"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, Filter, X, QrCode, Pencil, Wrench, ArrowLeftRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockAssets } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Asset } from "@/lib/mock-data";

const statuses = ["All", "Available", "Allocated", "Under Maintenance", "Retired"];
const categories = ["All", "Laptops", "Monitors", "AV Equipment", "Printers", "Vehicles", "Mobile Devices", "Furniture", "Servers"];

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const filtered = mockAssets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchCat = filterCat === "All" || a.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader title="Asset Directory" description="Register, search, and manage all company assets" icon={Package}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setRegisterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold"
        >
          <Plus size={14} /> Register Asset
        </motion.button>
      </PageHeader>

      {/* Filters toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…"
            className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40 cursor-pointer">
          {statuses.map(s => <option key={s} value={s} className="bg-[#1c1b1b]">{s}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40 cursor-pointer">
          {categories.map(c => <option key={c} value={c} className="bg-[#1c1b1b]">{c}</option>)}
        </select>
        {(filterStatus !== "All" || filterCat !== "All") && (
          <button onClick={() => { setFilterStatus("All"); setFilterCat("All"); }}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-[12px] text-[#8e9192] hover:text-[#e5e2e1] bg-white/5 border border-white/8 transition-colors">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-[12px] text-[#8e9192] ml-auto">{filtered.length} assets</span>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Asset ID", "Name", "Category", "Department", "Status", "Current Holder", "Location", "Purchase Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset, i) => (
                <motion.tr
                  key={asset.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedAsset(asset)}
                  className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 text-[12px] font-mono text-[#00f0ff]">{asset.id}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1] whitespace-nowrap">{asset.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[#8e9192]">{asset.category}</td>
                  <td className="px-4 py-3 text-[13px] text-[#8e9192]">{asset.department}</td>
                  <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                  <td className="px-4 py-3 text-[13px] text-[#e5e2e1]">{asset.currentHolder}</td>
                  <td className="px-4 py-3 text-[13px] text-[#8e9192] whitespace-nowrap">{asset.location}</td>
                  <td className="px-4 py-3 text-[13px] text-[#8e9192]">{asset.purchaseDate}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package size={32} className="text-[#444748] mx-auto mb-3" />
              <p className="text-[#8e9192] text-[14px]">No assets match your filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Asset Details Drawer */}
      <AnimatePresence>
        {selectedAsset && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#1c1b1b] border-l border-white/10 z-50 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
                <div>
                  <h2 className="text-[16px] font-bold text-[#e5e2e1]">{selectedAsset.name}</h2>
                  <p className="text-[12px] font-mono text-[#00f0ff]">{selectedAsset.id}</p>
                </div>
                <button onClick={() => setSelectedAsset(null)} className="p-2 rounded-lg hover:bg-white/8 text-[#8e9192] transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1">
                <StatusBadge status={selectedAsset.status} />

                <section>
                  <h3 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">General Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Category", selectedAsset.category],
                      ["Department", selectedAsset.department],
                      ["Location", selectedAsset.location],
                      ["Current Holder", selectedAsset.currentHolder],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white/3 rounded-xl p-3">
                        <p className="text-[11px] text-[#8e9192] mb-0.5">{k}</p>
                        <p className="text-[13px] text-[#e5e2e1] font-medium">{v}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Purchase Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Vendor", selectedAsset.vendor],
                      ["Purchase Date", selectedAsset.purchaseDate],
                      ["Cost", `₹${selectedAsset.cost.toLocaleString()}`],
                      ["Serial Number", selectedAsset.serialNumber],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-white/3 rounded-xl p-3">
                        <p className="text-[11px] text-[#8e9192] mb-0.5">{k}</p>
                        <p className="text-[13px] text-[#e5e2e1] font-medium font-mono text-[12px]">{v}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">Warranty</h3>
                  <div className="bg-white/3 rounded-xl p-3">
                    <p className="text-[11px] text-[#8e9192] mb-0.5">Warranty Expiry</p>
                    <p className="text-[13px] text-[#e5e2e1] font-medium">{selectedAsset.warrantyExpiry}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">QR Code</h3>
                  <div className="bg-white/3 rounded-xl p-4 flex flex-col items-center gap-2">
                    <QrCode size={64} className="text-[#00f0ff]" />
                    <p className="text-[11px] text-[#8e9192]">{selectedAsset.id}</p>
                  </div>
                </section>
              </div>

              <div className="px-6 py-4 border-t border-white/8 flex flex-wrap gap-2">
                {[
                  { label: "Edit", icon: Pencil, cls: "bg-white/8 text-[#e5e2e1] hover:bg-white/12" },
                  { label: "Allocate", icon: ArrowLeftRight, cls: "bg-[#00f0ff]/15 text-[#00f0ff] hover:bg-[#00f0ff]/25" },
                  { label: "Maintenance", icon: Wrench, cls: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" },
                ].map(({ label, icon: Icon, cls }) => (
                  <button key={label} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${cls}`}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">Register New Asset</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {[["Asset Name","text"],["Asset ID","text"],["Serial Number","text"],["Vendor","text"],["Purchase Date","date"],["Cost (₹)","number"],["Location","text"],["Warranty Expiry","date"]].map(([l, t]) => (
              <div key={l} className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">{l}</Label>
                <Input type={t} className="bg-white/5 border-white/10 text-[#e5e2e1] focus-visible:ring-[#00f0ff]/30" placeholder={`Enter ${l.toLowerCase()}…`} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Category</Label>
              <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none">
                <option value="" className="bg-[#1c1b1b]">Select category…</option>
                {["Laptops","Monitors","AV Equipment","Printers","Vehicles","Mobile Devices"].map(c => (
                  <option key={c} value={c} className="bg-[#1c1b1b]">{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Department</Label>
              <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none">
                <option value="" className="bg-[#1c1b1b]">Select department…</option>
                {["Engineering","Design","Finance","HR","Sales","Operations","IT"].map(d => (
                  <option key={d} value={d} className="bg-[#1c1b1b]">{d}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRegisterOpen(false)} className="text-[#8e9192] hover:text-[#e5e2e1]">Cancel</Button>
            <Button onClick={() => setRegisterOpen(false)} className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-semibold">Register Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
