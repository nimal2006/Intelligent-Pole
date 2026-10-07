/**
 * Intelligent Crossbar - Product Live Session Experience
 * Clean, cinematic Apple-style live recording experience with 3-2-1 countdown,
 * instant crossbar reaction, human-readable contact decision, and deep statistics trigger.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttemptRecord, SimulationScenario } from '../types/poleVault';
import { ProductCrossbar } from './ProductCrossbar';
import { AttemptDetailModal } from './AttemptDetailModal';

interface ProductLiveSessionProps {
  currentAttempt: AttemptRecord | null;
  onRecordAttempt: (scenario?: SimulationScenario) => void;
  isAnalyzing: boolean;
  countdown: number | null; // 3, 2, 1, or null
}

export const ProductLiveSession: React.FC<ProductLiveSessionProps> = ({
  currentAttempt,
  onRecordAttempt,
  isAnalyzing,
  countdown,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>('POLE_CENTER');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const hasAttempt = currentAttempt !== null;
  const isContact = currentAttempt?.contact_detected ?? false;
  const isSuccess = currentAttempt?.is_success ?? false;

  const getHumanDescription = () => {
    if (!currentAttempt) return 'Waiting for first vault attempt.';
    if (currentAttempt.is_success) {
      return 'The crossbar remained steady on its pegs with clean clearance.';
    }
    const loc = currentAttempt.location.toLowerCase();
    const type = currentAttempt.contact_type === 'POLE_CONTACT' ? 'pole' : 'body';
    return `Contact occurred near the ${loc} section from athlete ${type}.`;
  };

  return (
    <section id="live" className="space-y-6">
      {/* Session Header Card */}
      <div className="apple-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase font-sans">
              Live Session
            </h2>
            <span className="text-[#6E6E73]">·</span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1D1D1F]">
              <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
              <span>READY</span>
            </div>
          </div>

          {/* Test Scenario Selector & Primary Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-full border border-black/5 text-xs">
              {[
                { id: 'CLEARANCE', label: 'Clearance' },
                { id: 'POLE_CENTER', label: 'Pole (Center)' },
                { id: 'POLE_LEFT', label: 'Pole (Left)' },
                { id: 'BODY_CONTACT', label: 'Body Contact' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id as SimulationScenario)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedScenario === sc.id
                      ? 'bg-white text-[#0A0A0A] shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#0A0A0A]'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRecordAttempt(selectedScenario)}
              disabled={isAnalyzing || countdown !== null}
              className={`px-5 py-2 rounded-full font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                isAnalyzing || countdown !== null
                  ? 'bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed'
                  : 'bg-[#FFD60A] text-[#0A0A0A] hover:bg-[#FFCC00]'
              }`}
            >
              {countdown !== null ? (
                <span>Starting in {countdown}...</span>
              ) : isAnalyzing ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#0A0A0A] animate-ping" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Record Attempt</span>
                  <span>→</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Countdown Overlay or Status Pill */}
        <div className="text-center py-4">
          <AnimatePresence mode="wait">
            {countdown !== null ? (
              <motion.div
                key="countdown"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-[#0A0A0A] text-[#FFD60A] text-4xl font-extrabold font-mono shadow-xl"
              >
                {countdown}
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0A0A] text-[#FFD60A] text-xs font-mono font-bold uppercase tracking-wider"
              >
                <span className="h-2 w-2 rounded-full bg-[#FFD60A] animate-ping" />
                <span>Analyzing attempt…</span>
              </motion.div>
            ) : !hasAttempt ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono uppercase tracking-widest text-[#8E8E93]"
              >
                Waiting for attempt
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 4.5m Crossbar Centerpiece */}
        <ProductCrossbar
          contactDetected={isContact}
          contactType={currentAttempt?.contact_type ?? 'NO_CONTACT'}
          location={currentAttempt?.location ?? 'NONE'}
          estimatedX={currentAttempt?.estimated_x_m ?? 2.25}
          isSuccess={isSuccess}
          isAnalyzing={isAnalyzing}
          hasAttempt={hasAttempt}
        />
      </div>

      {/* Result Card Reveal */}
      <AnimatePresence mode="wait">
        {hasAttempt && !isAnalyzing && (
          <motion.div
            key={currentAttempt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="apple-card p-8 sm:p-10 relative overflow-hidden"
          >
            {/* Subtle glow */}
            {isContact && (
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFD60A]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            )}

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
                <span>Attempt #{String(currentAttempt.attempt_number).padStart(3, '0')}</span>
                <span>·</span>
                <span className="text-[#0A0A0A] font-semibold">Live Analysis</span>
              </div>
              <span className="text-xs font-mono text-[#6E6E73]">
                {currentAttempt.timestamp.split(' ')[1] || currentAttempt.timestamp}
              </span>
            </div>

            {/* Large Product Result Presentation */}
            {isSuccess ? (
              /* CLEAN CLEARANCE */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-6xl font-black tracking-tight text-[#34C759] uppercase">
                    Clearance Successful
                  </span>
                </div>
                <div className="flex items-center gap-2 text-base font-semibold text-[#0A0A0A]">
                  <span className="h-5 w-5 rounded-full bg-[#34C759] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <span>Clean clearance — no contact detected along the 4.50 m bar.</span>
                </div>
              </div>
            ) : (
              /* CONTACT DETECTED */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                {/* Left Result Columns */}
                <div className="md:col-span-8 space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#6E6E73]">
                    Attempt Result
                  </div>
                  <div className="text-4xl sm:text-6xl font-black tracking-tight text-[#0A0A0A] uppercase">
                    Contact Detected
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2 text-[#0A0A0A]">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6E73] block">
                        Contact Type
                      </span>
                      <span className="text-xl sm:text-2xl font-black uppercase">
                        {currentAttempt.contact_type === 'POLE_CONTACT'
                          ? 'Pole Contact'
                          : currentAttempt.contact_type === 'BODY_CONTACT'
                          ? 'Body Contact'
                          : 'Other Contact'}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-black/10" />

                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6E73] block">
                        Location
                      </span>
                      <span className="text-xl sm:text-2xl font-black uppercase text-[#0A0A0A]">
                        {currentAttempt.location}
                      </span>
                    </div>
                  </div>

                  <p className="pt-2 text-sm text-[#6E6E73] leading-relaxed">
                    {getHumanDescription()}
                  </p>
                </div>

                {/* Right Confidence Score */}
                <div className="md:col-span-4 bg-[#F5F5F7] rounded-2xl p-6 text-right">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#6E6E73] block">
                    Confidence
                  </span>
                  <div className="my-1">
                    <span className="text-5xl sm:text-6xl font-extrabold font-mono text-[#0A0A0A] tracking-tighter">
                      {(currentAttempt.confidence * 100).toFixed(0)}
                    </span>
                    <span className="text-2xl font-bold text-[#FFCC00] ml-1">%</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#6E6E73]">
                    Confidence Verified
                  </span>
                </div>
              </div>
            )}

            {/* Quick Action to Open Expanded Attempt Statistics */}
            <div className="mt-8 pt-5 border-t border-black/5 flex items-center justify-between">
              <span className="text-xs font-mono text-[#6E6E73]">
                {isContact
                  ? `Impact registered: ${currentAttempt.features.imu_acceleration.toFixed(1)} m/s² shock`
                  : 'Zero impact perturbation'}
              </span>

              <button
                onClick={() => setShowDetailModal(true)}
                className="text-xs font-sans font-bold text-[#0A0A0A] hover:text-[#FFCC00] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Full Attempt Statistics</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Statistics Detail Modal */}
      <AttemptDetailModal
        attempt={showDetailModal ? currentAttempt : null}
        onClose={() => setShowDetailModal(false)}
      />
    </section>
  );
};
