import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ToolLayout } from './pages/ToolLayout';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';

// Tool Components
import { PdfToWordTool } from './pages/tools/PdfToWordTool';
import { WordToPdfTool } from './pages/tools/WordToPdfTool';
import { CompressPdfTool } from './pages/tools/CompressPdfTool';
import { ReducePdfSizeTool } from './pages/tools/ReducePdfSizeTool';
import { MergePdfTool } from './pages/tools/MergePdfTool';
import { SplitPdfTool } from './pages/tools/SplitPdfTool';
import { RotatePdfTool } from './pages/tools/RotatePdfTool';
import { DeletePdfPagesTool } from './pages/tools/DeletePdfPagesTool';
import { ExtractPdfPagesTool } from './pages/tools/ExtractPdfPagesTool';
import { OrganizePdfTool } from './pages/tools/OrganizePdfTool';
import { ImageToPdfTool } from './pages/tools/ImageToPdfTool';
import { PdfToImageTool } from './pages/tools/PdfToImageTool';
import { WordOptimizerTool } from './pages/tools/WordOptimizerTool';

import { TOOLS_DATA } from './data/toolsData';
import { ToolDefinition, ToastMessage } from './types';
import { getSettings } from './utils/storage';

function getInitialRoute(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Check Hash routing first (ideal for GitHub Pages subdirectories)
  const hash = window.location.hash;
  if (hash) {
    const cleanHash = hash.replace(/^#\/?/, '/');
    if (cleanHash.startsWith('/')) {
      return cleanHash;
    }
  }

  // 2. Check Pathname
  const pathname = window.location.pathname || '/';
  if (pathname === '/' || pathname === '' || pathname.endsWith('/index.html')) {
    return '/';
  }

  // Match tool routes against the end of pathname (e.g. /my-repo/pdf-to-word)
  for (const tool of TOOLS_DATA) {
    if (pathname.endsWith(tool.route) || pathname.endsWith(`/${tool.id}`)) {
      return tool.route;
    }
  }

  // Match static pages
  const staticPages = ['/history', '/settings', '/help', '/privacy', '/terms', '/contact'];
  for (const page of staticPages) {
    if (pathname.endsWith(page)) {
      return page;
    }
  }

  return '/';
}

export default function App() {
  // Navigation Path
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getInitialRoute();
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const settings = getSettings();
    if (settings.theme === 'dark') return true;
    if (settings.theme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dark mode class synchronization
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle browser popstate & hashchange (back/forward and hash navigation)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getInitialRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Navigation Handler
  const navigate = (path: string) => {
    if (path.startsWith('/#') || path.startsWith('#')) {
      const sectionId = path.replace(/^\/?#/, '');
      setCurrentPath('/');
      window.location.hash = sectionId;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    setCurrentPath(path);
    const targetHash = path === '/' ? '' : (path.startsWith('/') ? path.substring(1) : path);
    if (targetHash) {
      window.location.hash = targetHash;
    } else {
      // Clear hash if navigating back to home
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Find if current path corresponds to a tool
  const currentTool = TOOLS_DATA.find(
    (t) => t.route === currentPath || `/${t.id}` === currentPath
  );

  // Render current view
  const renderContent = () => {
    // 1. History Page
    if (currentPath === '/history') {
      return <HistoryPage onNavigate={navigate} showToast={showToast} />;
    }

    // 2. Settings Page
    if (currentPath === '/settings') {
      return (
        <SettingsPage
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showToast={showToast}
        />
      );
    }

    // 3. Help Page
    if (currentPath === '/help') {
      return <HelpPage />;
    }

    // 4. Privacy Page
    if (currentPath === '/privacy') {
      return <PrivacyPage />;
    }

    // 5. Terms Page
    if (currentPath === '/terms') {
      return <TermsPage />;
    }

    // 6. Contact Page
    if (currentPath === '/contact') {
      return <ContactPage showToast={showToast} />;
    }

    // 7. Tool Pages
    if (currentTool) {
      return (
        <ToolLayout tool={currentTool} onNavigate={navigate}>
          {currentTool.id === 'pdf-to-word' && (
            <PdfToWordTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'word-to-pdf' && (
            <WordToPdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'compress-pdf' && (
            <CompressPdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'reduce-pdf-size' && (
            <ReducePdfSizeTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'merge-pdf' && (
            <MergePdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'split-pdf' && (
            <SplitPdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'rotate-pdf' && (
            <RotatePdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'delete-pdf-pages' && (
            <DeletePdfPagesTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'extract-pdf-pages' && (
            <ExtractPdfPagesTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'organize-pdf' && (
            <OrganizePdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'image-to-pdf' && (
            <ImageToPdfTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'pdf-to-image' && (
            <PdfToImageTool
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

          {currentTool.id === 'word-optimizer' && (
            <WordOptimizerTool
              mode="optimize"
              title="Word Document Optimizer"
              toolId="word-optimizer"
              onViewHistory={() => navigate('/history')}
              showToast={showToast}
            />
          )}

        </ToolLayout>
      );
    }

    // Default: Home Page
    return (
      <HomePage
        onSelectTool={(tool) => navigate(tool.route)}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Frosted Glass Ambient Light Blobs (Backdrop Layer) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/50 dark:bg-blue-600/20 blur-[130px] opacity-70" />
        <div className="absolute top-[30%] -right-[15%] w-[45%] h-[45%] rounded-full bg-indigo-200/50 dark:bg-indigo-600/20 blur-[130px] opacity-70" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-sky-200/40 dark:bg-violet-600/15 blur-[120px] opacity-60" />
      </div>

      {/* Header */}
      <div className="relative z-40">
        <Header
          isDarkMode={darkMode}
          onToggleTheme={() => setDarkMode((prev) => !prev)}
          currentPath={currentPath}
          onNavigate={navigate}
        />
      </div>

      {/* Main Page Body */}
      <main className="relative z-10 flex-1 w-full">{renderContent()}</main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer onNavigate={navigate} />
      </div>

      {/* Toast Notification Layer */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
