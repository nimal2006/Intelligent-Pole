/**
 * Apple-inspired Live Contact Analysis Card
 * Large confident numbers, high visual hierarchy, clean unboxed metadata,
 * and yellow visual emphasis (#FFD60A).
 */

import React from 'react';
import { motion } from 'motion/react';
import { AttemptRecord } from '../types/poleVault';

interface AppleAnalysisCardProps {
  attempt: AttemptRecord | null;
  isSimulating: boolean;
}

export const AppleAnalysisCard: React.FC<AppleAnalysisCardProps> = ({
  attempt,
  isSimulating,
}) => {
  if (!attempt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="apple-card p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono uppercase font-bold tracking-wider text-[#6E6E73]">
              Live Contact Analysis
            </span>
            <span className="text-black/20">/</span>
            <span className="text-[12px] font-mono text-[#34C759] font-semibold">
              System Calibrated & Ready
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#6E6E73]">
            <span>1,000 Hz ADC Armed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
                Current Crossbar Status
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A]">
                  AWAITING VAULT
                </span>
                <span className="h-3 w-3 rounded-full bg-[#34C759]" />
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
                Transducer Grid
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#6E6E73] mt-1">
                Ready For Simulation
              </div>
            </div>

            <div className="pt-2 flex items-center gap-6 text-sm text-[#6E6E73]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider block">Crossbar Span</span>
                <span className="font-bold text-[#0A0A0A] text-lg font-mono">4.500 m</span>
              </div>
              <div className="h-8 w-px bg-black/10" />
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider block">Active Stations</span>
                <span className="font-bold text-[#0A0A0A] text-lg font-mono">5 Sensors Online</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#F5F5F7] rounded-2xl p-6 text-right flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
              Hardware Calibration
            </span>
            <div className="my-2">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono text-[#0A0A0A] tracking-tighter">
                100
              </span>
              <span className="text-2xl font-bold text-[#FFCC00] ml-1">%</span>
            </div>
            <div className="text-[11px] font-mono text-[#6E6E73]">
              P1, SG1, P2+IMU, SG2, P3 Calibrated
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-black/5 flex items-center justify-between text-xs">
          <p className="text-[#6E6E73]">
            No attempts recorded yet. Click <strong className="text-[#0A0A0A]">&ldquo;Simulate Jump&rdquo;</strong> to execute the first multimodal data acquisition, sensor fusion, and contact localization.
          </p>
        </div>
      </motion.div>
    );
  }

  const isDetected = attempt.contact_detected;
  const confidencePct = (attempt.confidence * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="apple-card p-8 sm:p-10 relative overflow-hidden"
    >
      {/* Background yellow accent glow when contact is detected */}
      {isDetected && (
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono uppercase font-bold tracking-wider text-[#6E6E73]">
            Live Contact Analysis
          </span>
          <span className="text-black/20">/</span>
          <span className="text-[12px] font-mono text-[#6E6E73]">
            Attempt #{String(attempt.attempt_number).padStart(3, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#6E6E73]">{attempt.timestamp}</span>
        </div>
      </div>

      {/* Core Detection Verdict Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        {/* Left Column: Contact State & Source (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
              Contact State
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isDetected ? 'text-[#0A0A0A]' : 'text-[#34C759]'
                }`}
              >
                {isDetected ? 'DETECTED' : 'CLEARANCE'}
              </span>
              <span
                className={`h-3 w-3 rounded-full ${
                  isDetected ? 'bg-[#FF3B30]' : 'bg-[#34C759]'
                }`}
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
              Classified Source
            </span>
            <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0A0A0A] mt-1">
              {attempt.contact_type === 'NO_CONTACT'
                ? 'CLEAN PASS'
                : attempt.contact_type === 'POLE_CONTACT'
                ? 'POLE CONTACT'
                : attempt.contact_type === 'BODY_CONTACT'
                ? 'BODY CONTACT'
                : 'OTHER CONTACT'}
            </div>
          </div>

          <div className="pt-2 flex items-center gap-6 text-sm text-[#6E6E73]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider block">Zone</span>
              <span className="font-bold text-[#0A0A0A] text-lg font-mono">
                {attempt.location === 'NONE' ? '—' : attempt.location}
              </span>
            </div>
            <div className="h-8 w-px bg-black/10" />
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider block">Impact Coordinate</span>
              <span className="font-bold text-[#0A0A0A] text-lg font-mono">
                {attempt.location === 'NONE' ? '4.500 m clean' : `${attempt.estimated_x_m.toFixed(2)} m`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Confidence Score (5 cols) */}
        <div className="md:col-span-5 bg-[#F5F5F7] rounded-2xl p-6 text-right flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
            Model Confidence
          </span>
          <div className="my-2">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-[#0A0A0A] tracking-tighter">
              {confidencePct}
            </span>
            <span className="text-2xl font-bold text-[#FFCC00] ml-1">%</span>
          </div>
          <div className="text-[11px] font-mono text-[#6E6E73]">
            Multimodal Fusion + Random Forest Ensemble
          </div>
        </div>
      </div>

      {/* Observed Training Data Insight Line */}
      <div className="mt-8 pt-5 border-t border-black/5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <p className="text-[#1D1D1F] font-medium leading-relaxed max-w-2xl">
          <span className="font-bold text-[#0A0A0A] uppercase font-mono mr-1">Observed Telemetry:</span>
          {attempt.fusion_reasoning}
        </p>

        <div className="flex items-center gap-3 font-mono text-[11px] text-[#6E6E73]">
          <span>P1: {attempt.sensor_response.p1.toFixed(2)}V</span>
          <span>·</span>
          <span>P2: {attempt.sensor_response.p2.toFixed(2)}V</span>
          <span>·</span>
          <span>SG: {Math.max(attempt.sensor_response.sg1, attempt.sensor_response.sg2).toFixed(0)}με</span>
        </div>
      </div>
    </motion.div>
  );
};
