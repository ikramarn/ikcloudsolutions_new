import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_LEADERSHIP } from '../../data/initialData';
import { 
  Users, 
  MapPin, 
  Target, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const TeamSection = () => {
  const { setIsConsultationModalOpen } = useApp();

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mission & Vision Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          <div className="p-8 rounded-2xl glass-card text-left space-y-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">
              Our Mission
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To bring definitive clarity to priorities, automated strategies, and cloud opportunities within global enterprises—enabling engineering organizations to achieve the exceptional, high-velocity results they desire.
            </p>
          </div>

          <div className="p-8 rounded-2xl glass-card text-left space-y-3 relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white font-sans">
              Our Vision
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We strive to empower our clients with an autonomous, resilient multi-cloud digital frontier where cloud computing, Agentic AI, and DevOps automation converge into an unstoppable engine for growth.
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Leadership & Engineering Bench</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Spearheaded by Veteran Cloud Architects
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Our team blends deep enterprise infrastructure mastery with younger, agile minds passionate about continuous delivery and multi-cloud resilience.
          </p>
        </div>

        {/* Leadership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INITIAL_LEADERSHIP.map((leader, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl overflow-hidden flex flex-col text-left group hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    {leader.title}
                  </span>
                  <h3 className="text-xl font-bold text-white font-sans mt-0.5">
                    {leader.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    {leader.role}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {leader.bio}
                </p>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Core Architectural Focus:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {leader.specialties.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-white/10 text-slate-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scotland UK Office Spotlight */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl glass-panel-glow border border-cyan-500/30 flex flex-col lg:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 text-cyan-400 text-xs font-mono">
              <MapPin className="w-4 h-4" />
              <span>UNITED KINGDOM HEADQUARTERS</span>
            </div>
            <h4 className="text-xl font-bold text-white font-sans">
              35 Napier Road, Glenrothes, KY6 1DS, Scotland, UK
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Operating our central engineering center from Fife, Scotland, delivering enterprise solutions across the United Kingdom, Europe, North America, and the Middle East.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsConsultationModalOpen(true)}
              className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950"
            >
              Meet the Architects
            </button>
            <a
              href="https://maps.google.com/?q=35+Napier+Rd,+Glenrothes+KY6+1DS,+UK"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-cyan-400 transition-all flex items-center space-x-1.5"
            >
              <span>View On Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
