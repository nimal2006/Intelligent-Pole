/**
 * Intelligent Pole-Vault Crossbar - Sensor Fusion & Localization Engine (TypeScript)
 * Fuses P1 (1.125m), SG1 (1.650m), P2+IMU (2.250m), SG2 (2.850m), P3 (3.375m)
 */

import { SensorFeatureVector, ContactLocation } from '../types/poleVault';
import { SENSOR_POSITIONS } from './simulator';

export interface FusionOutput {
  impact_present: boolean;
  location: ContactLocation;
  estimated_x_m: number;
  confidence: number;
  dominant_sensor: string;
  spatial_weights: {
    left: number;
    center: number;
    right: number;
  };
  fusion_reasoning: string;
}

export function runSensorFusion(features: SensorFeatureVector): FusionOutput {
  const {
    p1_peak: p1,
    p2_peak: p2,
    p3_peak: p3,
    sg1_peak: sg1,
    sg2_peak: sg2,
    imu_acceleration: accel,
  } = features;

  const piezoMax = Math.max(p1, p2, p3);
  const strainMax = Math.max(sg1, sg2);

  // 1. Multimodal impact gate
  const impactDetected =
    (piezoMax >= 0.50 && (strainMax >= 25.0 || accel >= 1.5)) ||
    (strainMax >= 120.0 && accel >= 2.0) ||
    piezoMax >= 1.20;

  if (!impactDetected) {
    return {
      impact_present: false,
      location: 'NONE',
      estimated_x_m: 2.25,
      confidence: 0.98,
      dominant_sensor: 'NONE',
      spatial_weights: { left: 0, center: 0, right: 0 },
      fusion_reasoning: 'Multi-sensor baseline check: readings within clean clearance thresholds (no impact).',
    };
  }

  // 2. Spatial weighting along 4.50m beam
  const w_p1 = Math.max(0.01, Math.pow(p1, 1.8));
  const w_sg1 = Math.max(0.01, Math.pow(sg1 / 80.0, 1.5));
  const w_p2 = Math.max(0.01, Math.pow(p2, 1.8));
  const w_sg2 = Math.max(0.01, Math.pow(sg2 / 80.0, 1.5));
  const w_p3 = Math.max(0.01, Math.pow(p3, 1.8));

  const totalW = w_p1 + w_sg1 + w_p2 + w_sg2 + w_p3;

  const x_est =
    (w_p1 * SENSOR_POSITIONS.P1 +
      w_sg1 * SENSOR_POSITIONS.SG1 +
      w_p2 * SENSOR_POSITIONS.P2 +
      w_sg2 * SENSOR_POSITIONS.SG2 +
      w_p3 * SENSOR_POSITIONS.P3) /
    totalW;

  // Regional probability mass
  const leftMass = (w_p1 * 1.5 + w_sg1 * 0.8) / totalW;
  const centerMass = (w_p2 * 1.6 + (w_sg1 + w_sg2) * 0.3) / totalW;
  const rightMass = (w_p3 * 1.5 + w_sg2 * 0.8) / totalW;

  const massSum = leftMass + centerMass + rightMass;
  const leftProb = leftMass / massSum;
  const centerProb = centerMass / massSum;
  const rightProb = rightMass / massSum;

  let location: ContactLocation = 'CENTER';
  let locConf = centerProb;
  let dominantSensor = 'P2/IMU';

  if (x_est < 1.875) {
    location = 'LEFT';
    locConf = leftProb;
    dominantSensor = p1 >= w_sg1 ? 'P1' : 'SG1';
  } else if (x_est > 2.625) {
    location = 'RIGHT';
    locConf = rightProb;
    dominantSensor = p3 >= w_sg2 ? 'P3' : 'SG2';
  }

  // Cross-sensor concordance bonus
  let concordance = 1.0;
  if (location === 'LEFT' && p1 > p2 && p1 > p3 && sg1 >= sg2 * 0.9) {
    concordance = 1.15;
  } else if (location === 'RIGHT' && p3 > p2 && p3 > p1 && sg2 >= sg1 * 0.9) {
    concordance = 1.15;
  } else if (location === 'CENTER' && p2 > p1 && p2 > p3) {
    concordance = 1.15;
  }

  const finalConfidence = Math.min(0.99, Math.max(0.65, locConf * concordance));

  const reasoning =
    `Spatial centroid estimated at ${x_est.toFixed(2)}m along 4.5m beam. ` +
    `Dominant response: ${dominantSensor} (P1=${p1.toFixed(2)}V, P2=${p2.toFixed(2)}V, P3=${p3.toFixed(2)}V, ` +
    `SG1=${sg1.toFixed(1)}με, SG2=${sg2.toFixed(1)}με). Multi-sensor concordance: ${(finalConfidence * 100).toFixed(1)}%.`;

  return {
    impact_present: true,
    location,
    estimated_x_m: Number(x_est.toFixed(2)),
    confidence: Number(finalConfidence.toFixed(2)),
    dominant_sensor: dominantSensor,
    spatial_weights: {
      left: Number(leftProb.toFixed(3)),
      center: Number(centerProb.toFixed(3)),
      right: Number(rightProb.toFixed(3)),
    },
    fusion_reasoning: reasoning,
  };
}
