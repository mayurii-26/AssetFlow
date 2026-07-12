"use client";
import { Bell, Search, ChevronRight, User, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  organization: "Organization Setup",
  assets: "Asset Directory",
  allocation: "Allocation & Transfer",
  booking: "Resource Booking",
  maintenance: "Maintenance",
  audit: "Audit",
  reports: "Reports & Analytics",
  notifications: "Notifications",
};

export default function TopNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-16 bg-[#131313]/80 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-[#8e9192]">AssetFlow</span>
        {segments.map((seg, i) => (
          <span key={seg} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-[#444748]" />
            <span className={i === segments.length - 1 ? "text-[#e5e2e1] font-medium" : "text-[#8e9192]"}>
              {breadcrumbMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-[#8e9192]" />
          <input
            type="text"
            placeholder="Search assets, employees…"
            className="w-56 pl-8 pr-4 py-1.5 bg-white/5 border border-white/8 rounded-full text-[13px] text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#00f0ff]/40 focus:bg-white/8 transition-all"
          />
        </div>

        {/* Org name */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/8 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
          <span className="text-[12px] text-[#c4c7c8] font-medium tracking-wide">Nexus Corp</span>
        </div>

        {/* Notifications bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/8 text-[#8e9192] hover:text-[#e5e2e1] transition-colors"
        >
          <Bell size={15} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00f0ff] rounded-full text-[9px] text-black font-bold flex items-center justify-center">3</span>
        </motion.button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none hover:opacity-90 transition-opacity">
            <Avatar className="w-8 h-8 border border-white/15">
              <AvatarFallback className="bg-[#2a2a2a] text-[#00f0ff] text-[11px] font-bold">AK</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-medium text-[#e5e2e1]">Aditya Kumar</p>
              <p className="text-[10px] text-[#8e9192]">Admin</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#1c1b1b] border-white/10 text-[#e5e2e1]">
            <DropdownMenuItem className="gap-2 text-[13px] focus:bg-white/8 cursor-pointer">
              <User size={14} /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-[13px] focus:bg-white/8 cursor-pointer">
              <Settings size={14} /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/8" />
            <DropdownMenuItem className="gap-2 text-[13px] text-red-400 focus:bg-red-500/10 cursor-pointer">
              <LogOut size={14} /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
