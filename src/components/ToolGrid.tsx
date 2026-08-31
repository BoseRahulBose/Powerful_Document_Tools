import React, { useState } from 'react';
import { Search, Sparkles, Filter } from 'lucide-react';
import { TOOLS_DATA } from '../data/toolsData';
import { ToolCategory, ToolDefinition } from '../types';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  onSelectTool: (tool: ToolDefinition) => void;
  initialCategory?: ToolCategory;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  onSelectTool,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'pdf', label: 'PDF Tools' },
    { id: 'word', label: 'Word Tools' },
    { id: 'image', label: 'Image Tools' },
    { id: 'organize', label: 'Page Management' },
  ];

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      tool.category === selectedCategory ||
      (selectedCategory === 'pdf' && tool.category === 'organize');

    const matchesSearch =
      searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.supportedFormats.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="all-tools" className="py-12 space-y-8">
      {/* Section Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need for Your Documents
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Professional grade tools to convert, compress, merge, and organize without size restrictions.
        </p>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/70 dark:border-white/10 rounded-2xl overflow-x-auto max-w-full shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white/90 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400 border border-white/90 dark:border-white/10 shadow-sm backdrop-blur-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools (e.g. merge, word)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/70 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => onSelectTool(tool)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/70 dark:border-white/10 p-8 space-y-3 shadow-lg">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
            No tools found matching "{searchQuery}"
          </p>
          <p className="text-xs text-slate-500">
            Try searching for PDF, Word, compress, rotate, or images.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 border border-blue-200/50 dark:border-blue-800/40"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
};
