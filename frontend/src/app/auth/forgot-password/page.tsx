"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Zap, AlertCircle, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/25 flex items-center justify-center">
            <Zap size={20} className="text-[#00f0ff]" />
          </div>
          <span className="text-2xl font-bold text-[#e5e2e1] tracking-tight">AssetFlow</span>
        </div>

        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-[#e5e2e1] mb-1">Forgot password?</h1>
              <p className="text-[13px] text-[#8e9192] mb-6">
                Enter your work email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-[#8e9192]">Work Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com" autoComplete="email"
                      className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl"
                  >
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-[12px] text-red-400">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#00f0ff] text-black font-semibold rounded-xl text-[14px] hover:bg-[#00f0ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <><span>Send Reset Link</span><ArrowRight size={15} /></>
                  }
                </motion.button>
              </form>
            </>
          ) : (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-[#e5e2e1] mb-2">Check your inbox</h2>
              <p className="text-[13px] text-[#8e9192] leading-relaxed mb-6">
                If <span className="text-[#e5e2e1]">{email}</span> is registered,
                you&apos;ll receive a password reset link within a few minutes.
              </p>
              <p className="text-[12px] text-[#444748]">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors"
                >
                  try again
                </button>
                .
              </p>
            </motion.div>
          )}

          <div className="mt-6 pt-5 border-t border-white/8">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-[13px] text-[#8e9192] hover:text-[#e5e2e1] transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
