"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Package, ArrowLeftRight,
  CalendarClock, Wrench, ClipboardCheck, BarChart3,
  Bell, ChevronLeft, ChevronRight, Zap, LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/hooks/useRole";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin:           "bg-red-500/15 text-red-400 border-red-500/25",
  asset_manager:   "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/25",
  department_head: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  employee:        "bg-white/8 text-[#8e9192] border-white/10",
};

const ROLE_LABELS: Record<string, string> = {
  admin:           "Admin",
  asset_manager:   "Asset Manager",
  department_head: "Dept Head",
  employee:        "Employee",
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[]; // which roles can see this item — empty = all roles
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard, roles: [] },
  { href: "/organization",  label: "Organization",  icon: Building2,       roles: ["admin"] },
  { href: "/assets",        label: "Assets",        icon: Package,         roles: [] },
  { href: "/allocation",    label: "Allocation",    icon: ArrowLeftRight,  roles: [] },
  { href: "/booking",       label: "Booking",       icon: CalendarClock,   roles: [] },
  { href: "/maintenance",   label: "Maintenance",   icon: Wrench,          roles: [] },
  { href: "/audit",         label: "Audit",         icon: ClipboardCheck,  roles: [] },
  { href: "/reports",       label: "Reports",       icon: BarChart3,       roles: [] },
  { href: "/notifications", label: "Notifications", icon: Bell,            roles: [] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { logout } = useAuth();
  const { user, role } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.replace("/auth/login");
  };

  // Filter nav items by role
  const visibleItems = NAV_ITEMS.filter(item =>
    item.roles.length === 0 || item.roles.includes(role)
  );

  const roleBadge = ROLE_BADGE_COLORS[role] ?? ROLE_BADGE_COLORS.employee;
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[var(--surface-dim)] border-r border-border shrink-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-[var(--accent)]" />
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
              <p className="font-bold text-[14px] text-foreground tracking-tight whitespace-nowrap leading-tight">
                {user?.organization ?? "AssetFlow"}
              </p>
              <p className="text-[10px] text-[var(--accent)] tracking-widest uppercase whitespace-nowrap mt-0.5">
                AssetFlow
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                  active
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[var(--input)]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-full"
                  />
                )}
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[13px] font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--surface-high)] text-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border">
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
          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--input)]",
          collapsed && "justify-center px-0"
        )}>
          <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[var(--accent)]">{user?.initials ?? "?"}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-[12px] font-medium text-[#e5e2e1] truncate">{user?.name ?? "—"}</p>
                <p className="text-[10px] text-[#8e9192] capitalize truncate">{user?.role ?? "—"}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

        {/* Collapse toggle */}
        <div className="px-0 pt-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[var(--input)] transition-all duration-200"
          >
            {collapsed
              ? <ChevronRight size={16} />
              : <><ChevronLeft size={16} /><span className="text-[12px]">Collapse</span></>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
