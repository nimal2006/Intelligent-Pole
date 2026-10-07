/**
 * Intelligent Pole-Vault Crossbar - Pipeline Step Inspector
 * Step-by-step visualizer of the core engineering pipeline:
 * Sensor Data -> Signal Processing -> Feature Extraction -> Sensor Fusion -> ML Classifier -> Localization -> Analytics
 */

import React from 'react';
import { SensorFeatureVector, PredictionResult } from '../types/poleVault';

interface PipelineStepInspectorProps {
  features?: SensorFeatureVector;
  prediction?: PredictionResult;
  timings?: {
    simulationMs: number;
    processingMs: number;
    fusionMs: number;
    mlMs: number;
    totalMs: number;
  };
  onClose?: () => void;
}

export const PipelineStepInspector: React.FC<PipelineStepInspectorProps> = ({
  features,
  prediction,
  timings,
  onClose,
}) => {
  const steps = [
    {
      num: 1,
      title: 'Sensor Data Acquisition',
      desc: '1000 Hz continuous acquisition from P1, P2, P3, SG1, SG2, IMU 6-DOF',
      badge: timings ? `${timings.simulationMs}ms` : '1000 Hz',
      detail: 'P1 (1.125m), SG1 (1.650m), P2+IMU (2.250m), SG2 (2.850m), P3 (3.375m)',
    },
    {
      num: 2,
      title: 'Digital Signal Processing',
      desc: 'DC offset cancellation, moving average / Butterworth bandpass filtering (15-450Hz)',
      badge: timings ? `${timings.processingMs}ms` : 'Filtered',
      detail: 'RMS calculation, baseline detrending, dynamic magnitude calculation',
    },
    {
      num: 3,
      title: '10-D Feature Extraction',
      desc: 'Extracting physics-informed multimodal vectors',
      badge: '10 Features',
      detail: features
        ? `Peaks: P1=${features.p1_peak}V, P2=${features.p2_peak}V, P3=${features.p3_peak}V | Strain: SG1=${features.sg1_peak}με, SG2=${features.sg2_peak}με | Accel: ${features.imu_acceleration}m/s² | Freq: ${features.frequency}Hz | Dur: ${features.duration}s`
        : 'Awaiting feature vector',
    },
    {
      num: 4,
      title: 'Multimodal Sensor Fusion',
      desc: 'Spatial centroid estimation along 4.5m crossbar and multi-sensor validation',
      badge: timings ? `${timings.fusionMs}ms` : 'Spatial',
      detail: prediction
        ? `Estimated coordinate: x = ${prediction.estimated_x_m.toFixed(2)}m (${prediction.location}) | Confidence: ${(prediction.confidence * 100).toFixed(1)}%`
        : 'Centroid weighting',
    },
    {
      num: 5,
      title: 'Random Forest Classifier',
      desc: 'Multimodal decision tree ensemble classification (4 classes)',
      badge: timings ? `${timings.mlMs}ms` : 'Random Forest',
      detail: prediction
        ? `Class: ${prediction.contact_type} | Probabilities: No Contact=${(prediction.probabilities.NO_CONTACT * 100).toFixed(0)}%, Pole=${(prediction.probabilities.POLE_CONTACT * 100).toFixed(0)}%, Body=${(prediction.probabilities.BODY_CONTACT * 100).toFixed(0)}%, Other=${(prediction.probabilities.OTHER_CONTACT * 100).toFixed(0)}%`
        : 'Inference model',
    },
    {
      num: 6,
      title: 'Localization & Decision',
      desc: 'Contact flag, spatial zone classification (Left / Center / Right), and confidence',
      badge: prediction?.contact_detected ? 'Contact Found' : 'Clean',
      detail: prediction?.fusion_reasoning || 'Coordinated decision',
    },
    {
      num: 7,
      title: 'Training Analytics Update',
      desc: 'Persistent logging to SQLite database & real-time failure pattern detection',
      badge: 'Logged',
      detail: 'Historical comparison, coach diagnostics, and biomechanical feedback',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">
            Core Processing Pipeline Execution Trace
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end signal processing and machine-learning decision chain
          </p>
        </div>
        {timings && (
          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/60">
            Total Pipeline Latency: {timings.totalMs} ms
          </span>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 ml-3"
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* Step Sequence */}
      <div className="mt-4 space-y-2.5">
        {steps.map((st) => (
          <div
            key={st.num}
            className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-950/50 p-2.5 text-xs transition-colors"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-700/60 font-mono font-bold text-cyan-300 text-[11px]">
              {st.num}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{st.title}</span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {st.badge}
                </span>
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">{st.desc}</div>
              <div className="mt-1 font-mono text-[11px] text-slate-300 bg-slate-900/70 p-1.5 rounded border border-slate-800/50 break-words">
                {st.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
