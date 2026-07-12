"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Search, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockAssets } from "@/lib/mock-data";
import { mockAllocations, mockTransferRequests } from "@/lib/mock-data-extra";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/lib/mock-data";

export default function AllocationPage() {
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [fromEmployee, setFromEmployee] = useState("");
  const [toEmployee, setToEmployee] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const searchResults = assetSearch.length > 1
    ? mockAssets.filter(a => a.name.toLowerCase().includes(assetSearch.toLowerCase()) || a.id.toLowerCase().includes(assetSearch.toLowerCase()))
    : [];

  const isAllocated = selectedAsset?.status === "Allocated";

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Allocation & Transfer" description="Allocate assets to employees or raise transfer requests" icon={ArrowLeftRight} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Asset Search + Transfer Form */}
        <div className="xl:col-span-3 space-y-4">
          {/* Asset Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-5 border border-white/8">
            <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Search Asset</h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
              <input value={assetSearch} onChange={e => { setAssetSearch(e.target.value); setSelectedAsset(null); }}
                placeholder="Search by asset name or ID…"
                className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
            </div>
            {searchResults.length > 0 && !selectedAsset && (
              <div className="mt-2 bg-[#201f1f] border border-white/8 rounded-xl overflow-hidden">
                {searchResults.slice(0, 5).map(asset => (
                  <button key={asset.id} onClick={() => { setSelectedAsset(asset); setAssetSearch(asset.name); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 text-left border-b border-white/5 last:border-0 transition-colors">
                    <div>
                      <p className="text-[13px] font-medium text-[#e5e2e1]">{asset.name}</p>
                      <p className="text-[11px] font-mono text-[#00f0ff]">{asset.id}</p>
                    </div>
                    <StatusBadge status={asset.status} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Asset Info + Warning */}
          {selectedAsset && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-panel rounded-2xl p-5 border border-white/8 mb-3">
                <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Asset Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Asset", selectedAsset.name],
                    ["ID", selectedAsset.id],
                    ["Department", selectedAsset.department],
                    ["Current Holder", selectedAsset.currentHolder],
                    ["Location", selectedAsset.location],
                    ["Status", selectedAsset.status],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white/3 rounded-xl p-3">
                      <p className="text-[11px] text-[#8e9192]">{k}</p>
                      <p className="text-[13px] text-[#e5e2e1] font-medium">{k === "Status" ? <StatusBadge status={v} /> : v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isAllocated && (
                <div className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/25 rounded-xl mb-3">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-red-400">Direct Allocation Blocked</p>
                    <p className="text-[12px] text-[#8e9192] mt-0.5">Already allocated to <span className="text-[#e5e2e1]">{selectedAsset.currentHolder}</span>. You must raise a transfer request.</p>
                  </div>
                </div>
              )}

              {/* Transfer Form */}
              <div className="glass-panel rounded-2xl p-5 border border-white/8">
                <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">
                  {isAllocated ? "Transfer Request" : "Allocate Asset"}
                </h2>
                <div className="space-y-4">
                  {isAllocated && (
                    <div className="space-y-1.5">
                      <Label className="text-[#8e9192] text-[12px]">From Employee</Label>
                      <input value={selectedAsset.currentHolder} disabled
                        className="w-full px-3 py-2 bg-white/3 border border-white/8 rounded-xl text-[13px] text-[#8e9192]" />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-[#8e9192] text-[12px]">To Employee</Label>
                    <input value={toEmployee} onChange={e => setToEmployee(e.target.value)} placeholder="Enter employee name…"
                      className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8e9192] text-[12px]">Reason</Label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for allocation/transfer…" rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8e9192] text-[12px]">Priority</Label>
                    <select className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none">
                      {["Normal","High","Critical"].map(p => <option key={p} className="bg-[#1c1b1b]">{p}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <motion.button onClick={handleSubmit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-2.5 bg-[#00f0ff] text-black rounded-xl text-[13px] font-semibold">
                      {isAllocated ? "Submit Transfer Request" : "Allocate Asset"}
                    </motion.button>
                    <button onClick={() => setSelectedAsset(null)}
                      className="px-4 py-2.5 bg-white/5 border border-white/8 text-[#8e9192] rounded-xl text-[13px] hover:bg-white/8 transition-colors">Cancel</button>
                  </div>
                  {submitted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-400 text-[13px]">
                      <CheckCircle size={14} /> Request submitted successfully!
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Transfer Requests */}
        <div className="xl:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-5 border border-white/8">
            <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Transfer Requests</h2>
            <div className="space-y-3">
              {mockTransferRequests.map((req, i) => (
                <motion.div key={req.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-white/3 border border-white/8 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[13px] font-medium text-[#e5e2e1]">{req.assetName}</p>
                      <p className="text-[11px] font-mono text-[#00f0ff]">{req.assetId}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="text-[12px] text-[#8e9192] space-y-0.5">
                    <p>{req.fromEmployee} → {req.toEmployee}</p>
                    <p>{req.reason}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-[11px] text-[#444748]">
                      <Clock size={11} /> {req.createdAt}
                    </div>
                    {req.status === "Pending" && (
                      <div className="flex gap-1">
                        <button className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-[11px] font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1">
                          <CheckCircle size={11} /> Approve
                        </button>
                        <button className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-[11px] font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                          <XCircle size={11} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Allocation History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-5 border border-white/8">
            <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Active Allocations</h2>
            <div className="space-y-3">
              {mockAllocations.map((alloc, i) => (
                <div key={alloc.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[#00f0ff] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#e5e2e1] truncate">{alloc.assetName}</p>
                    <p className="text-[11px] text-[#8e9192]">{alloc.toEmployee} · {alloc.department}</p>
                  </div>
                  <StatusBadge status={alloc.status} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
