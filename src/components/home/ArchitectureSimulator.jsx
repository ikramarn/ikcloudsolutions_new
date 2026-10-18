import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sliders, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Server, 
  ArrowRight, 
  Download, 
  RefreshCw,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

export const ArchitectureSimulator = () => {
  const { setIsConsultationModalOpen, showToast } = useApp();

  const [provider, setProvider] = useState('AWS'); // 'AWS' | 'Azure' | 'GCP' | 'Multi-Cloud'
  const [infraType, setInfraType] = useState('Legacy VMs & Monolith');
  const [monthlySpend, setMonthlySpend] = useState(45000);
  const [deployFreq, setDeployFreq] = useState('Weekly Manual');

  // Dynamic calculations based on real FinOps benchmarks
  const savingsPercent = provider === 'Multi-Cloud' ? 44 : infraType.includes('Monolith') ? 48 : 36;
  const monthlySavings = Math.round(monthlySpend * (savingsPercent / 100));
  const annualSavings = monthlySavings * 12;
  const deploymentMultiplier = deployFreq.includes('Manual') ? '8.5x Faster' : '3.2x Faster';

  const handleDownloadBlueprint = () => {
    showToast(`Generating custom ${provider} FinOps Architecture Blueprint PDF...`);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-slate-900/60 border-y border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive ROI & Infrastructure Engine</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Multi-Cloud FinOps & GitOps Simulator
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Adjust your enterprise parameters below to calculate projected cloud spend reduction, deployment acceleration, and the optimal automated GitOps topology.
          </p>
        </div>

        {/* Simulator Cockpit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Panel (7 cols) */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            
            {/* 1. Cloud Provider Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                1. Select Target Cloud Environment:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['AWS', 'Azure', 'GCP', 'Multi-Cloud'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                      provider === p
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Current Architecture State */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                2. Current Architecture Archetype:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Legacy VMs & Monolith',
                  'Basic Docker Containers',
                  'Distributed Microservices'
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInfraType(type)}
                    className={`p-3 rounded-xl text-xs text-left font-medium transition-all border ${
                      infraType === type
                        ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400'
                        : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Monthly Spend Range Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 uppercase tracking-wider">
                  3. Current Monthly Cloud Bill:
                </span>
                <span className="text-lg font-bold text-cyan-400">
                  ${monthlySpend.toLocaleString()} / mo
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>$5,000 / mo</span>
                <span>$100,000 / mo</span>
                <span>$250,000+ / mo</span>
              </div>
            </div>

            {/* 4. Release Cadence */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                4. Current Deployment Cadence:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Monthly Manual', 'Weekly Scheduled', 'Daily Automated'].map((cadence) => (
                  <button
                    key={cadence}
                    type="button"
                    onClick={() => setDeployFreq(cadence)}
                    className={`py-2 px-2.5 rounded-xl text-xs text-center font-medium transition-all border ${
                      deployFreq === cadence
                        ? 'bg-cyan-950/60 text-cyan-200 border-cyan-400'
                        : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {cadence}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projection Dashboard (5 cols) */}
          <div className="lg:col-span-5 glass-panel-glow rounded-2xl p-6 sm:p-8 space-y-6 border border-cyan-500/30">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Simulated Outcomes</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                -{savingsPercent}% FinOps ROI
              </span>
            </div>

            {/* Big Savings Metric */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-left space-y-1">
              <div className="text-xs font-mono text-slate-400">
                Projected Annual Cloud Savings:
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-sans tracking-tight">
                ${annualSavings.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                ~ <strong className="text-white">${monthlySavings.toLocaleString()}</strong> saved every month through spot automation, compute rightsizing & storage tiers.
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Velocity</span>
                </div>
                <div className="text-xl font-bold text-white font-sans">
                  {deploymentMultiplier}
                </div>
                <div className="text-[10px] text-slate-400">
                  ArgoCD GitOps continuous deployment
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recovery Time</span>
                </div>
                <div className="text-xl font-bold text-white font-sans">
                  &lt; 3 Minutes
                </div>
                <div className="text-[10px] text-slate-400">
                  Declarative zero-downtime rollback
                </div>
              </div>
            </div>

            {/* Recommended Blueprint */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 text-left text-xs font-mono space-y-2 text-slate-300">
              <div className="text-cyan-300 font-bold flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Recommended Blueprint Topology:</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• {provider} Multi-AZ Container Cluster (K8s)</li>
                <li>• Terraform Modular State Locking with DynamoDB</li>
                <li>• ArgoCD Self-Healing GitOps Pipeline</li>
                <li>• Kubecost Real-Time Allocation & Spot Orchestration</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setIsConsultationModalOpen(true)}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 glow-button flex items-center justify-center space-x-2"
              >
                <span>Book Audit for this Specification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownloadBlueprint}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Executive Architecture Blueprint</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
