"use client";
import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Zap, Mail, Lock,
  AlertCircle, ArrowRight, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMsg = searchParams.get("success");
  const from = searchParams.get("from") || "/dashboard";
  const { login } = useAuth();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    const result = await login(email, password, rememberMe);
    setLoading(false);
    if (result.success) {
      router.replace(from);
    } else {
      setError(result.error || "Invalid email or password.");
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-8 border border-white/10">
      <h1 className="text-2xl font-bold text-[#e5e2e1] mb-1">Welcome back</h1>
      <p className="text-[13px] text-[#8e9192] mb-6">Sign in to your organization&apos;s workspace</p>

      {/* Success message from signup redirect */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/25 rounded-xl mb-5"
        >
          <CheckCircle size={14} className="text-green-400 shrink-0" />
          <p className="text-[12px] text-green-400">{successMsg}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[#8e9192]">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" autoComplete="email"
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[#8e9192]">Password</label>
            <Link href="/auth/forgot-password"
              className="text-[12px] text-[#00f0ff]/70 hover:text-[#00f0ff] transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
            <input
              type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
              rememberMe
                ? "bg-[#00f0ff] border-[#00f0ff]"
                : "bg-white/5 border-white/20 group-hover:border-white/40"
            }`}
          >
            {rememberMe && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-[13px] text-[#8e9192] group-hover:text-[#c4c7c8] transition-colors">
            Remember me
          </span>
        </label>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-[12px] text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit" disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#00f0ff] text-black font-semibold rounded-xl text-[14px] hover:bg-[#00f0ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            : <><span>Sign In</span><ArrowRight size={15} /></>}
        </motion.button>
      </form>

      <p className="text-center text-[13px] text-[#8e9192] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-[#00f0ff] hover:text-[#00f0ff]/80 font-medium transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#00f0ff]/3 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/25 flex items-center justify-center">
            <Zap size={20} className="text-[#00f0ff]" />
          </div>
          <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">AssetFlow</span>
        </div>

        <Suspense fallback={
          <div className="glass-panel rounded-3xl p-8 border border-white/10 flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-[12px] text-[#444748] mt-4">
          <Link href="/" className="hover:text-[#8e9192] transition-colors">← Back to AssetFlow.com</Link>
        </p>
      </motion.div>
    </div>
  );
}
