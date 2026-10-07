/**
 * Intelligent Crossbar - Product Crossbar Visualization
 * Clean, realistic 4.5m competition beam without internal engineering labels.
 * Features traveling yellow beam light, yellow impact beacon + outward wave on contact,
 * and subtle green clearance illumination.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactLocation, ContactType } from '../types/poleVault';

interface ProductCrossbarProps {
  contactDetected: boolean;
  contactType: ContactType;
  location: ContactLocation;
  estimatedX: number; // 0 to 4.5 meters
  isSuccess: boolean;
  isAnalyzing: boolean;
  hasAttempt: boolean;
}

export const ProductCrossbar: React.FC<ProductCrossbarProps> = ({
  contactDetected,
  contactType,
  location,
  estimatedX,
  isSuccess,
  isAnalyzing,
  hasAttempt,
}) => {
  const clampedX = Math.max(0.2, Math.min(4.3, estimatedX || 2.25));
  const impactPercent = (clampedX / 4.5) * 100;

  return (
    <div className="w-full relative select-none">
      {/* 4.5m Crossbar Visual Canvas */}
      <div className="relative py-12 px-2 sm:px-6">
        {/* Support Upright Pegs (Left & Right) */}
        <div
          className="absolute left-1 sm:left-4 top-4 bottom-8 w-2.5 sm:w-3 bg-[#1D1D1F] rounded-t-sm flex flex-col justify-between items-center py-1 z-10"
          title="Left Upright Standard (0.00 m)"
        >
          <div className="w-4 sm:w-5 h-1.5 bg-[#FFD60A] rounded-xs shadow-xs" />
        </div>
        <div
          className="absolute right-1 sm:right-4 top-4 bottom-8 w-2.5 sm:w-3 bg-[#1D1D1F] rounded-t-sm flex flex-col justify-between items-center py-1 z-10"
          title="Right Upright Standard (4.50 m)"
        >
          <div className="w-4 sm:w-5 h-1.5 bg-[#FFD60A] rounded-xs shadow-xs" />
        </div>

        {/* Spatial Zone Guides (Left, Center, Right) - Human readable */}
        <div className="relative h-20 w-full flex">
          {/* Left Zone (0 – 1.88 m) */}
          <div
            style={{ width: `${(1.875 / 4.5) * 100}%` }}
            className={`h-full border-r border-dashed border-black/10 transition-colors flex items-end pb-2 px-3 ${
              contactDetected && location === 'LEFT' ? 'bg-[#FFD60A]/10' : 'bg-transparent'
            }`}
          >
            <span className="text-[10px] font-medium tracking-wider text-[#8E8E93] uppercase">
              Left
            </span>
          </div>

          {/* Center Zone (1.88 – 2.63 m) */}
          <div
            style={{ width: `${((2.625 - 1.875) / 4.5) * 100}%` }}
            className={`h-full border-r border-dashed border-black/10 transition-colors flex items-end pb-2 px-3 justify-center ${
              contactDetected && location === 'CENTER' ? 'bg-[#FFD60A]/15' : 'bg-black/[0.015]'
            }`}
          >
            <span className="text-[10px] font-bold tracking-wider text-[#0A0A0A] uppercase">
              Center
            </span>
          </div>

          {/* Right Zone (2.63 – 4.50 m) */}
          <div
            style={{ width: `${((4.5 - 2.625) / 4.5) * 100}%` }}
            className={`h-full transition-colors flex items-end pb-2 px-3 justify-end ${
              contactDetected && location === 'RIGHT' ? 'bg-[#FFD60A]/10' : 'bg-transparent'
            }`}
          >
            <span className="text-[10px] font-medium tracking-wider text-[#8E8E93] uppercase">
              Right
            </span>
          </div>

          {/* The Physical 4.5m Crossbar Beam */}
          <div
            className={`absolute top-6 left-0 right-0 h-3 rounded-full transition-all duration-500 ${
              hasAttempt && isSuccess
                ? 'bg-[#34C759] shadow-[0_0_16px_rgba(52,199,89,0.35)]'
                : 'bg-[#0A0A0A] shadow-sm'
            }`}
          >
            {/* Subtle beam graduation points (1m, 2m, 3m, 4m) */}
            {[1.125, 2.25, 3.375].map((m) => (
              <div
                key={m}
                className="absolute top-0 bottom-0 w-0.5 bg-white/20"
                style={{ left: `${(m / 4.5) * 100}%` }}
              />
            ))}

            {/* Subtle Traveling Yellow Light Across Crossbar */}
            {!contactDetected && !isAnalyzing && (
              <motion.div
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#FFD60A] to-transparent rounded-full opacity-90 blur-[1px]"
                animate={{
                  x: ['-20%', '115%'],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3.5,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>

          {/* Analyzing State Traveling Scanner */}
          {isAnalyzing && (
            <motion.div
              className="absolute top-6 h-3 bg-gradient-to-r from-transparent via-[#FFD60A] to-transparent rounded-full shadow-[0_0_12px_#FFD60A]"
              initial={{ left: '0%', width: '30%' }}
              animate={{ left: ['0%', '70%', '0%'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            />
          )}

          {/* Contact Impact Pulse Waves Travelling Outward */}
          {contactDetected && !isAnalyzing && (
            <>
              {/* Leftward Wave */}
              <motion.div
                className="absolute top-6 h-3 bg-[#FFD60A] rounded-full opacity-80"
                initial={{ left: `${impactPercent}%`, width: '0%' }}
                animate={{ left: '0%', width: `${impactPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
              />
              {/* Rightward Wave */}
              <motion.div
                className="absolute top-6 h-3 bg-[#FFD60A] rounded-full opacity-80"
                initial={{ left: `${impactPercent}%`, width: '0%' }}
                animate={{ left: `${impactPercent}%`, width: `${100 - impactPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
              />
            </>
          )}

          {/* Floating Impact Beacon & Clean Product Label */}
          {contactDetected && !isAnalyzing && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: -8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
              style={{ left: `${impactPercent}%` }}
            >
              {/* Pulsing Core */}
              <div className="relative flex items-center justify-center">
                <span className="absolute h-9 w-9 rounded-full bg-[#FFD60A] opacity-60 animate-ping" />
                <span className="relative h-4 w-4 rounded-full bg-[#FFD60A] border-2 border-[#0A0A0A] shadow-md" />
              </div>

              {/* Floating Clean Product Badge */}
              <div className="mt-1.5 px-3 py-1 rounded-full bg-[#0A0A0A] text-white shadow-xl flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#FFD60A] tracking-wider uppercase">
                  {location} CONTACT
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Minimal Baseline Span Labels */}
        <div className="mt-2 border-t border-black/5 pt-2 flex justify-between text-[11px] font-mono text-[#8E8E93]">
          <span>0.00 m</span>
          <span>Standard 4.50 m Competition Beam</span>
          <span>4.50 m</span>
        </div>
      </div>
    </div>
  );
};
