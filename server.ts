import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON payload limit to accept base64 image data
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Meter analysis will fail.");
}

// API endpoint for meter analysis
app.post("/api/analyze", async (req, res): Promise<any> => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API client is not initialized. Please configure the GEMINI_API_KEY in Settings > Secrets.",
    });
  }

  const { image, imageUrl, mimeType, meterType } = req.body;

  if (!image && !imageUrl) {
    return res.status(400).json({
      error: "Missing image or imageUrl parameter in request.",
    });
  }

  try {
    let imagePart;

    if (image) {
      // Strip the data URL prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
      imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data,
        },
      };
    } else if (imageUrl) {
      console.log(`Fetching remote image for analysis: ${imageUrl}`);
      const remoteRes = await fetch(imageUrl);
      if (!remoteRes.ok) {
        throw new Error(`Failed to fetch remote image: ${remoteRes.statusText}`);
      }
      const arrayBuffer = await remoteRes.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const contentType = remoteRes.headers.get("content-type") || "image/jpeg";
      
      imagePart = {
        inlineData: {
          mimeType: contentType,
          data: base64Data,
        },
      };
    } else {
      throw new Error("Invalid request data");
    }

    const textPart = {
      text: `Analyze this image of a utility meter (water or electricity meter). 
      Identify the current meter reading value and the brand/manufacturer of the meter.
      The user selected meter type: ${meterType || "any"}. 
      
      Look closely at the numbers shown on the dial or digital screen. 
      - Water meters usually have black and red numbers. Extract the black numbers (whole units) or provide a full reading.
      - Electricity meters usually have a series of rotating dials or a digital display. Extract the digits clearly.
      - Identify the brand (e.g., Mitsubishi, Asahi, Sanwa, Holley, Crown, etc.).
      - Assess your confidence level.
      - Write a short explanation in Thai explaining what was detected.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readingValue: {
              type: Type.STRING,
              description: "The numerical reading value extracted from the meter dial or display. Return only digits and optional decimal point. If not readable, return null.",
            },
            brand: {
              type: Type.STRING,
              description: "The brand/manufacturer name of the meter (e.g., Mitsubishi, Asahi, Sanwa, Holley). If not visible, return 'ไม่ทราบยี่ห้อ'.",
            },
            meterType: {
              type: Type.STRING,
              description: "The category of the meter detected, either 'electricity' or 'water'.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence level of the extraction between 0.0 and 1.0.",
            },
            explanation: {
              type: Type.STRING,
              description: "A short, helpful summary of the analysis in Thai. Explain what numbers were read (including units if known) and how the brand was identified.",
            },
          },
          required: ["readingValue", "brand", "meterType", "confidence", "explanation"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(resultText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Error analyzing meter image:", error);
    return res.status(500).json({
      error: "Failed to analyze image: " + (error.message || error),
    });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", apiInitialized: !!ai });
});

// Setup Vite dev server or static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode, serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
