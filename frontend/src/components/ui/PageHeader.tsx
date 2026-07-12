"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between mb-6"
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center">
            <Icon size={18} className="text-[#00f0ff]" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-[#e5e2e1] tracking-tight">{title}</h1>
          {description && <p className="text-[13px] text-[#8e9192] mt-0.5">{description}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </motion.div>
  );
}
