import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_CASE_STUDIES, INITIAL_TESTIMONIALS } from '../../data/initialData';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Quote, 
  CheckCircle,
  Building,
  ArrowRight
} from 'lucide-react';

export const CaseStudiesSection = () => {
  const { setIsConsultationModalOpen } = useApp();

  return (
    <section className="py-24 bg-slate-900/40 relative border-t border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Proven Enterprise Impact</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Case Studies: Transforming Critical Infrastructure
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Discover how global organizations leverage our multi-cloud architecture, automated GitOps pipelines, and FinOps governance to achieve market leadership.
          </p>
        </div>

        {/* 3 Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {INITIAL_CASE_STUDIES.map((cs, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between text-left relative group hover:border-cyan-500/40 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                  <div className="flex items-center space-x-1.5">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>{cs.client}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">VERIFIED</span>
                </div>

                <h3 className="text-base font-bold text-white font-sans">
                  {cs.service}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {cs.summary}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Impact</span>
                    <p className="text-sm font-bold text-cyan-300">{cs.metrics}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">FinOps</span>
                    <p className="text-sm font-bold text-emerald-400">{cs.savings}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">AWS + ArgoCD GitOps</span>
                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>Request Full Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Client Testimonials Carousel/Grid */}
        <div className="pt-8 border-t border-white/10">
          <h3 className="text-center text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-8">
            Endorsements from Technology Leaders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-xl bg-slate-950/80 border border-white/10 text-left space-y-3 relative"
              >
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{t.comment}"
                </p>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
