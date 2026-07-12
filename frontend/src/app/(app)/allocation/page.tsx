"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Search, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { assetsApi, allocationApi, type Asset, type Allocation, type TransferRequest } from "@/lib/api";
import { Label } from "@/components/ui/label";

export default function AllocationPage() {
  const [assetSearch, setAssetSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [toEmployee, setToEmployee] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [loadingRight, setLoadingRight] = useState(true);

  const loadPanel = useCallback(async () => {
    setLoadingRight(true);
    try {
      const [a, t] = await Promise.all([allocationApi.list(), allocationApi.transfers.list()]);
      setAllocations(a.data);
      setTransfers(t.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRight(false);
    }
  }, []);

  useEffect(() => { loadPanel(); }, [loadPanel]);

  // Live asset search
  useEffect(() => {
    if (assetSearch.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await assetsApi.list({ search: assetSearch });
        setSearchResults(res.data.slice(0, 6));
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [assetSearch]);

  const isAllocated = selectedAsset?.status === "Allocated";

  const handleSubmit = async () => {
    if (!selectedAsset || !toEmployee) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      if (isAllocated) {
        await allocationApi.transfers.create({
          assetId: selectedAsset.id,
          fromEmployee: selectedAsset.currentHolder,
          toEmployee,
          reason,
          priority,
        });
        setSubmitMsg({ ok: true, text: "Transfer request submitted successfully." });
      } else {
        await allocationApi.create({ assetId: selectedAsset.id, toEmployee, reason });
        setSubmitMsg({ ok: true, text: "Asset allocated successfully." });
      }
      setSelectedAsset(null);
      setAssetSearch("");
      setToEmployee("");
      setReason("");
      loadPanel();
    } catch (e: any) {
      setSubmitMsg({ ok: false, text: e.message || "Submission failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferAction = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await allocationApi.transfers.update(id, status);
      loadPanel();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Allocation & Transfer" description="Allocate assets to employees or raise transfer requests" icon={ArrowLeftRight} />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Search + Form */}
        <div className="xl:col-span-3 space-y-4">
          {/* Asset Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-5 border border-white/8">
            <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Search Asset</h2>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
              <input value={assetSearch}
                onChange={e => { setAssetSearch(e.target.value); setSelectedAsset(null); }}
                placeholder="Search by asset name or ID…"
                className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
            </div>
            {searchResults.length > 0 && !selectedAsset && (
              <div className="mt-2 bg-[#201f1f] border border-white/8 rounded-xl overflow-hidden">
                {searchResults.map(asset => (
                  <button key={asset.id}
                    onClick={() => { setSelectedAsset(asset); setAssetSearch(asset.name); setSearchResults([]); }}
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

          {/* Asset Info + Form */}
          {selectedAsset && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="glass-panel rounded-2xl p-5 border border-white/8">
                <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Asset Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[["Asset", selectedAsset.name], ["ID", selectedAsset.id],
                    ["Department", selectedAsset.department], ["Current Holder", selectedAsset.currentHolder],
                    ["Location", selectedAsset.location]].map(([k, v]) => (
                    <div key={k} className="bg-white/3 rounded-xl p-3">
                      <p className="text-[11px] text-[#8e9192]">{k}</p>
                      <p className="text-[13px] text-[#e5e2e1] font-medium">{v}</p>
                    </div>
                  ))}
                  <div className="bg-white/3 rounded-xl p-3">
                    <p className="text-[11px] text-[#8e9192] mb-1">Status</p>
                    <StatusBadge status={selectedAsset.status} />
                  </div>
                </div>
              </div>

              {isAllocated && (
                <div className="flex items-start gap-3 p-4 bg-red-500/8 border border-red-500/25 rounded-xl">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-red-400">Direct Allocation Blocked</p>
                    <p className="text-[12px] text-[#8e9192] mt-0.5">Already allocated to <span className="text-[#e5e2e1]">{selectedAsset.currentHolder}</span>. Raise a transfer request instead.</p>
                  </div>
                </div>
              )}

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
                    <Label className="text-[#8e9192] text-[12px]">To Employee *</Label>
                    <input value={toEmployee} onChange={e => setToEmployee(e.target.value)} placeholder="Enter employee name…"
                      className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8e9192] text-[12px]">Reason</Label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                      placeholder="Reason for allocation / transfer…"
                      className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40 resize-none" />
                  </div>
                  {isAllocated && (
                    <div className="space-y-1.5">
                      <Label className="text-[#8e9192] text-[12px]">Priority</Label>
                      <select value={priority} onChange={e => setPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-xl text-[13px] text-[#e5e2e1] focus:outline-none">
                        {["Low", "Medium", "High", "Critical"].map(p => <option key={p} className="bg-[#1c1b1b]">{p}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <motion.button onClick={handleSubmit} disabled={submitting || !toEmployee}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 py-2.5 bg-[#00f0ff] text-black rounded-xl text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                      {submitting ? "Submitting…" : isAllocated ? "Submit Transfer Request" : "Allocate Asset"}
                    </motion.button>
                    <button onClick={() => { setSelectedAsset(null); setAssetSearch(""); setToEmployee(""); setReason(""); }}
                      className="px-4 py-2.5 bg-white/5 border border-white/8 text-[#8e9192] rounded-xl text-[13px] hover:bg-white/8 transition-colors">
                      Cancel
                    </button>
                  </div>
                  {submitMsg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`flex items-center gap-2 text-[13px] ${submitMsg.ok ? "text-green-400" : "text-red-400"}`}>
                      {submitMsg.ok ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                      {submitMsg.text}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Transfer Requests + Active Allocations */}
        <div className="xl:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">Transfer Requests</h2>
              <button onClick={loadPanel} className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] transition-colors"><RefreshCw size={13} /></button>
            </div>
            {loadingRight ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse mb-2" />)
            ) : transfers.length === 0 ? (
              <p className="text-[#8e9192] text-[13px] text-center py-6">No transfer requests yet.</p>
            ) : (
              <div className="space-y-3">
                {transfers.map((req, i) => (
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
                          <button onClick={() => handleTransferAction(req.id, "Approved")}
                            className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-[11px] font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1">
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button onClick={() => handleTransferAction(req.id, "Rejected")}
                            className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-[11px] font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1">
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel rounded-2xl p-5 border border-white/8">
            <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider mb-4">Active Allocations</h2>
            {loadingRight ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse mb-2" />)
            ) : allocations.filter(a => a.status === "Active").length === 0 ? (
              <p className="text-[#8e9192] text-[13px] text-center py-6">No active allocations.</p>
            ) : (
              <div className="space-y-3">
                {allocations.filter(a => a.status === "Active").map(alloc => (
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
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
