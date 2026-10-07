/**
 * Apple-inspired Cinematic Hero Section
 * Large confident typography, 4.5m crossbar visualization with traveling yellow beam pulse,
 * and high-contrast CTA buttons.
 */

import React from 'react';
import { motion } from 'motion/react';
import { SENSOR_POSITIONS } from '../services/simulator';

interface AppleHeroProps {
  onSimulateClick: () => void;
  onViewAnalyticsClick: () => void;
  isSimulating: boolean;
}

export const AppleHero: React.FC<AppleHeroProps> = ({
  onSimulateClick,
  onViewAnalyticsClick,
  isSimulating,
}) => {
  return (
    <section id="hero" className="pt-20 pb-16 px-6 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Confident Category Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/5 shadow-xs mb-6"
        >
          <span className="h-2 w-2 rounded-full bg-[#FFD60A]" />
          <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#6E6E73]">
            Next-Gen Athletics Instrumentation
          </span>
        </motion.div>

        {/* Large Centered Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl sm:text-7xl font-extrabold tracking-[-0.04em] text-[#0A0A0A] leading-[0.98] uppercase"
        >
          Intelligent <br />
          <span className="text-[#0A0A0A]">Pole-Vault Crossbar</span>
        </motion.h1>

        {/* Minimal Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-lg sm:text-xl text-[#6E6E73] font-normal tracking-tight max-w-2xl mx-auto leading-relaxed"
        >
          Multimodal contact detection. Real-time localization.
          AI-powered training insight.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSimulateClick}
            disabled={isSimulating}
            className="px-6 py-3 rounded-full bg-[#FFD60A] text-[#0A0A0A] font-semibold text-sm shadow-sm hover:bg-[#FFCC00] transition-colors flex items-center gap-2"
          >
            <span>{isSimulating ? 'Simulating Pipeline...' : 'Simulate Jump'}</span>
            <span className="font-bold text-base leading-none">→</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewAnalyticsClick}
            className="px-6 py-3 rounded-full bg-white text-[#1D1D1F] border border-black/10 font-semibold text-sm shadow-xs hover:border-black/20 hover:bg-[#FAFAFC] transition-colors"
          >
            View Live Analytics
          </motion.button>
        </motion.div>

        {/* 4.5m Hero Engineering Crossbar Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="mt-16 bg-white rounded-3xl p-8 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative"
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#6E6E73] mb-6">
            <span className="font-medium tracking-tight">4.500 m Competition Span</span>
            <span className="flex items-center gap-1.5 text-[#0A0A0A] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A]" />
              Fiberglass-Carbon Composite Beam
            </span>
            <span>Acoustic Wave: 3,200 m/s</span>
          </div>

          {/* Crossbar Beam Graphic with Traveling Yellow Light Pulse */}
          <div className="relative py-8 px-4">
            {/* Beam Track */}
            <div className="relative h-2.5 w-full bg-[#E5E5EA] rounded-full overflow-hidden shadow-inner">
              {/* Traveling Yellow Light Animation */}
              <motion.div
                className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#FFD60A] to-transparent rounded-full opacity-90 blur-[1px]"
                animate={{
                  x: ['-10%', '110%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3.2,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Left & Right Upright Pegs */}
            <div className="absolute left-2 top-6 w-3 h-7 bg-[#1D1D1F] rounded-t-sm" title="0.000m Left Support" />
            <div className="absolute right-2 top-6 w-3 h-7 bg-[#1D1D1F] rounded-t-sm" title="4.500m Right Support" />

            {/* Sensor Stations along the beam */}
            <div className="relative -mt-1 flex justify-between">
              {/* P1: 1.125m (25%) */}
              <div
                className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(SENSOR_POSITIONS.P1 / 4.5) * 100}%` }}
              >
                <div className="h-5 w-5 rounded-full bg-[#0A0A0A] border-2 border-[#FFD60A] flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-mono text-white font-bold">P</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-bold text-[#0A0A0A]">P1</div>
                  <div className="text-[10px] font-mono text-[#6E6E73]">1.125m</div>
                </div>
              </div>

              {/* SG1: 1.650m (36.67%) */}
              <div
                className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(SENSOR_POSITIONS.SG1 / 4.5) * 100}%` }}
              >
                <div className="h-5 w-5 rounded-full bg-[#0A0A0A] border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-mono text-white font-bold">S</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-bold text-[#0A0A0A]">SG1</div>
                  <div className="text-[10px] font-mono text-[#6E6E73]">1.650m</div>
                </div>
              </div>

              {/* P2 + IMU: 2.250m (50%) */}
              <div
                className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(SENSOR_POSITIONS.P2 / 4.5) * 100}%` }}
              >
                <div className="h-5 w-5 rounded-full bg-[#0A0A0A] border-2 border-[#FFD60A] flex items-center justify-center shadow-md ring-4 ring-[#FFD60A]/30">
                  <span className="text-[8px] font-mono text-[#FFD60A] font-bold">◆</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-bold text-[#0A0A0A]">P2 + IMU</div>
                  <div className="text-[10px] font-mono text-[#6E6E73]">2.250m Apex</div>
                </div>
              </div>

              {/* SG2: 2.850m (63.33%) */}
              <div
                className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(SENSOR_POSITIONS.SG2 / 4.5) * 100}%` }}
              >
                <div className="h-5 w-5 rounded-full bg-[#0A0A0A] border-2 border-white flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-mono text-white font-bold">S</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-bold text-[#0A0A0A]">SG2</div>
                  <div className="text-[10px] font-mono text-[#6E6E73]">2.850m</div>
                </div>
              </div>

              {/* P3: 3.375m (75%) */}
              <div
                className="absolute -top-3.5 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${(SENSOR_POSITIONS.P3 / 4.5) * 100}%` }}
              >
                <div className="h-5 w-5 rounded-full bg-[#0A0A0A] border-2 border-[#FFD60A] flex items-center justify-center shadow-sm">
                  <span className="text-[8px] font-mono text-white font-bold">P</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-bold text-[#0A0A0A]">P3</div>
                  <div className="text-[10px] font-mono text-[#6E6E73]">3.375m</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar below crossbar */}
          <div className="mt-8 pt-4 border-t border-black/5 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="text-[#6E6E73]">Multimodal Sensors</span>
              <div className="font-mono font-bold text-sm text-[#0A0A0A] mt-0.5">3 Piezo · 2 Strain · 1 IMU</div>
            </div>
            <div>
              <span className="text-[#6E6E73]">Acquisition Frequency</span>
              <div className="font-mono font-bold text-sm text-[#0A0A0A] mt-0.5">1,000 Hz Continuous</div>
            </div>
            <div>
              <span className="text-[#6E6E73]">Localization Precision</span>
              <div className="font-mono font-bold text-sm text-[#0A0A0A] mt-0.5">± 0.05 m Continuous</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
