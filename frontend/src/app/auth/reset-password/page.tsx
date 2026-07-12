"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number",     test: (p: string) => /\d/.test(p) },
];

function ResetForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") || "";

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) { setError("Please fill in both fields."); return; }
    if (password !== confirm)  { setError("Passwords do not match."); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
    if (!token)                { setError("Invalid reset link. Please request a new one."); return; }

    setLoading(true);
    setError("");

    try {
      const res  = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Reset failed. The link may have expired.");
      } else {
        setSuccess(true);
        setTimeout(() => router.replace("/auth/login"), 3000);
      }
    } catch {
      setError("Cannot reach server. Is the backend running?");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="glass-panel rounded-3xl p-8 border border-white/10 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-[#e5e2e1] mb-2">Invalid Reset Link</h2>
        <p className="text-[13px] text-[#8e9192] mb-6">
          This reset link is missing or malformed. Please request a new one.
        </p>
        <Link href="/auth/forgot-password"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00f0ff] text-black font-semibold rounded-xl text-[13px] hover:bg-[#00f0ff]/90 transition-colors">
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-3xl p-8 border border-white/10 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-[#e5e2e1] mb-2">Password Reset!</h2>
        <p className="text-[13px] text-[#8e9192]">
          Your password has been updated. Redirecting you to login…
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-5 h-5 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-8 border border-white/10">
      <h1 className="text-2xl font-bold text-[#e5e2e1] mb-1">Set new password</h1>
      <p className="text-[13px] text-[#8e9192] mb-6">
        Choose a strong password for your AssetFlow account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[#8e9192]">New Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
            <input
              type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="new-password"
              className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex gap-4 pt-1">
              {passwordRules.map(rule => (
                <div key={rule.label}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${rule.test(password) ? "text-green-400" : "text-[#444748]"}`}>
                  <CheckCircle2 size={11} />{rule.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[#8e9192]">Confirm Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
            <input
              type={showConf ? "text" : "password"} value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" autoComplete="new-password"
              className={`w-full pl-9 pr-10 py-2.5 bg-white/5 border rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:bg-white/8 transition-all ${
                confirm && confirm !== password ? "border-red-500/50 focus:border-red-500/70" : "border-white/10 focus:border-[#00f0ff]/50"
              }`}
            />
            <button type="button" onClick={() => setShowConf(!showConf)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
              {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {confirm && confirm !== password && (
            <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
          )}
          {confirm && confirm === password && password.length >= 8 && (
            <p className="text-[11px] text-green-400 mt-1 flex items-center gap-1">
              <CheckCircle2 size={11} /> Passwords match
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-[12px] text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button type="submit" disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#00f0ff] text-black font-semibold rounded-xl text-[14px] hover:bg-[#00f0ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {loading
            ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            : <><span>Reset Password</span><ArrowRight size={15} /></>}
        </motion.button>
      </form>

      <div className="mt-5 pt-4 border-t border-white/8 text-center">
        <Link href="/auth/login"
          className="text-[13px] text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/25 flex items-center justify-center">
            <Zap size={20} className="text-[#00f0ff]" />
          </div>
          <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">AssetFlow</span>
        </div>

        <Suspense fallback={
          <div className="glass-panel rounded-3xl p-8 border border-white/10 flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
          </div>
        }>
          <ResetForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
