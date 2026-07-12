"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Package, ArrowLeftRight,
  CalendarClock, Wrench, ClipboardCheck, BarChart3,
  Bell, ChevronLeft, ChevronRight, Zap, LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { href: "/organization",  label: "Organization", icon: Building2 },
  { href: "/assets",        label: "Assets",       icon: Package },
  { href: "/allocation",    label: "Allocation",   icon: ArrowLeftRight },
  { href: "/booking",       label: "Booking",      icon: CalendarClock },
  { href: "/maintenance",   label: "Maintenance",  icon: Wrench },
  { href: "/audit",         label: "Audit",        icon: ClipboardCheck },
  { href: "/reports",       label: "Reports",      icon: BarChart3 },
  { href: "/notifications", label: "Notifications",icon: Bell },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.replace("/auth/login");
  };

  // Initials from org name for the logo badge
  const orgInitials = user?.organization
    ? user.organization.split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("")
    : "AF";

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[#0e0e0e] border-r border-white/8 shrink-0 overflow-hidden z-20"
    >
      {/* Logo / Org Name */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8 min-h-[72px]">
        <div className="w-8 h-8 rounded-lg bg-[#00f0ff]/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-[#00f0ff]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="font-bold text-[14px] text-white tracking-tight whitespace-nowrap leading-tight">
                {user?.organization ?? "AssetFlow"}
              </p>
              <p className="text-[10px] text-[#00f0ff] tracking-widest uppercase whitespace-nowrap mt-0.5">
                AssetFlow
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                  active
                    ? "bg-[#00f0ff]/10 text-[#00f0ff]"
                    : "text-[#8e9192] hover:text-[#e5e2e1] hover:bg-white/5"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00f0ff] rounded-full"
                  />
                )}
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#2a2a2a] text-[#e5e2e1] text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10">
                    {label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-2 pb-3 border-t border-white/8 pt-3 space-y-1">
        {/* User card */}
        <div className={cn(
          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/3",
          collapsed && "justify-center px-0"
        )}>
          <div className="w-7 h-7 rounded-full bg-[#00f0ff]/15 border border-[#00f0ff]/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#00f0ff]">{user?.initials ?? "?"}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-[12px] font-medium text-[#e5e2e1] truncate">{user?.name ?? "—"}</p>
                <p className="text-[10px] text-[#8e9192] capitalize truncate">{user?.role ?? "—"}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#8e9192] hover:text-[#e5e2e1] hover:bg-white/5 transition-all duration-200"
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <><ChevronLeft size={16} /><span className="text-[12px]">Collapse</span></>}
        </button>
      </div>
    </motion.aside>
  );
}
