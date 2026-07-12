"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Pencil, Trash2, Search, X, Check } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { orgApi, type Department, type Employee, type Category } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-[13px] text-[#e5e2e1] ${className}`}>{children}</td>;
}

type Tab = "departments" | "employees" | "categories";

export default function OrganizationPage() {
  const [tab, setTab] = useState<Tab>("departments");
  const [search, setSearch] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | Employee | Category | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [d, e, c] = await Promise.all([
        orgApi.departments.list(),
        orgApi.employees.list(),
        orgApi.categories.list(),
      ]);
      setDepartments(d.data);
      setEmployees(e.data);
      setCategories(c.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({});
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item: Department | Employee | Category) => {
    setEditTarget(item);
    setForm({ ...item } as Record<string, string>);
    setError("");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      if (tab === "departments") await orgApi.departments.remove(id);
      else if (tab === "employees") await orgApi.employees.remove(id);
      else await orgApi.categories.remove(id);
      loadAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (editTarget) {
        // Edit
        if (tab === "departments") await orgApi.departments.update(editTarget.id, form as Partial<Department>);
        else if (tab === "employees") await orgApi.employees.update(editTarget.id, form as Partial<Employee>);
        else await orgApi.categories.update(editTarget.id, form as Partial<Category>);
      } else {
        // Create
        if (tab === "departments") {
          if (!form.name) throw new Error("Name is required");
          await orgApi.departments.create(form as Partial<Department>);
        } else if (tab === "employees") {
          if (!form.name || !form.email) throw new Error("Name and email are required");
          await orgApi.employees.create(form as Partial<Employee>);
        } else {
          if (!form.name || !form.prefix) throw new Error("Name and prefix are required");
          await orgApi.categories.create(form as Partial<Category>);
        }
      }
      setModalOpen(false);
      loadAll();
    } catch (e: any) {
      setError(e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const f = (key: string) => form[key] || "";
  const sf = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const deptFiltered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const empFiltered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const catFiltered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const modalTitle = `${editTarget ? "Edit" : "Add"} ${tab === "departments" ? "Department" : tab === "employees" ? "Employee" : "Category"}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Organization Setup" description="Manage departments, employees, and asset categories" icon={Building2}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold">
          <Plus size={14} /> Add New
        </motion.button>
      </PageHeader>

      <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-white/5 border border-white/8 p-1 rounded-xl">
            {(["departments", "employees", "categories"] as Tab[]).map(t => (
              <TabsTrigger key={t} value={t}
                className="data-[state=active]:bg-[#00f0ff]/15 data-[state=active]:text-[#00f0ff] text-[#8e9192] text-[13px] rounded-lg capitalize px-4">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e9192]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="pl-8 pr-4 py-2 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40 w-48" />
          </div>
        </div>

        {/* Departments */}
        <TabsContent value="departments">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/8"><Th>Department</Th><Th>Head</Th><Th>Parent</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : deptFiltered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#8e9192] text-[13px]">No departments yet. Add your first department.</td></tr>
                ) : deptFiltered.map((dept, i) => (
                  <motion.tr key={dept.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <Td><span className="font-medium">{dept.name}</span></Td>
                    <Td>{dept.head}</Td>
                    <Td><span className="text-[#8e9192]">{dept.parent}</span></Td>
                    <Td><StatusBadge status={dept.status} /></Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(dept.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </Td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </TabsContent>

        {/* Employees */}
        <TabsContent value="employees">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/8"><Th>ID</Th><Th>Name</Th><Th>Department</Th><Th>Designation</Th><Th>Email</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : empFiltered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-[#8e9192] text-[13px]">No employees yet. Add team members to get started.</td></tr>
                ) : empFiltered.map((emp, i) => (
                  <motion.tr key={emp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <Td><span className="font-mono text-[12px] text-[#00f0ff]">{emp.id}</span></Td>
                    <Td><span className="font-medium">{emp.name}</span></Td>
                    <Td>{emp.department}</Td>
                    <Td><span className="text-[#8e9192]">{emp.designation}</span></Td>
                    <Td><span className="text-[12px]">{emp.email}</span></Td>
                    <Td><StatusBadge status={emp.status} /></Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </Td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-white/8"><Th>Category</Th><Th>Prefix</Th><Th>Description</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : catFiltered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#8e9192] text-[13px]">No categories yet. Add asset categories first.</td></tr>
                ) : catFiltered.map((cat, i) => (
                  <motion.tr key={cat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <Td><span className="font-medium">{cat.name}</span></Td>
                    <Td><span className="font-mono text-[12px] text-[#00f0ff]">{cat.prefix}</span></Td>
                    <Td><span className="text-[#8e9192]">{cat.description}</span></Td>
                    <Td><StatusBadge status={cat.status} /></Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </Td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {tab === "departments" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Name *</Label>
                  <input value={f("name")} onChange={sf("name")} placeholder="e.g. Engineering"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Head</Label>
                  <input value={f("head")} onChange={sf("head")} placeholder="Department head name"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Parent Division</Label>
                  <input value={f("parent")} onChange={sf("parent")} placeholder="e.g. Technology, Operations"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
              </>
            )}
            {tab === "employees" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Full Name *</Label>
                  <input value={f("name")} onChange={sf("name")} placeholder="e.g. Jane Smith"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Email *</Label>
                  <input type="email" value={f("email")} onChange={sf("email")} placeholder="jane@company.com"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Department</Label>
                  <select value={f("department")} onChange={sf("department")}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40">
                    <option value="" className="bg-[#1c1b1b]">Select department…</option>
                    {departments.map(d => <option key={d.id} value={d.name} className="bg-[#1c1b1b]">{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Designation</Label>
                  <input value={f("designation")} onChange={sf("designation")} placeholder="e.g. Senior Engineer"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
              </>
            )}
            {tab === "categories" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Category Name *</Label>
                  <input value={f("name")} onChange={sf("name")} placeholder="e.g. Laptops"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Asset ID Prefix *</Label>
                  <input value={f("prefix")} onChange={sf("prefix")} placeholder="e.g. LAP"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#8e9192] text-[12px]">Description</Label>
                  <input value={f("description")} onChange={sf("description")} placeholder="Optional description"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[13px] text-[#e5e2e1] focus:outline-none focus:border-[#00f0ff]/40" />
                </div>
              </>
            )}
          </div>
          {error && <p className="text-red-400 text-[12px] px-1">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-[#8e9192] hover:text-[#e5e2e1]">Cancel</Button>
            <Button onClick={handleSave} disabled={submitting} className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-semibold">
              {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
