"use client";
import { motion } from "framer-motion";
import {
  Package, Users, Wrench, CalendarClock,
  ArrowLeftRight, RotateCcw, AlertTriangle,
  Clock, CheckCircle, Plus, BookOpen, Zap
} from "lucide-react";
import KpiCard from "@/components/ui/KpiCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { mockActivityLogs } from "@/lib/mock-data-extra";
import Link from "next/link";

const kpis = [
  { title: "Available Assets", value: 142, trend: 5, icon: Package, color: "green" as const },
  { title: "Allocated Assets", value: 87, trend: -2, icon: Users, color: "cyan" as const },
  { title: "Under Maintenance", value: 12, trend: 8, icon: Wrench, color: "yellow" as const },
  { title: "Active Bookings", value: 24, trend: 12, icon: CalendarClock, color: "purple" as const },
  { title: "Pending Transfers", value: 6, trend: -15, icon: ArrowLeftRight, color: "orange" as const },
  { title: "Upcoming Returns", value: 9, trend: 0, icon: RotateCcw, color: "red" as const },
];

const alerts = [
  { id: 1, message: "3 Assets overdue for return", severity: "error" },
  { id: 2, message: "2 Maintenance approvals pending", severity: "warning" },
  { id: 3, message: "iPhone 15 Pro could not be located during audit", severity: "error" },
];

const quickActions = [
  { label: "Register Asset", href: "/assets", icon: Plus, color: "bg-[#00f0ff] text-black" },
  { label: "Book Resource", href: "/booking", icon: BookOpen, color: "bg-white/10 text-[#e5e2e1] border border-white/10" },
  { label: "Raise Maintenance", href: "/maintenance", icon: Wrench, color: "bg-white/10 text-[#e5e2e1] border border-white/10" },
];

const severityIcon: Record<string, React.ReactNode> = {
  error: <AlertTriangle size={14} className="text-red-400 shrink-0" />,
  warning: <AlertTriangle size={14} className="text-yellow-400 shrink-0" />,
};
const severityBg: Record<string, string> = {
  error: "bg-red-500/8 border-red-500/20",
  warning: "bg-yellow-500/8 border-yellow-500/20",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Overview of your asset ecosystem"
        icon={Zap}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      {/* Alerts + Quick Actions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/8"
        >
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Active Alerts</h2>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl border ${severityBg[alert.severity]}`}>
                {severityIcon[alert.severity]}
                <span className="text-[13px] text-[#e5e2e1]">{alert.message}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
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
        <div className="space-y-0">
          {mockActivityLogs.slice(0, 8).map((log, i) => {
            const severityColor: Record<string, string> = {
              info: "bg-[#00f0ff]",
              warning: "bg-yellow-400",
              error: "bg-red-400",
            };
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColor[log.severity]}`} />
                  {i < mockActivityLogs.length - 1 && <div className="w-px flex-1 bg-white/8 mt-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-[#e5e2e1]">{log.action}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8e9192]">
                      <Clock size={11} />
                      {new Date(log.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
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
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
