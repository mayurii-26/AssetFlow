"use client";
import { Bell, Search, ChevronRight, User, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/lib/api";
import { toast } from "sonner";
import ThemeToggle from "@/components/ui/ThemeToggle";

const breadcrumbMap: Record<string, string> = {
  dashboard:    "Dashboard",
  organization: "Organization Setup",
  assets:       "Asset Directory",
  allocation:   "Allocation & Transfer",
  booking:      "Resource Booking",
  maintenance:  "Maintenance",
  audit:        "Audit",
  reports:      "Reports & Analytics",
  notifications:"Notifications",
};

export default function TopNav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const segments = pathname.split("/").filter(Boolean);

  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread count every 30s
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationsApi.list({ read: "false" });
        setUnreadCount(res.unread ?? 0);
      } catch { /* ignore */ }
    };
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.replace("/auth/login");
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground font-medium">
          {user?.organization ?? "AssetFlow"}
        </span>
        {segments.map((seg, i) => (
          <span key={seg} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-[var(--outline-variant)]" />
            <span className={i === segments.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
              {breadcrumbMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets, employees…"
            className="w-56 pl-8 pr-4 py-1.5 bg-[var(--input)] border border-border rounded-full text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--accent)]/40 focus:bg-[var(--input)] transition-all"
          />
        </div>

        {/* Live org badge */}
        {user?.organization && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--input)] border border-border rounded-full">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[12px] text-[var(--on-surface-variant)] font-medium tracking-wide">
              {user.organization}
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications bell — live unread count */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/notifications")}
          className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[var(--input)] border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-[var(--accent)] rounded-full text-[9px] text-black font-bold flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none hover:opacity-90 transition-opacity">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="bg-[var(--surface-high)] text-[var(--accent)] text-[11px] font-bold">
                {user?.initials ?? "??"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-[12px] font-medium text-foreground">{user?.name ?? "Guest"}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role ?? "—"}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card border-border text-foreground">
            {/* User + org summary */}
            <div className="px-3 py-2.5 border-b border-border mb-1">
              <p className="text-[12px] font-semibold text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <p className="text-[10px] text-[var(--accent)] font-medium tracking-wide">{user?.organization}</p>
              </div>
              <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-[var(--input)] text-muted-foreground capitalize">
                {user?.role}
              </span>
            </div>
            <DropdownMenuItem className="gap-2 text-[13px] focus:bg-[var(--input)] cursor-pointer">
              <User size={14} /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-[13px] focus:bg-[var(--input)] cursor-pointer">
              <Settings size={14} /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-[13px] text-red-400 focus:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={14} /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
