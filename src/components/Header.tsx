import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Settings,
  HelpCircle,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  Layers,
  FileType,
  Image as ImageIcon,
  ShieldCheck,
} from 'lucide-react';
import { ToolCategory } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  isDarkMode,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'PDF Tools', path: '/#pdf-tools', category: 'pdf' },
    { label: 'Word Tools', path: '/#word-tools', category: 'word' },
    { label: 'Image Tools', path: '/#image-tools', category: 'image' },
    { label: 'All Tools', path: '/#all-tools', category: 'all' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-white/60 dark:border-white/10 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 text-white group-hover:scale-105 transition-transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
              DocuFlow
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline -mt-0.5">
              Document Workspace
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-3 bg-white/30 dark:bg-slate-850/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 dark:border-white/10">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.label}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleNavClick(item.path)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-white/10 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/40 dark:hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick actions & CTAs */}
        <div className="hidden sm:flex items-center gap-2">
          {/* History */}
          <button
            id="header-history-btn"
            onClick={() => handleNavClick('/history')}
            title="Processing History"
            className={`p-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 backdrop-blur-sm border ${
              currentPath === '/history'
                ? 'text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-slate-800/80 border-white/80 dark:border-white/10 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/30 dark:bg-slate-850/30 border-white/40 dark:border-white/10 hover:bg-white/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">History</span>
          </button>

          {/* Help */}
          <button
            id="header-help-btn"
            onClick={() => handleNavClick('/help')}
            title="Help & FAQs"
            className={`p-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 backdrop-blur-sm border ${
              currentPath === '/help'
                ? 'text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-slate-800/80 border-white/80 dark:border-white/10 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/30 dark:bg-slate-850/30 border-white/40 dark:border-white/10 hover:bg-white/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">Help</span>
          </button>

          {/* Settings */}
          <button
            id="header-settings-btn"
            onClick={() => handleNavClick('/settings')}
            title="Preferences"
            className={`p-2 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm border ${
              currentPath === '/settings'
                ? 'text-blue-600 dark:text-blue-400 bg-white/80 dark:bg-slate-800/80 border-white/80 dark:border-white/10 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/30 dark:bg-slate-850/30 border-white/40 dark:border-white/10 hover:bg-white/60'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Dark mode toggle */}
          <button
            id="header-theme-toggle"
            onClick={onToggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/30 dark:bg-slate-850/30 border border-white/40 dark:border-white/10 hover:bg-white/60 transition-colors backdrop-blur-sm"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA */}
          <button
            id="header-get-started-btn"
            onClick={() => handleNavClick('/#all-tools')}
            className="ml-1 px-5 py-2 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
            Get Started
          </button>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            id="header-mobile-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 text-slate-600 dark:text-slate-300 backdrop-blur-sm"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            id="header-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/50 dark:border-white/10 text-slate-700 dark:text-slate-200 backdrop-blur-sm focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1 pb-3 border-b border-white/40 dark:border-white/10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
                  currentPath === item.path
                    ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200/50 dark:border-blue-800/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleNavClick('/history')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-sm"
            >
              <Clock className="w-4 h-4 text-blue-500" />
              History
            </button>
            <button
              onClick={() => handleNavClick('/settings')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4 text-blue-500" />
              Settings
            </button>
            <button
              onClick={() => handleNavClick('/help')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-sm"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Help / FAQ
            </button>
            <button
              onClick={() => handleNavClick('/privacy')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 backdrop-blur-sm"
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Security
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleNavClick('/#all-tools')}
              className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              Start Using Tools
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
