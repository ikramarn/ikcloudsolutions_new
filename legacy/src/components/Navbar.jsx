import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cloud, 
  PlayCircle, 
  Sliders, 
  Cpu, 
  User, 
  LogOut, 
  PlusCircle, 
  GraduationCap, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown, 
  Sparkles,
  PhoneCall,
  Terminal
} from 'lucide-react';

export const Navbar = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    currentUser, 
    logout, 
    switchRole, 
    setAuthModal, 
    setIsConsultationModalOpen 
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/15">
      {/* Top telemetry ticker strip */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 text-xs bg-slate-950/80 border-b border-white/5 text-slate-400 font-mono">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300">SYSTEM TELEMETRY:</span>
            <span className="text-cyan-400">AWS / AZURE / GCP / OCI ACTIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>GitOps ArgoCD: <span className="text-emerald-400 font-medium">100% Synced</span></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Zero Trust Gate: <span className="text-indigo-400 font-medium">Enforced</span></span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-0.5 rounded border border-white/10 text-slate-300">
            <span className="text-slate-400">Location:</span>
            <span className="text-white font-medium">Glenrothes, Scotland, UK</span>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>ENTERPRISE CLOUD PLATFORM</span>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cloud className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors">
                IK CLOUD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SOLUTIONS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wide">
              AUTONOMOUS CLOUD & AI
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'home'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => handleNavClick('services')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'services'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Services
          </button>

          {/* TRAINING VIDEOS / ACADEMY BADGE */}
          <button
            onClick={() => handleNavClick('academy')}
            className={`relative group px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 ${
              currentTab === 'academy'
                ? 'text-cyan-300 bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-400/40 shadow-sm shadow-cyan-500/30'
                : 'text-slate-200 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <PlayCircle className={`w-4 h-4 ${currentTab === 'academy' ? 'text-cyan-400 animate-pulse' : 'text-cyan-400'}`} />
            <span>Training Videos</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
          </button>

          <button
            onClick={() => handleNavClick('simulator')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
              currentTab === 'simulator'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>FinOps Simulator</span>
          </button>

          {/* Trainer Personalized Studio Link - Only when Trainer */}
          {currentUser?.role === 'trainer' && (
            <button
              onClick={() => handleNavClick('trainer-studio')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'trainer-studio'
                  ? 'text-violet-300 bg-violet-950/60 border border-violet-500/40 shadow-sm shadow-violet-500/30'
                  : 'text-violet-400 hover:text-violet-300 hover:bg-violet-950/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Trainer Studio</span>
              <span className="px-1.5 py-0.2 text-[10px] bg-violet-500/30 text-violet-200 rounded font-mono">
                CREATOR
              </span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('about')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'about'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            About & Team
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentTab === 'contact'
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* User Account / Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/30 transition-all text-left"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/30" 
                />
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-white flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase">
                    {currentUser.role}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-panel-glow rounded-xl p-2 shadow-2xl border border-cyan-500/30 z-50">
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <span>Role: {currentUser.role.toUpperCase()}</span>
                    </div>
                  </div>

                  {currentUser.role === 'trainer' && (
                    <button
                      onClick={() => {
                        handleNavClick('trainer-studio');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-violet-300 hover:bg-violet-950/40 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>Open Trainer Studio & Courses</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleNavClick('academy');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <span>My Learning & Enrolled Courses</span>
                  </button>

                  <div className="my-1 border-t border-white/5"></div>

                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'login', role: 'learner' })}
                className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup', role: 'learner' })}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Book Consultation Primary CTA */}
          <button
            onClick={() => setIsConsultationModalOpen(true)}
            className="glow-button px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-cyan-500/20 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                currentTab === 'home' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                currentTab === 'services' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
              }`}
            >
              Services & Multi-Cloud
            </button>
            <button
              onClick={() => handleNavClick('academy')}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium flex items-center justify-between ${
                currentTab === 'academy' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                <span>Training Videos</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded font-mono">
                ACADEMY
              </span>
            </button>
            <button
              onClick={() => handleNavClick('simulator')}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                currentTab === 'simulator' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
              }`}
            >
              FinOps Simulator
            </button>

            {currentUser?.role === 'trainer' && (
              <button
                onClick={() => handleNavClick('trainer-studio')}
                className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium text-violet-300 bg-violet-950/30 ${
                  currentTab === 'trainer-studio' ? 'border border-violet-500/40' : ''
                }`}
              >
                ★ Trainer Studio (Manage & Create Courses)
              </button>
            )}

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                currentTab === 'about' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
              }`}
            >
              About & Team
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2.5 rounded-lg text-left text-sm font-medium ${
                currentTab === 'contact' ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
              }`}
            >
              Contact & UK Office
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
            {currentUser ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/10">
                <div className="flex items-center space-x-2">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full" />
                  <span className="text-xs font-medium text-white">{currentUser.name} ({currentUser.role})</span>
                </div>
                <button 
                  onClick={logout} 
                  className="text-xs text-rose-400 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModal({ isOpen: true, mode: 'login', role: 'learner' });
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModal({ isOpen: true, mode: 'signup', role: 'learner' });
                  }}
                  className="px-3 py-2 rounded-lg bg-cyan-500 text-xs font-bold text-slate-950"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsConsultationModalOpen(true);
              }}
              className="w-full py-2.5 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider text-center"
            >
              Book Architecture Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
