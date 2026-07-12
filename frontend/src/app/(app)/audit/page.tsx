"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, AlertTriangle, Download, Plus } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuditItem {
  id: string;
  assetId: string;
  assetName: string;
  expectedLocation: string;
  actualLocation: string;
  condition: string;
  status: "Verified" | "Missing" | "Damaged" | "Discrepancy";
  verifiedBy: string;
  verifiedAt: string;
}

interface AuditCycle {
  id: string;
  name: string;
  department: string;
  auditors: string[];
  startDate: string;
  endDate: string;
  status: "Active" | "Closed";
  items: AuditItem[];
  totalItems: number;
  verified: number;
  discrepancies: number;
}

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("assetflow_token") : null;
}

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = token();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(opts.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) throw new Error(data.error || "Request failed");
  return data;
}

const emptyForm = { name: "", department: "All Departments", startDate: "", endDate: "" };

export default function AuditPage() {
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<AuditCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCycles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ success: true; data: AuditCycle[] }>("/api/audit");
      setCycles(res.data);
      const active = res.data.find(c => c.status === "Active");
      if (active) {
        const detail = await api<{ success: true; data: AuditCycle }>(`/api/audit/${active.id}`);
        setActiveCycle(detail.data);
      } else {
        setActiveCycle(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCycles(); }, [loadCycles]);

  const handleCreate = async () => {
    if (!form.name || !form.startDate || !form.endDate) { setFormError("Name, start date, and end date are required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api("/api/audit", { method: "POST", body: JSON.stringify(form) });
      setNewOpen(false);
      setForm(emptyForm);
      loadCycles();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!activeCycle) return;
    if (!confirm("Close this audit cycle? This cannot be undone.")) return;
    try {
      await api(`/api/audit/${activeCycle.id}/close`, { method: "PATCH" });
      loadCycles();
    } catch (e: any) { alert(e.message); }
  };

  const items = activeCycle?.items || [];
  const discrepancies = items.filter(a => a.status !== "Verified");

  const sf = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Audit" description="Track asset verification and discrepancy reports" icon={ClipboardCheck}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setNewOpen(true); setForm(emptyForm); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold">
          <Plus size={14} /> New Audit Cycle
        </motion.button>
        {activeCycle && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleClose}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/25 text-red-400 rounded-full text-[13px] font-medium hover:bg-red-500/25 transition-colors">
            Close Cycle
          </motion.button>
        )}
      </PageHeader>

      {loading ? (
        <div className="glass-panel rounded-2xl p-5 border border-white/8 animate-pulse h-32" />
      ) : !activeCycle ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-10 border border-white/8 text-center">
          <ClipboardCheck size={40} className="text-[#444748] mx-auto mb-3" />
          <p className="text-[#e5e2e1] text-[15px] font-medium mb-1">No Active Audit Cycle</p>
          <p className="text-[#8e9192] text-[13px]">Create a new audit cycle to start verifying assets.</p>
        </motion.div>
      ) : (
        <>
          {/* Cycle Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-5 border border-white/8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[["Audit Cycle", activeCycle.id], ["Department", activeCycle.department],
                ["Start Date", activeCycle.startDate], ["End Date", activeCycle.endDate]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-1">{k}</p>
                  <p className="text-[14px] font-semibold text-[#e5e2e1]">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[{ label: "Total Items", value: items.length, color: "text-[#e5e2e1]" },
                { label: "Verified", value: items.filter(a => a.status === "Verified").length, color: "text-green-400" },
                { label: "Discrepancies", value: discrepancies.length, color: "text-red-400" }].map(({ label, value, color }) => (
                <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-[11px] text-[#8e9192] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {discrepancies.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/25 rounded-2xl">
              <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-red-400">{discrepancies.length} Discrepancies Found</p>
                <p className="text-[13px] text-[#8e9192] mt-0.5">
                  {discrepancies.map(d => `${d.assetName} (${d.status})`).join(" · ")}
                </p>
              </div>
            </motion.div>
          )}

          {items.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 border border-white/8 text-center">
              <p className="text-[#8e9192] text-[13px]">No items in this audit cycle yet. Add assets to the checklist via the API.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/8">
                <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">Audit Checklist</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {["Asset", "Expected Location", "Actual Location", "Condition", "Status", "Verified By", "Date"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <motion.tr key={item.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className={`border-b border-white/5 transition-colors ${
                          item.status === "Missing" ? "bg-red-500/5 hover:bg-red-500/8" :
                          item.status === "Damaged" ? "bg-orange-500/5 hover:bg-orange-500/8" :
                          item.status === "Discrepancy" ? "bg-yellow-500/5 hover:bg-yellow-500/8" : "hover:bg-white/3"
                        }`}>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium text-[#e5e2e1]">{item.assetName}</p>
                          <p className="text-[11px] font-mono text-[#00f0ff]">{item.assetId}</p>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">{item.expectedLocation}</td>
                        <td className="px-4 py-3 text-[13px] text-[#e5e2e1]">
                          {item.actualLocation !== item.expectedLocation && item.actualLocation !== "—"
                            ? <span className="text-yellow-400">{item.actualLocation}</span>
                            : item.actualLocation}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">{item.condition}</td>
                        <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">{item.verifiedBy}</td>
                        <td className="px-4 py-3 text-[13px] text-[#8e9192]">{item.verifiedAt}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* New Audit Cycle Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader><DialogTitle>New Audit Cycle</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Cycle Name *</Label>
              <input value={form.name} onChange={sf("name")} placeholder="e.g. Q3 2026 Asset Audit"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Department</Label>
              <input value={form.department} onChange={sf("department")} placeholder="All Departments"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">Start Date *</Label>
                <input type="date" value={form.startDate} onChange={sf("startDate")}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">End Date *</Label>
                <input type="date" value={form.endDate} onChange={sf("endDate")}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
            </div>
          </div>
          {formError && <p className="text-red-400 text-[12px] px-1">{formError}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)} className="text-[#8e9192]">Cancel</Button>
            <Button onClick={handleCreate} disabled={submitting} className="bg-[#00f0ff] text-black font-semibold">
              {submitting ? "Creating…" : "Create Cycle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
