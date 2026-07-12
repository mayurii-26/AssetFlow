"use client";
import { motion } from "framer-motion";
import { BarChart3, Download, TrendingUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, AreaChart, Area
} from "recharts";

const utilizationData = [
  { dept: "Engineering", utilization: 92 },
  { dept: "Sales", utilization: 78 },
  { dept: "HR", utilization: 55 },
  { dept: "Finance", utilization: 63 },
  { dept: "Operations", utilization: 88 },
  { dept: "Design", utilization: 71 },
  { dept: "IT", utilization: 95 },
];

const statusDistribution = [
  { name: "Available", value: 142, color: "#4ade80" },
  { name: "Allocated", value: 87, color: "#00f0ff" },
  { name: "Maintenance", value: 12, color: "#ffd966" },
  { name: "Retired", value: 8, color: "#8e9192" },
];

const maintenanceTrend = [
  { month: "Feb", requests: 4, resolved: 3 },
  { month: "Mar", requests: 7, resolved: 6 },
  { month: "Apr", requests: 5, resolved: 5 },
  { month: "May", requests: 9, resolved: 7 },
  { month: "Jun", requests: 6, resolved: 6 },
  { month: "Jul", requests: 5, resolved: 3 },
];

const bookingHeatmap = [
  { time: "8:00", Mon: 1, Tue: 2, Wed: 3, Thu: 1, Fri: 0 },
  { time: "10:00", Mon: 3, Tue: 4, Wed: 5, Thu: 4, Fri: 2 },
  { time: "12:00", Mon: 2, Tue: 3, Wed: 2, Thu: 2, Fri: 1 },
  { time: "14:00", Mon: 4, Tue: 5, Wed: 4, Thu: 5, Fri: 3 },
  { time: "16:00", Mon: 2, Tue: 2, Wed: 3, Thu: 2, Fri: 1 },
];

const tooltipStyle = {
  contentStyle: { backgroundColor: "#1c1b1b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#e5e2e1", fontSize: "12px" },
  labelStyle: { color: "#8e9192" },
};

const topAssets = [
  { name: "Conference Room A", uses: 48 },
  { name: "Projector Unit 1", uses: 36 },
  { name: "Company Vehicle 1", uses: 29 },
  { name: "MacBook Pro 16\"", uses: 24 },
  { name: "iPad Pro 12.9\"", uses: 18 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Reports & Analytics" description="Asset utilization, trends, and insights" icon={BarChart3}>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] focus:outline-none">
            {["All Departments","Engineering","Sales","Finance"].map(d => <option key={d} className="bg-[#1c1b1b]">{d}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/10 text-[#e5e2e1] rounded-full text-[13px] font-medium">
            <Download size={14} /> Export
          </motion.button>
        </div>
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Asset Value", value: "₹4.8Cr", trend: "+12%", color: "text-[#00f0ff]" },
          { label: "Avg Utilization", value: "77%", trend: "+5%", color: "text-green-400" },
          { label: "Maintenance Cost YTD", value: "₹3.2L", trend: "-8%", color: "text-yellow-400" },
          { label: "Assets Near Retirement", value: "14", trend: "+3", color: "text-orange-400" },
        ].map(({ label, value, trend, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-panel rounded-2xl p-4 border border-white/8">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-[#8e9192] mt-0.5">{label}</p>
            <div className="flex items-center gap-1 mt-2 text-[11px]">
              <TrendingUp size={11} className="text-green-400" />
              <span className="text-green-400">{trend}</span>
              <span className="text-[#444748]">vs last quarter</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Utilization by Dept */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/8">
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Asset Utilization by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={utilizationData} {...tooltipStyle}>
              <XAxis dataKey="dept" tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "Utilization"]} />
              <Bar dataKey="utilization" fill="#00f0ff" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-panel rounded-2xl p-5 border border-white/8">
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statusDistribution.map(entry => <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {statusDistribution.map(({ name, value, color }) => (
              <div key={name} className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[#8e9192]">{name}</span>
                <span className="text-[#e5e2e1] font-medium ml-auto">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Maintenance Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-5 border border-white/8">
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Maintenance Frequency</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={maintenanceTrend}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#8e9192" }} />
              <Area type="monotone" dataKey="requests" stroke="#00f0ff" fill="url(#reqGrad)" strokeWidth={2} name="Requests" />
              <Area type="monotone" dataKey="resolved" stroke="#4ade80" fill="url(#resGrad)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Used Assets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-panel rounded-2xl p-5 border border-white/8">
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Most Used Assets</h2>
          <div className="space-y-3">
            {topAssets.map(({ name, uses }, i) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px] text-[#e5e2e1]">{name}</span>
                  <span className="text-[12px] text-[#8e9192]">{uses} uses</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${(uses / 50) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-[#00f0ff] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
