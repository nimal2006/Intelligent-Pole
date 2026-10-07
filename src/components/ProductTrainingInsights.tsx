/**
 * Intelligent Crossbar - Product Training Insights Page
 * Professional athlete training analytics, historical contact map along the 4.5m beam,
 * factual pattern recognition, and recent attempt timeline.
 */

import React from 'react';
import { motion } from 'motion/react';
import { TrainingAnalytics, AttemptRecord } from '../types/poleVault';

interface ProductTrainingInsightsProps {
  analytics: TrainingAnalytics;
  recentAttempts: AttemptRecord[];
  onSelectAttempt?: (attempt: AttemptRecord) => void;
}

export const ProductTrainingInsights: React.FC<ProductTrainingInsightsProps> = ({
  analytics,
  recentAttempts,
  onSelectAttempt,
}) => {
  const total = analytics.total_attempts;
  const successes = analytics.successful_attempts;
  const fails = analytics.failed_attempts;

  // Recent 10 attempts for pattern computation
  const last10 = recentAttempts.slice(0, 10);
  const centerFailsCount = last10.filter(
    (a) => !a.is_success && a.location === 'CENTER'
  ).length;

  const totalContacts = analytics.left_contacts + analytics.center_contacts + analytics.right_contacts;
  const leftPct = totalContacts > 0 ? (analytics.left_contacts / totalContacts) * 100 : 0;
  const centerPct = totalContacts > 0 ? (analytics.center_contacts / totalContacts) * 100 : 0;
  const rightPct = totalContacts > 0 ? (analytics.right_contacts / totalContacts) * 100 : 0;

  return (
    <section id="training" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A] uppercase font-sans">
            Training Insights
          </h2>
          <p className="text-sm text-[#6E6E73] mt-1 font-normal">
            Every attempt becomes useful feedback.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-[#0A0A0A] bg-white px-3.5 py-1.5 rounded-full border border-black/5 shadow-xs">
          Crossbar Height: 5.50 m
        </span>
      </div>

      {/* Large Statistics (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Attempts */}
        <motion.div whileHover={{ y: -2 }} className="apple-card p-6 sm:p-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Attempts
          </span>
          <div className="text-5xl sm:text-6xl font-black font-mono text-[#0A0A0A] mt-2 tracking-tight tabular-nums">
            {total}
          </div>
          <div className="text-xs text-[#6E6E73] mt-1 font-mono">
            Recorded vaults in session
          </div>
        </motion.div>

        {/* Successful Clearances */}
        <motion.div whileHover={{ y: -2 }} className="apple-card p-6 sm:p-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Successful
          </span>
          <div className="text-5xl sm:text-6xl font-black font-mono text-[#34C759] mt-2 tracking-tight tabular-nums">
            {successes}
          </div>
          <div className="text-xs text-[#34C759] mt-1 font-mono font-medium">
            {analytics.success_rate_pct}% clearance rate
          </div>
        </motion.div>

        {/* Contact Events */}
        <motion.div whileHover={{ y: -2 }} className="apple-card p-6 sm:p-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Contact Events
          </span>
          <div className="text-5xl sm:text-6xl font-black font-mono text-[#0A0A0A] mt-2 tracking-tight tabular-nums">
            {fails}
          </div>
          <div className="text-xs text-[#6E6E73] mt-1 font-mono">
            {total > 0
              ? `${(100 - analytics.success_rate_pct).toFixed(1)}% contact rate`
              : 'Awaiting attempts'}
          </div>
        </motion.div>
      </div>

      {/* Contact Map Visualizer */}
      <div className="apple-card p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-tight text-[#0A0A0A]">
              Contact Map
            </h3>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Historical contact distribution along the 4.50 m competition crossbar
            </p>
          </div>
          <span className="text-xs font-mono text-[#6E6E73]">
            {totalContacts} Recorded Contacts
          </span>
        </div>

        {/* Crossbar Beam Representation with Yellow Contact Points */}
        <div className="relative py-8 px-4">
          <div className="h-3 w-full bg-[#0A0A0A] rounded-full relative overflow-visible shadow-sm">
            {/* Historical Yellow Points */}
            {recentAttempts
              .filter((a) => a.contact_detected)
              .map((att, idx) => {
                const pct = (att.estimated_x_m / 4.5) * 100;
                return (
                  <motion.div
                    key={att.id || idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.85 }}
                    transition={{ delay: idx * 0.05 }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#FFD60A] border-2 border-[#0A0A0A] shadow-xs cursor-pointer group"
                    style={{ left: `${Math.max(2, Math.min(98, pct))}%` }}
                    title={`Attempt #${att.attempt_number} · ${att.location} (${att.estimated_x_m.toFixed(2)}m)`}
                  >
                    <div className="hidden group-hover:flex absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0A0A] text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                      #{att.attempt_number} · {att.location}
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Region Breakdowns */}
          <div className="mt-6 grid grid-cols-3 text-center text-xs font-mono">
            <div className="p-3 bg-[#F5F5F7] rounded-xl mr-2">
              <span className="text-[#6E6E73] text-[10px] uppercase block">Left (0–1.88m)</span>
              <span className="text-base font-bold text-[#0A0A0A] mt-0.5 block">
                {analytics.left_contacts}
              </span>
              <span className="text-[10px] text-[#6E6E73]">
                {leftPct.toFixed(0)}% of contacts
              </span>
            </div>

            <div className="p-3 bg-[#F5F5F7] rounded-xl mx-1 border border-[#FFD60A]/40">
              <span className="text-[#0A0A0A] font-bold text-[10px] uppercase block">
                Center Apex (1.88–2.63m)
              </span>
              <span className="text-base font-bold text-[#0A0A0A] mt-0.5 block">
                {analytics.center_contacts}
              </span>
              <span className="text-[10px] text-[#FFCC00] font-bold">
                {centerPct.toFixed(0)}% of contacts
              </span>
            </div>

            <div className="p-3 bg-[#F5F5F7] rounded-xl ml-2">
              <span className="text-[#6E6E73] text-[10px] uppercase block">Right (2.63–4.50m)</span>
              <span className="text-base font-bold text-[#0A0A0A] mt-0.5 block">
                {analytics.right_contacts}
              </span>
              <span className="text-[10px] text-[#6E6E73]">
                {rightPct.toFixed(0)}% of contacts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Insight & Most Recent Attempts (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Pattern Card (6 cols) */}
        <div className="md:col-span-6 apple-card p-8 bg-[#0A0A0A] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A]/40 text-[#FFD60A] text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A] animate-ping" />
              A Pattern is Emerging
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {centerFailsCount >= 2
                ? `Center-region contact occurred ${centerFailsCount} times in the last 10 attempts.`
                : total > 0
                ? 'Clearance pattern remains consistent across recent vaults.'
                : 'Awaiting training session attempts.'}
            </h3>

            <p className="mt-4 text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
              {centerFailsCount >= 2
                ? 'Contact coordinates indicate repetitive apex interaction during late pole release transition.'
                : 'Historical contact locations are continuously logged to highlight clustering.'}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 block">
                Observed Frequency
              </span>
              <span className="text-3xl font-extrabold font-mono text-[#FFD60A] tracking-tight">
                {centerFailsCount} / {Math.min(10, Math.max(1, total))}{' '}
                <span className="text-xs text-white/70 font-normal">attempts</span>
              </span>
            </div>

            <span className="text-xs font-mono font-bold text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
              Verified Telemetry
            </span>
          </div>
        </div>

        {/* Most Recent Attempts List (6 cols) */}
        <div className="md:col-span-6 apple-card p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#0A0A0A]">
              Most Recent Attempts
            </h3>
            <span className="text-xs font-mono text-[#6E6E73]">Timeline</span>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#8E8E93]">
              No attempts recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAttempts.slice(0, 5).map((att) => (
                <div
                  key={att.id}
                  onClick={() => onSelectAttempt?.(att)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBEF] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#0A0A0A]">
                      #{String(att.attempt_number).padStart(3, '0')}
                    </span>
                    <span className="text-xs text-[#1D1D1F] font-medium">
                      {att.is_success
                        ? 'Clean clearance'
                        : `${att.location} contact (${att.contact_type === 'POLE_CONTACT' ? 'Pole' : 'Body'})`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      att.is_success
                        ? 'bg-[#34C759]/15 text-[#34C759]'
                        : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                    }`}
                  >
                    {att.is_success ? 'Clearance' : 'Contact'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
