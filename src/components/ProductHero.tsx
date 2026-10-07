/**
 * Intelligent Crossbar - Product Hero Section
 * Apple-inspired product launch hero with clean 4.5m crossbar, massive typography,
 * and clear consumer CTAs.
 */

import React from 'react';
import { motion } from 'motion/react';
import { ProductCrossbar } from './ProductCrossbar';

interface ProductHeroProps {
  onStartLiveSession: () => void;
  onExploreTraining: () => void;
}

export const ProductHero: React.FC<ProductHeroProps> = ({
  onStartLiveSession,
  onExploreTraining,
}) => {
  return (
    <section id="overview" className="pt-24 pb-20 px-6 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Subtle Product Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-black/5 shadow-xs mb-6"
        >
          <span className="h-2 w-2 rounded-full bg-[#FFD60A]" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6E6E73] font-mono">
            Intelligent Athletics System
          </span>
        </motion.div>

        {/* Large Cinematic Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-[#0A0A0A] leading-[0.94] uppercase"
        >
          See every attempt <br />
          <span className="text-[#0A0A0A]">differently.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-lg sm:text-xl text-[#6E6E73] font-normal tracking-tight max-w-xl mx-auto leading-relaxed"
        >
          Real-time insight into pole-vault contact, clearance and training patterns.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartLiveSession}
            className="px-7 py-3.5 rounded-full bg-[#FFD60A] text-[#0A0A0A] font-bold text-sm shadow-sm hover:bg-[#FFCC00] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Start Live Session</span>
            <span className="font-bold text-base leading-none">→</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExploreTraining}
            className="px-7 py-3.5 rounded-full bg-white text-[#1D1D1F] border border-black/10 font-semibold text-sm shadow-xs hover:border-black/25 hover:bg-[#FAFAFC] transition-colors cursor-pointer"
          >
            Explore Training
          </motion.button>
        </motion.div>

        {/* Realistic 4.5m Crossbar Centerpiece (No technical labels) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center justify-between text-xs font-mono text-[#6E6E73] mb-2 px-2">
            <span className="font-semibold text-[#0A0A0A] uppercase tracking-wider">
              Crossbar System
            </span>
            <span className="flex items-center gap-1.5 text-[#34C759] font-medium">
              <span className="h-2 w-2 rounded-full bg-[#34C759]" />
              Ready on Runway
            </span>
          </div>

          <ProductCrossbar
            contactDetected={false}
            contactType="NO_CONTACT"
            location="NONE"
            estimatedX={2.25}
            isSuccess={true}
            isAnalyzing={false}
            hasAttempt={false}
          />

          {/* Three Simple Value Propositions */}
          <div className="mt-8 pt-6 border-t border-black/5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                Instant Contact
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                Immediately confirms whether the crossbar was contacted before human eyes can tell.
              </p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                Exact Location
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                Pins the exact impact point across the 4.50 m beam — left, center apex, or right.
              </p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                Training Memory
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                Connects individual vaults into actionable patterns over sessions and heights.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
