import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cloud, 
  PlayCircle, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Server,
  Layers,
  Sparkles
} from 'lucide-react';

export const HeroSection = () => {
  const { setCurrentTab, setIsConsultationModalOpen } = useApp();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-20 overflow-hidden cyber-grid">
      {/* Background radial glow spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/10 to-violet-600/15 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-violet-600/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Live badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <span className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                Autonomous Cloud & AI Engineering Frontier
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-sans">
              Build, Modernize & Scale Multi-Cloud with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 glow-text">
                Autonomous Precision.
              </span>
            </h1>

            {/* Subheading / Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              We engineer enterprise-grade multi-cloud ecosystems spanning <strong className="text-white">AWS, Azure, GCP & Oracle Cloud</strong>. From declarative <strong className="text-cyan-300">ArgoCD GitOps</strong> and resilient <strong className="text-cyan-300">Kubernetes</strong> to radical <strong className="text-emerald-400">FinOps cost optimization</strong> and self-healing <strong className="text-violet-300">Agentic AI</strong>.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <button
                onClick={() => setCurrentTab('academy')}
                className="glow-button px-6 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2.5 hover:scale-[1.02] transition-all"
              >
                <PlayCircle className="w-5 h-5 fill-slate-950 text-cyan-400" />
                <span>Explore Training Videos</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950/20 text-slate-950 font-mono font-bold">
                  ACADEMY
                </span>
              </button>

              <button
                onClick={() => setIsConsultationModalOpen(true)}
                className="px-6 py-3.5 rounded-xl text-sm font-bold tracking-wide text-white bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Book Architecture Consultation</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Trust points bar */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Zero Drift GitOps</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>40%+ FinOps Savings</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Production K8s SLA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Futuristic Telemetry & HUD */}
          <div className="lg:col-span-5 relative">
            
            {/* Interactive Futuristic Card */}
            <div className="glass-panel-glow rounded-2xl p-5 border border-cyan-500/30 relative overflow-hidden shadow-2xl">
              
              {/* HUD Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-white font-bold tracking-wide">LIVE CLOUD TELEMETRY</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-400 font-semibold">99.999% HEALTHY</span>
                </div>
              </div>

              {/* Multi-Cloud Topology Grid */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>AWS EKS Multi-AZ</span>
                    <span className="text-cyan-400">eu-west-1</span>
                  </div>
                  <div className="text-lg font-bold text-white font-sans flex items-center space-x-1.5">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span>64 Worker Nodes</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full w-[88%]"></div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Azure AKS Cluster</span>
                    <span className="text-indigo-400">uk-south</span>
                  </div>
                  <div className="text-lg font-bold text-white font-sans flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>32 Worker Nodes</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full w-[72%]"></div>
                  </div>
                </div>
              </div>

              {/* Animated Live Terminal Snippet */}
              <div className="rounded-xl bg-black/90 p-3.5 border border-cyan-500/20 font-mono text-[11px] space-y-1 text-slate-300">
                <div className="text-slate-500 flex items-center justify-between">
                  <span>argo-cd-controller.log</span>
                  <span className="text-emerald-400">SYNC_OK</span>
                </div>
                <div className="text-cyan-300 font-bold">$ argocd app sync ik-production-cluster</div>
                <div className="text-slate-400">» Comparing desired git state to live cluster...</div>
                <div className="text-emerald-400">✓ 18 resources in sync. 0 mutations required.</div>
                <div className="text-indigo-300">» AI Agent telemetry: latency 14ms · zero drift</div>
              </div>

              {/* Quick Feature Pill: Academy Preview */}
              <div 
                onClick={() => setCurrentTab('academy')}
                className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-950/50 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between cursor-pointer hover:border-cyan-400 transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <PlayCircle className="w-5 h-5 fill-cyan-400/20 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-1">
                      <span>IK Cloud Academy: Training Videos</span>
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Over 80+ hours of Kubernetes & Multi-Cloud masterclasses
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Floating Decorative Badges */}
            <div className="hidden sm:flex absolute -top-4 -left-4 items-center space-x-2 px-3 py-1.5 rounded-xl glass-panel border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-xl animate-float">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Terraform 1.9+ IaC</span>
            </div>

            <div className="hidden sm:flex absolute -bottom-4 -right-4 items-center space-x-2 px-3 py-1.5 rounded-xl glass-panel border border-violet-500/40 text-[11px] font-mono text-violet-300 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Agentic AI Workflows</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
