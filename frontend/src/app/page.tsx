"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowRight, ShoppingCart, Wifi, Sparkles, Recycle, Quote } from "lucide-react";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <div ref={ref} className="text-[80px] font-extrabold text-[#00f0ff] mb-4 leading-none">{count}{suffix}</div>;
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}

const features = [
  {
    tag: "Precision Tracking",
    title: "Real-time Tracking for a Connected World.",
    body: "Sub-meter accuracy across continental boundaries. Our proprietary mesh network ensures no asset ever goes offline.",
    side: "right",
    bg: "bg-[#131313]",
  },
  {
    tag: "AI-Driven Insights",
    title: "Predictive Maintenance, Powered by AI.",
    body: "Prevent downtime before it happens. Our neural engine analyzes performance metrics to predict failures weeks in advance.",
    side: "left",
    bg: "bg-[#1c1b1b]",
  },
  {
    tag: "Global Scale",
    title: "Global Fleet Visibility. One Unified View.",
    body: "Consolidate disparate data sources into a single, high-fidelity command center. From maritime fleets to drone delivery hubs.",
    side: "right",
    bg: "bg-[#131313]",
  },
];

const lifecycle = [
  { icon: ShoppingCart, title: "Procurement", body: "Automated vendor assessment and digital twin creation for every new acquisition." },
  { icon: Wifi, title: "Deployment", body: "Instant IoT provisioning and network integration across global logistics hubs." },
  { icon: Sparkles, title: "Optimization", body: "Continuous performance tuning using real-world telemetry and environmental data." },
  { icon: Recycle, title: "Retirement", body: "Eco-compliant decommissioning and historical data preservation for audit." },
];

const faqs = [
  { q: "How secure is AssetFlow's data encryption?", a: "We use AES-256 encryption at rest and TLS 1.3 in transit. All data is stored in SOC 2 Type II certified infrastructure with zero-knowledge architecture." },
  { q: "Can AssetFlow integrate with our existing ERP?", a: "Yes. AssetFlow provides REST APIs and pre-built connectors for SAP, Oracle, and Microsoft Dynamics. Custom integrations typically take 2-4 weeks." },
  { q: "How many assets can the platform handle?", a: "AssetFlow scales to billions of assets. Our largest deployment manages 4.2 billion assets across 180 countries with sub-100ms query times." },
  { q: "What is the implementation timeline?", a: "Standard deployments go live in 2-6 weeks. Enterprise migrations with custom workflows average 8-12 weeks including data migration and team training." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[#131313] text-[#e5e2e1] overflow-x-hidden">

      {/* Floating nav */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 bg-[#131313]/60 backdrop-blur-xl rounded-full mx-auto w-[90%] max-w-7xl border border-white/15 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/25 flex items-center justify-center">
            <Zap size={14} className="text-[#00f0ff]" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">AssetFlow</span>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          {["Platform","Solutions","Network","Insights"].map((item, i) => (
            <a key={item} href="#" className={`text-[14px] transition-colors ${i === 0 ? "text-white font-semibold border-b-2 border-[#00f0ff] pb-0.5" : "text-[#8e9192] hover:text-white"}`}>{item}</a>
          ))}
        </nav>
        <Link href="/auth/login">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-5 py-2 rounded-full text-[13px] font-bold hover:bg-[#00f0ff] hover:text-black transition-all duration-300">
            Launch App
          </motion.button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-24">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#131313]/50 to-[#131313]" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#00f0ff]/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00f0ff]/10 border border-[#00f0ff]/25 rounded-full text-[#00f0ff] text-[11px] font-semibold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
            Cinematic Asset Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-[88px] font-black text-white leading-[0.95] tracking-tight mb-8 max-w-5xl mx-auto">
            Manage Every Asset.{" "}
            <span className="text-[#00f0ff]">Track Every Resource.</span>{" "}
            Automate Every Workflow.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-lg text-[#8e9192] max-w-2xl mx-auto mb-10 leading-relaxed">
            The enterprise platform that transforms how global organizations manage, track, and optimize their asset ecosystems — in real time.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-[15px] hover:bg-[#00f0ff] transition-all duration-300 shadow-xl">
                Start Managing <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="glass-panel flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold text-[15px] hover:bg-white/8 transition-all duration-300">
                Sign In →
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Trusted by marquee */}
      <section className="py-16 bg-[#0e0e0e] overflow-hidden border-y border-white/5">
        <p className="text-center text-[11px] font-bold text-[#444748] uppercase tracking-[0.3em] mb-8">Empowering Global Logistics Leaders</p>
        <div className="flex items-center gap-16 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
          {["MARS LOGISTICS","QUANTUM FREIGHT","ORBITAL CARGO","TITAN SUPPLY","NEBULA TRANSIT","MARS LOGISTICS","QUANTUM FREIGHT","ORBITAL CARGO","TITAN SUPPLY","NEBULA TRANSIT"].map((name, i) => (
            <span key={i} className="text-2xl font-black opacity-20 px-8 tracking-wider">{name}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </section>

      {/* Storytelling features */}
      {features.map((f, i) => (
        <section key={i} className={`min-h-screen flex items-center py-32 ${f.bg}`}>
          <div className={`max-w-7xl mx-auto px-16 grid md:grid-cols-2 gap-24 items-center ${f.side === "left" ? "" : ""}`}>
            <RevealSection delay={0.1}>
              <div className={f.side === "left" ? "order-2" : ""}>
                <span className="text-[#00f0ff] text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block">{f.tag}</span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">{f.title}</h2>
                <p className="text-lg text-[#8e9192] leading-relaxed">{f.body}</p>
              </div>
            </RevealSection>
            <RevealSection delay={0.2}>
              <div className={`glass-panel aspect-square rounded-3xl overflow-hidden relative group ${f.side === "left" ? "order-1" : ""}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                    <Zap size={48} className="text-[#00f0ff]/60" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-[#00f0ff] rounded-full" initial={{ width: "0%" }} whileInView={{ width: "72%" }} transition={{ duration: 1.5, delay: 0.3 }} viewport={{ once: true }} />
                  </div>
                  <p className="text-[11px] text-[#8e9192] mt-2 font-mono">SYSTEM NOMINAL · {72 + i * 8}% EFFICIENCY</p>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>
      ))}

      {/* Lifecycle steps */}
      <section className="py-32 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-16">
          <RevealSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">The Lifecycle of Intelligent Assets</h2>
              <p className="text-[#8e9192] max-w-2xl mx-auto">From the moment of acquisition to final decommissioning, AssetFlow orchestrates the entire journey.</p>
            </div>
          </RevealSection>
          <div className="grid md:grid-cols-4 gap-6">
            {lifecycle.map(({ icon: Icon, title, body }, i) => (
              <RevealSection key={title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }}
                  className="glass-panel p-8 rounded-3xl border border-white/8 hover:border-[#00f0ff]/20 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-[#00f0ff]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-[14px] text-[#8e9192] leading-relaxed">{body}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32 bg-[#131313] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #00f0ff, transparent 60%)",
        }} />
        <div className="max-w-7xl mx-auto px-16 grid md:grid-cols-3 gap-12 text-center relative z-10">
          {[{ target: 99.9, suffix: "%", label: "Operational Accuracy" }, { target: 2.4, suffix: "B", label: "Assets Managed" }, { target: 45, suffix: "%", label: "Cost Reduction Avg." }].map(({ target, suffix, label }) => (
            <RevealSection key={label}>
              <Counter target={target} suffix={suffix} />
              <p className="text-[11px] font-bold text-[#8e9192] uppercase tracking-[0.25em]">{label}</p>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-16">
          <RevealSection>
            <div className="glass-panel p-16 md:p-24 rounded-[3rem] border border-white/8 relative overflow-hidden">
              <Quote size={120} className="absolute top-8 left-8 text-[#00f0ff]/10" />
              <div className="relative z-10 max-w-4xl">
                <h2 className="text-3xl md:text-4xl font-black text-white italic leading-tight mb-10">
                  "AssetFlow didn't just organize our resources; it fundamentally changed how we perceive operational efficiency. It's the nervous system of our entire global enterprise."
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center">
                    <span className="text-[#00f0ff] font-bold text-lg">MT</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Marcus Thorne</p>
                    <p className="text-[13px] text-[#8e9192]">Chief Technical Officer, Global Nexus</p>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-[#131313]">
        <div className="max-w-3xl mx-auto px-8">
          <RevealSection>
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">Questions? Answers.</h2>
          </RevealSection>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <RevealSection key={i} delay={i * 0.05}>
                <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/3 transition-colors">
                    <span className="font-semibold text-[15px] text-[#e5e2e1]">{faq.q}</span>
                    <span className={`text-[#8e9192] transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}>↓</span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <p className="px-6 pb-5 text-[14px] text-[#8e9192] leading-relaxed">{faq.a}</p>
                  </motion.div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[#0e0e0e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-[#00f0ff]/20 via-transparent to-[#00f0ff]/20" />
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <RevealSection>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to take control?</h2>
            <p className="text-lg text-[#8e9192] mb-10">Join thousands of enterprises that trust AssetFlow to manage their most critical resources.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-[#00f0ff] text-black px-10 py-4 rounded-full font-black text-[15px] hover:bg-white transition-all duration-300 shadow-2xl">
                  Get Started Free <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="/auth/login">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="glass-panel text-white px-10 py-4 rounded-full font-bold text-[15px] hover:bg-white/8 transition-all duration-300">
                  Sign In →
                </motion.button>
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e0e0e] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-16 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#00f0ff]" />
            <span className="font-bold text-white">AssetFlow</span>
            <span className="text-[#444748] text-[13px]">— Cinematic Asset Intelligence</span>
          </div>
          <p className="text-[12px] text-[#444748]">© 2024 AssetFlow. Enterprise Asset Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
