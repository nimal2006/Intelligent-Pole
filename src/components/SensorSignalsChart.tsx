/**
 * Intelligent Pole-Vault Crossbar - Sensor Signals Waveform Monitor
 * Clean, high-contrast multi-channel waveform monitor using Recharts.
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SensorSample } from '../types/poleVault';

interface SensorSignalsChartProps {
  samples: SensorSample[];
}

type ChannelTab = 'piezo' | 'strain' | 'imu';

export const SensorSignalsChart: React.FC<SensorSignalsChartProps> = ({
  samples,
}) => {
  const [activeTab, setActiveTab] = useState<ChannelTab>('piezo');

  if (!samples || samples.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 text-center text-slate-400">
        No active waveform data.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Header with Clean Segmented Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <span>High-Speed Sensor Waveform Telemetry</span>
            <span className="text-xs font-normal text-slate-400">· 1,000 Hz</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized multichannel time series across 2.00-second vault window
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('piezo')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'piezo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Piezo Shock (P1–P3)
          </button>
          <button
            onClick={() => setActiveTab('strain')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'strain'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Strain Bending (SG1–SG2)
          </button>
          <button
            onClick={() => setActiveTab('imu')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'imu'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            IMU Recoil (Linear & Gyro)
          </button>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={samples} margin={{ top: 8, right: 16, left: -14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => `${Number(v).toFixed(2)}s`}
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
            />
            <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090d16',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
              labelFormatter={(label) => `Time: ${Number(label).toFixed(3)}s`}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
            />

            {/* Piezo Channels */}
            {activeTab === 'piezo' && (
              <>
                <Line
                  type="monotone"
                  dataKey="p1"
                  name="P1 (1.125m) [V]"
                  stroke="#06b6d4"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="p2"
                  name="P2 Center (2.250m) [V]"
                  stroke="#38bdf8"
                  strokeWidth={2.0}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="p3"
                  name="P3 (3.375m) [V]"
                  stroke="#818cf8"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Strain Channels */}
            {activeTab === 'strain' && (
              <>
                <Line
                  type="monotone"
                  dataKey="sg1"
                  name="SG1 Left (1.650m) [με]"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="sg2"
                  name="SG2 Right (2.850m) [με]"
                  stroke="#f472b6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}

            {/* IMU Channels */}
            {activeTab === 'imu' && (
              <>
                <Line
                  type="monotone"
                  dataKey="az"
                  name="IMU Vertical az [m/s²]"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="ay"
                  name="IMU Lateral ay [m/s²]"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="gx"
                  name="IMU Roll Rate gx [rad/s]"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
        <span>Impact Event Window: ~0.85s</span>
        <span>Sampling Interval: 1.0 ms</span>
      </div>
    </div>
  );
};
