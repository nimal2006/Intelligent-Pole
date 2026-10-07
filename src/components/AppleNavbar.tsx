/**
 * Apple-inspired Minimal Navigation Bar
 * Features subtle glass blur, restrained branding, and live system status indicator.
 */

import React from 'react';
import { motion } from 'motion/react';

interface AppleNavbarProps {
  onSimulateClick: () => void;
  isSimulating: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AppleNavbar: React.FC<AppleNavbarProps> = ({
  onSimulateClick,
  isSimulating,
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: 'live', label: 'Live' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'sensors', label: 'Sensors' },
    { id: 'history', label: 'History' },
  ];

  return (
    <header className="sticky top-0 z-50 apple-glass transition-all">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand Lockup */}
        <a href="#hero" className="flex items-center gap-2 group">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFD60A] shadow-[0_0_8px_rgba(255,214,10,0.6)]" />
          <span className="text-[13px] font-bold tracking-tight text-[#0A0A0A] uppercase">
            Intelligent Crossbar
          </span>
        </a>

        {/* Center Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#6E6E73]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`transition-colors relative py-1 hover:text-[#0A0A0A] ${
                activeTab === item.id ? 'text-[#0A0A0A] font-semibold' : ''
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right Status & Quick Action */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[12px] font-mono font-medium text-[#1D1D1F]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
            </span>
            <span className="tracking-tight">SYSTEM ONLINE</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSimulateClick}
            disabled={isSimulating}
            className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm ${
              isSimulating
                ? 'bg-[#E5E5EA] text-[#8E8E93] cursor-wait'
                : 'bg-[#0A0A0A] text-white hover:bg-[#1D1D1F]'
            }`}
          >
            {isSimulating ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A] animate-ping" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <span>Simulate Jump</span>
                <span className="text-[#FFD60A]">→</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
