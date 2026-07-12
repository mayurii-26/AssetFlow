"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Pencil, Trash2, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockDepartments, mockEmployees, mockCategories } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-white/8">
        {children}
      </tr>
    </thead>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-[13px] text-[#e5e2e1] ${className}`}>{children}</td>;
}

export default function OrganizationPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("departments");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Organization Setup" description="Manage departments, employees, and asset categories" icon={Building2}>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff] text-black rounded-full text-[13px] font-semibold hover:bg-[#00f0ff]/90 transition-colors"
        >
          <Plus size={14} /> Add New
        </motion.button>
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-white/5 border border-white/8 p-1 rounded-xl">
            {["departments", "employees", "categories"].map(t => (
              <TabsTrigger key={t} value={t} className="data-[state=active]:bg-[#00f0ff]/15 data-[state=active]:text-[#00f0ff] text-[#8e9192] text-[13px] rounded-lg capitalize px-4">
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
              <TableHeader>
                <Th>Department</Th><Th>Head</Th><Th>Parent</Th><Th>Status</Th><Th>Actions</Th>
              </TableHeader>
              <tbody>
                {mockDepartments.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((dept, i) => (
                  <motion.tr key={dept.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <Td><span className="font-medium">{dept.name}</span></Td>
                    <Td>{dept.head}</Td>
                    <Td><span className="text-[#8e9192]">{dept.parent}</span></Td>
                    <Td><StatusBadge status={dept.status} /></Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"><Pencil size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
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
              <TableHeader>
                <Th>Employee ID</Th><Th>Name</Th><Th>Department</Th><Th>Designation</Th><Th>Email</Th><Th>Status</Th><Th>Actions</Th>
              </TableHeader>
              <tbody>
                {mockEmployees.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map((emp, i) => (
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
                        <button className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"><Pencil size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
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
              <TableHeader>
                <Th>Category Name</Th><Th>Asset Prefix</Th><Th>Description</Th><Th>Status</Th><Th>Actions</Th>
              </TableHeader>
              <tbody>
                {mockCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((cat, i) => (
                  <motion.tr key={cat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <Td><span className="font-medium">{cat.name}</span></Td>
                    <Td><span className="font-mono text-[12px] text-[#00f0ff]">{cat.prefix}</span></Td>
                    <Td><span className="text-[#8e9192]">{cat.description}</span></Td>
                    <Td><StatusBadge status={cat.status} /></Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"><Pencil size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8e9192] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </Td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1c1b1b] border-white/10 text-[#e5e2e1] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#e5e2e1]">Add {tab === "departments" ? "Department" : tab === "employees" ? "Employee" : "Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Name</Label>
              <Input className="bg-white/5 border-white/10 text-[#e5e2e1] focus-visible:ring-[#00f0ff]/30" placeholder="Enter name…" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8e9192] text-[12px]">Description</Label>
              <Input className="bg-white/5 border-white/10 text-[#e5e2e1] focus-visible:ring-[#00f0ff]/30" placeholder="Optional description…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-[#8e9192] hover:text-[#e5e2e1]">Cancel</Button>
            <Button onClick={() => setModalOpen(false)} className="bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-semibold">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
