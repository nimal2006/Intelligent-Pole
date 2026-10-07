/**
 * Intelligent Pole-Vault Crossbar - Feature Extraction (TypeScript)
 * Extracts the 10-dimensional multimodal feature vector:
 * [p1_peak, p2_peak, p3_peak, sg1_peak, sg2_peak, imu_accel, imu_gyro, energy, freq, duration]
 */

import { SensorSample, SensorFeatureVector } from '../types/poleVault';
import {
  removeDCOffset,
  movingAverageFilter,
  detectPeaks,
  calculateRMS,
  calculateEnergy,
  calculateDominantFrequency,
  estimateImpactTimingAndDuration
} from './signalProcessing';

export function extractFeatureVector(
  samples: SensorSample[],
  sampleRateHz = 1000
): { features: SensorFeatureVector; diagnostics: Record<string, any> } {
  if (samples.length === 0) {
    return {
      features: {
        p1_peak: 0,
        p2_peak: 0,
        p3_peak: 0,
        sg1_peak: 0,
        sg2_peak: 0,
        imu_acceleration: 0,
        imu_angular_velocity: 0,
        energy: 0,
        frequency: 0,
        duration: 0,
      },
      diagnostics: {},
    };
  }

  const p1Raw = samples.map((s) => s.p1);
  const p2Raw = samples.map((s) => s.p2);
  const p3Raw = samples.map((s) => s.p3);
  const sg1Raw = samples.map((s) => s.sg1);
  const sg2Raw = samples.map((s) => s.sg2);
  const ax = samples.map((s) => s.ax);
  const ay = samples.map((s) => s.ay);
  const az = samples.map((s) => s.az);
  const gx = samples.map((s) => s.gx);
  const gy = samples.map((s) => s.gy);
  const gz = samples.map((s) => s.gz);

  // Filter piezo channels
  const p1Filt = movingAverageFilter(removeDCOffset(p1Raw), 5);
  const p2Filt = movingAverageFilter(removeDCOffset(p2Raw), 5);
  const p3Filt = movingAverageFilter(removeDCOffset(p3Raw), 5);

  // Baseline strain removal
  const sg1Base = sg1Raw.slice(0, 100).reduce((a, b) => a + b, 0) / Math.min(100, sg1Raw.length || 1);
  const sg2Base = sg2Raw.slice(0, 100).reduce((a, b) => a + b, 0) / Math.min(100, sg2Raw.length || 1);
  const sg1Dyn = sg1Raw.map((v) => Math.abs(v - sg1Base));
  const sg2Dyn = sg2Raw.map((v) => Math.abs(v - sg2Base));

  // IMU dynamic magnitude (subtract 9.81 from vertical Z)
  const accelMag: number[] = [];
  const gyroMag: number[] = [];
  for (let i = 0; i < samples.length; i++) {
    const a = Math.sqrt(ax[i] * ax[i] + ay[i] * ay[i] + Math.pow(az[i] - 9.81, 2));
    const g = Math.sqrt(gx[i] * gx[i] + gy[i] * gy[i] + gz[i] * gz[i]);
    accelMag.push(a);
    gyroMag.push(g);
  }

  // 1-3. Piezo peaks
  const p1_peak = Math.max(...p1Filt.map(Math.abs), 0);
  const p2_peak = Math.max(...p2Filt.map(Math.abs), 0);
  const p3_peak = Math.max(...p3Filt.map(Math.abs), 0);

  // 4-5. Strain peaks
  const sg1_peak = Math.max(...sg1Dyn, 0);
  const sg2_peak = Math.max(...sg2Dyn, 0);

  // 6-7. IMU dynamic peaks
  const imu_acceleration = Math.max(...accelMag, 0);
  const imu_angular_velocity = Math.max(...gyroMag, 0);

  // 8. Total energy
  const e1 = calculateEnergy(p1Filt);
  const e2 = calculateEnergy(p2Filt);
  const e3 = calculateEnergy(p3Filt);
  const energy = e1 + e2 + e3 + (sg1_peak + sg2_peak) * 0.1;

  // 9. Dominant frequency
  let strongestPiezo = p2Filt;
  if (p1_peak > p2_peak && p1_peak > p3_peak) strongestPiezo = p1Filt;
  else if (p3_peak > p2_peak && p3_peak > p1_peak) strongestPiezo = p3Filt;

  const { dominantFreq } = calculateDominantFrequency(strongestPiezo, sampleRateHz);

  // 10. Impact duration
  let { durationS } = estimateImpactTimingAndDuration(strongestPiezo, sampleRateHz);
  if (durationS === 0 && (sg1_peak > 80 || imu_acceleration > 4.0)) {
    const fallback = estimateImpactTimingAndDuration(accelMag, sampleRateHz);
    durationS = fallback.durationS;
  }

  const features: SensorFeatureVector = {
    p1_peak: Number(p1_peak.toFixed(4)),
    p2_peak: Number(p2_peak.toFixed(4)),
    p3_peak: Number(p3_peak.toFixed(4)),
    sg1_peak: Number(sg1_peak.toFixed(2)),
    sg2_peak: Number(sg2_peak.toFixed(2)),
    imu_acceleration: Number(imu_acceleration.toFixed(3)),
    imu_angular_velocity: Number(imu_angular_velocity.toFixed(3)),
    energy: Number(energy.toFixed(2)),
    frequency: Number(dominantFreq.toFixed(1)),
    duration: Number(durationS.toFixed(4)),
  };

  const diagnostics = {
    rms: {
      p1: Number(calculateRMS(p1Filt).toFixed(4)),
      p2: Number(calculateRMS(p2Filt).toFixed(4)),
      p3: Number(calculateRMS(p3Filt).toFixed(4)),
      sg1: Number(calculateRMS(sg1Dyn).toFixed(2)),
      sg2: Number(calculateRMS(sg2Dyn).toFixed(2)),
    },
    peaks: {
      p1: detectPeaks(p1Filt, 0.15).peakIndices.length,
      p2: detectPeaks(p2Filt, 0.15).peakIndices.length,
      p3: detectPeaks(p3Filt, 0.15).peakIndices.length,
    },
  };

  return { features, diagnostics };
}
