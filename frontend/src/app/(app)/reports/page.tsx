"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, TrendingUp, TrendingDown } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from "recharts";
import { reportsApi, type DashboardSummary } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";

const STATUS_COLORS: Record<string, string> = {
  Available:         "#4ade80",
  Allocated:         "#00f0ff",
  "Under Maintenance": "#ffd966",
  Retired:           "#8e9192",
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1c1b1b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#e5e2e1",
    fontSize: "12px",
  },
  labelStyle: { color: "#8e9192" },
};

interface UtilRow  { department: string; total: number; allocated: number; utilization: number }
interface StatusRow { status: string; count: number }
interface NearRetirementAsset { id: string; name: string; category: string; warrantyExpiry: string }

export default function ReportsPage() {
  const { user } = useAuth();
  const { canViewFullReports } = useRole();

  const [summary,      setSummary]      = useState<DashboardSummary | null>(null);
  const [utilization,  setUtilization]  = useState<UtilRow[]>([]);
  const [statusDist,   setStatusDist]   = useState<StatusRow[]>([]);
  const [nearRetire,   setNearRetire]   = useState<NearRetirementAsset[]>([]);
  const [deptFilter,   setDeptFilter]   = useState("All Departments");
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sumRes, utilRes, statusRes, retireRes] = await Promise.all([
          reportsApi.summary(),
          reportsApi.utilization(),
          reportsApi.statusDistribution(),
          reportsApi.nearRetirement(),
        ]);
        setSummary(sumRes.data);
        setUtilization(utilRes.data);
        setStatusDist(statusRes.data);
        setNearRetire(retireRes.data);
      } catch (e) {
        console.error("Reports load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filtered utilization data
  const filteredUtil = deptFilter === "All Departments"
    ? utilization
    : utilization.filter(r => r.department === deptFilter);

  // Departments list for filter dropdown
  const departments = ["All Departments", ...utilization.map(r => r.department)];

  // Status distribution for pie chart
  const pieData = statusDist.map(r => ({
    name: r.status,
    value: r.count,
    color: STATUS_COLORS[r.status] ?? "#8e9192",
  }));

  // Avg utilization across departments
  const avgUtil = utilization.length
    ? Math.round(utilization.reduce((s, r) => s + r.utilization, 0) / utilization.length)
    : 0;

  // Total assets value
  const totalValue = summary?.totalValue ?? 0;
  const totalAssets = summary?.totalAssets ?? 0;

  // Skeleton loader helper
  const Skeleton = ({ h = "h-6" }: { h?: string }) => (
    <div className={`${h} bg-white/5 rounded-xl animate-pulse`} />
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Reports & Analytics" description={canViewFullReports ? "Asset utilization, trends, and insights" : "Your asset summary"} icon={BarChart3}>
        {canViewFullReports && (
          <div className="flex items-center gap-2">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] focus:outline-none"
            >
              {departments.map(d => (
                <option key={d} className="bg-[#1c1b1b]">{d}</option>
              ))}
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/10 text-[#e5e2e1] rounded-full text-[13px] font-medium"
            >
              <Download size={14} /> Export
            </motion.button>
          </div>
        )}
      </PageHeader>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 border border-white/8 animate-pulse h-24" />
          ))
        ) : (
          [
            {
              label: "Total Asset Value",
              value: `₹${totalValue >= 10_000_000 ? (totalValue / 10_000_000).toFixed(1) + "Cr" : totalValue >= 100_000 ? (totalValue / 100_000).toFixed(1) + "L" : totalValue.toLocaleString("en-IN")}`,
              trend: null,
              color: "text-[#00f0ff]",
            },
            {
              label: "Avg Utilization",
              value: `${avgUtil}%`,
              trend: avgUtil > 70 ? "High utilization" : avgUtil > 40 ? "Moderate" : "Low utilization",
              trendUp: avgUtil > 70,
              color: avgUtil > 70 ? "text-green-400" : avgUtil > 40 ? "text-yellow-400" : "text-orange-400",
            },
            {
              label: "Total Assets",
              value: String(totalAssets),
              trend: null,
              color: "text-purple-400",
            },
            {
              label: "Near Retirement",
              value: String(nearRetire.length),
              trend: nearRetire.length > 0 ? `${nearRetire.length} expiring soon` : "All good",
              trendUp: nearRetire.length === 0,
              color: nearRetire.length > 0 ? "text-orange-400" : "text-green-400",
            },
          ].map(({ label, value, trend, trendUp, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-panel rounded-2xl p-4 border border-white/8"
            >
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-[#8e9192] mt-0.5">{label}</p>
              {trend && (
                <div className="flex items-center gap-1 mt-2 text-[11px]">
                  {trendUp
                    ? <TrendingUp size={11} className="text-green-400" />
                    : <TrendingDown size={11} className="text-orange-400" />}
                  <span className={trendUp ? "text-green-400" : "text-orange-400"}>{trend}</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Charts row 1 — full analytics only */}
      {canViewFullReports && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Utilization by Department */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">
            Asset Utilization by Department
          </h2>
          {loading ? (
            <div className="h-[220px] bg-white/3 rounded-xl animate-pulse" />
          ) : filteredUtil.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-[#8e9192] text-[13px]">
              No department data yet. Register and allocate assets to see utilization.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredUtil} {...tooltipStyle}>
                <XAxis dataKey="department" tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, "Utilization"]} />
                <Bar dataKey="utilization" fill="#00f0ff" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">
            Status Distribution
          </h2>
          {loading ? (
            <div className="h-[180px] bg-white/3 rounded-xl animate-pulse" />
          ) : pieData.every(d => d.value === 0) ? (
            <div className="h-[180px] flex items-center justify-center text-[#8e9192] text-[13px]">
              No assets registered yet.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                  >
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {pieData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[#8e9192]">{name}</span>
                    <span className="text-[#e5e2e1] font-medium ml-auto">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
      )}

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department breakdown — total vs allocated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">
            Total vs Allocated by Department
          </h2>
          {loading ? (
            <div className="h-[200px] bg-white/3 rounded-xl animate-pulse" />
          ) : utilization.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-[#8e9192] text-[13px]">
              No data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={utilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8e9192", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#8e9192" }} />
                <Bar dataKey="total"     fill="#8e9192" radius={[4, 4, 0, 0]} fillOpacity={0.5} name="Total" />
                <Bar dataKey="allocated" fill="#00f0ff" radius={[4, 4, 0, 0]} fillOpacity={0.85} name="Allocated" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Near Retirement Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">
            Assets Near / Past Warranty Expiry
          </h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : nearRetire.length === 0 ? (
            <div className="h-[160px] flex flex-col items-center justify-center gap-2">
              <span className="text-green-400 text-[28px]">✓</span>
              <p className="text-[#8e9192] text-[13px]">No assets near retirement — all warranties current.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {nearRetire.map((asset, i) => {
                const expired = new Date(asset.warrantyExpiry) < new Date();
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl border ${expired ? "bg-red-500/8 border-red-500/20" : "bg-orange-500/8 border-orange-500/20"}`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#e5e2e1]">{asset.name}</p>
                      <p className="text-[11px] text-[#8e9192]">{asset.category} · {asset.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[12px] font-semibold ${expired ? "text-red-400" : "text-orange-400"}`}>
                        {expired ? "Expired" : "Expiring"}
                      </p>
                      <p className="text-[11px] text-[#8e9192]">{asset.warrantyExpiry}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
      )} {/* end canViewFullReports charts */}

      {/* Restricted view for EMPLOYEE / DEPT_HEAD */}
      {!canViewFullReports && (
        <div className="glass-panel rounded-2xl p-6 border border-white/8 text-center">
          <BarChart3 size={32} className="text-[#444748] mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-[#e5e2e1] mb-1">Full Analytics Restricted</p>
          <p className="text-[13px] text-[#8e9192]">Org-wide reports are available to Admins and Asset Managers only.</p>
        </div>
      )}

      {/* Org context footer */}
      {user && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-[12px] text-[#444748]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]/50" />
          Data shown for <span className="text-[#00f0ff]/70 font-medium">{user.organization}</span>
        </motion.div>
      )}
    </div>
  );
}
