import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_SERVICES } from '../../data/initialData';
import { 
  Boxes, 
  Cpu, 
  Cloud, 
  TrendingDown, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Terminal,
  Zap,
  Sparkles,
  Layers,
  PhoneCall
} from 'lucide-react';

const ICON_MAP = {
  Boxes,
  Cpu,
  Cloud,
  TrendingDown,
  ShieldCheck,
  UserCheck
};

export const ServicesView = () => {
  const { setIsConsultationModalOpen, setCurrentTab } = useApp();

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-slate-100">
      
      {/* Services Hero */}
      <div className="py-20 bg-slate-950 border-b border-cyan-500/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Full-Spectrum Multi-Cloud Engineering</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-sans tracking-tight">
            Enterprise Cloud & AI Solutions
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            From strategic cloud architecture to high-velocity production pipelines, we deliver resilient DevOps, GitOps automation, and FinOps governance.
          </p>

          <div className="pt-4 flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsConsultationModalOpen(true)}
              className="glow-button px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center space-x-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Book Technical Consultation</span>
            </button>
            <button
              onClick={() => {
                setCurrentTab('simulator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400"
            >
              Try FinOps ROI Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Services Detailed Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16 text-left">
        {INITIAL_SERVICES.map((s, idx) => {
          const Icon = ICON_MAP[s.icon] || Cloud;
          const isEven = idx % 2 === 0;

          return (
            <div
              key={s.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 rounded-3xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Text Specs (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      CAPABILITY 0{idx + 1}
                    </span>
                    <h2 className="text-2xl font-bold text-white font-sans">
                      {s.title}
                    </h2>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                  {s.tagline}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {s.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {s.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                  Target SLA: {s.metrics}
                </div>
              </div>

              {/* Visual Blueprint Card (5 cols) */}
              <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/10">
                  <span>TOOLCHAIN ARCHITECTURE</span>
                  <span className="text-cyan-400">PRODUCTION READY</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Primary Engines:</span>
                    <span className="text-white font-bold">AWS EKS · ArgoCD · Terraform</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Security Guardrails:</span>
                    <span className="text-indigo-300 font-bold">Trivy · Kyverno · Vault</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Telemetry & FinOps:</span>
                    <span className="text-emerald-400 font-bold">Kubecost · Prometheus</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 glow-button flex items-center justify-center space-x-2"
                >
                  <span>Engage Cloud Squad for this Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
