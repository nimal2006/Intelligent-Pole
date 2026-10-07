/**
 * Apple-inspired 4.50m Crossbar Visualization Centerpiece
 * Shows exact sensor layout: P1 (1.125m), SG1 (1.650m), P2+IMU (2.250m), SG2 (2.850m), P3 (3.375m).
 * Animates a yellow (#FFD60A) impact wave traveling outward from the contact location.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ContactLocation, ContactType } from '../types/poleVault';
import { SENSOR_POSITIONS, CROSSBAR_LENGTH } from '../services/simulator';

interface AppleCrossbarProps {
  contactDetected: boolean;
  contactType: ContactType;
  location: ContactLocation;
  estimatedX: number;
  sensorResponse?: {
    p1: number;
    p2: number;
    p3: number;
    sg1: number;
    sg2: number;
    imu_accel: number;
    imu_gyro: number;
  };
  isSimulating: boolean;
}

export const AppleCrossbar: React.FC<AppleCrossbarProps> = ({
  contactDetected,
  contactType,
  location,
  estimatedX,
  sensorResponse,
  isSimulating,
}) => {
  const getPercent = (meters: number) => (meters / CROSSBAR_LENGTH) * 100;
  const clampedX = Math.max(0.15, Math.min(4.35, estimatedX || 2.25));
  const impactPercent = getPercent(clampedX);

  return (
    <div className="apple-card p-8 sm:p-10 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase">
            4.50 m Crossbar Geometry
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
            Proportional sensor topology with acoustic stress wave localization
          </p>
        </div>

        {/* Live indicator badge */}
        <div className="flex items-center gap-2">
          {contactDetected ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A] text-[#0A0A0A] text-xs font-mono font-bold shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#FFD60A] animate-ping" />
              <span>
                IMPACT AT {estimatedX.toFixed(2)} m · {location}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#34C759]/10 border border-[#34C759]/30 text-[#34C759] text-xs font-mono font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#34C759]" />
              <span>BAR INTACT · NO CONTACT</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Crossbar Canvas */}
      <div className="relative mt-12 mb-6 px-4 sm:px-8">
        {/* Support Upright Posts */}
        <div className="absolute left-2 top-0 bottom-6 w-3 bg-[#1D1D1F] rounded-t-sm flex flex-col justify-between items-center py-1">
          <div className="w-5 h-1.5 bg-[#FFD60A] rounded-xs" title="Left Support Peg (0.000m)" />
        </div>
        <div className="absolute right-2 top-0 bottom-6 w-3 bg-[#1D1D1F] rounded-t-sm flex flex-col justify-between items-center py-1">
          <div className="w-5 h-1.5 bg-[#FFD60A] rounded-xs" title="Right Support Peg (4.500m)" />
        </div>

        {/* Spatial Underlay Zones */}
        <div className="relative h-28 w-full flex">
          {/* Left Zone: 0.0 - 1.88m */}
          <div
            style={{ width: `${(1.875 / 4.5) * 100}%` }}
            className={`h-full border-r border-dashed border-black/10 transition-colors flex items-end pb-2 px-3 ${
              contactDetected && location === 'LEFT' ? 'bg-[#FFD60A]/10' : 'bg-transparent'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E93]">
              Left Span (0 – 1.88 m)
            </span>
          </div>

          {/* Center Zone: 1.88 - 2.63m */}
          <div
            style={{ width: `${((2.625 - 1.875) / 4.5) * 100}%` }}
            className={`h-full border-r border-dashed border-black/10 transition-colors flex items-end pb-2 px-3 justify-center ${
              contactDetected && location === 'CENTER' ? 'bg-[#FFD60A]/15' : 'bg-black/[0.015]'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0A0A0A] font-bold">
              Center Apex (1.88 – 2.63 m)
            </span>
          </div>

          {/* Right Zone: 2.63 - 4.50m */}
          <div
            style={{ width: `${((4.5 - 2.625) / 4.5) * 100}%` }}
            className={`h-full transition-colors flex items-end pb-2 px-3 justify-end ${
              contactDetected && location === 'RIGHT' ? 'bg-[#FFD60A]/10' : 'bg-transparent'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E93]">
              Right Span (2.63 – 4.50 m)
            </span>
          </div>

          {/* The Horizontal 4.5m Beam */}
          <div className="absolute top-10 left-0 right-0 h-3 rounded-full bg-[#1D1D1F] shadow-sm">
            {/* Subtle beam graduation marks */}
            {[1.0, 2.0, 3.0, 4.0].map((m) => (
              <div
                key={m}
                className="absolute top-0 bottom-0 w-px bg-white/30"
                style={{ left: `${(m / 4.5) * 100}%` }}
              />
            ))}
          </div>

          {/* Outward Traveling Yellow Pulse Wave on Impact */}
          {contactDetected && (
            <>
              {/* Leftward Wave */}
              <motion.div
                className="absolute top-10 h-3 bg-[#FFD60A] rounded-full opacity-80"
                initial={{ left: `${impactPercent}%`, width: '0%' }}
                animate={{ left: '0%', width: `${impactPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
              />
              {/* Rightward Wave */}
              <motion.div
                className="absolute top-10 h-3 bg-[#FFD60A] rounded-full opacity-80"
                initial={{ left: `${impactPercent}%`, width: '0%' }}
                animate={{ left: `${impactPercent}%`, width: `${100 - impactPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.2 }}
              />
            </>
          )}

          {/* Floating Impact Beacon & Label */}
          {contactDetected && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute top-1 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
              style={{ left: `${impactPercent}%` }}
            >
              {/* Pulsing Core */}
              <div className="relative flex items-center justify-center">
                <span className="absolute h-9 w-9 rounded-full bg-[#FFD60A] opacity-60 animate-ping" />
                <span className="relative h-4 w-4 rounded-full bg-[#FFD60A] border-2 border-[#0A0A0A] shadow-md" />
              </div>

              {/* Floating Text Pill */}
              <div className="mt-1.5 px-3 py-1 rounded-full bg-[#0A0A0A] text-white shadow-xl flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-[#FFD60A] tracking-wider uppercase">
                  {location}
                </span>
                <span className="text-[9px] font-mono text-white/90 whitespace-nowrap">
                  {contactType.replace('_CONTACT', ' CONTACT')}
                </span>
              </div>
            </motion.div>
          )}

          {/* Sensor Transducer Nodes */}
          {/* P1: 1.125m */}
          <SensorNode
            label="P1"
            meters={SENSOR_POSITIONS.P1}
            percent={getPercent(SENSOR_POSITIONS.P1)}
            peak={sensorResponse?.p1}
            isApex={false}
            unit="V"
          />

          {/* SG1: 1.650m */}
          <SensorNode
            label="SG1"
            meters={SENSOR_POSITIONS.SG1}
            percent={getPercent(SENSOR_POSITIONS.SG1)}
            peak={sensorResponse?.sg1}
            isApex={false}
            unit="με"
          />

          {/* P2 + IMU: 2.250m */}
          <SensorNode
            label="P2+IMU"
            meters={SENSOR_POSITIONS.P2}
            percent={getPercent(SENSOR_POSITIONS.P2)}
            peak={sensorResponse?.p2}
            isApex={true}
            unit="V"
          />

          {/* SG2: 2.850m */}
          <SensorNode
            label="SG2"
            meters={SENSOR_POSITIONS.SG2}
            percent={getPercent(SENSOR_POSITIONS.SG2)}
            peak={sensorResponse?.sg2}
            isApex={false}
            unit="με"
          />

          {/* P3: 3.375m */}
          <SensorNode
            label="P3"
            meters={SENSOR_POSITIONS.P3}
            percent={getPercent(SENSOR_POSITIONS.P3)}
            peak={sensorResponse?.p3}
            isApex={false}
            unit="V"
          />
        </div>

        {/* Ruler graduations */}
        <div className="mt-3 border-t border-black/5 pt-2 flex justify-between text-[11px] font-mono text-[#8E8E93]">
          <span>0.000 m</span>
          <span>1.125 m (P1)</span>
          <span>1.650 m (SG1)</span>
          <span className="font-bold text-[#0A0A0A]">2.250 m (Apex)</span>
          <span>2.850 m (SG2)</span>
          <span>3.375 m (P3)</span>
          <span>4.500 m</span>
        </div>
      </div>
    </div>
  );
};

interface SensorNodeProps {
  label: string;
  meters: number;
  percent: number;
  peak?: number;
  isApex: boolean;
  unit: string;
}

const SensorNode: React.FC<SensorNodeProps> = ({
  label,
  meters,
  percent,
  peak,
  isApex,
  unit,
}) => {
  const isHigh = peak !== undefined && peak > 1.2;

  return (
    <div
      className="absolute top-9 -translate-x-1/2 flex flex-col items-center z-20 group"
      style={{ left: `${percent}%` }}
    >
      {/* Node Dot / Diamond */}
      <div
        className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
          isHigh
            ? 'bg-[#FFD60A] text-[#0A0A0A] ring-4 ring-[#FFD60A]/40 scale-110 shadow-md'
            : isApex
            ? 'bg-[#0A0A0A] text-[#FFD60A] border-2 border-[#FFD60A] shadow-xs'
            : 'bg-[#0A0A0A] text-white border-2 border-white/80 shadow-xs'
        }`}
      >
        <span className="text-[9px] font-mono font-bold leading-none">
          {label.charAt(0)}
        </span>
      </div>

      {/* Label under node */}
      <div className="mt-1.5 flex flex-col items-center">
        <span className="text-[10px] font-bold text-[#0A0A0A] font-mono leading-none">
          {label}
        </span>
        <span className="text-[9px] font-mono text-[#8E8E93] mt-0.5">
          {meters.toFixed(3)}m
        </span>
      </div>
    </div>
  );
};
