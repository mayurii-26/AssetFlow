"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, Calendar, Wrench, ClipboardCheck, Check, Trash2, Filter, RefreshCw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { notificationsApi, activityApi, type Notification, type ActivityLog } from "@/lib/api";

const typeIcons: Record<string, React.ReactNode> = {
  ALERT:       <AlertTriangle size={16} className="text-red-400" />,
  APPROVAL:    <CheckCircle size={16} className="text-[#00f0ff]" />,
  BOOKING:     <Calendar size={16} className="text-purple-400" />,
  MAINTENANCE: <Wrench size={16} className="text-yellow-400" />,
  AUDIT:       <ClipboardCheck size={16} className="text-orange-400" />,
};
const typeBg: Record<string, string> = {
  ALERT:       "bg-red-500/10 border-red-500/20",
  APPROVAL:    "bg-[#00f0ff]/10 border-[#00f0ff]/20",
  BOOKING:     "bg-purple-500/10 border-purple-500/20",
  MAINTENANCE: "bg-yellow-500/10 border-yellow-500/20",
  AUDIT:       "bg-orange-500/10 border-orange-500/20",
};
const severityDot: Record<string, string> = {
  INFO: "bg-[#00f0ff]", WARNING: "bg-yellow-400", ERROR: "bg-red-400",
  info: "bg-[#00f0ff]", warning: "bg-yellow-400", error: "bg-red-400",
};

const tabs = ["All", "Alerts", "Approvals", "Bookings", "Maintenance", "Audit"];
const tabFilter: Record<string, string> = {
  All: "", Alerts: "ALERT", Approvals: "APPROVAL",
  Bookings: "BOOKING", Maintenance: "MAINTENANCE", Audit: "AUDIT",
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nRes, lRes] = await Promise.all([
        notificationsApi.list(),
        activityApi.list(30),
      ]);
      setNotifications(nRes.data);
      setLogs(lRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = notifications.filter(n =>
    !tabFilter[activeTab] || n.type === tabFilter[activeTab]
  );

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await notificationsApi.markRead(id); } catch { load(); }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await notificationsApi.markAllRead(); } catch { load(); }
  };

  const remove = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try { await notificationsApi.remove(id); } catch { load(); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Notifications" description="Alerts, approvals, and activity across all modules" icon={Bell}>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-full bg-white/5 border border-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
            <RefreshCw size={14} />
          </button>
          {unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/10 text-[#e5e2e1] rounded-full text-[13px] font-medium hover:bg-white/12 transition-colors">
              <Check size={14} /> Mark All Read ({unreadCount})
            </motion.button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Notifications panel */}
        <div className="xl:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 flex-wrap">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${activeTab === tab ? "bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/25" : "bg-white/5 text-[#8e9192] hover:text-[#e5e2e1] border border-white/8"}`}>
                {tab}
                {tab !== "All" && (
                  <span className="ml-1.5 text-[10px] opacity-60">
                    {notifications.filter(n => n.type === tabFilter[tab]).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filtered.map((notif, i) => (
                  <motion.div key={notif.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex gap-4 p-4 rounded-2xl border transition-all ${notif.read ? "bg-white/2 border-white/6 opacity-70" : typeBg[notif.type] || "bg-white/5 border-white/10"}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? "bg-white/5" : typeBg[notif.type] || "bg-white/5"}`}>
                      {typeIcons[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] font-semibold ${notif.read ? "text-[#8e9192]" : "text-[#e5e2e1]"}`}>{notif.title}</p>
                        <span className="text-[11px] text-[#444748] shrink-0">
                          {new Date(notif.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#8e9192] mt-0.5">{notif.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#8e9192]">{notif.module}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!notif.read && (
                        <button onClick={() => markRead(notif.id)} title="Mark read"
                          className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
                          <Check size={13} />
                        </button>
                      )}
                      <button onClick={() => remove(notif.id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Bell size={32} className="text-[#444748] mx-auto mb-3" />
                  <p className="text-[#8e9192] text-[14px]">
                    {notifications.length === 0
                      ? "No notifications yet. Activity will appear here as you use the platform."
                      : "No notifications in this category."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">Activity Log</h2>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-white/8 py-12 text-center">
              <p className="text-[#8e9192] text-[13px]">No activity yet. Actions you take will appear here.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/8 divide-y divide-white/5">
              {logs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${severityDot[log.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#e5e2e1]">{log.action}</p>
                    <p className="text-[11px] text-[#8e9192] mt-0.5 truncate">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-[#444748]">
                      <span>{log.user}</span><span>·</span><span>{log.module}</span><span>·</span>
                      <span>{new Date(log.timestamp ?? log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
