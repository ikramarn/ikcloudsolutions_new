import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cloud, 
  MapPin, 
  Mail, 
  Terminal, 
  ArrowUpRight, 
  ShieldCheck, 
  GitBranch, 
  PlayCircle,
  ExternalLink
} from 'lucide-react';

export const Footer = () => {
  const { setCurrentTab, setIsConsultationModalOpen } = useApp();

  const handleNav = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-cyan-500/20 text-slate-400 text-sm relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Address Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('home')}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-lg text-white font-sans tracking-tight">
                IK CLOUD <span className="text-cyan-400">SOLUTIONS</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              From strategy to production, we architect reliable AI, multi-cloud, and autonomous software outcomes with measurable enterprise business impact.
            </p>

            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex items-start space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>35 Napier Road, Glenrothes, KY6 1DS, Scotland, UK</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="mailto:admin@ikcloudsolutions.com" className="hover:text-cyan-300 transition-colors">
                  admin@ikcloudsolutions.com
                </a>
              </div>
            </div>

            {/* Live Infrastructure Tag */}
            <div className="pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>GLOBAL GITOPS CLOUD PLATFORM: OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Column 2: Solutions & Pillars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>Core Services</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-cyan-300 transition-colors text-left">
                  Multi-Cloud DevOps & GitOps
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-cyan-300 transition-colors text-left">
                  Agentic AI & Digital Engineering
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-cyan-300 transition-colors text-left">
                  Zero-Downtime Cloud Migration
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-cyan-300 transition-colors text-left">
                  FinOps Cloud Cost Optimization
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-cyan-300 transition-colors text-left">
                  DevSecOps & Zero Trust
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-cyan-300 transition-colors text-left">
                  Senior Squad B2B Staffing
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Training Videos & Academy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Training Videos</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleNav('academy')} className="hover:text-cyan-300 transition-colors text-left flex items-center space-x-1">
                  <span>Kubernetes CKA Masterclass</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academy')} className="hover:text-cyan-300 transition-colors text-left">
                  AWS Multi-Region Architect
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academy')} className="hover:text-cyan-300 transition-colors text-left">
                  Terraform Modular IaC & Drift
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academy')} className="hover:text-cyan-300 transition-colors text-left">
                  Agentic AI Cloud Systems
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('academy')} className="hover:text-cyan-300 transition-colors text-left">
                  Enterprise DevSecOps Pipelines
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('trainer-studio')} className="text-violet-400 hover:text-violet-300 transition-colors text-left font-medium">
                  ★ Trainer Space (Create Course)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Enterprise Consultation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Architecture Review</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Book a 1-on-1 enterprise cloud architecture review with CEO Ikram Ullah or our principal architects.
            </p>
            <button
              onClick={() => setIsConsultationModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 hover:text-white transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Schedule Architecture Audit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <div className="pt-1">
              <button
                onClick={() => handleNav('simulator')}
                className="text-xs text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Try Interactive FinOps Calculator &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono">
          <p>© 2026 IK Cloud Solutions Ltd. Registered in Scotland, UK. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-3 sm:mt-0">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Compliance</span>
            <span className="hover:text-slate-300 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
