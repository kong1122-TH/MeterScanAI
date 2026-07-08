export type MeterType = "electricity" | "water";

export interface MeterReading {
  id: string;
  timestamp: string;
  readingValue: string;
  brand: string;
  meterType: MeterType;
  confidence: number;
  explanation: string;
  image?: string;
  location?: string;
  notes?: string;
}

export interface DemoMeterImage {
  id: string;
  name: string;
  type: MeterType;
  brand: string;
  imageUrl: string;
  description: string;
  readingValue: string;
}

export interface AnalysisResponse {
  readingValue: string;
  brand: string;
  meterType: MeterType;
  confidence: number;
  explanation: string;
}
