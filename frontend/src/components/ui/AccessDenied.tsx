"use client";
import { motion } from "framer-motion";
import { ShieldOff } from "lucide-react";
import Link from "next/link";

interface Props {
  title?: string;
  message?: string;
}

export default function AccessDenied({
  title   = "Access Denied",
  message = "You don't have permission to view this page. Contact your administrator if you believe this is a mistake.",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-5">
        <ShieldOff size={28} className="text-red-400" />
      </div>
      <h1 className="text-[20px] font-bold text-[#e5e2e1] mb-2">{title}</h1>
      <p className="text-[13px] text-[#8e9192] max-w-sm leading-relaxed mb-6">{message}</p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-white/8 border border-white/10 text-[#e5e2e1] rounded-xl text-[13px] font-medium hover:bg-white/12 transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </motion.div>
  );
}
