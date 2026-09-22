import React, { useState, useEffect } from 'react';
import { Download, X, Laptop, CheckCircle2, ArrowRight } from 'lucide-react';

export const InstallAppModal = ({ isOpen, onClose, deferredPrompt, onInstallSuccess }) => {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        {/* Header with App Logo */}
        <div className="bg-slate-900 p-6 text-white text-center relative flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <img
            src="/logo-icon.png"
            alt="FocusFlow Logo"
            className="h-14 w-auto object-contain mb-3 filter drop-shadow-md"
          />
          <h2 className="text-xl font-extrabold tracking-tight">Install FocusFlow App</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            Download FocusFlow as a desktop application from Google Chrome for quick access and offline productivity.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1b3b2b] hover:bg-[#132c1f] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Click to Install App Now</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Chrome Installation Steps:
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Click the Three Dots Menu</p>
                  <p className="text-[11px] text-slate-500">
                    Click the 3 vertical dots <strong className="text-slate-700 font-bold">⋮</strong> in the top-right of Chrome browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Scroll down to "Save and share" or "Install"</p>
                  <p className="text-[11px] text-slate-500">
                    Hover over <strong className="text-slate-700 font-bold">Save and share</strong> or look for <strong className="text-slate-700 font-bold">Install FocusFlow...</strong> in the panel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-[#1b3b2b] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Click Install & Download</p>
                  <p className="text-[11px] text-slate-500">
                    Click <strong className="text-slate-700 font-bold">Install</strong> in the popup window. FocusFlow will download and run as a standalone desktop app!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full text-center py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Got it, Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
