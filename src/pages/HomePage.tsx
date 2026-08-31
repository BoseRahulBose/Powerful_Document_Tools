import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Hero } from '../components/Hero';
import { TrustSection } from '../components/TrustSection';
import { ToolGrid } from '../components/ToolGrid';
import { HowItWorks } from '../components/HowItWorks';
import { SecuritySection } from '../components/SecuritySection';
import { FAQAccordion } from '../components/FAQAccordion';
import { ToolDefinition } from '../types';

interface HomePageProps {
  onSelectTool: (tool: ToolDefinition) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool, onNavigate }) => {
  const scrollToTools = () => {
    const el = document.getElementById('all-tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 md:space-y-12">
      {/* 1. Hero Section */}
      <Hero
        onStartTools={scrollToTools}
        onExploreAll={scrollToTools}
        onSelectSpecificTool={(route) => onNavigate(route)}
      />

      {/* 2. Trust Indicators (Fast, Easy, Multi-format, Secure, In-Browser) */}
      <TrustSection />

      {/* 3. Main Tools Grid & Filter System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ToolGrid onSelectTool={onSelectTool} />
      </div>

      {/* 4. How DocuFlow Works (3 Steps) */}
      <HowItWorks />

      {/* 5. Enterprise Security & Local Sandboxing */}
      <SecuritySection />

      {/* 6. Frequently Asked Questions */}
      <FAQAccordion />

      {/* 7. Bottom Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Simplify Your Document Workflow?
            </h2>
            <p className="text-sm sm:text-base text-indigo-100">
              No software installation. No accounts required. 100% private, instant document manipulation in your browser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button
              onClick={scrollToTools}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/help')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 border border-indigo-500/40 text-white font-semibold text-sm transition-all"
            >
              Read User Guide
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
