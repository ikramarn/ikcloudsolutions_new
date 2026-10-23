import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  User, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const AuthModal = () => {
  const { authModal, setAuthModal, loginUser, signupUser } = useApp();
  const [mode, setMode] = useState(authModal.mode || 'signup'); // 'login' | 'signup'
  const [selectedRole, setSelectedRole] = useState(authModal.role || 'learner'); // 'learner' | 'trainer'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    title: '',
    bio: ''
  });

  // Sync mode with prop changes when modal opens
  useEffect(() => {
    if (authModal.isOpen) {
      setMode(authModal.mode || 'signup');
      setSelectedRole(authModal.role || 'learner');
      setError(null);
    }
  }, [authModal.isOpen, authModal.mode, authModal.role]);

  if (!authModal.isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const result = signupUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          title: formData.title,
          bio: formData.bio
        });

        if (result.success) {
          // Celebrate genuine registration with confetti
          confetti({
            particleCount: 85,
            spread: 70,
            origin: { y: 0.6 }
          });
          setFormData({ name: '', email: '', password: '', title: '', bio: '' });
        } else {
          setError(result.error);
        }
      } else {
        const result = loginUser({
          email: formData.email,
          password: formData.password
        });

        if (!result.success) {
          setError(result.error);
        } else {
          setFormData({ name: '', email: '', password: '', title: '', bio: '' });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillTrainerDemo = () => {
    setMode('login');
    setSelectedRole('trainer');
    setFormData(prev => ({
      ...prev,
      email: 'ikram@ikcloudsolutions.com',
      password: 'password123'
    }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 p-6 border-b border-white/10 text-left">
          <button
            onClick={() => setAuthModal({ ...authModal, isOpen: false })}
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>IK Cloud Secure Identity Access</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white font-sans">
            {mode === 'signup' ? 'Create Your Account' : 'Sign In to IK Cloud Platform'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' 
              ? 'Join IK Cloud Academy to earn certificates, launch cloud labs, and track your DevOps mastery.'
              : 'Welcome back. Access your saved progress, course syllabus, and sandboxes.'}
          </p>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-5 text-left">
          
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Role Selector (in signup mode) */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                Choose Account Type:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setSelectedRole('learner')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === 'learner'
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>Cloud Learner</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Course masterclasses, terminal labs, quizzes & skill tracking.
                  </p>
                </div>

                <div 
                  onClick={() => setSelectedRole('trainer')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === 'trainer'
                      ? 'bg-violet-950/40 border-violet-400 shadow-sm shadow-violet-500/20'
                      : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Trainer / Creator</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Trainer Studio access to publish, edit & manage courses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'trainer' ? 'e.g. Ikram Ullah' : 'e.g. John Doe'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@enterprise.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Password <span className="text-cyan-400">*</span>
                </label>
                {mode === 'signup' && (
                  <span className="text-[10px] font-mono text-slate-500">Min. 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && selectedRole === 'trainer' && (
              <div>
                <label className="block text-xs font-medium text-violet-300 mb-1">
                  Professional Title / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Enterprise Cloud & DevOps Architect"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-violet-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-400 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center justify-center space-x-2 transition-all shadow-lg ${
                selectedRole === 'trainer' 
                  ? 'bg-gradient-to-r from-violet-400 to-indigo-400 hover:from-violet-300 hover:to-indigo-300 shadow-violet-500/30' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-cyan-500/30'
              } disabled:opacity-50`}
            >
              <span>
                {isSubmitting 
                  ? 'Processing...' 
                  : mode === 'signup' 
                    ? `Create ${selectedRole === 'trainer' ? 'Trainer' : 'Learner'} Account` 
                    : 'Sign In to Platform'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Footer for Ikram's Trainer Access */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              {mode === 'signup' ? (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Need an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Register free
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleFillTrainerDemo}
              className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 hover:text-violet-300 transition-colors bg-slate-900/60 px-2 py-1 rounded-lg border border-white/5"
            >
              <KeyRound className="w-3 h-3 text-violet-400" />
              <span>Trainer Quick Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
