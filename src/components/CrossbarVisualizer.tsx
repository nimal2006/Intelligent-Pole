/**
 * Intelligent Pole-Vault Crossbar - 4.5m Beam Visualizer
 * Clean, proportional physical crossbar diagram with clear sensor locations:
 *   P1: 1.125m | SG1: 1.650m | P2: 2.250m | IMU: 2.250m | SG2: 2.850m | P3: 3.375m
 */

import React from 'react';
import { ContactLocation, ContactType } from '../types/poleVault';
import { SENSOR_POSITIONS, CROSSBAR_LENGTH } from '../services/simulator';

interface CrossbarVisualizerProps {
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
  isSimulating?: boolean;
}

export const CrossbarVisualizer: React.FC<CrossbarVisualizerProps> = ({
  contactDetected,
  contactType,
  location,
  estimatedX,
  sensorResponse,
  isSimulating = false,
}) => {
  const getPercent = (meters: number) => (meters / CROSSBAR_LENGTH) * 100;
  const clampedX = Math.max(0.15, Math.min(4.35, estimatedX || 2.25));
  const impactPercent = getPercent(clampedX);

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm">
      {/* Title & Coordinate Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <span>4.50 m Crossbar Sensor Topology</span>
            <span className="text-xs font-normal text-slate-400">· 5 Sensor Stations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time contact localization along the standard 4.500 m competition beam
          </p>
        </div>

        {/* Impact readout pill */}
        <div className="flex items-center gap-2">
          {contactDetected ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-950/50 border border-rose-700/60 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              <span className="text-rose-200 font-bold">
                Impact at {estimatedX.toFixed(2)} m
              </span>
              <span className="text-slate-400">({location})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-700/60 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-200 font-medium">Clean Bar · No Contact</span>
            </div>
          )}
        </div>
      </div>

      {/* Crossbar Graphic */}
      <div className="relative mt-8 px-6 pt-4 pb-2">
        {/* Support Uprights */}
        <div className="absolute left-4 top-2 bottom-6 w-2.5 rounded-t bg-slate-700 border-r border-slate-600 flex flex-col justify-between items-center py-1">
          <div className="w-4 h-1.5 bg-amber-500 rounded-sm" title="Left Upright Peg (0.00 m)" />
        </div>
        <div className="absolute right-4 top-2 bottom-6 w-2.5 rounded-t bg-slate-700 border-l border-slate-600 flex flex-col justify-between items-center py-1">
          <div className="w-4 h-1.5 bg-amber-500 rounded-sm" title="Right Upright Peg (4.50 m)" />
        </div>

        {/* Beam Container */}
        <div className="relative h-16 w-full flex">
          {/* Spatial Zone Underlays */}
          {/* Left Zone: 0 - 1.88 m */}
          <div
            style={{ width: `${(1.875 / 4.5) * 100}%` }}
            className={`h-full border-r border-dashed border-slate-800 transition-colors flex items-end pb-1 px-2 ${
              contactDetected && location === 'LEFT' ? 'bg-amber-500/10' : 'bg-slate-950/20'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Left Span (0 – 1.88 m)
            </span>
          </div>

          {/* Center Zone: 1.88 - 2.63 m */}
          <div
            style={{ width: `${((2.625 - 1.875) / 4.5) * 100}%` }}
            className={`h-full border-r border-dashed border-slate-800 transition-colors flex items-end pb-1 px-2 justify-center ${
              contactDetected && location === 'CENTER' ? 'bg-rose-500/15' : 'bg-slate-950/40'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-300 font-semibold uppercase">
              Center Apex (1.88 – 2.63 m)
            </span>
          </div>

          {/* Right Zone: 2.63 - 4.50 m */}
          <div
            style={{ width: `${((4.5 - 2.625) / 4.5) * 100}%` }}
            className={`h-full transition-colors flex items-end pb-1 px-2 justify-end ${
              contactDetected && location === 'RIGHT' ? 'bg-amber-500/10' : 'bg-slate-950/20'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Right Span (2.63 – 4.50 m)
            </span>
          </div>

          {/* Physical Crossbar Rod */}
          <div
            className={`absolute top-4 left-0 right-0 h-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-md ${
              isSimulating ? 'animate-pulse' : ''
            }`}
            style={{
              boxShadow: contactDetected
                ? '0 0 16px rgba(245, 158, 11, 0.45)'
                : '0 0 6px rgba(0, 0, 0, 0.6)',
            }}
          />

          {/* Impact Marker Pin */}
          {contactDetected && (
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300 z-30"
              style={{ left: `${impactPercent}%` }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute h-7 w-7 rounded-full bg-rose-500/40 animate-ping" />
                <span className="relative h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white shadow-lg" />
              </div>
              <div className="mt-1 whitespace-nowrap rounded bg-slate-950/95 border border-rose-500/70 px-2 py-0.5 text-center shadow-xl">
                <span className="text-[10px] font-mono font-bold text-rose-300">
                  {estimatedX.toFixed(2)} m
                </span>
              </div>
            </div>
          )}

          {/* Sensor Station Nodes */}
          <SensorStation
            id="P1"
            name="Piezoelectric P1"
            position={SENSOR_POSITIONS.P1}
            percent={getPercent(SENSOR_POSITIONS.P1)}
            type="piezo"
            peak={sensorResponse?.p1}
            unit="V"
          />

          <SensorStation
            id="SG1"
            name="Strain Gauge SG1"
            position={SENSOR_POSITIONS.SG1}
            percent={getPercent(SENSOR_POSITIONS.SG1)}
            type="strain"
            peak={sensorResponse?.sg1}
            unit="με"
          />

          <SensorStation
            id="P2+IMU"
            name="Center Apex P2 + IMU"
            position={SENSOR_POSITIONS.P2}
            percent={getPercent(SENSOR_POSITIONS.P2)}
            type="combo"
            peak={sensorResponse?.p2}
            unit="V"
          />

          <SensorStation
            id="SG2"
            name="Strain Gauge SG2"
            position={SENSOR_POSITIONS.SG2}
            percent={getPercent(SENSOR_POSITIONS.SG2)}
            type="strain"
            peak={sensorResponse?.sg2}
            unit="με"
          />

          <SensorStation
            id="P3"
            name="Piezoelectric P3"
            position={SENSOR_POSITIONS.P3}
            percent={getPercent(SENSOR_POSITIONS.P3)}
            type="piezo"
            peak={sensorResponse?.p3}
            unit="V"
          />
        </div>

        {/* Ruler scale */}
        <div className="mt-2 border-t border-slate-800 pt-1.5 flex justify-between text-[10px] font-mono text-slate-500">
          <span>0.0 m</span>
          <span>1.125 m (P1)</span>
          <span>2.25 m (Center)</span>
          <span>3.375 m (P3)</span>
          <span>4.5 m</span>
        </div>
      </div>

      {/* Sensor Peak Readouts Row */}
      <div className="mt-4 grid grid-cols-5 gap-2 border-t border-slate-800/80 pt-3 text-center">
        <div className="rounded bg-slate-950/40 p-2 border border-slate-800/60">
          <div className="text-[10px] font-mono text-cyan-400 font-bold">P1 (1.125m)</div>
          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5 tabular-nums">
            {sensorResponse?.p1 !== undefined ? `${sensorResponse.p1.toFixed(2)} V` : '0.00 V'}
          </div>
        </div>

        <div className="rounded bg-slate-950/40 p-2 border border-slate-800/60">
          <div className="text-[10px] font-mono text-purple-400 font-bold">SG1 (1.650m)</div>
          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5 tabular-nums">
            {sensorResponse?.sg1 !== undefined ? `${sensorResponse.sg1.toFixed(1)} με` : '0.0 με'}
          </div>
        </div>

        <div className="rounded bg-slate-950/40 p-2 border border-slate-800/60">
          <div className="text-[10px] font-mono text-amber-400 font-bold">P2+IMU (2.250m)</div>
          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5 tabular-nums">
            {sensorResponse?.p2 !== undefined ? `${sensorResponse.p2.toFixed(2)} V` : '0.00 V'}
          </div>
        </div>

        <div className="rounded bg-slate-950/40 p-2 border border-slate-800/60">
          <div className="text-[10px] font-mono text-purple-400 font-bold">SG2 (2.850m)</div>
          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5 tabular-nums">
            {sensorResponse?.sg2 !== undefined ? `${sensorResponse.sg2.toFixed(1)} με` : '0.0 με'}
          </div>
        </div>

        <div className="rounded bg-slate-950/40 p-2 border border-slate-800/60">
          <div className="text-[10px] font-mono text-cyan-400 font-bold">P3 (3.375m)</div>
          <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5 tabular-nums">
            {sensorResponse?.p3 !== undefined ? `${sensorResponse.p3.toFixed(2)} V` : '0.00 V'}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SensorStationProps {
  id: string;
  name: string;
  position: number;
  percent: number;
  type: 'piezo' | 'strain' | 'combo';
  peak?: number;
  unit: string;
}

const SensorStation: React.FC<SensorStationProps> = ({
  id,
  position,
  percent,
  type,
  peak,
}) => {
  const isHigh = peak !== undefined && peak > 1.2;

  const getStyle = () => {
    if (type === 'piezo') return 'bg-cyan-500 border-cyan-300 text-cyan-100';
    if (type === 'strain') return 'bg-purple-500 border-purple-300 text-purple-100';
    return 'bg-amber-500 border-amber-300 text-amber-100';
  };

  return (
    <div
      className="absolute top-3.5 -translate-x-1/2 flex flex-col items-center pointer-events-auto group z-20"
      style={{ left: `${percent}%` }}
      title={`${id} @ ${position.toFixed(3)} m`}
    >
      <div
        className={`h-4 w-4 rounded-full border flex items-center justify-center shadow transition-all ${getStyle()} ${
          isHigh ? 'ring-2 ring-amber-400 scale-110' : ''
        }`}
      >
        <span className="text-[8px] font-mono font-bold">{id.charAt(0)}</span>
      </div>
      <span className="mt-1 text-[9px] font-mono text-slate-300 bg-slate-950/90 px-1 py-0.5 rounded border border-slate-800 whitespace-nowrap">
        {id}
      </span>
    </div>
  );
};
