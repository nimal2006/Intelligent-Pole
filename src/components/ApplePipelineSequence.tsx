/**
 * Apple-inspired AI Analysis Pipeline
 * Horizontal sequence: SENSORS → SIGNAL PROCESSING → FEATURE EXTRACTION → SENSOR FUSION → CLASSIFIER → RESULT
 * Smooth sequential illumination with intelligent yellow (#FFD60A) glow and check states.
 */

import React from 'react';
import { motion } from 'motion/react';

interface ApplePipelineSequenceProps {
  currentStepIndex: number; // 0 to 5, or -1 when idle
  isSimulating: boolean;
  stepMessage?: string;
  totalMs?: number;
}

export const ApplePipelineSequence: React.FC<ApplePipelineSequenceProps> = ({
  currentStepIndex,
  isSimulating,
  stepMessage,
  totalMs,
}) => {
  const stages = [
    { id: 'sensors', name: 'Sensors', desc: '1,000 Hz ADC Stream' },
    { id: 'dsp', name: 'Signal Processing', desc: 'Butterworth Bandpass' },
    { id: 'features', name: 'Feature Extraction', desc: '10-D Physical Vector' },
    { id: 'fusion', name: 'Sensor Fusion', desc: 'Spatial Wave Centroid' },
    { id: 'classifier', name: 'Classifier', desc: 'Random Forest Ensemble' },
    { id: 'result', name: 'Result', desc: 'Localization & Insight' },
  ];

  return (
    <div className="apple-card p-8 sm:p-10 space-y-6">
      {/* Title & Pipeline Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase">
            AI Analysis Pipeline
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
            Deterministic digital signal processing fused with random forest classification
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {isSimulating ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A] text-[#0A0A0A] font-bold">
              <span className="h-2 w-2 rounded-full bg-[#FFD60A] animate-ping" />
              <span>{stepMessage || 'Processing Pipeline...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#6E6E73]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
              <span>Pipeline Latency: {totalMs ? `${totalMs} ms` : '< 5 ms'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Pipeline Sequence */}
      <div className="relative pt-3 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {stages.map((stage, idx) => {
            const isActive = isSimulating && currentStepIndex === idx;
            const isCompleted = !isSimulating || currentStepIndex > idx;
            const isPending = isSimulating && currentStepIndex < idx;

            return (
              <motion.div
                key={stage.id}
                animate={{
                  scale: isActive ? 1.03 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-[#FFD60A] shadow-[0_0_20px_rgba(255,214,10,0.35)] ring-2 ring-[#FFD60A]'
                    : isCompleted
                    ? 'bg-[#FAFAFC] border-black/5 text-[#0A0A0A]'
                    : 'bg-white border-black/5 opacity-50'
                }`}
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-[#6E6E73]">
                    0{idx + 1}
                  </span>
                  {isCompleted && !isActive ? (
                    <span className="h-4 w-4 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  ) : isActive ? (
                    <span className="h-2 w-2 rounded-full bg-[#FFD60A] animate-ping" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-black/20" />
                  )}
                </div>

                <div>
                  <div
                    className={`text-xs font-extrabold tracking-tight ${
                      isActive ? 'text-[#0A0A0A]' : 'text-[#1D1D1F]'
                    }`}
                  >
                    {stage.name}
                  </div>
                  <div className="text-[10px] font-mono text-[#6E6E73] mt-1 leading-tight">
                    {stage.desc}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
