"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Mail, Lock, User, Building2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !organization) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await signup(name, email, password, organization);
    setLoading(false);
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setError(result.error || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#00f0ff]/3 rounded-full blur-3xl pointer-events-none" />

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

        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <h1 className="text-2xl font-bold text-[#e5e2e1] mb-1">Create your account</h1>
          <p className="text-[13px] text-[#8e9192] mb-6">Set up your organization's asset workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#8e9192]">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Aditya Kumar"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all" />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#8e9192]">Organization Name</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
                <input type="text" value={organization} onChange={e => setOrganization(e.target.value)} placeholder="Nexus Corp"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#8e9192]">Work Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-[#8e9192]">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e9192]" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[14px] text-[#e5e2e1] placeholder-[#444748] focus:outline-none focus:border-[#00f0ff]/50 focus:bg-white/8 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8e9192] hover:text-[#e5e2e1] transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Password strength hints */}
              {password.length > 0 && (
                <div className="flex gap-3 pt-1">
                  {passwordRules.map(rule => (
                    <div key={rule.label} className={`flex items-center gap-1 text-[11px] transition-colors ${rule.test(password) ? "text-green-400" : "text-[#444748]"}`}>
                      <CheckCircle2 size={11} />
                      {rule.label}
                    </div>
                  ))}
                </div>
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#00f0ff] text-black font-semibold rounded-xl text-[14px] hover:bg-[#00f0ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-[13px] text-[#8e9192] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#00f0ff] hover:text-[#00f0ff]/80 font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-[12px] text-[#444748] mt-4">
          <Link href="/" className="hover:text-[#8e9192] transition-colors">← Back to AssetFlow.com</Link>
        </p>
      </motion.div>
    </div>
  );
}
