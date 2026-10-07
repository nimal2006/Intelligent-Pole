/**
 * Apple-inspired Live Sensor Telemetry Grid
 * Six compact cards: P1, P2, P3, SG1, SG2, IMU
 * Features large current value, smooth SVG mini-sparkline, and thin elegant lines.
 */

import React from 'react';
import { motion } from 'motion/react';
import { SensorSample } from '../types/poleVault';

interface AppleSensorTelemetryProps {
  samples: SensorSample[];
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

export const AppleSensorTelemetry: React.FC<AppleSensorTelemetryProps> = ({
  samples,
  sensorResponse,
  isSimulating,
}) => {
  // Extract historical sparkline points (downsampled to 30 points)
  const step = Math.max(1, Math.floor(samples.length / 30));
  const points = samples.filter((_, i) => i % step === 0);

  const getPointsPath = (key: 'p1' | 'p2' | 'p3' | 'sg1' | 'sg2' | 'az') => {
    if (points.length < 2) return '';
    const vals = points.map((p) => Math.abs(p[key]));
    const max = Math.max(...vals, 0.01);
    const min = Math.min(...vals, 0);
    const range = max - min || 1;

    const width = 120;
    const height = 36;

    return points
      .map((p, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const normalizedY = (Math.abs(p[key]) - min) / range;
        const y = height - normalizedY * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const sensorCards = [
    {
      id: 'P1',
      name: 'Piezoelectric Sensor 1',
      location: '1.125 m (Left)',
      val: sensorResponse?.p1 ?? 0.08,
      unit: 'V',
      path: getPointsPath('p1'),
      isImpact: (sensorResponse?.p1 ?? 0) > 1.2,
      type: 'Piezo Transducer',
    },
    {
      id: 'P2',
      name: 'Piezoelectric Sensor 2',
      location: '2.250 m (Apex)',
      val: sensorResponse?.p2 ?? 0.12,
      unit: 'V',
      path: getPointsPath('p2'),
      isImpact: (sensorResponse?.p2 ?? 0) > 1.2,
      type: 'Piezo Transducer',
    },
    {
      id: 'P3',
      name: 'Piezoelectric Sensor 3',
      location: '3.375 m (Right)',
      val: sensorResponse?.p3 ?? 0.08,
      unit: 'V',
      path: getPointsPath('p3'),
      isImpact: (sensorResponse?.p3 ?? 0) > 1.2,
      type: 'Piezo Transducer',
    },
    {
      id: 'SG1',
      name: 'Strain Gauge 1',
      location: '1.650 m (Left)',
      val: sensorResponse?.sg1 ?? 14.2,
      unit: 'με',
      path: getPointsPath('sg1'),
      isImpact: (sensorResponse?.sg1 ?? 0) > 120,
      type: 'Flexural Strain',
    },
    {
      id: 'SG2',
      name: 'Strain Gauge 2',
      location: '2.850 m (Right)',
      val: sensorResponse?.sg2 ?? 13.8,
      unit: 'με',
      path: getPointsPath('sg2'),
      isImpact: (sensorResponse?.sg2 ?? 0) > 120,
      type: 'Flexural Strain',
    },
    {
      id: 'IMU',
      name: '6-DOF Inertial Unit',
      location: '2.250 m (Apex)',
      val: sensorResponse?.imu_accel ?? 0.45,
      unit: 'm/s²',
      path: getPointsPath('az'),
      isImpact: (sensorResponse?.imu_accel ?? 0) > 6.0,
      type: 'Inertial Recoil',
    },
  ];

  return (
    <div id="sensors" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase">
            Live Sensor Telemetry
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
            Calibrated multi-channel transducer acquisition at 1,000 Hz
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#6E6E73]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A]" />
          <span>Active Waveform Monitoring</span>
        </div>
      </div>

      {/* Six Compact Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {sensorCards.map((sc) => (
          <motion.div
            key={sc.id}
            whileHover={{ y: -3 }}
            className={`apple-card p-4 flex flex-col justify-between relative transition-all ${
              sc.isImpact ? 'ring-2 ring-[#FFD60A] shadow-md' : ''
            }`}
          >
            {/* Top ID & Status */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold font-mono text-sm text-[#0A0A0A]">
                {sc.id}
              </span>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                  sc.isImpact
                    ? 'bg-[#FFD60A] text-[#0A0A0A]'
                    : 'bg-black/5 text-[#6E6E73]'
                }`}
              >
                {sc.isImpact ? '↑ IMPACT' : 'NOMINAL'}
              </span>
            </div>

            {/* Current Value (large bold) */}
            <div className="my-3">
              <div className="text-2xl font-extrabold font-mono text-[#0A0A0A] tracking-tight tabular-nums">
                {sc.val.toFixed(sc.unit === 'με' ? 0 : 2)}
                <span className="text-xs font-normal text-[#6E6E73] ml-1 font-mono">
                  {sc.unit}
                </span>
              </div>
              <div className="text-[10px] text-[#6E6E73] font-mono mt-0.5">
                {sc.location}
              </div>
            </div>

            {/* Thin Elegant Sparkline */}
            <div className="h-9 w-full overflow-hidden border-t border-black/5 pt-1.5 flex items-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 36">
                <path
                  d={sc.path}
                  fill="none"
                  stroke={sc.isImpact ? '#FFD60A' : '#1D1D1F'}
                  strokeWidth={sc.isImpact ? '2.2' : '1.4'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
