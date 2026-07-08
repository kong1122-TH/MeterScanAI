import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Droplet, 
  Upload, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Activity, 
  Sparkles, 
  Clock, 
  Settings, 
  ShieldCheck,
  Cpu,
  Trash2,
  RefreshCw,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEMO_METERS } from "./data/demoMeters";
import { MeterReading, MeterType, AnalysisResponse } from "./types";
import { StatsGrid } from "./components/StatsGrid";
import { TrendsChart } from "./components/TrendsChart";
import { HistoryTable } from "./components/HistoryTable";

const INITIAL_HISTORY: MeterReading[] = [
  {
    id: "hist-1",
    timestamp: "2026-06-10T10:30:00.000Z",
    readingValue: "18320",
    brand: "Mitsubishi",
    meterType: "electricity",
    confidence: 0.98,
    explanation: "อ่านค่าตัวเลข 5 หลักจากมิเตอร์จานหมุนตรงตามภาพ ได้ค่า 18320 kWh",
    location: "บ้านพักหลัก ชั้น 1",
    notes: "จดบันทึกประจำรอบเดือนมิถุนายน"
  },
  {
    id: "hist-2",
    timestamp: "2026-06-12T14:15:00.000Z",
    readingValue: "332.4",
    brand: "Asahi",
    meterType: "water",
    confidence: 0.95,
    explanation: "ตรวจพบมิเตอร์น้ำยี่ห้อ Asahi หน้าปัดพลาสติกกลมหนา ได้ค่า 332.4 ลูกบาศก์เมตร",
    location: "สวนหน้าบ้าน",
    notes: "เริ่มสถิติการรดน้ำต้นไม้"
  },
  {
    id: "hist-3",
    timestamp: "2026-06-25T11:00:00.000Z",
    readingValue: "18412",
    brand: "Mitsubishi",
    meterType: "electricity",
    confidence: 0.97,
    explanation: "อ่านค่าจานหมุนรอบกลางเดือน ได้ 18412 kWh (ปริมาณการใช้เพิ่มขึ้นตามรอบแอร์หน้าร้อน)",
    location: "บ้านพักหลัก ชั้น 1",
    notes: "แอร์ห้องนั่งเล่น"
  },
  {
    id: "hist-4",
    timestamp: "2026-06-27T09:45:00.000Z",
    readingValue: "335.8",
    brand: "Asahi",
    meterType: "water",
    confidence: 0.96,
    explanation: "อ่านหน้ามิเตอร์ ได้ค่า 335.8 ลูกบาศก์เมตร ตรวจสอบตามสายท่อปกติ",
    location: "สวนหน้าบ้าน",
    notes: "สวนผลไม้หลังบ้าน"
  },
  {
    id: "hist-5",
    timestamp: "2026-07-05T08:30:00.000Z",
    readingValue: "18452",
    brand: "Mitsubishi",
    meterType: "electricity",
    confidence: 0.99,
    explanation: "อ่านหน้าจานหมุนไฟฟ้าล่าสุด ได้ค่า 18452 kWh (เฉลี่ยไฟฟ้ารวมปกติ)",
    location: "บ้านพักหลัก ชั้น 1",
    notes: "สรุปงวดบิลกลางปี"
  }
];

export default function App() {
  const [history, setHistory] = useState<MeterReading[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const [meterTypeInput, setMeterTypeInput] = useState<MeterType | "any">("any");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [locationLabel, setLocationLabel] = useState("บ้านพักหลัก ชั้น 1");
  const [notesText, setNotesText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [timeStr, setTimeStr] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("meter_dashboard_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory(INITIAL_HISTORY);
      }
    } else {
      setHistory(INITIAL_HISTORY);
      localStorage.setItem("meter_dashboard_history", JSON.stringify(INITIAL_HISTORY));
    }

    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("th-TH", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateLocalStorage = (newHistory: MeterReading[]) => {
    setHistory(newHistory);
    localStorage.setItem("meter_dashboard_history", JSON.stringify(newHistory));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    setErrorMsg(null);
    setSelectedImageUrl(null);
    setSelectedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setAnalysisResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectDemo = (demo: typeof DEMO_METERS[0]) => {
    setSelectedImage(null);
    setSelectedImageUrl(demo.imageUrl);
    setSelectedMimeType("image/jpeg");
    setMeterTypeInput(demo.type);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setErrorMsg("ไม่สามารถเข้าถึงกล้องถ่ายภาพได้ กรุณาอัปโหลดรูปภาพทดแทน");
      setCameraActive(false);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelectedImage(dataUrl);
        setSelectedImageUrl(null);
        setSelectedMimeType("image/jpeg");
        setAnalysisResult(null);
        stopCamera();
      }
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage && !selectedImageUrl) {
      setErrorMsg("กรุณาอัปโหลดรูปภาพ ถ่ายภาพ หรือเลือกรูปภาพจำลองก่อนวิเคราะห์");
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage,
          imageUrl: selectedImageUrl,
          mimeType: selectedMimeType || "image/jpeg",
          meterType: meterTypeInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบวิเคราะห์ข้อมูล");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!analysisResult) return;

    const newReading: MeterReading = {
      id: "hist-" + Date.now(),
      timestamp: new Date().toISOString(),
      readingValue: analysisResult.readingValue || "0",
      brand: analysisResult.brand || "ไม่ระบุ",
      meterType: analysisResult.meterType || "electricity",
      confidence: analysisResult.confidence || 0.90,
      explanation: analysisResult.explanation || "",
      image: selectedImage || selectedImageUrl || undefined,
      location: locationLabel.trim() || "บ้านพักหลัก ชั้น 1",
      notes: notesText.trim() || undefined
    };

    const updated = [newReading, ...history];
    updateLocalStorage(updated);
    
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setAnalysisResult(null);
      setSelectedImage(null);
      setSelectedImageUrl(null);
      setNotesText("");
    }, 2000);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("ยืนยันการลบข้อมูลการสแกนมิเตอร์นี้?")) {
      const updated = history.filter(item => item.id !== id);
      updateLocalStorage(updated);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header Navigation styled as requested in Geometric Balance */}
      <nav className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-display">
            METER<span className="text-indigo-400">SCAN</span> AI
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            V2.4 PRO
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="text-indigo-400 border-b-2 border-indigo-400 pb-1">Dashboard</span>
            <span className="hover:text-slate-200 cursor-pointer">ประวัติการอ่าน</span>
            <span className="hover:text-slate-200 cursor-pointer">ตั้งค่าระบุ</span>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-800 border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-inner">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-emerald-500/30">
              ✓
            </div>
            <span className="text-[11px] font-medium text-slate-300">สมชาย ใจดี</span>
          </div>
        </div>
      </nav>

      {/* Main Grid View split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Panel (col-span-7): Scanner Interface and current active analyzer */}
        <div className="col-span-1 lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col p-6 space-y-6 bg-slate-950/20">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold font-display tracking-tight text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" /> กล้องวิเคราะห์ภาพมิเตอร์
              </h1>
              <p className="text-[11px] text-slate-400">ถ่ายรูปมิเตอร์เพื่อให้อ่านเลขมาตรวัดโดยอัตโนมัติ</p>
            </div>

            {/* Quick manual selection of Type */}
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMeterTypeInput("any")}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                  meterTypeInput === "any" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                ตรวจจับอัตโนมัติ
              </button>
              <button
                onClick={() => setMeterTypeInput("electricity")}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition ${
                  meterTypeInput === "electricity" ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Zap className="w-3 h-3 fill-amber-400/20" /> ไฟฟ้า
              </button>
              <button
                onClick={() => setMeterTypeInput("water")}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 transition ${
                  meterTypeInput === "water" ? "bg-sky-500 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Droplet className="w-3 h-3 fill-sky-400/20" /> ประปา
              </button>
            </div>
          </div>

          {/* Holographic scanner viewport with corners */}
          <div className="flex-1 min-h-[300px] relative rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 flex flex-col items-center justify-center group geometric-glow">
            {/* Viewport decoration */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950/40 pointer-events-none" />
            
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider animate-pulse shadow-sm">
                REC: LIVE FEED
              </span>
              <span className="bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono shadow-xs">
                AI SENSOR ACTIVE
              </span>
            </div>

            {/* Display Video, Image or Placeholder */}
            {showCamera ? (
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-between">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                
                {/* Red Laser Scanner Effect Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 opacity-60 animate-bounce top-[45%]" />
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4 z-20">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> กดเพื่อถ่ายภาพสแกน
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : selectedImage || selectedImageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950 group">
                <img 
                  src={selectedImage || selectedImageUrl || ""} 
                  alt="Meter Preview" 
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
                {/* Visual grid overlay to look hyper-technical */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedImageUrl(null);
                      setAnalysisResult(null);
                    }}
                    className="bg-red-500 text-white p-2 rounded-lg shadow-md hover:bg-red-600 transition"
                    title="ลบรูปภาพ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Default scanner viewfinder
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-6 flex flex-col items-center gap-3 select-none"
              >
                {/* Scanner corners decoration */}
                <div className="w-[280px] h-[140px] border border-indigo-500/20 rounded-lg flex flex-col items-center justify-center relative bg-slate-900/30">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-indigo-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-indigo-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-indigo-400"></div>
                  
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all duration-300 shadow-sm mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">ลากวางรูปมิเตอร์ หรือ คลิกเพื่อเลือกไฟล์</p>
                    <p className="text-[10px] text-slate-500 mt-1">รองรับ JPEG, PNG ความกว้างชัดเจน</p>
                  </div>
                </div>
              </div>
            )}

            {/* Static visual bar */}
            <div className="absolute bottom-2 right-4 text-[9px] font-mono text-indigo-500/60 tracking-wider">OCR SYSTEM ENGAGED</div>
          </div>

          {/* Action trigger & selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> ค้นหาภาพถ่าย
            </button>
            <button
              type="button"
              onClick={showCamera ? stopCamera : startCamera}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400" /> {showCamera ? "ปิดกล้อง" : "ใช้กล้องไลฟ์"}
            </button>
            
            <button
              type="button"
              onClick={handleAnalyzeImage}
              disabled={analyzing || (!selectedImage && !selectedImageUrl)}
              className={`font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md ${
                selectedImage || selectedImageUrl
                  ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 cursor-pointer"
                  : "bg-slate-800/50 text-slate-600 border border-slate-800/80 cursor-not-allowed"
              }`}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  กดเพื่อสแกนด้วย AI
                </>
              )}
            </button>
            
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="font-sans leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Demonstration/Simulated Meters */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
              ตัวอย่างมาตรวัดสำหรับทดสอบระบบ (METER SIMULATION)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEMO_METERS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectDemo(demo)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    selectedImageUrl === demo.imageUrl 
                      ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500" 
                      : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-950 relative mb-1.5">
                    <img 
                      src={demo.imageUrl} 
                      alt={demo.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 left-1">
                      {demo.type === "electricity" ? (
                        <span className="p-0.5 bg-amber-500 rounded text-slate-950 block">
                          <Zap className="w-2.5 h-2.5 fill-slate-950" />
                        </span>
                      ) : (
                        <span className="p-0.5 bg-sky-500 rounded text-slate-950 block">
                          <Droplet className="w-2.5 h-2.5 fill-slate-950" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-bold text-slate-200 truncate">{demo.brand}</h4>
                    <p className="text-[8px] text-slate-500 truncate">{demo.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results readout inside Left Panel */}
          <AnimatePresence mode="wait">
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900 border-2 border-indigo-500/40 rounded-xl p-5 shadow-lg shadow-indigo-500/5 relative"
              >
                {/* Absolute status box corner ornament */}
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {analysisResult.meterType === "electricity" ? (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-amber-400/30" /> มิเตอร์ไฟฟ้า
                      </span>
                    ) : (
                      <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <Droplet className="w-3 h-3 fill-sky-400/30" /> มิเตอร์น้ำประปา
                      </span>
                    )}
                    
                    <span className="text-[11px] text-slate-400">
                      ยี่ห้อตรวจพบ: <strong className="text-white font-semibold font-display">{analysisResult.brand}</strong>
                    </span>
                  </div>

                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* DIGITS ROLLER */}
                <div className="mb-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                      ตัวเลขหน่วยที่ระบุได้ (METER READING UNIT)
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      {analysisResult.readingValue ? (
                        <div className="flex gap-1 font-mono text-2xl font-bold text-white tracking-widest">
                          {analysisResult.readingValue.split("").map((c, i) => (
                            <span 
                              key={i} 
                              className={`px-2.5 py-1 rounded border ${
                                c === "." 
                                  ? "text-red-400 border-transparent px-0 bg-transparent"
                                  : analysisResult.meterType === "water" && i >= analysisResult.readingValue.indexOf(".")
                                    ? "bg-slate-900 border-slate-800 text-red-500 font-bold"
                                    : "bg-slate-900 border-slate-800 text-indigo-400"
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">UNABLE TO READ</span>
                      )}
                      
                      <span className="text-xs text-slate-400 font-bold ml-1">
                        {analysisResult.meterType === "electricity" ? "kWh" : "m³ (คิว)"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 max-w-sm font-sans leading-relaxed">
                    {analysisResult.explanation}
                  </div>
                </div>

                {/* Additional custom save labels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">สถานที่ติดตั้ง</label>
                    <input 
                      type="text" 
                      value={locationLabel}
                      onChange={(e) => setLocationLabel(e.target.value)}
                      placeholder="เช่น ชั้น 1 โซน A, บ้านพักหลัก"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">โน้ตข้อความ</label>
                    <input 
                      type="text" 
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="จดรอบบิลรายเดือน..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Save actions */}
                <div className="flex gap-2.5 justify-end">
                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    ลบล้างภาพ
                  </button>
                  <button
                    onClick={handleSaveToHistory}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> บันทึกสถิติมิเตอร์
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick success state overlay popup indicator */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center justify-center gap-2 font-bold animate-pulse">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              บันทึกข้อมูลและนำไปประมวลผลบน Dashboard สำเร็จแล้ว!
            </div>
          )}

        </div>

        {/* Right Panel (col-span-5): Historical Database & Dashboard metrics */}
        <div className="col-span-1 lg:col-span-5 bg-slate-900/40 p-6 flex flex-col space-y-6 overflow-hidden h-full">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display tracking-tight text-white uppercase">สรุปข้อมูลภาพรวมระบบ</h2>
              <p className="text-[11px] text-slate-400">ประมวลผลกราฟเปรียบเทียบและการใช้สอยย้อนหลัง</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-900">
              <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>{timeStr}</span>
            </div>
          </div>

          {/* Stats quick card grid */}
          <StatsGrid history={history} />

          {/* Trends analytical charts */}
          <TrendsChart history={history} />

          {/* Table history module */}
          <div className="flex-1 overflow-hidden min-h-[300px]">
            <HistoryTable history={history} onDelete={handleDeleteRecord} />
          </div>

        </div>

      </div>

      {/* Futuristic footer strip bar */}
      <footer className="h-10 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between px-6 text-[10px] text-slate-500 shrink-0">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SYSTEM ONLINE</span>
          <span>STATION ID: CENTRAL-THAILAND</span>
          <span>LATENCY: 12ms</span>
        </div>
        <div className="flex gap-4">
          <span>มิเตอร์สแกนเนอร์ AI v2.4.0</span>
          <span className="text-indigo-400 font-semibold uppercase tracking-wider">SUPPORTED BY GEMINI VISION</span>
        </div>
      </footer>

    </div>
  );
}
