
import React from 'react';
import { AnalysisResult } from '../types';

interface AnalysisPanelProps {
  result: AnalysisResult;
  sources?: any[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, sources }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Scorecard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-indigo-500/20 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-widest text-slate-400 mb-1">Engagement Score</span>
          <span className="text-4xl font-black text-indigo-400">{result.overallEngagementScore}%</span>
        </div>
        <div className="md:col-span-2 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-slate-400 mb-1">Top Performing Joke</span>
          <span className="text-lg font-bold text-white line-clamp-1">"{result.topPerformingJoke}"</span>
        </div>
      </div>

      {/* Style Summary */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
            <i className="fas fa-theater-masks"></i> Performance Summary
          </h3>
          {sources && sources.length > 0 && (
            <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase tracking-tighter">
              <i className="fas fa-search mr-1"></i> Grounded Research
            </span>
          )}
        </div>
        <p className="text-slate-300 leading-relaxed">
          {result.summary}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Laughter Timeline */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 px-2">
            <i className="fas fa-chart-line"></i> Laughter Timeline
          </h3>
          <div className="space-y-3">
            {result.laughterEvents.map((event, idx) => (
              <div 
                key={idx} 
                className="flex flex-col gap-2 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded">
                    {event.timestamp}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">{event.reactionType}</span>
                </div>
                <p className="text-slate-200 text-sm italic">"{event.setup}"</p>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
                   <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-1000"
                    style={{ width: `${event.intensity * 10}%` }}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Insights */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 px-2">
            <i className="fas fa-microphone-alt"></i> Delivery Feedback
          </h3>
          <div className="space-y-4">
            {result.deliveryInsights.map((insight, idx) => (
              <div key={idx} className="relative pl-6 py-3 bg-slate-800/20 rounded-r-xl border-l-2 border-indigo-500">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
          
          {/* Grounding Sources */}
          {sources && sources.length > 0 && (
            <div className="pt-6 border-t border-slate-800 mt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Verification Sources</h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((chunk, i) => (
                  chunk.web && (
                    <a 
                      key={i} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 py-1 px-2 rounded border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <i className="fas fa-link text-[8px]"></i> {chunk.web.title || 'Source'}
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AnalysisPanel;
