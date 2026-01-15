
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism px-6 py-4 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-video-slash text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            VisionQuest
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
            AI Video Intelligence
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Gemini 3 Pro Online
        </span>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300">
          <i className="fas fa-cog"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
