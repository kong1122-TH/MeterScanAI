import React from "react";
import { Zap, Droplet, History, Award } from "lucide-react";
import { MeterReading } from "../types";

interface StatsGridProps {
  history: MeterReading[];
}

export function StatsGrid({ history }: StatsGridProps) {
  const electricityHistory = history.filter(h => h.meterType === "electricity");
  const waterHistory = history.filter(h => h.meterType === "water");

  // Calculate most common brand
  const getMostCommonBrand = () => {
    if (history.length === 0) return "ไม่มีข้อมูล";
    const counts: { [key: string]: number } = {};
    history.forEach(h => {
      counts[h.brand] = (counts[h.brand] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "ไม่พบยี่ห้อ";
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Readings */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between shadow-md hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider">บันทึกทั้งหมด</span>
          <History className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-2xl font-bold font-mono text-white">{history.length}</span>
          <span className="text-xs text-slate-400 ml-1.5">รายการ</span>
        </div>
        <div className="text-[9px] text-slate-500 mt-1">
          ไฟ {electricityHistory.length} | น้ำ {waterHistory.length}
        </div>
      </div>

      {/* Latest Electricity */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between shadow-md hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-amber-400 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider">มิเตอร์ไฟฟ้าล่าสุด</span>
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
        </div>
        <div>
          <span className="text-2xl font-bold font-mono text-white">
            {electricityHistory.length > 0 ? electricityHistory[0].readingValue : "0"}
          </span>
          <span className="text-xs text-slate-400 ml-1.5">kWh</span>
        </div>
        <div className="text-[9px] text-slate-500 mt-1 truncate">
          {electricityHistory.length > 0 
            ? `บันทึกเมื่อ: ${new Date(electricityHistory[0].timestamp).toLocaleDateString("th-TH")}` 
            : "ไม่มีประวัติ"}
        </div>
      </div>

      {/* Latest Water */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between shadow-md hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-sky-400 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider">มิเตอร์น้ำประปาล่าสุด</span>
          <Droplet className="w-4 h-4 text-sky-400 fill-sky-400/20" />
        </div>
        <div>
          <span className="text-2xl font-bold font-mono text-white">
            {waterHistory.length > 0 ? waterHistory[0].readingValue : "0"}
          </span>
          <span className="text-xs text-slate-400 ml-1.5">m³ (คิว)</span>
        </div>
        <div className="text-[9px] text-slate-500 mt-1 truncate">
          {waterHistory.length > 0 
            ? `บันทึกเมื่อ: ${new Date(waterHistory[0].timestamp).toLocaleDateString("th-TH")}` 
            : "ไม่มีประวัติ"}
        </div>
      </div>

      {/* Common Brand */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between shadow-md hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between text-indigo-400 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider">ยี่ห้อที่พบบ่อยสุด</span>
          <Award className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <span className="text-lg font-bold text-indigo-300 truncate block">
            {getMostCommonBrand()}
          </span>
        </div>
        <div className="text-[9px] text-slate-500 mt-1">
          วิเคราะห์แบบโมเดล AI ในประเทศ
        </div>
      </div>
    </div>
  );
}
