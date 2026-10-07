/**
 * Intelligent Pole-Vault Crossbar - ML Classifier (TypeScript)
 * Implements the Random Forest ensemble decision rules for contact classification:
 *   0 = NO_CONTACT
 *   1 = POLE_CONTACT
 *   2 = BODY_CONTACT
 *   3 = OTHER_CONTACT
 */

import { ContactType, SensorFeatureVector } from '../types/poleVault';

export interface ClassificationOutput {
  contact_type: ContactType;
  confidence: number;
  probabilities: Record<ContactType, number>;
}

export function classifyContactFeatures(features: SensorFeatureVector): ClassificationOutput {
  const {
    p1_peak: p1,
    p2_peak: p2,
    p3_peak: p3,
    sg1_peak: sg1,
    sg2_peak: sg2,
    imu_acceleration: accel,
    imu_angular_velocity: gyro,
    energy,
    frequency: freq,
    duration,
  } = features;

  const piezoMax = Math.max(p1, p2, p3);
  const strainMax = Math.max(sg1, sg2);

  // 1. Clean clearance check
  if (piezoMax < 0.45 && strainMax < 45.0 && accel < 1.8) {
    return {
      contact_type: 'NO_CONTACT',
      confidence: 0.96,
      probabilities: {
        NO_CONTACT: 0.96,
        POLE_CONTACT: 0.01,
        BODY_CONTACT: 0.01,
        OTHER_CONTACT: 0.02,
      },
    };
  }

  // 2. Score candidate classes based on physical features
  // POLE CONTACT: High piezo impulse (>1.8V), high frequency (>180Hz), short duration (<0.09s), sharp recoil
  let poleScore = 0.0;
  if (piezoMax >= 2.0) poleScore += 0.35;
  else if (piezoMax >= 1.0) poleScore += 0.20;

  if (freq >= 200.0) poleScore += 0.30;
  else if (freq >= 120.0) poleScore += 0.15;

  if (duration >= 0.005 && duration <= 0.090) poleScore += 0.25;
  else if (duration <= 0.150) poleScore += 0.10;

  if (accel >= 8.0 || gyro >= 3.5) poleScore += 0.10;

  // BODY CONTACT: High strain deformation (>300με), low frequency (<110Hz), longer duration (>0.12s)
  let bodyScore = 0.0;
  if (strainMax >= 400.0) bodyScore += 0.45;
  else if (strainMax >= 200.0) bodyScore += 0.25;

  if (duration >= 0.120) bodyScore += 0.25;
  else if (duration >= 0.080) bodyScore += 0.15;

  if (freq <= 110.0 && freq > 0) bodyScore += 0.20;
  if (gyro >= 6.0) bodyScore += 0.10;

  // OTHER CONTACT: Low-to-moderate piezo, moderate strain, non-harmonic frequency
  let otherScore = 0.0;
  if (piezoMax >= 0.45 && piezoMax < 1.8 && strainMax < 180.0) otherScore += 0.40;
  if (freq >= 80.0 && freq <= 180.0) otherScore += 0.25;
  if (energy < 400.0) otherScore += 0.20;
  if (accel < 7.0 && gyro < 4.0) otherScore += 0.15;

  // Softmax normalization
  const noContactScore = 0.02;
  const raw = [noContactScore, Math.max(0.01, poleScore), Math.max(0.01, bodyScore), Math.max(0.01, otherScore)];
  const scale = 3.6;
  const exps = raw.map((s) => Math.exp(s * scale));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sumExp);

  const classes: ContactType[] = ['NO_CONTACT', 'POLE_CONTACT', 'BODY_CONTACT', 'OTHER_CONTACT'];
  let maxIdx = 0;
  for (let i = 1; i < 4; i++) {
    if (probs[i] > probs[maxIdx]) maxIdx = i;
  }

  const chosenType = classes[maxIdx];
  const conf = probs[maxIdx];

  return {
    contact_type: chosenType,
    confidence: Number(conf.toFixed(3)),
    probabilities: {
      NO_CONTACT: Number(probs[0].toFixed(3)),
      POLE_CONTACT: Number(probs[1].toFixed(3)),
      BODY_CONTACT: Number(probs[2].toFixed(3)),
      OTHER_CONTACT: Number(probs[3].toFixed(3)),
    },
  };
}
