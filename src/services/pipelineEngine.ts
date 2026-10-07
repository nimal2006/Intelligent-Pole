/**
 * Intelligent Pole-Vault Crossbar - Pipeline Orchestrator
 * Connects:
 *   Sensor Data -> Signal Processing -> Feature Extraction -> Sensor Fusion -> ML Classifier -> Localization -> Analytics
 */

import {
  SimulationScenario,
  SensorSample,
  SensorFeatureVector,
  PredictionResult,
  AttemptRecord,
  ContactType,
  ContactLocation,
} from '../types/poleVault';
import { simulateSensorReadings } from './simulator';
import { extractFeatureVector } from './featureExtraction';
import { runSensorFusion } from './sensorFusion';
import { classifyContactFeatures } from './classifier';
import { saveAttemptToStorage, getStoredAttempts, computeTrainingAnalytics } from './storage';

export interface PipelineExecutionResult {
  attempt: AttemptRecord;
  readings: SensorSample[];
  features: SensorFeatureVector;
  prediction: PredictionResult;
  diagnostics: Record<string, any>;
  stepTimings: {
    simulationMs: number;
    processingMs: number;
    fusionMs: number;
    mlMs: number;
    totalMs: number;
  };
}

export function executeFullPipeline(
  scenario: SimulationScenario,
  athleteId = 'ATH-001',
  athleteName = 'Elena Rostova',
  sampleRateHz = 1000
): PipelineExecutionResult {
  const t0 = performance.now();

  // 1. Sensor Data Simulation
  const { samples, nominalImpactX } = simulateSensorReadings(scenario, 2.0, sampleRateHz);
  const t1 = performance.now();

  // 2. Digital Signal Processing & Feature Extraction
  const { features, diagnostics } = extractFeatureVector(samples, sampleRateHz);
  const t2 = performance.now();

  // 3. Sensor Fusion Layer
  const fusion = runSensorFusion(features);
  const t3 = performance.now();

  // 4. ML Classifier (Random Forest Ensemble)
  const mlOutput = classifyContactFeatures(features);
  const t4 = performance.now();

  // 5. Decision Synthesis & Continuous Localization
  let contactDetected = false;
  let contactType: ContactType = 'NO_CONTACT';
  let location: ContactLocation = 'NONE';
  let isSuccess = true;
  let confidence = 0.98;

  if (!fusion.impact_present || mlOutput.contact_type === 'NO_CONTACT') {
    contactDetected = false;
    contactType = 'NO_CONTACT';
    location = 'NONE';
    confidence = Math.max(fusion.confidence, mlOutput.confidence);
    isSuccess = true;
  } else {
    contactDetected = true;
    contactType = mlOutput.contact_type;
    location = fusion.location;
    // Harmonic mean / weighted confidence of spatial localization & ML classification
    confidence = Number((0.55 * mlOutput.confidence + 0.45 * fusion.confidence).toFixed(2));
    isSuccess = false;
  }

  const prediction: PredictionResult = {
    contact_detected: contactDetected,
    contact_type: contactType,
    location,
    estimated_x_m: fusion.estimated_x_m,
    confidence,
    sensor_response: {
      p1: features.p1_peak,
      p2: features.p2_peak,
      p3: features.p3_peak,
      sg1: features.sg1_peak,
      sg2: features.sg2_peak,
      imu_accel: features.imu_acceleration,
      imu_gyro: features.imu_angular_velocity,
    },
    features,
    probabilities: mlOutput.probabilities,
    fusion_reasoning: fusion.fusion_reasoning,
  };

  const existingAttempts = getStoredAttempts();
  const nextNum = existingAttempts.length + 1;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // Downsample to 120 samples for instant smooth chart rendering
  const step = Math.max(1, Math.floor(samples.length / 120));
  const downsampledReadings: SensorSample[] = [];
  for (let i = 0; i < samples.length; i += step) {
    downsampledReadings.push(samples[i]);
  }

  const attempt: AttemptRecord = {
    id: Date.now(),
    attempt_number: nextNum,
    athlete_id: athleteId,
    athlete_name: athleteName,
    timestamp: timestampStr,
    scenario,
    contact_detected: contactDetected,
    contact_type: contactType,
    location,
    estimated_x_m: fusion.estimated_x_m,
    confidence,
    is_success: isSuccess,
    features,
    sensor_response: prediction.sensor_response,
    fusion_reasoning: fusion.fusion_reasoning,
    readings: downsampledReadings,
  };

  saveAttemptToStorage(attempt);

  const t5 = performance.now();

  return {
    attempt,
    readings: downsampledReadings,
    features,
    prediction,
    diagnostics,
    stepTimings: {
      simulationMs: Number((t1 - t0).toFixed(2)),
      processingMs: Number((t2 - t1).toFixed(2)),
      fusionMs: Number((t3 - t2).toFixed(2)),
      mlMs: Number((t4 - t3).toFixed(2)),
      totalMs: Number((t5 - t0).toFixed(2)),
    },
  };
}
