/**
 * Intelligent Pole-Vault Crossbar - Attempt Result Card
 * Clean, high-contrast decision card showing outcome, location, and coaching advice.
 */

import React from 'react';
import { AttemptRecord } from '../types/poleVault';

interface AttemptResultCardProps {
  attempt: AttemptRecord;
  onInspectPipeline?: () => void;
}

export const AttemptResultCard: React.FC<AttemptResultCardProps> = ({
  attempt,
  onInspectPipeline,
}) => {
  const isSuccess = attempt.is_success;

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Current Jump
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-sm font-bold text-slate-100">
              Attempt #{attempt.attempt_number}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {attempt.timestamp.split(' ')[1] || attempt.timestamp}
          </span>
        </div>

        {/* Big Outcome Banner */}
        <div
          className={`mt-4 rounded-xl border p-4 flex items-center justify-between ${
            isSuccess
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Official Attempt Decision
            </div>
            <div className="text-xl font-bold tracking-tight mt-0.5">
              {isSuccess ? 'CLEAN CLEARANCE' : 'CONTACT DETECTED'}
            </div>
            <div className="text-xs mt-1 text-slate-300">
              {isSuccess
                ? 'Crossbar remained steady without dislodgement.'
                : `${attempt.contact_type.replace('_CONTACT', '')} contact identified at ${attempt.location} (${attempt.estimated_x_m.toFixed(2)}m)`}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono uppercase text-slate-400">Confidence</div>
            <div className="font-mono text-2xl font-bold tabular-nums">
              {(attempt.confidence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* 4 Clean Key Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
            <span className="text-slate-400 uppercase text-[10px]">Contact Source</span>
            <div className="text-sm font-bold text-slate-100 mt-0.5">
              {attempt.contact_type === 'NO_CONTACT'
                ? 'None'
                : attempt.contact_type === 'POLE_CONTACT'
                ? 'Pole Strike'
                : attempt.contact_type === 'BODY_CONTACT'
                ? 'Body / Hip Drag'
                : 'Glancing Tap'}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
            <span className="text-slate-400 uppercase text-[10px]">Impact Zone</span>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              {attempt.location === 'NONE'
                ? 'No Impact'
                : `${attempt.location} (${attempt.estimated_x_m.toFixed(2)}m)`}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
            <span className="text-slate-400 uppercase text-[10px]">Impact Frequency</span>
            <div className="text-sm font-bold text-cyan-300 mt-0.5 tabular-nums">
              {attempt.features.frequency > 0 ? `${attempt.features.frequency.toFixed(0)} Hz` : 'Baseline (2.4 Hz)'}
            </div>
          </div>

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-3">
            <span className="text-slate-400 uppercase text-[10px]">Max Bending Strain</span>
            <div className="text-sm font-bold text-purple-300 mt-0.5 tabular-nums">
              {Math.max(attempt.sensor_response.sg1, attempt.sensor_response.sg2).toFixed(1)} με
            </div>
          </div>
        </div>

        {/* Technical Summary Line */}
        <div className="mt-4 rounded-lg bg-slate-950/60 p-3 border border-slate-800/60 text-xs text-slate-300 leading-relaxed font-sans">
          <span className="font-semibold text-slate-200">Analysis: </span>
          {attempt.fusion_reasoning}
        </div>
      </div>

      {/* Footer link to pipeline details */}
      {onInspectPipeline && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">Athlete: Elena Rostova</span>
          <button
            onClick={onInspectPipeline}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            View Signal Processing Pipeline →
          </button>
        </div>
      )}
    </div>
  );
};
