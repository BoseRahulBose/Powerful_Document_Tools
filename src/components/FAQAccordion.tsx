import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const GLOBAL_FAQS: FAQItem[] = [
  {
    question: 'How do I convert PDF to Word?',
    answer:
      'Simply navigate to the "PDF to Word" tool, upload your PDF document, and click "Convert to Word". DocuFlow parses text layers, headings, and tables into a clean, editable Microsoft Word (.docx) document ready for download.',
    category: 'Conversion',
  },
  {
    question: 'How do I convert Word to PDF?',
    answer:
      'Select the "Word to PDF" tool, drag and drop your .docx or .doc file, and click "Convert to PDF". The tool will structure paragraphs, headings, and formatting into a universally compatible, print-ready PDF.',
    category: 'Conversion',
  },
  {
    question: 'How can I reduce PDF file size?',
    answer:
      'Use our "Compress PDF" tool to choose from Low, Medium, or High compression. Alternatively, use "Reduce PDF Size" if you need to hit a specific file size threshold (like Under 2MB or 1MB) for email or web portal limits.',
    category: 'Optimization',
  },
  {
    question: 'How many files can I merge at once?',
    answer:
      'You can merge up to 50 PDF files simultaneously. You can easily drag and drop or use up/down buttons to reorder the documents before creating the merged PDF.',
    category: 'PDF Tools',
  },
  {
    question: 'Are my files private and secure?',
    answer:
      'Yes. DocuFlow prioritizes in-browser client-side execution whenever possible, meaning files never leave your computer. For server-assisted conversions, files are held only in isolated temporary memory and deleted automatically after processing.',
    category: 'Security',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We support PDF (.pdf), Microsoft Word (.docx, .doc), text files (.txt, .rtf), images (.jpg, .jpeg, .png, .webp), and compressed archives (.zip).',
    category: 'General',
  },
  {
    question: 'Why did my conversion fail?',
    answer:
      'Conversions may fail if the PDF is password-protected/encrypted, corrupted, or contains zero valid page streams. Try removing the password or ensuring the file is readable in a standard PDF viewer.',
    category: 'Troubleshooting',
  },
  {
    question: 'What is the maximum allowed file size?',
    answer:
      'DocuFlow allows up to 50 MB per file, which covers virtually all documents, multi-page PDFs, and scanned contracts.',
    category: 'General',
  },
];

interface FAQAccordionProps {
  customFaqs?: FAQItem[];
  title?: string;
  showSearch?: boolean;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  customFaqs,
  title = 'Frequently Asked Questions',
  showSearch = true,
}) => {
  const faqs = customFaqs || GLOBAL_FAQS;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState('');

  const filteredFaqs = faqs.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Everything you need to know about processing documents with DocuFlow.
        </p>
      </div>

      {showSearch && (
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/70 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
          />
        </div>
      )}

      <div className="space-y-3 pt-2">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-white/60 dark:border-white/10 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <p className="text-center py-8 text-xs text-slate-400">
            No matching questions found for "{search}".
          </p>
        )}
      </div>
    </section>
  );
};
