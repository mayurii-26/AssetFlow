import { cn } from "@/lib/utils";

// Maps DB enum values (SCREAMING_SNAKE) to display labels
const enumToLabel: Record<string, string> = {
  AVAILABLE:           "Available",
  ALLOCATED:           "Allocated",
  UNDER_MAINTENANCE:   "Under Maintenance",
  RETIRED:             "Retired",
  PENDING_TRANSFER:    "Pending Transfer",
  ACTIVE:              "Active",
  INACTIVE:            "Inactive",
  PENDING:             "Pending",
  APPROVED:            "Approved",
  REJECTED:            "Rejected",
  CONFIRMED:           "Confirmed",
  CANCELLED:           "Cancelled",
  IN_PROGRESS:         "In Progress",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  RESOLVED:            "Resolved",
  CRITICAL:            "Critical",
  HIGH:                "High",
  MEDIUM:              "Medium",
  LOW:                 "Low",
  VERIFIED:            "Verified",
  MISSING:             "Missing",
  DAMAGED:             "Damaged",
  DISCREPANCY:         "Discrepancy",
  RETURNED:            "Returned",
  CLOSED:              "Closed",
};

const statusStyles: Record<string, string> = {
  Available:            "text-green-400 bg-green-500/10 border-green-500/25",
  Allocated:            "text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/25",
  "Under Maintenance":  "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  Retired:              "text-[#8e9192] bg-white/5 border-white/10",
  "Pending Transfer":   "text-orange-400 bg-orange-500/10 border-orange-500/25",
  Active:               "text-green-400 bg-green-500/10 border-green-500/25",
  Inactive:             "text-[#8e9192] bg-white/5 border-white/10",
  Pending:              "text-orange-400 bg-orange-500/10 border-orange-500/25",
  Approved:             "text-green-400 bg-green-500/10 border-green-500/25",
  Rejected:             "text-red-400 bg-red-500/10 border-red-500/25",
  Confirmed:            "text-green-400 bg-green-500/10 border-green-500/25",
  Cancelled:            "text-red-400 bg-red-500/10 border-red-500/25",
  "In Progress":        "text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/25",
  "Technician Assigned":"text-purple-400 bg-purple-500/10 border-purple-500/25",
  Resolved:             "text-green-400 bg-green-500/10 border-green-500/25",
  Critical:             "text-red-400 bg-red-500/10 border-red-500/25",
  High:                 "text-orange-400 bg-orange-500/10 border-orange-500/25",
  Medium:               "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  Low:                  "text-[#8e9192] bg-white/5 border-white/10",
  Verified:             "text-green-400 bg-green-500/10 border-green-500/25",
  Missing:              "text-red-400 bg-red-500/10 border-red-500/25",
  Damaged:              "text-orange-400 bg-orange-500/10 border-orange-500/25",
  Discrepancy:          "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  Returned:             "text-[#8e9192] bg-white/5 border-white/10",
  Closed:               "text-[#8e9192] bg-white/5 border-white/10",
};

export default function StatusBadge({ status }: { status: string }) {
  // Normalise: convert DB enum → display label if needed
  const label = enumToLabel[status] ?? status;
  const style = statusStyles[label] ?? statusStyles[status] ?? "text-[#8e9192] bg-white/5 border-white/10";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border", style)}>
      {label}
    </span>
  );
}
