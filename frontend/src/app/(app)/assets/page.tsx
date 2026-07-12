"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, X, QrCode, Pencil, Wrench, ArrowLeftRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { assetsApi, orgApi, assetCategoryName, assetDepartmentName, assetStatusLabel, getUserId, type Asset, type Category, type Department } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";

const STATUS_OPTIONS = ["All", "AVAILABLE", "ALLOCATED", "UNDER_MAINTENANCE", "RETIRED"];
const STATUS_LABELS: Record<string, string> = {
  All: "All", AVAILABLE: "Available", ALLOCATED: "Allocated",
  UNDER_MAINTENANCE: "Under Maintenance", RETIRED: "Retired",
};

const emptyForm = {
  name: "", categoryId: "", departmentId: "", serialNumber: "",
  vendor: "", purchaseDate: "", cost: "", location: "",
  warrantyExpiry: "", description: "",
};

export default function AssetsPage() {
  const { canRegisterAssets, isEmployee, user } = useRole();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (search) params.search = search;
      // Employees only see assets allocated to them
      if (isEmployee && user?.name) params.currentHolder = user.name;
      const res = await assetsApi.list(params);
      setAssets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search, isEmployee, user?.name]);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  useEffect(() => {
    Promise.all([orgApi.categories.list(), orgApi.departments.list()]).then(([c, d]) => {
      setCategories(c.data);
      setDepartments(d.data);
    }).catch(console.error);
  }, []);

  const handleRegister = async () => {
    if (!form.name || !form.categoryId || !form.departmentId || !form.serialNumber) {
      setError("Name, category, department and serial number are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await assetsApi.create({
        name:          form.name,
        categoryId:    form.categoryId,
        departmentId:  form.departmentId,
        serialNumber:  form.serialNumber,
        vendor:        form.vendor     || undefined,
        purchaseDate:  form.purchaseDate || undefined,
        cost:          form.cost ? Number(form.cost) : undefined,
        location:      form.location   || undefined,
        warrantyExpiry: form.warrantyExpiry || undefined,
        description:   form.description || undefined,
      });
      setRegisterOpen(false);
      setForm(emptyForm);
      loadAssets();
    } catch (e: any) {
      setError(e.message || "Failed to register asset.");
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side category filter (after fetch)
  const filteredAssets = filterCat === "All"
    ? assets
    : assets.filter(a => assetCategoryName(a) === filterCat);

  const categoryNames = ["All", ...categories.map(c => c.name)];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader title="Asset Directory" description={isEmployee ? "Assets currently allocated to you" : "Register, search, and manage all assets"} icon={Package}>
        {canRegisterAssets && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setRegisterOpen(true); setError(""); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold"
          >
            <Plus size={14} /> Register Asset
          </motion.button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…"
            className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40 cursor-pointer">
          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-[#1c1b1b]">{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40 cursor-pointer">
          {categoryNames.map(c => <option key={c} value={c} className="bg-[#1c1b1b]">{c}</option>)}
        </select>
        {(filterStatus !== "All" || filterCat !== "All") && (
          <button onClick={() => { setFilterStatus("All"); setFilterCat("All"); }}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-[12px] text-[#8e9192] hover:text-[#e5e2e1] bg-white/5 border border-white/8 transition-colors">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-[12px] text-[#8e9192] ml-auto">{filteredAssets.length} assets</span>
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
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                : filteredAssets.map((asset, i) => (
                    <motion.tr key={asset.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedAsset(asset)}
                      className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-[12px] font-mono text-[#00f0ff]">{asset.id}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[#e5e2e1] whitespace-nowrap">{asset.name}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">{assetCategoryName(asset)}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">{assetDepartmentName(asset)}</td>
                      <td className="px-4 py-3"><StatusBadge status={assetStatusLabel(asset.status)} /></td>
                      <td className="px-4 py-3 text-[13px] text-[#e5e2e1]">{asset.currentHolder}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192] whitespace-nowrap">{asset.location}</td>
                      <td className="px-4 py-3 text-[13px] text-[#8e9192]">
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
          {!loading && filteredAssets.length === 0 && (
            <div className="py-16 text-center">
              <Package size={32} className="text-[#444748] mx-auto mb-3" />
              <p className="text-[#8e9192] text-[14px]">No assets found. Register your first asset to get started.</p>
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
                <StatusBadge status={assetStatusLabel(selectedAsset.status)} />
                <section>
                  <h3 className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-3">General Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Category",       assetCategoryName(selectedAsset)],
                      ["Department",     assetDepartmentName(selectedAsset)],
                      ["Location",       selectedAsset.location],
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
                      ["Vendor",        selectedAsset.vendor],
                      ["Purchase Date", selectedAsset.purchaseDate ? new Date(selectedAsset.purchaseDate).toLocaleDateString("en-IN") : "—"],
                      ["Cost",          `₹${Number(selectedAsset.cost).toLocaleString("en-IN")}`],
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
                    <p className="text-[13px] text-[#e5e2e1] font-medium">
                      {selectedAsset.warrantyExpiry ? new Date(selectedAsset.warrantyExpiry).toLocaleDateString("en-IN") : "—"}
                    </p>
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
                {canRegisterAssets && [
                  { label: "Edit",        icon: Pencil,        cls: "bg-white/8 text-[#e5e2e1] hover:bg-white/12" },
                  { label: "Allocate",    icon: ArrowLeftRight, cls: "bg-[#00f0ff]/15 text-[#00f0ff] hover:bg-[#00f0ff]/25" },
                  { label: "Maintenance", icon: Wrench,         cls: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" },
                ].map(({ label, icon: Icon, cls }) => (
                  <button key={label} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${cls}`}>
                    <Icon size={13} />{label}
                  </button>
                ))}
                {!canRegisterAssets && (
                  <p className="text-[12px] text-[#8e9192]">Contact your Asset Manager to make changes.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Register Asset Modal */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">Register New Asset</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {([
              ["Asset Name *",    "name",          "text"],
              ["Serial Number *", "serialNumber",  "text"],
              ["Vendor",         "vendor",         "text"],
              ["Purchase Date",  "purchaseDate",   "date"],
              ["Cost (₹)",       "cost",           "number"],
              ["Location",       "location",       "text"],
              ["Warranty Expiry","warrantyExpiry", "date"],
            ] as [string, keyof typeof emptyForm, string][]).map(([label, key, type]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-[#8e9192] text-[12px]">{label}</Label>
                <input type={type} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] placeholder-[#555] focus:outline-none focus:border-[#00f0ff]/40"
                  placeholder={`Enter ${label.replace(" *", "").toLowerCase()}…`}
                />
              </div>
            ))}

            {/* Category — sends categoryId */}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Category *</Label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40">
                <option value="" className="bg-[#1c1b1b]">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-[#1c1b1b]">{c.name}</option>)}
              </select>
            </div>

            {/* Department — sends departmentId */}
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Department *</Label>
              <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40">
                <option value="" className="bg-[#1c1b1b]">Select department…</option>
                {departments.map(d => <option key={d.id} value={d.id} className="bg-[#1c1b1b]">{d.name}</option>)}
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Description</Label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40"
                placeholder="Optional description…" />
            </div>
          </div>
          {error && <p className="text-red-400 text-[12px] px-1">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRegisterOpen(false)} className="text-[#8e9192] hover:text-[#e5e2e1]">Cancel</Button>
            <Button onClick={handleRegister} disabled={submitting} className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-semibold">
              {submitting ? "Registering…" : "Register Asset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
