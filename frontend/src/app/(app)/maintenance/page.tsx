"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, X, Clock, User } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { maintenanceApi, assetsApi, maintenanceStatusLabel, getUserId, type MaintenanceTask, type Asset } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";

// DB status values (SCREAMING_SNAKE)
const COLUMNS = ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS", "RESOLVED"] as const;
type ColType = typeof COLUMNS[number];

const COL_COLORS: Record<ColType, string> = {
  PENDING:             "border-orange-500/30 bg-orange-500/5",
  APPROVED:            "border-[#00f0ff]/30 bg-[#00f0ff]/5",
  TECHNICIAN_ASSIGNED: "border-purple-500/30 bg-purple-500/5",
  IN_PROGRESS:         "border-yellow-500/30 bg-yellow-500/5",
  RESOLVED:            "border-green-500/30 bg-green-500/5",
};
const COL_HEADER_COLORS: Record<ColType, string> = {
  PENDING:             "text-orange-400",
  APPROVED:            "text-[#00f0ff]",
  TECHNICIAN_ASSIGNED: "text-purple-400",
  IN_PROGRESS:         "text-yellow-400",
  RESOLVED:            "text-green-400",
};
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/25",
  HIGH:     "text-orange-400 bg-orange-500/10 border-orange-500/25",
  MEDIUM:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  LOW:      "text-[#8e9192] bg-white/5 border-white/10",
};

const emptyForm = { assetId: "", issue: "", description: "", priority: "MEDIUM", technician: "" };

export default function MaintenancePage() {
  const { user } = useAuth();
  const { canApproveRequests } = useRole();

  const [tasks,        setTasks]        = useState<MaintenanceTask[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [newOpen,      setNewOpen]      = useState(false);
  const [dragging,     setDragging]     = useState<string | null>(null);
  const [form,         setForm]         = useState({ ...emptyForm, technician: user?.name ?? "" });
  const [assetSearch,  setAssetSearch]  = useState("");
  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [formError,    setFormError]    = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await maintenanceApi.list();
      setTasks(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Asset autocomplete
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
    } catch { loadTasks(); }
  };

  const updateSelectedTask = async (toCol: ColType) => {
    if (!selectedTask) return;
    await moveTask(selectedTask.id, toCol);
    setSelectedTask(prev => prev ? { ...prev, status: toCol } : null);
  };

  const handleNewSubmit = async () => {
    if (!form.assetId) { setFormError("Please select an asset."); return; }
    if (!form.issue)   { setFormError("Issue description is required."); return; }
    const userId = getUserId();
    if (!userId) { setFormError("Session expired. Please log in again."); return; }

    setSubmitting(true);
    setFormError("");
    try {
      await maintenanceApi.create({
        assetId:     form.assetId,
        issue:       form.issue,
        raisedById:  userId,
        description: form.description || undefined,
        priority:    form.priority,
        technician:  form.technician || undefined,
      });
      setNewOpen(false);
      setForm({ ...emptyForm, technician: user?.name ?? "" });
      setAssetSearch("");
      loadTasks();
    } catch (e: any) {
      setFormError(e.message || "Failed to raise request.");
    } finally {
      setSubmitting(false);
    }
  };

  const sf = (key: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  // Helper: get asset name from task
  const taskAssetName = (t: MaintenanceTask) => t.asset?.name ?? t.assetId;

  return (
    <div className="space-y-5">
      <PageHeader title="Maintenance" description="Track and manage asset maintenance requests" icon={Wrench}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setNewOpen(true); setForm({ ...emptyForm, technician: user?.name ?? "" }); setAssetSearch(""); setFormError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold">
          <Plus size={14} /> Raise Request
        </motion.button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-5 gap-3 min-w-0">
          {COLUMNS.map(col => (
            <div key={col} className="rounded-2xl border border-white/8 p-3 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-24 mb-3" />
              {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl mb-2" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3 min-w-0">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col);
            return (
              <div key={col}
                onDragOver={e => { if (canApproveRequests) e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); if (canApproveRequests && dragging) { moveTask(dragging, col); setDragging(null); } }}
                className={`rounded-2xl border p-3 min-w-0 ${COL_COLORS[col]}`}>
                <div className="flex items-center justify-between mb-3 gap-1">
                  <h3 className={`text-[11px] font-semibold uppercase tracking-wider truncate ${COL_HEADER_COLORS[col]}`}>
                    {maintenanceStatusLabel(col)}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-white/10 text-[#8e9192] text-[11px] flex items-center justify-center font-bold shrink-0">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  <AnimatePresence>
                    {colTasks.map(task => (
                      <motion.div key={task.id} layout
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        draggable={canApproveRequests}
                        onDragStart={() => { if (canApproveRequests) setDragging(task.id); }}
                        onDragEnd={() => setDragging(null)}
                        onClick={() => setSelectedTask(task)}
                        className="bg-[#1c1b1b] border border-white/8 rounded-xl p-3 cursor-pointer hover:border-white/15 hover:bg-[#201f1f] transition-all"
                        whileHover={{ y: -1 }}
                      >
                        <div className="flex items-start justify-between mb-2 gap-1">
                          <p className="text-[12px] font-medium text-[#e5e2e1] leading-tight truncate">{taskAssetName(task)}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8e9192] mb-2 line-clamp-2">{task.issue}</p>
                        <div className="flex items-center justify-between text-[10px] text-[#444748] gap-1">
                          <div className="flex items-center gap-1 truncate"><User size={10} className="shrink-0" /><span className="truncate">{task.technician ?? "—"}</span></div>
                          <div className="flex items-center gap-1 shrink-0"><Clock size={10} />{new Date(task.createdAt).toLocaleDateString("en-IN")}</div>
                        </div>
                        <p className="text-[10px] font-mono text-[#00f0ff]/60 mt-1.5 truncate">{task.id}</p>
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
                <Wrench size={16} className="text-[#00f0ff]" /> {taskAssetName(selectedTask)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={maintenanceStatusLabel(selectedTask.status)} />
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${PRIORITY_COLORS[selectedTask.priority]}`}>
                  {selectedTask.priority.charAt(0) + selectedTask.priority.slice(1).toLowerCase()}
                </span>
                <span className="text-[11px] font-mono text-[#00f0ff]">{selectedTask.id}</span>
              </div>
              <div className="bg-white/3 rounded-xl p-4">
                <p className="text-[12px] font-semibold text-[#8e9192] mb-1">Issue</p>
                <p className="text-[13px] text-[#e5e2e1]">{selectedTask.issue}</p>
                {selectedTask.description && <p className="text-[12px] text-[#8e9192] mt-2">{selectedTask.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Asset ID",   selectedTask.assetId],
                  ["Department", selectedTask.department],
                  ["Technician", selectedTask.technician ?? "—"],
                  ["Created",    new Date(selectedTask.createdAt).toLocaleDateString("en-IN")],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/3 rounded-xl p-3">
                    <p className="text-[11px] text-[#8e9192]">{k}</p>
                    <p className="text-[13px] text-[#e5e2e1] font-medium">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#8e9192] mb-2">Move To</p>
                {canApproveRequests ? (
                  <div className="flex flex-wrap gap-2">
                    {COLUMNS.filter(c => c !== selectedTask.status).map(col => (
                      <button key={col} onClick={() => updateSelectedTask(col)}
                        className="px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-[12px] text-[#e5e2e1] hover:bg-white/10 transition-colors">
                        → {maintenanceStatusLabel(col)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#8e9192]">Only Asset Managers and Admins can change the status.</p>
                )}
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
            {/* Asset search — required */}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Asset *</Label>
              <div className="relative">
                <input value={assetSearch}
                  onChange={e => { setAssetSearch(e.target.value); setForm(f => ({ ...f, assetId: "" })); }}
                  placeholder="Search asset name or ID…"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
                {assetResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#201f1f] border border-white/8 rounded-xl overflow-hidden z-10">
                    {assetResults.map(a => (
                      <button key={a.id}
                        onClick={() => { setForm(f => ({ ...f, assetId: a.id })); setAssetSearch(a.name); setAssetResults([]); }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left border-b border-white/5 last:border-0">
                        <p className="text-[13px] text-[#e5e2e1]">{a.name}</p>
                        <p className="text-[11px] font-mono text-[#00f0ff]">{a.id}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {form.assetId && (
                <p className="text-[11px] text-[#00f0ff]/70 mt-1">Selected: <span className="font-mono">{form.assetId}</span></p>
              )}
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
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(p => (
                    <option key={p} value={p} className="bg-[#1c1b1b]">{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">
                  Technician
                  <span className="ml-1 text-[10px] text-[#00f0ff]/70 font-normal">pre-filled</span>
                </Label>
                <input value={form.technician} onChange={sf("technician")} placeholder="Assign technician…"
                  className="w-full px-3 py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/20 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
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
