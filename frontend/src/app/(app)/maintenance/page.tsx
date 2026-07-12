"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, X, Clock, User, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockMaintenanceTasks } from "@/lib/mock-data-extra";
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

export default function MaintenancePage() {
  const [tasks, setTasks] = useState(mockMaintenanceTasks);
  const [selectedTask, setSelectedTask] = useState<typeof mockMaintenanceTasks[0] | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);

  const moveTask = (taskId: string, toCol: ColType) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: toCol } : t));
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <PageHeader title="Maintenance" description="Track and manage asset maintenance requests" icon={Wrench}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setNewOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold">
          <Plus size={14} /> Raise Request
        </motion.button>
      </PageHeader>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragging) { moveTask(dragging, col); setDragging(null); } }}
              className={`flex-shrink-0 w-64 rounded-2xl border p-3 ${colColors[col]}`}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-[12px] font-semibold uppercase tracking-wider ${colHeaderColors[col]}`}>{col}</h3>
                <span className="w-5 h-5 rounded-full bg-white/10 text-[#8e9192] text-[11px] flex items-center justify-center font-bold">{colTasks.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[80px]">
                <AnimatePresence>
                  {colTasks.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable
                      onDragStart={() => setDragging(task.id)}
                      onDragEnd={() => setDragging(null)}
                      onClick={() => setSelectedTask(task)}
                      className="bg-[#1c1b1b] border border-white/8 rounded-xl p-3 cursor-pointer hover:border-white/15 hover:bg-[#201f1f] transition-all group"
                      whileHover={{ y: -1 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[13px] font-medium text-[#e5e2e1] leading-tight">{task.assetName}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>{task.priority}</span>
                      </div>
                      <p className="text-[11px] text-[#8e9192] mb-2 line-clamp-2">{task.issue}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#444748]">
                        <div className="flex items-center gap-1"><User size={10} />{task.technician}</div>
                        <div className="flex items-center gap-1"><Clock size={10} />{task.createdAt}</div>
                      </div>
                      <p className="text-[10px] font-mono text-[#00f0ff]/60 mt-1.5">{task.id}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

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
                <p className="text-[12px] text-[#8e9192] mt-2">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[["Asset ID",selectedTask.assetId],["Department",selectedTask.department],["Technician",selectedTask.technician],["Created",selectedTask.createdAt],["Updated",selectedTask.updatedAt]].map(([k,v]) => (
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
                    <button key={col} onClick={() => { moveTask(selectedTask.id, col); setSelectedTask(prev => prev ? {...prev, status: col} : null); }}
                      className="px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-[12px] text-[#e5e2e1] hover:bg-white/10 hover:border-white/15 transition-colors">
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
            {[["Asset Name","text"],["Issue","text"],["Description","text"]].map(([l,t]) => (
              <div key={l} className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">{l}</Label>
                <input type={t} placeholder={`Enter ${l.toLowerCase()}…`}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Priority</Label>
              <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none">
                {["Low","Medium","High","Critical"].map(p => <option key={p} className="bg-[#1c1b1b]">{p}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)} className="text-[#8e9192]">Cancel</Button>
            <Button onClick={() => setNewOpen(false)} className="bg-[#00f0ff] text-black font-semibold">Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
