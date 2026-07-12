"use client";
import { motion } from "framer-motion";
import { ClipboardCheck, AlertTriangle, Download, X, CheckCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { mockAuditItems } from "@/lib/mock-data-extra";

const discrepancies = mockAuditItems.filter(a => a.status !== "Verified");

export default function AuditPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader title="Audit" description="Track asset verification and discrepancy reports" icon={ClipboardCheck}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/10 text-[#e5e2e1] rounded-full text-[13px] font-medium hover:bg-white/12 transition-colors">
          <Download size={14} /> Export Audit
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/25 text-red-400 rounded-full text-[13px] font-medium hover:bg-red-500/25 transition-colors">
          <X size={14} /> Close Cycle
        </motion.button>
      </PageHeader>

      {/* Audit Cycle Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-5 border border-white/8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Audit Cycle", "AUD-2024-Q3"],
            ["Department", "All Departments"],
            ["Start Date", "2024-07-08"],
            ["End Date", "2024-07-15"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider mb-1">{k}</p>
              <p className="text-[14px] font-semibold text-[#e5e2e1]">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total Assets", value: mockAuditItems.length, color: "text-[#e5e2e1]" },
            { label: "Verified", value: mockAuditItems.filter(a => a.status === "Verified").length, color: "text-green-400" },
            { label: "Discrepancies", value: discrepancies.length, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/3 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-[#8e9192] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Discrepancy Warning */}
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

      {/* Audit Checklist Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-[13px] font-semibold text-[#8e9192] uppercase tracking-wider">Audit Checklist</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Asset","Expected Location","Actual Location","Condition","Status","Verified By","Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-[#8e9192] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAuditItems.map((item, i) => (
                <motion.tr key={item.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`border-b border-white/5 transition-colors ${
                    item.status === "Missing" ? "bg-red-500/5 hover:bg-red-500/8" :
                    item.status === "Damaged" ? "bg-orange-500/5 hover:bg-orange-500/8" :
                    item.status === "Discrepancy" ? "bg-yellow-500/5 hover:bg-yellow-500/8" :
                    "hover:bg-white/3"
                  }`}>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[#e5e2e1]">{item.assetName}</p>
                    <p className="text-[11px] font-mono text-[#00f0ff]">{item.assetId}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#8e9192]">{item.expectedLocation}</td>
                  <td className="px-4 py-3 text-[13px] text-[#e5e2e1]">
                    {item.actualLocation !== item.expectedLocation && item.actualLocation !== "—" ? (
                      <span className="text-yellow-400">{item.actualLocation}</span>
                    ) : item.actualLocation}
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
    </div>
  );
}
