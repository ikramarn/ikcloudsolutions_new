import React, { useState } from 'react';
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
  Sparkles,
  Layers
} from 'lucide-react';

const ICON_MAP = {
  Boxes: Boxes,
  Cpu: Cpu,
  Cloud: Cloud,
  TrendingDown: TrendingDown,
  ShieldCheck: ShieldCheck,
  UserCheck: UserCheck
};

export const ServicesGrid = () => {
  const { setCurrentTab, setIsConsultationModalOpen } = useApp();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950">
      {/* Background cyber lines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Enterprise Cloud Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-sans tracking-tight">
            Architected for Modern Enterprise Dominance
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            We transcend conventional consulting to deliver an autonomous, self-healing digital ecosystem. Every capability is engineered for velocity, zero downtime, and audited FinOps savings.
          </p>
        </div>

        {/* Services 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_SERVICES.map((service) => {
            const Icon = ICON_MAP[service.icon] || Cloud;
            return (
              <div
                key={service.id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between relative group hover:border-cyan-500/40 transition-all duration-300"
              >
                <div>
                  {/* Icon & Glow */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center group-hover:border-cyan-400/50 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                      <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      ENTERPRISE TIER
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-white font-sans mb-1 group-hover:text-cyan-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-cyan-400/80 font-mono mb-3">
                    {service.tagline}
                  </p>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 mb-6">
                    {service.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Metric & Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold truncate max-w-[190px]">
                    {service.metrics}
                  </div>
                  <button
                    onClick={() => setIsConsultationModalOpen(true)}
                    className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all flex items-center space-x-1 text-xs font-semibold"
                  >
                    <span>Engage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global CTA Strip */}
        <div className="mt-12 p-6 rounded-2xl glass-panel-glow border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h4 className="text-base font-bold text-white font-sans flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Looking for Custom Multi-Cloud Architecture or Team Augmentation?</span>
            </h4>
            <p className="text-xs text-slate-400">
              Speak directly with Lead Architect Ikram Ullah to design a tailored blueprint for your enterprise.
            </p>
          </div>
          <button
            onClick={() => setIsConsultationModalOpen(true)}
            className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 shrink-0"
          >
            Schedule Technical Assessment
          </button>
        </div>
      </div>
    </section>
  );
};
