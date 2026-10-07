/**
 * Intelligent Crossbar - Product Navigation
 * Minimal, Apple-inspired header for a commercial sports product.
 */

import React from 'react';
import { motion } from 'motion/react';

interface ProductNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRecordClick: () => void;
  isAnalyzing: boolean;
}

export const ProductNavbar: React.FC<ProductNavbarProps> = ({
  activeTab,
  setActiveTab,
  onRecordClick,
  isAnalyzing,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'live', label: 'Live' },
    { id: 'training', label: 'Training' },
    { id: 'history', label: 'History' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5EA]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <span className="h-2 w-2 rounded-full bg-[#FFD60A] shadow-[0_0_8px_rgba(255,214,10,0.8)]" />
          <span className="text-[13px] font-bold tracking-tight text-[#0A0A0A] uppercase font-sans">
            Intelligent Crossbar
          </span>
        </button>

        {/* Clean Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#6E6E73]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`relative py-1 transition-colors hover:text-[#0A0A0A] cursor-pointer ${
                activeTab === item.id ? 'text-[#0A0A0A] font-semibold' : ''
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="productNavUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right Status Indicator & Action */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F5F7] border border-black/5 text-[11px] font-mono font-semibold text-[#1D1D1F]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
            </span>
            <span className="tracking-wide">LIVE</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRecordClick}
            disabled={isAnalyzing}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              isAnalyzing
                ? 'bg-[#E5E5EA] text-[#8E8E93] cursor-not-allowed'
                : 'bg-[#0A0A0A] text-white hover:bg-[#1D1D1F]'
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A] animate-ping" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Record Attempt</span>
                <span className="text-[#FFD60A]">→</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
