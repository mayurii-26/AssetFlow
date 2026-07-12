"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  color?: "cyan" | "green" | "yellow" | "red" | "purple" | "orange";
  index?: number;
}

const colorMap = {
  cyan: { bg: "bg-[#00f0ff]/10", text: "text-[#00f0ff]", border: "border-[#00f0ff]/20" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" },
  red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
};

export default function KpiCard({ title, value, trend, icon: Icon, color = "cyan", index = 0 }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn("glass-panel rounded-2xl p-5 border cursor-default", c.border)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
          <Icon size={18} className={c.text} />
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full", trend >= 0 ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10")}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#e5e2e1] mb-1">{value}</p>
      <p className="text-[12px] text-[#8e9192] uppercase tracking-wider font-medium">{title}</p>
    </motion.div>
  );
}
