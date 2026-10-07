/**
 * Intelligent Pole-Vault Crossbar - Failure Pattern Analysis
 * Automatically identifies repeated biomechanical flaws (e.g. repeated center pole strikes,
 * hip drags, asymmetrical plant drift), showing frequency, percentage, and actionable coaching cues.
 */

import React from 'react';
import { FailurePattern } from '../types/poleVault';

interface FailurePatternAnalysisProps {
  patterns: FailurePattern[];
  recommendations: string[];
}

export const FailurePatternAnalysis: React.FC<FailurePatternAnalysisProps> = ({
  patterns,
  recommendations,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm">
      <div className="border-b border-slate-800/80 pb-4">
        <h2 className="text-base font-semibold text-slate-100 tracking-tight">
          Automated Failure Pattern Diagnosis & Biomechanical Insights
        </h2>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span>Continuous Pattern Recognition Engine</span>
          <span aria-hidden="true">·</span>
          <span>Kinematic Correlation</span>
          <span aria-hidden="true">·</span>
          <span>Coaching Recommendations</span>
        </div>
      </div>

      {/* Identified Patterns List */}
      <div className="mt-4 space-y-3">
        {patterns.length === 0 ? (
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 text-center text-sm text-slate-400">
            No repeated failure patterns detected yet. Clearances and attempts appear uniform.
          </div>
        ) : (
          patterns.map((pat) => (
            <div
              key={pat.id}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-all hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      pat.severity === 'HIGH'
                        ? 'bg-rose-500'
                        : pat.severity === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                  />
                  <h3 className="font-semibold text-slate-100 text-sm">
                    {pat.pattern}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">
                    Occurrences:{' '}
                    <strong className="text-slate-200 tabular-nums">{pat.occurrences}</strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-rose-400 font-semibold tabular-nums">
                    {pat.percentage}% of failures
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      pat.severity === 'HIGH'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {pat.severity} PRIORITY
                  </span>
                </div>
              </div>

              {/* Diagnosis Details */}
              <div className="mt-2 text-xs text-slate-300 font-mono leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/60">
                <span className="text-slate-400 font-bold uppercase">Diagnosis:</span> {pat.diagnosis}
              </div>

              {/* Coaching Cue */}
              <div className="mt-2 flex items-start gap-2 text-xs text-amber-300/90 bg-amber-950/20 p-2.5 rounded border border-amber-900/30">
                <span className="font-bold text-amber-400 font-mono shrink-0">
                  COACHING CUE:
                </span>
                <span>{pat.coaching_advice}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Synthesis Recommendations */}
      <div className="mt-5 rounded-lg border border-cyan-900/30 bg-cyan-950/10 p-4">
        <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-cyan-400 mb-2">
          Actionable Training Synthesis
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">›</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
