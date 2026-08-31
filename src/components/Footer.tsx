import React from 'react';
import { FileText, Shield, Sparkles, Heart, ArrowUpRight } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const pdfTools = TOOLS_DATA.filter((t) => t.category === 'pdf' || t.category === 'organize').slice(0, 6);
  const wordTools = TOOLS_DATA.filter((t) => t.category === 'word');
  const imageTools = TOOLS_DATA.filter((t) => t.category === 'image');

  return (
    <footer className="bg-slate-900/90 dark:bg-slate-950/90 text-slate-300 pt-16 pb-12 border-t border-white/10 backdrop-blur-2xl transition-colors relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">DocuFlow</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              “All Your Document Tools. One Simple Workspace.” Convert, compress, merge, split, rotate, and organize PDF and Word files securely right inside your browser.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" />
                <span>100% Client Privacy Option</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>No File Limits</span>
              </div>
            </div>
          </div>

          {/* PDF Tools */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">PDF Tools</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {pdfTools.map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(tool.route)}
                    className="hover:text-white transition-colors flex items-center gap-1 group text-left cursor-pointer"
                  >
                    <span>{tool.name}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('/#all-tools')}
                  className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  All PDF Tools <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Word & Image Tools */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Word & Images</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              {wordTools.map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(tool.route)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
              {imageTools.map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => onNavigate(tool.route)}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Resources & Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('/help')} className="hover:text-white transition-colors cursor-pointer">
                  Help & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/history')} className="hover:text-white transition-colors cursor-pointer">
                  Recent Operations
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/settings')} className="hover:text-white transition-colors cursor-pointer">
                  Workspace Settings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DocuFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/privacy')} className="hover:text-slate-400 cursor-pointer">
              Privacy
            </button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-slate-400 cursor-pointer">
              Terms
            </button>
            <button onClick={() => onNavigate('/contact')} className="hover:text-slate-400 cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
