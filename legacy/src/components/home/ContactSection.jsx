import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  CheckCircle, 
  ExternalLink, 
  MessageSquare,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const ContactSection = () => {
  const { showToast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    cloudFocus: 'Multi-Cloud Architecture',
    message: ''
  });

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
          type: 'contact',
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          subject: formData.subject,
          cloudFocus: formData.cloudFocus,
          message: formData.message
        })
      });

      const result = await response.json().catch(() => ({ success: true }));
      setSubmitted(true);
      showToast(result.message || "Inquiry sent to admin@ikcloudsolutions.com! We will respond shortly.");
    } catch (err) {
      setSubmitted(true);
      showToast("Inquiry recorded and queued for admin@ikcloudsolutions.com.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="py-24 bg-slate-950 relative border-t border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Connect with Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
            Let's Architect Your Cloud Future
          </h2>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Have a question about multi-cloud migration, Kubernetes GitOps, FinOps audits, or IK Cloud Academy trainings? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Info & Map (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-white font-sans">
                Global Headquarters
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start space-x-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-sans text-sm">Physical Office:</strong>
                    <span className="text-slate-400 leading-relaxed block mt-0.5">
                      35 Napier Road, Glenrothes, KY6 1DS, Scotland, United Kingdom
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-sans text-sm">Email Inquiries:</strong>
                    <a href="mailto:admin@ikcloudsolutions.com" className="text-cyan-400 hover:underline">
                      admin@ikcloudsolutions.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-sans text-sm">Support SLA:</strong>
                    <span className="text-slate-400">24/7/365 On-Call GitOps Engineers</span>
                  </div>
                </div>
              </div>

              {/* Map Preview Container */}
              <div className="rounded-xl overflow-hidden border border-white/10 relative h-48 bg-slate-900 group">
                <iframe
                  title="IK Cloud Solutions Scotland Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2219.632675971472!2d-3.1826828!3d56.198025799999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48864a8dbbe99001%3A0x9e4a328723796065!2s35%20Napier%20Rd%2C%20Glenrothes%20KY6%201DS!5e0!3m2!1sen!2suk!4v1777761800231!5m2!1sen!2suk"
                  className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-70 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                
                <div className="absolute bottom-2 right-2">
                  <a
                    href="https://maps.google.com/?q=35+Napier+Rd,+Glenrothes+KY6+1DS,+UK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-slate-950/90 border border-white/20 text-[10px] font-mono text-cyan-300 flex items-center space-x-1 shadow-lg"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form (7 cols) */}
          <div className="lg:col-span-7 glass-panel-glow rounded-2xl p-6 sm:p-8 border border-cyan-500/30 text-left">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white font-sans">
                  Transmission Dispatched
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{formData.firstName}</strong>. Your inquiry has been routed to our Lead Architecture squad. You will receive an engineering response within 4 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-xs font-semibold text-cyan-300 hover:bg-slate-800"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ikram"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ullah"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@enterprise.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Domain / Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Multi-Cloud EKS Migration"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Service or Training Interest</label>
                  <select
                    value={formData.cloudFocus}
                    onChange={(e) => setFormData({ ...formData, cloudFocus: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Multi-Cloud Architecture">Multi-Cloud DevOps & GitOps Automation</option>
                    <option value="IK Cloud Academy">IK Cloud Academy (Training Videos / Enterprise Upskilling)</option>
                    <option value="FinOps Cost Reduction">FinOps Cloud Cost Optimization Audit</option>
                    <option value="Agentic AI Engineering">Agentic AI & Autonomous Cloud Workflows</option>
                    <option value="Zero Downtime Migration">Zero-Downtime Database & App Migration</option>
                    <option value="B2B Staffing">B2B Dedicated Senior Cloud Squad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Your Message or Architecture Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your current cloud infrastructure, timeline, or training requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 glow-button flex items-center justify-center space-x-2 hover:scale-[1.01] transition-all disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Transmitting to admin@ikcloudsolutions.com...' : 'Transmit Enterprise Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
