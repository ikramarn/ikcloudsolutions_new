import React from 'react';
import { Server, TrendingDown, ShieldCheck, GraduationCap } from 'lucide-react';

export const StatsBar = () => {
  const stats = [
    {
      value: "500+",
      label: "Cloud Modernizations",
      detail: "AWS, Azure, GCP & Oracle",
      icon: Server,
      color: "text-cyan-400"
    },
    {
      value: "42%",
      label: "Average FinOps Reduction",
      detail: "Sustained compute & storage savings",
      icon: TrendingDown,
      color: "text-emerald-400"
    },
    {
      value: "99.999%",
      label: "GitOps Infrastructure SLA",
      detail: "Zero configuration drift with ArgoCD",
      icon: ShieldCheck,
      color: "text-indigo-400"
    },
    {
      value: "14,500+",
      label: "Engineers Trained",
      detail: "CKA, AWS & Terraform Certifications",
      icon: GraduationCap,
      color: "text-violet-400"
    }
  ];

  return (
    <div className="border-y border-cyan-500/15 bg-slate-950/70 backdrop-blur-md relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="p-4 rounded-xl glass-card text-left space-y-1 group hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center space-x-2 text-slate-400">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs font-mono tracking-wide">{s.label}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  {s.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
