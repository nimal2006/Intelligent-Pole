/**
 * Intelligent Crossbar - Expanded Attempt Detail View
 * Displays in-depth attempt statistics such as Impact Intensity, Contact Duration,
 * Exact Beam Coordinate, Flexural Load, and Confidence when an item in the history table is clicked.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttemptRecord } from '../types/poleVault';

interface AttemptDetailModalProps {
  attempt: AttemptRecord | null;
  onClose: () => void;
  onLoadIntoLiveSession?: (attempt: AttemptRecord) => void;
}

export const AttemptDetailModal: React.FC<AttemptDetailModalProps> = ({
  attempt,
  onClose,
  onLoadIntoLiveSession,
}) => {
  if (!attempt) return null;

  const isContact = attempt.contact_detected;
  const isSuccess = attempt.is_success;
  const durationMs = isContact ? Math.round((attempt.features.duration || 0.042) * 1000) : 0;
  const impactAccel = isContact ? (attempt.features.imu_acceleration || 24.8) : 0;
  const energyVal = isContact ? Math.round(attempt.features.energy || 4920) : 0;
  const strainVal = isContact ? Math.round(Math.max(attempt.features.sg1_peak || 0, attempt.features.sg2_peak || 0)) : 14;
  const pctAlongBeam = ((attempt.estimated_x_m || 2.25) / 4.5) * 100;

  const getIntensityLevel = (accel: number) => {
    if (!isContact) return { label: 'Zero Perturbation', color: 'text-[#34C759]' };
    if (accel > 20) return { label: 'High Shock Load', color: 'text-[#FF3B30]' };
    if (accel > 8) return { label: 'Moderate Impact', color: 'text-[#FFD60A]' };
    return { label: 'Glancing Contact', color: 'text-[#FFCC00]' };
  };

  const intensity = getIntensityLevel(impactAccel);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6 sm:p-8 shadow-2xl text-[#1D1D1F] max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-black/5 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6E6E73]">
                  Attempt #{String(attempt.attempt_number).padStart(3, '0')} Telemetry
                </span>
                <span className="text-black/20">·</span>
                <span className="text-[11px] font-mono text-[#6E6E73]">
                  {attempt.timestamp}
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#0A0A0A] uppercase font-sans">
                {isSuccess ? 'Clean Clearance Verification' : 'Contact Impact Analysis'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="rounded-full h-8 w-8 flex items-center justify-center text-[#6E6E73] hover:text-[#0A0A0A] hover:bg-[#F5F5F7] transition-colors cursor-pointer"
              title="Close Detail View"
            >
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="mt-5 overflow-y-auto flex-1 pr-1 space-y-6">
            {/* Primary Result Banner */}
            <div
              className={`p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 ${
                isSuccess
                  ? 'bg-[#34C759]/10 border border-[#34C759]/20'
                  : 'bg-[#FFD60A]/15 border border-[#FFD60A]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    isSuccess ? 'bg-[#34C759] text-white' : 'bg-[#0A0A0A] text-[#FFD60A]'
                  }`}
                >
                  {isSuccess ? '✓' : '⚠'}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A]">
                    {isSuccess ? 'Clearance Verified' : 'Contact Confirmed'}
                  </div>
                  <div className="text-lg font-black text-[#0A0A0A] tracking-tight">
                    {isSuccess
                      ? 'Bar Maintained on Pegs'
                      : `${attempt.location} · ${attempt.contact_type.replace('_CONTACT', ' CONTACT')}`}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] uppercase text-[#6E6E73] block">Confidence</span>
                <span className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
                  {(attempt.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Core Specific Attempt Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. Impact Intensity */}
              <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6E73]">
                  Impact Intensity
                </span>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#0A0A0A] tracking-tight">
                    {impactAccel > 0 ? `${impactAccel.toFixed(1)}` : '0.0'}
                    <span className="text-xs font-normal text-[#6E6E73] ml-1">m/s²</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold ${intensity.color}`}>
                  {intensity.label}
                </span>
              </div>

              {/* 2. Contact Duration */}
              <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6E73]">
                  Contact Duration
                </span>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#0A0A0A] tracking-tight">
                    {durationMs}
                    <span className="text-xs font-normal text-[#6E6E73] ml-1">ms</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#6E6E73]">
                  {isContact ? 'Transient Shock' : 'Zero Interaction'}
                </span>
              </div>

              {/* 3. Beam Coordinate */}
              <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6E73]">
                  Beam Coordinate
                </span>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#0A0A0A] tracking-tight">
                    {isContact ? `${attempt.estimated_x_m.toFixed(2)}` : '4.50'}
                    <span className="text-xs font-normal text-[#6E6E73] ml-1">m</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#6E6E73]">
                  {isContact ? `${attempt.location} Zone` : 'Span Clear'}
                </span>
              </div>

              {/* 4. Flexural Load */}
              <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#6E6E73]">
                  Flexural Strain
                </span>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-black font-mono text-[#0A0A0A] tracking-tight">
                    {strainVal}
                    <span className="text-xs font-normal text-[#6E6E73] ml-1">με</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#6E6E73]">
                  {strainVal > 150 ? 'Significant Bending' : 'Nominal Flex'}
                </span>
              </div>
            </div>

            {/* Crossbar Impact Localization Visualization */}
            <div className="bg-[#FAFAFC] rounded-2xl p-5 border border-black/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#0A0A0A] uppercase tracking-wider">
                  4.50 m Beam Contact Position
                </span>
                <span className="text-[#6E6E73]">
                  {isContact
                    ? `Impact at ${attempt.estimated_x_m.toFixed(2)} m (±0.05m tolerance)`
                    : 'Zero Contact Across Span'}
                </span>
              </div>

              {/* Mini Crossbar Beam */}
              <div className="relative py-4 px-2">
                <div className="h-2.5 w-full bg-[#E5E5EA] rounded-full relative overflow-visible">
                  {/* Upright markers */}
                  <div className="absolute left-0 -top-1 w-1 h-4.5 bg-[#0A0A0A] rounded-xs" title="0.00 m" />
                  <div className="absolute right-0 -top-1 w-1 h-4.5 bg-[#0A0A0A] rounded-xs" title="4.50 m" />

                  {/* Zone partition lines */}
                  <div className="absolute top-0 bottom-0 w-px bg-black/10" style={{ left: `${(1.875 / 4.5) * 100}%` }} />
                  <div className="absolute top-0 bottom-0 w-px bg-black/10" style={{ left: `${(2.625 / 4.5) * 100}%` }} />

                  {/* Active Impact Point Marker */}
                  {isContact && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
                      style={{ left: `${pctAlongBeam}%` }}
                    >
                      <span className="h-4 w-4 rounded-full bg-[#FFD60A] border-2 border-[#0A0A0A] shadow-md animate-pulse" />
                    </motion.div>
                  )}
                </div>

                <div className="mt-3 flex justify-between text-[10px] font-mono text-[#8E8E93]">
                  <span>0.00 m (Left)</span>
                  <span className="font-bold text-[#0A0A0A]">2.25 m (Center Apex)</span>
                  <span>4.50 m (Right)</span>
                </div>
              </div>
            </div>

            {/* Athletic Training Observation */}
            <div className="p-4 rounded-2xl bg-[#F5F5F7] text-xs leading-relaxed space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6E6E73] block">
                Session Observation
              </span>
              <p className="text-[#1D1D1F] font-normal">
                {attempt.fusion_reasoning}
              </p>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-5 border-t border-black/5 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[#6E6E73] font-mono">
              Energy Score: {energyVal} a.u.
            </span>

            <div className="flex items-center gap-2">
              {onLoadIntoLiveSession && (
                <button
                  onClick={() => {
                    onLoadIntoLiveSession(attempt);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-full bg-[#0A0A0A] text-white font-semibold hover:bg-[#1D1D1F] transition-colors cursor-pointer"
                >
                  Load in Live View →
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-white border border-black/10 text-[#1D1D1F] font-semibold hover:bg-[#F5F5F7] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
