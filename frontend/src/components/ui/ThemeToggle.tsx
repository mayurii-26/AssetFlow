"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Avoid hydration mismatch — render after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a placeholder with same dimensions to avoid layout shift
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/8" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-[var(--border)] text-[var(--outline)] hover:text-[var(--foreground)] hover:bg-white/10 transition-colors"
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </motion.span>
    </motion.button>
  );
}
