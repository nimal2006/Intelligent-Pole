/**
 * Apple-inspired Training Insights & Failure Pattern Card
 * Clean statistics, dynamic distribution charts, and real-time observed pattern diagnosis.
 */

import React from 'react';
import { motion } from 'motion/react';
import { TrainingAnalytics } from '../types/poleVault';

interface AppleTrainingInsightsProps {
  analytics: TrainingAnalytics;
}

export const AppleTrainingInsights: React.FC<AppleTrainingInsightsProps> = ({
  analytics,
}) => {
  const totalContacts = analytics.pole_contacts + analytics.body_contacts + analytics.other_contacts;
  const leftPct = totalContacts > 0 ? (analytics.left_contacts / totalContacts) * 100 : 0;
  const centerPct = totalContacts > 0 ? (analytics.center_contacts / totalContacts) * 100 : 0;
  const rightPct = totalContacts > 0 ? (analytics.right_contacts / totalContacts) * 100 : 0;

  const polePct = totalContacts > 0 ? (analytics.pole_contacts / totalContacts) * 100 : 0;
  const bodyPct = totalContacts > 0 ? (analytics.body_contacts / totalContacts) * 100 : 0;
  const otherPct = totalContacts > 0 ? (analytics.other_contacts / totalContacts) * 100 : 0;

  const topPattern = analytics.repeated_patterns[0];

  return (
    <div id="analytics" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase">
            Training Insights
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
            Biomechanical fault detection derived from empirical crossbar telemetry
          </p>
        </div>

        <span className="text-xs font-mono font-semibold text-[#0A0A0A] bg-white px-3 py-1 rounded-full border border-black/5 shadow-xs">
          Height: 5.50 m
        </span>
      </div>

      {/* Large Statistics Cards (3 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Attempts */}
        <motion.div whileHover={{ y: -2 }} className="apple-card p-6">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Total Attempts
          </span>
          <div className="text-5xl font-extrabold font-mono text-[#0A0A0A] mt-2 tracking-tight tabular-nums">
            {analytics.total_attempts}
          </div>
          <div className="text-xs text-[#6E6E73] mt-1 font-mono">
            {analytics.total_attempts === 0
              ? 'No attempts recorded'
              : 'Recorded competition jumps'}
          </div>
        </motion.div>

        {/* Successful Clearances */}
        <motion.div whileHover={{ y: -2 }} className="apple-card p-6">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Successful
          </span>
          <div className="text-5xl font-extrabold font-mono text-[#34C759] mt-2 tracking-tight tabular-nums">
            {analytics.successful_attempts}
          </div>
          <div className="text-xs text-[#34C759] mt-1 font-mono font-medium">
            {analytics.success_rate_pct}% bar clearance rate
          </div>
        </motion.div>

        {/* Contact Events */}
        <motion.div whileHover={{ y: -2 }} className="apple-card p-6">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Contact Events
          </span>
          <div className="text-5xl font-extrabold font-mono text-[#0A0A0A] mt-2 tracking-tight tabular-nums">
            {analytics.failed_attempts}
          </div>
          <div className="text-xs text-[#6E6E73] mt-1 font-mono">
            {analytics.total_attempts > 0
              ? `${(100 - analytics.success_rate_pct).toFixed(1)}% crossbar displacement`
              : '0.0% crossbar displacement'}
          </div>
        </motion.div>
      </div>

      {/* Split Cards: Distribution Charts (Left) & Repeated Pattern Card (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Minimal Charts (7 cols) */}
        <div className="md:col-span-7 apple-card p-8 space-y-6">
          <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0A0A0A]">
            Spatial Contact Distribution
          </h3>

          {/* Contact Distribution along 4.5m bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-[#6E6E73]">
              <span>Left (0 – 1.88 m)</span>
              <span className="font-bold text-[#0A0A0A]">Center (1.88 – 2.63 m)</span>
              <span>Right (2.63 – 4.50 m)</span>
            </div>

            <div className="h-6 w-full rounded-full bg-[#F5F5F7] overflow-hidden flex p-0.5 border border-black/5">
              {totalContacts === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-[#6E6E73]">
                  No contact events recorded
                </div>
              ) : (
                <>
                  <div
                    style={{ width: `${leftPct}%` }}
                    className="bg-[#1D1D1F] h-full rounded-l-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                    title={`Left: ${leftPct.toFixed(0)}%`}
                  >
                    {leftPct > 15 && `${leftPct.toFixed(0)}%`}
                  </div>
                  <div
                    style={{ width: `${centerPct}%` }}
                    className="bg-[#FFD60A] h-full flex items-center justify-center text-[10px] font-mono text-[#0A0A0A] font-extrabold shadow-sm"
                    title={`Center: ${centerPct.toFixed(0)}%`}
                  >
                    {centerPct > 15 && `${centerPct.toFixed(0)}% Center`}
                  </div>
                  <div
                    style={{ width: `${rightPct}%` }}
                    className="bg-[#8E8E93] h-full rounded-r-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                    title={`Right: ${rightPct.toFixed(0)}%`}
                  >
                    {rightPct > 15 && `${rightPct.toFixed(0)}%`}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between text-[11px] font-mono text-[#6E6E73] pt-1">
              <span>{analytics.left_contacts} Left Hits</span>
              <span className="text-[#0A0A0A] font-bold">{analytics.center_contacts} Center Apex Hits</span>
              <span>{analytics.right_contacts} Right Hits</span>
            </div>
          </div>

          {/* Contact Type Breakdown */}
          <div className="pt-4 border-t border-black/5 space-y-2">
            <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0A0A0A]">
              Contact Source Classification
            </h4>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
              <div className="bg-[#F5F5F7] rounded-xl p-3 text-center">
                <span className="text-[#6E6E73] text-[10px] uppercase">Pole Contact</span>
                <div className="text-xl font-bold text-[#0A0A0A] mt-0.5">{analytics.pole_contacts}</div>
                <div className="text-[10px] text-[#6E6E73] mt-0.5 font-bold">
                  {totalContacts > 0 ? `${polePct.toFixed(0)}% of faults` : '0 faults'}
                </div>
              </div>

              <div className="bg-[#F5F5F7] rounded-xl p-3 text-center">
                <span className="text-[#6E6E73] text-[10px] uppercase">Body Drag</span>
                <div className="text-xl font-bold text-[#0A0A0A] mt-0.5">{analytics.body_contacts}</div>
                <div className="text-[10px] text-[#6E6E73] mt-0.5 font-bold">
                  {totalContacts > 0 ? `${bodyPct.toFixed(0)}% of faults` : '0 faults'}
                </div>
              </div>

              <div className="bg-[#F5F5F7] rounded-xl p-3 text-center">
                <span className="text-[#6E6E73] text-[10px] uppercase">Other Contact</span>
                <div className="text-xl font-bold text-[#0A0A0A] mt-0.5">{analytics.other_contacts}</div>
                <div className="text-[10px] text-[#6E6E73] mt-0.5 font-bold">
                  {totalContacts > 0 ? `${otherPct.toFixed(0)}% of faults` : '0 faults'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Large Intelligent Insight Card: Repeated Pattern (5 cols) */}
        <div className="md:col-span-5 apple-card p-8 bg-[#0A0A0A] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A]/40 text-[#FFD60A] text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A]" />
              {topPattern ? 'Repeated Pattern Detected' : 'Pattern Engine Active'}
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
              {topPattern
                ? `${topPattern.pattern} appeared in ${topPattern.occurrences} of ${analytics.total_attempts} attempts.`
                : 'Awaiting training attempts to identify recurring faults.'}
            </h3>

            <p className="mt-4 text-sm text-white/70 leading-relaxed font-normal">
              {topPattern
                ? topPattern.diagnosis
                : 'The continuous pattern recognition engine detects recurring impact regions, late pole release trajectory, and asymmetrical approach drift as jumps are recorded.'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                Observed Frequency
              </span>
              <span className="text-3xl font-extrabold font-mono text-[#FFD60A] tracking-tight">
                {topPattern
                  ? `${topPattern.occurrences} / ${analytics.total_attempts}`
                  : '0 / 0'}{' '}
                <span className="text-xs text-white/70 font-normal">attempts</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                Target Action
              </span>
              <span className="text-xs font-semibold text-white">
                {topPattern ? topPattern.coaching_advice : 'Run simulation'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
