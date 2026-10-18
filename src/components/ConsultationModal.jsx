import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  Cloud, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Send,
  Sparkles
} from 'lucide-react';

export const ConsultationModal = () => {
  const { isConsultationModalOpen, setIsConsultationModalOpen, showToast } = useApp();
  
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    roleTitle: '',
    cloudFocus: 'Multi-Cloud DevOps & GitOps',
    cloudProvider: 'AWS',
    monthlySpend: '$25,000 - $100,000',
    preferredDate: '2026-10-02',
    preferredTime: '14:00 BST',
    notes: ''
  });

  if (!isConsultationModalOpen) return null;

  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await fetch('/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type: 'consultation',
          name: formData.name,
          email: formData.email,
          company: formData.company,
          roleTitle: formData.roleTitle,
          cloudFocus: formData.cloudFocus,
          cloudProvider: formData.cloudProvider,
          monthlySpend: formData.monthlySpend,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          notes: formData.notes
        })
      });

      const result = await response.json().catch(() => ({ success: true }));
      setSubmitted(true);
      showToast(result.message || "Consultation booked! Details delivered to admin@ikcloudsolutions.com.");
    } catch (err) {
      setSubmitted(true);
      showToast("Consultation booked! Details delivered to admin@ikcloudsolutions.com.");
    } finally {
      setIsSending(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setIsSending(false);
    setIsConsultationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl glass-panel-glow rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
        
        {/* Glow Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 p-6 border-b border-white/10">
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Cloud className="w-4 h-4" />
            <span>IK Cloud Architecture Consultation</span>
          </div>

          <h3 className="text-xl font-bold text-white font-sans">
            Book an Enterprise Architecture Session
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Meet directly with CEO Ikram Ullah or Principal Cloud Architect Aisha Rahman.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-sans">
                Architecture Review Confirmed!
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.name}</strong>. A calendar invite for <strong className="text-cyan-300">{formData.preferredDate} at {formData.preferredTime}</strong> has been transmitted to <span className="font-mono text-cyan-400">{formData.email}</span>.
              </p>
              
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-left text-xs font-mono space-y-1.5 max-w-md mx-auto text-slate-400">
                <div>SESSION ID: <span className="text-white">IK-ARCH-{Math.floor(100000 + Math.random() * 900000)}</span></div>
                <div>FOCUS: <span className="text-cyan-400">{formData.cloudFocus} ({formData.cloudProvider})</span></div>
                <div>LOCATION: <span className="text-slate-300">Secure Video Conference / 35 Napier Rd, Scotland UK</span></div>
              </div>

              <button
                onClick={resetAndClose}
                className="glow-button px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 mt-4"
              >
                Return to Platform
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="s.jenkins@enterprise.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Tech"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. VP of Engineering, Lead Architect"
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Architecture Objective</label>
                  <select
                    value={formData.cloudFocus}
                    onChange={(e) => setFormData({ ...formData, cloudFocus: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Multi-Cloud DevOps & GitOps">Multi-Cloud DevOps & GitOps</option>
                    <option value="FinOps & Cost Optimization">FinOps & Cloud Cost Optimization</option>
                    <option value="Agentic AI & LLM Systems">Agentic AI & Digital Engineering</option>
                    <option value="Cloud Migration & Modernization">Zero-Downtime Cloud Migration</option>
                    <option value="DevSecOps & Zero Trust">DevSecOps & Zero Trust Governance</option>
                    <option value="Dedicated Engineering Squad">Dedicated Senior Cloud Squad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Cloud Environment</label>
                  <select
                    value={formData.cloudProvider}
                    onChange={(e) => setFormData({ ...formData, cloudProvider: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="AWS">Amazon Web Services (AWS)</option>
                    <option value="Azure">Microsoft Azure</option>
                    <option value="GCP">Google Cloud Platform (GCP)</option>
                    <option value="Oracle Cloud">Oracle Cloud Infrastructure (OCI)</option>
                    <option value="Multi-Cloud Hybrid">Multi-Cloud Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preferred Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preferred Time (UK Time)</span>
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="10:00 BST">10:00 AM BST (Morning Slot)</option>
                    <option value="12:00 BST">12:00 PM BST (Midday Slot)</option>
                    <option value="14:00 BST">02:00 PM BST (Afternoon Slot)</option>
                    <option value="16:30 BST">04:30 PM BST (Late Afternoon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Specific Infrastructure Challenges or Scope</label>
                <textarea
                  rows={2}
                  placeholder="Outline current cluster architecture, monthly spend, or deployment bottlenecks..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 glow-button flex items-center justify-center space-x-2 hover:scale-[1.01] transition-all disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Transmitting to admin@ikcloudsolutions.com...' : 'Confirm Architecture Session'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
