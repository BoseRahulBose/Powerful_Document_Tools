import React from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2, Server } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Strict Data Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: August 2026 • Effective immediately
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1. Core Privacy Principles
          </h2>
          <p>
            At DocuFlow, we believe your personal documents belong solely to you. We design our software architecture to process documents locally in your browser wherever technically viable, avoiding unnecessary remote data transmissions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            2. How We Handle Your Documents
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Client-Side Operations:</strong> Operations like PDF Merge, Split, Rotate, Delete Pages, Extract Pages, Organize, and Image-to-PDF run directly in your web browser via WebAssembly and JavaScript. No document payload is uploaded to our servers.
            </li>
            <li>
              <strong>Server-Assisted Conversions:</strong> For high-fidelity conversions requiring OpenXML document restructuring (such as complex PDF-to-Word conversions), files are sent via secure TLS/HTTPS connections into isolated memory containers. Files are processed and immediately deleted upon completion.
            </li>
            <li>
              <strong>No Long-Term File Storage:</strong> We do not store, archive, index, or back up your document contents.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Local Storage Data
          </h2>
          <p>
            DocuFlow uses your browser’s local storage (`localStorage`) solely to store user interface preferences (such as Dark/Light theme mode) and your personal processing history log. This data never leaves your browser and can be purged at any time from the Settings page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            4. No Advertising or Data Selling
          </h2>
          <p>
            We do not sell, rent, or monetize your document contents or personal browsing habits to third-party ad networks.
          </p>
        </section>
      </div>
    </div>
  );
};
