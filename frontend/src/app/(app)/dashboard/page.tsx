"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Package, Users, Wrench, CalendarClock,
  ArrowLeftRight, RotateCcw, AlertTriangle,
  Clock, Plus, BookOpen, Zap
} from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import { reportsApi, activityApi, notificationsApi, type DashboardSummary, type ActivityLog, type Notification } from "@/lib/api";
import Link from "next/link";

const severityColor: Record<string, string> = {
  info: "bg-[#00f0ff]",
  warning: "bg-yellow-400",
  error: "bg-red-400",
};

const quickActions = [
  { label: "Register Asset", href: "/assets", icon: Plus, color: "bg-[#00f0ff] text-black" },
  { label: "Book Resource", href: "/booking", icon: BookOpen, color: "bg-white/10 text-[#e5e2e1] border border-white/10" },
  { label: "Raise Maintenance", href: "/maintenance", icon: Wrench, color: "bg-white/10 text-[#e5e2e1] border border-white/10" },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sumRes, notifRes, logsRes] = await Promise.all([
        reportsApi.summary(),
        notificationsApi.list({ read: "false" }),
        activityApi.list(8),
      ]);
      setSummary(sumRes.data);
      setAlerts(notifRes.data.slice(0, 5));
      setLogs(logsRes.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = summary
    ? [
        { title: "Available Assets",    value: summary.available,       icon: Package,       color: "green"  as const },
        { title: "Allocated Assets",    value: summary.allocated,       icon: Users,         color: "cyan"   as const },
        { title: "Under Maintenance",   value: summary.maintenance,     icon: Wrench,        color: "yellow" as const },
        { title: "Active Bookings",     value: summary.activeBookings,  icon: CalendarClock, color: "purple" as const },
        { title: "Pending Transfers",   value: summary.pendingTransfers,icon: ArrowLeftRight,color: "orange" as const },
        { title: "Upcoming Returns",    value: summary.upcomingReturns, icon: RotateCcw,     color: "red"    as const },
      ]
    : [];

  const alertSeverityBg: Record<string, string> = {
    high:   "bg-red-500/8 border-red-500/20",
    medium: "bg-yellow-500/8 border-yellow-500/20",
    low:    "bg-white/5 border-white/10",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Overview of your asset ecosystem"
        icon={Zap}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 border border-white/8 animate-pulse h-24" />
            ))
          : kpis.map((kpi, i) => (
              <KpiCard key={kpi.title} {...kpi} index={i} />
            ))}
      </div>

      {/* Alerts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Active Alerts</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-8 text-center text-[#8e9192] text-[13px]">No active alerts — all clear ✓</div>
          ) : (
            <div className="space-y-2">
              {alerts.map(alert => (
                <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl border ${alertSeverityBg[alert.priority]}`}>
                  <AlertTriangle size={14} className={alert.priority === "high" ? "text-red-400 shrink-0" : "text-yellow-400 shrink-0"} />
                  <span className="text-[13px] text-[#e5e2e1]">{alert.title} — {alert.description}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link key={label} href={href}>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-[13px] transition-all ${color}`}
                >
                  <Icon size={15} />
                  {label}
                </motion.button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-panel rounded-2xl p-5 border border-white/8"
      >
        <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Recent Activity</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-[#8e9192] text-[13px]">
            No activity yet. Start by registering assets or setting up your organization.
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColor[log.severity]}`} />
                  {i < logs.length - 1 && <div className="w-px flex-1 bg-white/8 mt-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-[#e5e2e1]">{log.action}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8e9192]">
                      <Clock size={11} />
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <p className="text-[12px] text-[#8e9192] mt-0.5">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#444748]">{log.user}</span>
                    <span className="text-[11px] text-[#444748]">·</span>
                    <span className="text-[11px] text-[#444748]">{log.module}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
