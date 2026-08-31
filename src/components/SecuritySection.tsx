import React from 'react';
import { ShieldCheck, Lock, Trash2, EyeOff, Server, FileLock2 } from 'lucide-react';

export const SecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      icon: EyeOff,
      title: 'Browser Sandboxing',
      description:
        'Client-side operations execute in your browser memory without ever transmitting documents to third-party databases.',
    },
    {
      icon: Trash2,
      title: 'Automated Ephemeral Cleanup',
      description:
        'Any server-side conversions are queued in temporary isolated memory and wiped automatically after processing.',
    },
    {
      icon: Lock,
      title: 'Zero Unnecessary File Storage',
      description:
        'We never retain, log, index, or harvest user document contents for training or marketing purposes.',
    },
    {
      icon: FileLock2,
      title: 'Rigorous Type & MIME Validation',
      description:
        'Robust multi-layer validation stops malicious executables and verifies genuine PDF / DOCX file signatures.',
    },
    {
      icon: Server,
      title: 'End-to-End Encryption in Transit',
      description:
        'All communications adhere to modern HTTPS and TLS standards for safe and encrypted transfers.',
    },
    {
      icon: ShieldCheck,
      title: 'Local Processing Priority',
      description:
        'Whenever mathematically feasible, PDF manipulations are handled directly via WebAssembly and local JavaScript.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-900/80 backdrop-blur-2xl text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 my-12 relative overflow-hidden border border-white/10 shadow-2xl">
      {/* Glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Enterprise Privacy Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your Files Are Private and Secure.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Built with strict privacy-by-design principles so your sensitive contracts, tax records, and personal documents remain under your control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {securityFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-3 hover:bg-white/10 transition-all shadow-sm"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 backdrop-blur-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{feat.title}</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
