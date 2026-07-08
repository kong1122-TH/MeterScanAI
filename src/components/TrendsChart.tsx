import React from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { MeterReading } from "../types";

interface TrendsChartProps {
  history: MeterReading[];
}

export function TrendsChart({ history }: TrendsChartProps) {
  // Process Recharts graph data chronologically
  const getChartData = () => {
    const allItems = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Create map of days
    const dataPoints: { [key: string]: { dateStr: string; elecValue?: number; waterValue?: number } } = {};
    
    const formatThaiShortDate = (dateString: string) => {
      const d = new Date(dateString);
      const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return `${d.getDate()} ${thaiMonths[d.getMonth()]}`;
    };

    allItems.forEach(item => {
      const d = new Date(item.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const val = parseFloat(item.readingValue);
      if (isNaN(val)) return;

      if (!dataPoints[key]) {
        dataPoints[key] = {
          dateStr: formatThaiShortDate(item.timestamp),
        };
      }

      if (item.meterType === "electricity") {
        dataPoints[key].elecValue = val;
      } else {
        dataPoints[key].waterValue = val;
      }
    });

    return Object.values(dataPoints);
  };

  const chartData = getChartData();

  if (chartData.length === 0) {
    return (
      <div className="h-44 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-xs text-slate-500">
        ยังไม่มีข้อมูลประวัติเพียงพอสำหรับวาดกราฟ
      </div>
    );
  }

  return (
    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">แนวโน้มการใช้สอย (Utility Usage Trend)</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
              dataKey="dateStr" 
              tick={{ fontSize: 9, fill: "#94a3b8" }} 
              stroke="#334155"
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 9, fill: "#94a3b8" }} 
              stroke="#334155" 
            />
            <Tooltip 
              contentStyle={{ 
                fontSize: "10px", 
                backgroundColor: "#0f172a", 
                borderRadius: "8px", 
                border: "1px solid #334155",
                color: "#f8fafc"
              }} 
            />
            <Legend 
              wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} 
              iconSize={8}
            />
            <Area 
              name="กระแสไฟฟ้า (kWh)"
              type="monotone" 
              dataKey="elecValue" 
              stroke="#fbbf24" 
              fillOpacity={1} 
              fill="url(#colorElec)" 
              strokeWidth={2}
            />
            <Area 
              name="น้ำประปา (คิว)"
              type="monotone" 
              dataKey="waterValue" 
              stroke="#38bdf8" 
              fillOpacity={1} 
              fill="url(#colorWater)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
