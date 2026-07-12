"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, X, Clock, User, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { maintenanceApi, assetsApi, type MaintenanceTask, type Asset } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const columns = ["Pending", "Approved", "Technician Assigned", "In Progress", "Resolved"] as const;
type ColType = typeof columns[number];

const colColors: Record<ColType, string> = {
  "Pending": "border-orange-500/30 bg-orange-500/5",
  "Approved": "border-[#00f0ff]/30 bg-[#00f0ff]/5",
  "Technician Assigned": "border-purple-500/30 bg-purple-500/5",
  "In Progress": "border-yellow-500/30 bg-yellow-500/5",
  "Resolved": "border-green-500/30 bg-green-500/5",
};
const colHeaderColors: Record<ColType, string> = {
  "Pending": "text-orange-400", "Approved": "text-[#00f0ff]",
  "Technician Assigned": "text-purple-400", "In Progress": "text-yellow-400", "Resolved": "text-green-400",
};
const priorityColors: Record<string, string> = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/25",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  Low: "text-[#8e9192] bg-white/5 border-white/10",
};

const emptyForm = { assetId: "", assetName: "", issue: "", description: "", priority: "Medium", technician: "", department: "" };

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [assetSearch, setAssetSearch] = useState("");
  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await maintenanceApi.list();
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Asset autocomplete for new request
  useEffect(() => {
    if (assetSearch.length < 2) { setAssetResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await assetsApi.list({ search: assetSearch });
        setAssetResults(res.data.slice(0, 5));
      } catch { setAssetResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [assetSearch]);

  const moveTask = async (taskId: string, toCol: ColType) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: toCol } : t));
    try {
      await maintenanceApi.update(taskId, { status: toCol });
    } catch (e) {
      console.error(e);
      loadTasks(); // revert on failure
    }
  };

  const updateSelectedTask = async (toCol: ColType) => {
    if (!selectedTask) return;
    await moveTask(selectedTask.id, toCol);
    setSelectedTask(prev => prev ? { ...prev, status: toCol } : null);
  };

  const handleNewSubmit = async () => {
    if (!form.issue) { setFormError("Issue description is required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await maintenanceApi.create({
        assetId: form.assetId || undefined,
        assetName: form.assetName || form.assetId || "Unknown Asset",
        issue: form.issue,
        description: form.description,
        priority: form.priority as MaintenanceTask["priority"],
        technician: form.technician || undefined,
        department: form.department || undefined,
      });
      setNewOpen(false);
      setForm(emptyForm);
      setAssetSearch("");
      loadTasks();
    } catch (e: any) {
      setFormError(e.message || "Failed to raise request.");
    } finally {
      setSubmitting(false);
    }
  };

  const sf = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <PageHeader title="Maintenance" description="Track and manage asset maintenance requests" icon={Wrench}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setNewOpen(true); setForm(emptyForm); setAssetSearch(""); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold">
          <Plus size={14} /> Raise Request
        </motion.button>
      </PageHeader>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <div key={col} className="flex-shrink-0 w-64 rounded-2xl border border-white/8 p-3 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-24 mb-3" />
              {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl mb-2" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); if (dragging) { moveTask(dragging, col); setDragging(null); } }}
                className={`flex-shrink-0 w-64 rounded-2xl border p-3 ${colColors[col]}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-[12px] font-semibold uppercase tracking-wider ${colHeaderColors[col]}`}>{col}</h3>
                  <span className="w-5 h-5 rounded-full bg-white/10 text-[#8e9192] text-[11px] flex items-center justify-center font-bold">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  <AnimatePresence>
                    {colTasks.map(task => (
                      <motion.div
                        key={task.id} layout
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        draggable onDragStart={() => setDragging(task.id)} onDragEnd={() => setDragging(null)}
                        onClick={() => setSelectedTask(task)}
                        className="bg-[#1c1b1b] border border-white/8 rounded-xl p-3 cursor-pointer hover:border-white/15 hover:bg-[#201f1f] transition-all"
                        whileHover={{ y: -1 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-[13px] font-medium text-[#e5e2e1] leading-tight">{task.assetName}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>{task.priority}</span>
                        </div>
                        <p className="text-[11px] text-[#8e9192] mb-2 line-clamp-2">{task.issue}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#444748]">
                          <div className="flex items-center gap-1"><User size={10} />{task.technician}</div>
                          <div className="flex items-center gap-1"><Clock size={10} />{new Date(task.createdAt).toLocaleDateString()}</div>
                        </div>
                        <p className="text-[10px] font-mono text-[#00f0ff]/60 mt-1.5">{task.id}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div className="h-16 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center">
                      <p className="text-[11px] text-[#444748]">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        {selectedTask && (
          <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#e5e2e1] flex items-center gap-2">
                <Wrench size={16} className="text-[#00f0ff]" /> {selectedTask.assetName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={selectedTask.status} />
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityColors[selectedTask.priority]}`}>{selectedTask.priority}</span>
                <span className="text-[11px] font-mono text-[#00f0ff]">{selectedTask.id}</span>
              </div>
              <div className="bg-white/3 rounded-xl p-4">
                <p className="text-[12px] font-semibold text-[#8e9192] mb-1">Issue</p>
                <p className="text-[13px] text-[#e5e2e1]">{selectedTask.issue}</p>
                {selectedTask.description && <p className="text-[12px] text-[#8e9192] mt-2">{selectedTask.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["Asset ID", selectedTask.assetId], ["Department", selectedTask.department],
                  ["Technician", selectedTask.technician],
                  ["Created", new Date(selectedTask.createdAt).toLocaleDateString()]].map(([k, v]) => (
                  <div key={k} className="bg-white/3 rounded-xl p-3">
                    <p className="text-[11px] text-[#8e9192]">{k}</p>
                    <p className="text-[13px] text-[#e5e2e1] font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#8e9192] mb-2">Move To</p>
                <div className="flex flex-wrap gap-2">
                  {columns.filter(c => c !== selectedTask.status).map(col => (
                    <button key={col} onClick={() => updateSelectedTask(col)}
                      className="px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-[12px] text-[#e5e2e1] hover:bg-white/10 transition-colors">
                      → {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* New Request Modal */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader><DialogTitle>Raise Maintenance Request</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Asset search */}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Asset</Label>
              <div className="relative">
                <input value={assetSearch}
                  onChange={e => { setAssetSearch(e.target.value); setForm(f => ({ ...f, assetId: "", assetName: e.target.value })); }}
                  placeholder="Search asset name or ID…"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
                {assetResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#201f1f] border border-white/8 rounded-xl overflow-hidden z-10">
                    {assetResults.map(a => (
                      <button key={a.id} onClick={() => { setForm(f => ({ ...f, assetId: a.id, assetName: a.name, department: a.department })); setAssetSearch(a.name); setAssetResults([]); }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left border-b border-white/5 last:border-0">
                        <p className="text-[13px] text-[#e5e2e1]">{a.name}</p>
                        <p className="text-[11px] font-mono text-[#00f0ff]">{a.id}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Issue *</Label>
              <input value={form.issue} onChange={sf("issue")} placeholder="Describe the issue…"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Description</Label>
              <textarea value={form.description} onChange={sf("description")} rows={2} placeholder="Additional details…"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">Priority</Label>
                <select value={form.priority} onChange={sf("priority")}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none">
                  {["Low", "Medium", "High", "Critical"].map(p => <option key={p} className="bg-[#1c1b1b]">{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">Technician</Label>
                <input value={form.technician} onChange={sf("technician")} placeholder="Assign technician…"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Department</Label>
              <input value={form.department} onChange={sf("department")} placeholder="e.g. IT, Finance…"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
            </div>
          </div>
          {formError && <p className="text-red-400 text-[12px] px-1">{formError}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)} className="text-[#8e9192]">Cancel</Button>
            <Button onClick={handleNewSubmit} disabled={submitting} className="bg-[#00f0ff] text-black font-semibold">
              {submitting ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
