import React, { useState } from "react";
import { Zap, Droplet, Search, Trash2, Calendar, MapPin, FileText, Download } from "lucide-react";
import { MeterReading, MeterType } from "../types";

interface HistoryTableProps {
  history: MeterReading[];
  onDelete: (id: string) => void;
}

export function HistoryTable({ history, onDelete }: HistoryTableProps) {
  const [filterType, setFilterType] = useState<"all" | MeterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatThaiDateTime = (dateString: string) => {
    const d = new Date(dateString);
    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const timeStr = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    return `${d.getDate()} ${thaiMonths[d.getMonth()]} | ${timeStr}`;
  };

  const filtered = history.filter(item => {
    const matchesType = filterType === "all" || item.meterType === filterType;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.brand.toLowerCase().includes(searchLower) ||
      item.readingValue.toLowerCase().includes(searchLower) ||
      (item.location && item.location.toLowerCase().includes(searchLower)) ||
      (item.notes && item.notes.toLowerCase().includes(searchLower));
    
    return matchesType && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["ID", "Timestamp", "MeterType", "Brand", "Value", "Location", "Notes"];
    const rows = history.map(item => [
      item.id,
      item.timestamp,
      item.meterType,
      item.brand,
      item.readingValue,
      item.location || "",
      item.notes || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meter_readings_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header section with export button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">ประวัติการอ่านมิเตอร์ย้อนหลัง</h2>
        </div>
        <button 
          onClick={exportCSV}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3 h-3" /> ส่งออก CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหาตามยี่ห้อ, เลขมิเตอร์, สถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Type selector inside history */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              filterType === "all" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterType("electricity")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              filterType === "electricity" ? "bg-amber-500/20 text-amber-300" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Zap className="w-2.5 h-2.5 fill-amber-300/30" /> ไฟฟ้า
          </button>
          <button
            onClick={() => setFilterType("water")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              filterType === "water" ? "bg-sky-500/20 text-sky-300" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Droplet className="w-2.5 h-2.5 fill-sky-300/30" /> ประปา
          </button>
        </div>
      </div>

      {/* Structured List resembling Geometric Balance */}
      <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 bg-slate-900 text-[10px] font-bold uppercase text-slate-400 py-2 px-4 tracking-widest border-b border-slate-800">
          <div className="col-span-4">วัน/เวลา</div>
          <div className="col-span-4 text-center">ยี่ห้อ</div>
          <div className="col-span-4 text-right">เลขมิเตอร์</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div 
                key={item.id} 
                className="grid grid-cols-12 py-3 px-4 text-xs items-center hover:bg-slate-900/50 group transition-colors"
              >
                {/* Timestamp & Location */}
                <div className="col-span-4">
                  <div className="text-slate-300 font-medium font-sans flex items-center gap-1">
                    {item.meterType === "electricity" ? (
                      <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                    ) : (
                      <Droplet className="w-3 h-3 text-sky-400 shrink-0" />
                    )}
                    {formatThaiDateTime(item.timestamp)}
                  </div>
                  {item.location && (
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Brand Logo badge */}
                <div className="col-span-4 text-center">
                  <span className="bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-bold">
                    {item.brand}
                  </span>
                </div>

                {/* Reading Value & Delete Button */}
                <div className="col-span-4 text-right flex items-center justify-end gap-2">
                  <div className="font-mono text-indigo-400 font-bold text-sm">
                    {item.readingValue}
                    <span className="text-[9px] text-slate-500 ml-1 font-sans">
                      {item.meterType === "electricity" ? "kWh" : "คิว"}
                    </span>
                  </div>
                  
                  {/* Delete record option */}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 cursor-pointer"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              ไม่พบบันทึกที่ค้นหาหรือยังไม่มีประวัติ
            </div>
          )}
        </div>

        {/* List total records */}
        <div className="bg-slate-900/40 p-2 text-center border-t border-slate-900">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
            แสดง {filtered.length} จาก {history.length} รายการทั้งหมด
          </span>
        </div>
      </div>
    </div>
  );
}
