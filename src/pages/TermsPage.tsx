import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Last updated: August 2026
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using the DocuFlow document utility suite, you agree to comply with and be bound by these terms. If you disagree with any part of these terms, please do not use the application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            2. Permitted Use
          </h2>
          <p>
            DocuFlow is provided for lawful document management, format conversion, and compression. You agree not to upload files containing malicious software, viruses, or materials that violate copyright or legal rights.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            The services are provided on an "as is" and "as available" basis. While we strive for 100% conversion accuracy and visual fidelity, DocuFlow makes no warranties regarding the absolute perfection of machine conversion across all custom font sets or corrupted legacy documents.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall DocuFlow be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access or use of the tools. Users are encouraged to maintain independent backups of all critical files.
          </p>
        </section>
      </div>
    </div>
  );
};
