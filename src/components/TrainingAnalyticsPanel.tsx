/**
 * Intelligent Pole-Vault Crossbar - Training Analytics & Failure Patterns
 * Clean, high-impact summary of clearance rate, spatial contact distribution,
 * and automated biomechanical coaching recommendations.
 */

import React from 'react';
import { TrainingAnalytics, AttemptRecord } from '../types/poleVault';

interface TrainingAnalyticsPanelProps {
  analytics: TrainingAnalytics;
  recentAttempts: AttemptRecord[];
  onSelectAttempt?: (attempt: AttemptRecord) => void;
}

export const TrainingAnalyticsPanel: React.FC<TrainingAnalyticsPanelProps> = ({
  analytics,
  recentAttempts,
  onSelectAttempt,
}) => {
  const totalContacts = analytics.pole_contacts + analytics.body_contacts + analytics.other_contacts;
  const leftPct = totalContacts > 0 ? (analytics.left_contacts / totalContacts) * 100 : 0;
  const centerPct = totalContacts > 0 ? (analytics.center_contacts / totalContacts) * 100 : 0;
  const rightPct = totalContacts > 0 ? (analytics.right_contacts / totalContacts) * 100 : 0;

  const topPattern = analytics.repeated_patterns[0];

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            Session Analytics & Coaching Diagnosis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Biomechanical breakdown across {analytics.total_attempts} attempts at 5.50 m
          </p>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
          {analytics.success_rate_pct}% Clearances
        </div>
      </div>

      {/* 3 Main KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Attempts</span>
          <div className="text-xl font-bold font-mono text-slate-100 mt-0.5 tabular-nums">
            {analytics.total_attempts}
          </div>
          <span className="text-[10px] text-slate-500">
            {analytics.successful_attempts} cleared · {analytics.failed_attempts} contacts
          </span>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">Clearance Rate</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
            {analytics.success_rate_pct}%
          </div>
          <span className="text-[10px] text-emerald-500/80">Bar intact</span>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-center">
          <span className="text-[10px] font-mono uppercase text-slate-400">Main Contact Cause</span>
          <div className="text-base font-bold text-amber-300 mt-1 truncate">
            {analytics.pole_contacts >= analytics.body_contacts ? 'Pole Strike' : 'Body Drag'}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {analytics.pole_contacts} pole · {analytics.body_contacts} body
          </span>
        </div>
      </div>

      {/* Spatial Distribution Bar */}
      <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3.5">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-slate-300 font-semibold uppercase text-[11px]">
            Contact Zone Breakdown Along 4.50 m Beam
          </span>
          <span className="text-slate-400">{totalContacts} Total Contacts</span>
        </div>

        {/* Progress segment */}
        <div className="h-5 w-full rounded bg-slate-900 overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${leftPct}%` }}
            className="bg-amber-600/80 flex items-center justify-center text-[10px] font-mono text-white font-bold"
            title={`Left: ${leftPct.toFixed(1)}%`}
          >
            {leftPct > 15 && `${leftPct.toFixed(0)}% Left`}
          </div>
          <div
            style={{ width: `${centerPct}%` }}
            className="bg-rose-600/90 flex items-center justify-center text-[10px] font-mono text-white font-bold"
            title={`Center: ${centerPct.toFixed(1)}%`}
          >
            {centerPct > 15 && `${centerPct.toFixed(0)}% Center`}
          </div>
          <div
            style={{ width: `${rightPct}%` }}
            className="bg-cyan-600/80 flex items-center justify-center text-[10px] font-mono text-white font-bold"
            title={`Right: ${rightPct.toFixed(1)}%`}
          >
            {rightPct > 15 && `${rightPct.toFixed(0)}% Right`}
          </div>
        </div>

        <div className="mt-2 flex justify-between text-[11px] font-mono text-slate-400">
          <span>Left Span: {analytics.left_contacts} ({leftPct.toFixed(0)}%)</span>
          <span className="text-rose-300 font-semibold">Center Apex: {analytics.center_contacts} ({centerPct.toFixed(0)}%)</span>
          <span>Right Span: {analytics.right_contacts} ({rightPct.toFixed(0)}%)</span>
        </div>
      </div>

      {/* Top Automated Coaching Cue */}
      {topPattern && (
        <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              IDENTIFIED FAULT: {topPattern.pattern}
            </span>
            <span className="font-mono text-amber-400 text-[11px]">
              {topPattern.percentage}% of failed vaults
            </span>
          </div>
          <p className="mt-1 text-slate-300 leading-relaxed font-sans">
            {topPattern.diagnosis}
          </p>
          <div className="mt-2 text-amber-200 font-mono text-[11px] bg-amber-950/40 p-2 rounded border border-amber-900/30">
            <strong>Coaching Action:</strong> {topPattern.coaching_advice}
          </div>
        </div>
      )}

      {/* Recent Attempts History Table */}
      <div className="border-t border-slate-800/80 pt-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
          Recent Vault Attempts
        </div>
        <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-48">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Outcome</th>
                <th className="py-2 px-3">Contact Type</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentAttempts.slice(0, 6).map((att) => (
                <tr
                  key={att.id}
                  onClick={() => onSelectAttempt?.(att)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-slate-200">#{att.attempt_number}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        att.is_success
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {att.is_success ? 'CLEARED' : 'CONTACT'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    {att.contact_type === 'NO_CONTACT' ? 'None' : att.contact_type.replace('_CONTACT', '')}
                  </td>
                  <td className="py-2 px-3">
                    {att.location === 'NONE' ? '—' : `${att.location} (${att.estimated_x_m.toFixed(2)}m)`}
                  </td>
                  <td className="py-2 px-3 tabular-nums">
                    {(att.confidence * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
