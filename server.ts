/**
 * Intelligent Pole-Vault Crossbar - Full-Stack Express Server
 * Serves the REST API endpoints and mounts Vite middleware on Port 3000.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import our TypeScript mathematical pipeline engines
import { simulateSensorReadings, SENSOR_POSITIONS, CROSSBAR_LENGTH } from './src/services/simulator';
import { extractFeatureVector } from './src/services/featureExtraction';
import { runSensorFusion } from './src/services/sensorFusion';
import { classifyContactFeatures } from './src/services/classifier';
import { SimulationScenario, AttemptRecord } from './src/types/poleVault';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory / JSON persistence storage for server attempt history
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'attempts_server.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadServerAttempts(): AttemptRecord[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading server attempts', e);
  }
  return [];
}

function saveServerAttempt(att: AttemptRecord) {
  try {
    const list = loadServerAttempts();
    list.unshift(att);
    fs.writeFileSync(DB_FILE, JSON.stringify(list.slice(0, 100), null, 2));
  } catch (e) {
    console.error('Error saving server attempt', e);
  }
}

// ============================================================
// REST API ENDPOINTS
// ============================================================

// 1. Health check
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'Intelligent Pole-Vault Crossbar Multimodal Sensor Pipeline',
    crossbar_length_m: CROSSBAR_LENGTH,
    sensors: {
      P1: `${SENSOR_POSITIONS.P1}m (Piezoelectric Sensor 1)`,
      SG1: `${SENSOR_POSITIONS.SG1}m (Strain Gauge 1)`,
      P2: `${SENSOR_POSITIONS.P2}m (Piezoelectric Sensor 2)`,
      IMU: `${SENSOR_POSITIONS.IMU}m (6-DOF IMU Linear Accel & Gyro)`,
      SG2: `${SENSOR_POSITIONS.SG2}m (Strain Gauge 2)`,
      P3: `${SENSOR_POSITIONS.P3}m (Piezoelectric Sensor 3)`,
    },
    sampling_rate_hz: 1000,
    classifier: 'Random Forest Multimodal Ensemble (4 Classes)',
  });
};
app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// 2. Simulate sensor data
const handleSimulate = (req: Request, res: Response) => {
  try {
    const scenario: SimulationScenario = req.body?.scenario || 'POLE_CENTER';
    const durationS = req.body?.duration_s || 2.0;
    const sampleRateHz = req.body?.sample_rate_hz || 1000;
    const noiseLevel = req.body?.noise_level || 0.02;

    const { samples, nominalImpactX, contactSource } = simulateSensorReadings(
      scenario,
      durationS,
      sampleRateHz,
      noiseLevel
    );

    res.json({
      scenario,
      sample_count: samples.length,
      duration_s: durationS,
      sample_rate_hz: sampleRateHz,
      readings: samples,
      metadata: {
        nominal_impact_position_m: nominalImpactX,
        contact_source: contactSource,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
app.post('/simulate', handleSimulate);
app.post('/api/simulate', handleSimulate);

// 3. Process signal
const handleProcessSignal = (req: Request, res: Response) => {
  try {
    const readings = req.body?.readings || [];
    const sampleRateHz = req.body?.sample_rate_hz || 1000;
    const { features, diagnostics } = extractFeatureVector(readings, sampleRateHz);
    res.json({ features, diagnostics });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
app.post('/process-signal', handleProcessSignal);
app.post('/api/process-signal', handleProcessSignal);

// 4. Predict
const handlePredict = (req: Request, res: Response) => {
  try {
    const features = req.body;
    const fusion = runSensorFusion(features);
    const ml = classifyContactFeatures(features);

    let contactDetected = false;
    let contactType = 'NO_CONTACT';
    let location = 'NONE';
    let confidence = 0.98;

    if (!fusion.impact_present || ml.contact_type === 'NO_CONTACT') {
      contactDetected = false;
      contactType = 'NO_CONTACT';
      location = 'NONE';
      confidence = Math.max(fusion.confidence, ml.confidence);
    } else {
      contactDetected = true;
      contactType = ml.contact_type;
      location = fusion.location;
      confidence = Number((0.55 * ml.confidence + 0.45 * fusion.confidence).toFixed(2));
    }

    res.json({
      contact_detected: contactDetected,
      contact_type: contactType,
      location,
      confidence,
      estimated_x_m: fusion.estimated_x_m,
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
      probabilities: ml.probabilities,
      decision_reasoning: fusion.fusion_reasoning,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
app.post('/predict', handlePredict);
app.post('/api/predict', handlePredict);

// 5. Analyze Attempt (End-to-End)
const handleAnalyzeAttempt = (req: Request, res: Response) => {
  try {
    const scenario: SimulationScenario = (req.query?.scenario as SimulationScenario) || req.body?.scenario || 'POLE_CENTER';
    const athleteId = (req.query?.athlete_id as string) || req.body?.athlete_id || 'ATH-001';

    // 1. Simulate
    const { samples } = simulateSensorReadings(scenario, 2.0, 1000);
    // 2. Feature Extraction
    const { features, diagnostics } = extractFeatureVector(samples, 1000);
    // 3. Fusion
    const fusion = runSensorFusion(features);
    // 4. ML
    const ml = classifyContactFeatures(features);

    let contactDetected = false;
    let contactType = 'NO_CONTACT';
    let location = 'NONE';
    let confidence = 0.98;
    let isSuccess = true;

    if (!fusion.impact_present || ml.contact_type === 'NO_CONTACT') {
      contactDetected = false;
      contactType = 'NO_CONTACT';
      location = 'NONE';
      confidence = Math.max(fusion.confidence, ml.confidence);
      isSuccess = true;
    } else {
      contactDetected = true;
      contactType = ml.contact_type;
      location = fusion.location;
      confidence = Number((0.55 * ml.confidence + 0.45 * fusion.confidence).toFixed(2));
      isSuccess = false;
    }

    const nextAttempt: AttemptRecord = {
      id: Date.now(),
      attempt_number: loadServerAttempts().length + 1,
      athlete_id: athleteId,
      athlete_name: 'Elena Rostova',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      scenario,
      contact_detected: contactDetected,
      contact_type: contactType as any,
      location: location as any,
      estimated_x_m: fusion.estimated_x_m,
      confidence,
      is_success: isSuccess,
      features,
      sensor_response: {
        p1: features.p1_peak,
        p2: features.p2_peak,
        p3: features.p3_peak,
        sg1: features.sg1_peak,
        sg2: features.sg2_peak,
        imu_accel: features.imu_acceleration,
        imu_gyro: features.imu_angular_velocity,
      },
      fusion_reasoning: fusion.fusion_reasoning,
    };

    saveServerAttempt(nextAttempt);

    // Downsample readings for chart
    const step = Math.max(1, Math.floor(samples.length / 120));
    const downsampled = [];
    for (let i = 0; i < samples.length; i += step) {
      downsampled.push(samples[i]);
    }

    res.json({
      attempt: nextAttempt,
      readings: downsampled,
      diagnostics,
      probabilities: ml.probabilities,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
app.post('/analyze-attempt', handleAnalyzeAttempt);
app.post('/api/analyze-attempt', handleAnalyzeAttempt);

// 6. Attempts list
const handleGetAttempts = (_req: Request, res: Response) => {
  res.json(loadServerAttempts());
};
app.get('/attempts', handleGetAttempts);
app.get('/api/attempts', handleGetAttempts);

// 7. Attempt by ID
const handleGetAttemptById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const att = loadServerAttempts().find((a) => a.id === id);
  if (!att) return res.status(404).json({ error: 'Attempt not found' });
  res.json(att);
};
app.get('/attempts/:id', handleGetAttemptById);
app.get('/api/attempts/:id', handleGetAttemptById);

// 8. Analytics & Training summary
const handleAnalytics = (_req: Request, res: Response) => {
  const attempts = loadServerAttempts();
  const total = attempts.length;
  const successes = attempts.filter((a) => a.is_success).length;
  const fails = total - successes;

  res.json({
    total_attempts: total,
    successful_attempts: successes,
    failed_attempts: fails,
    success_rate_pct: total > 0 ? Number(((successes / total) * 100).toFixed(1)) : 0,
    pole_contacts: attempts.filter((a) => a.contact_type === 'POLE_CONTACT').length,
    body_contacts: attempts.filter((a) => a.contact_type === 'BODY_CONTACT').length,
    other_contacts: attempts.filter((a) => a.contact_type === 'OTHER_CONTACT').length,
    left_contacts: attempts.filter((a) => a.location === 'LEFT').length,
    center_contacts: attempts.filter((a) => a.location === 'CENTER').length,
    right_contacts: attempts.filter((a) => a.location === 'RIGHT').length,
    recommendations: [
      'Focus on early pole release before bar inversion.',
      'Check approach plant alignment relative to runway center line.',
    ],
  });
};
app.get('/analytics', handleAnalytics);
app.get('/api/analytics', handleAnalytics);
app.get('/training-summary', handleAnalytics);
app.get('/api/training-summary', handleAnalytics);

// 9. Apache Spark & Scala Telemetry / Job Simulation Engine
const handleSparkJobSimulation = (req: Request, res: Response) => {
  const scenario = (req.body?.scenario || 'POLE_CENTER') as SimulationScenario;
  const { samples } = simulateSensorReadings(scenario);

  // Partition sensor readings by crossbar zone
  const p0Samples = samples.filter((s) => s.p1 > 0.05 || s.sg1 > 10);
  const p1Samples = samples.filter((s) => s.p2 > 0.05 || Math.abs(s.az - 9.81) > 0.5);
  const p2Samples = samples.filter((s) => s.p3 > 0.05 || s.sg2 > 10);

  // Mathematical Centroid (Spark UDF equivalent)
  const maxP1 = Math.max(...samples.map((s) => s.p1));
  const maxP2 = Math.max(...samples.map((s) => s.p2));
  const maxP3 = Math.max(...samples.map((s) => s.p3));
  const sumW = maxP1 + maxP2 + maxP3 + 1e-5;
  const estimatedX = (maxP1 * 1.125 + maxP2 * 2.25 + maxP3 * 3.375) / sumW;

  const zone = estimatedX < 1.875 ? 'LEFT' : estimatedX <= 2.625 ? 'CENTER' : 'RIGHT';
  const isClearance = scenario === 'CLEARANCE';
  const contactType = isClearance
    ? 'NO_CONTACT'
    : scenario.startsWith('POLE')
    ? 'POLE_CONTACT'
    : scenario.startsWith('BODY')
    ? 'BODY_CONTACT'
    : 'OTHER_CONTACT';

  res.json({
    status: 'SUCCESS',
    sparkVersion: '3.5.1',
    scalaVersion: '2.12.18',
    appName: 'PoleVault-Spark-Structured-Streaming',
    jobId: `job_${Date.now()}`,
    batchId: Math.floor(Math.random() * 9000) + 1000,
    recordsProcessed: samples.length,
    samplingRateHz: 1000,
    executionTimeMs: Math.floor(Math.random() * 20) + 32, // Realistic micro-batch latency ~32-52ms
    watermarkDelayMs: 500,
    windowSizeMs: 200,
    windowSlideMs: 50,
    partitions: [
      {
        id: 0,
        sector: 'LEFT [0.0 - 1.875m]',
        sensors: ['P1 (1.125m)', 'SG1 (1.650m)'],
        records: p0Samples.length,
        peakVoltageV: Number(maxP1.toFixed(3)),
        status: 'COMPLETED',
      },
      {
        id: 1,
        sector: 'CENTER [1.875 - 2.625m]',
        sensors: ['P2 (2.250m)', 'IMU (2.250m)'],
        records: p1Samples.length,
        peakVoltageV: Number(maxP2.toFixed(3)),
        status: 'COMPLETED',
      },
      {
        id: 2,
        sector: 'RIGHT [2.625 - 4.500m]',
        sensors: ['SG2 (2.850m)', 'P3 (3.375m)'],
        records: p2Samples.length,
        peakVoltageV: Number(maxP3.toFixed(3)),
        status: 'COMPLETED',
      },
    ],
    dagStages: [
      {
        stageId: 0,
        name: 'ParallelCollectionRDD / KafkaRateStream',
        type: 'NARROW',
        tasks: 3,
        shuffleBytes: '0 KB',
        durationMs: 9,
      },
      {
        stageId: 1,
        name: 'WindowedSensorAggregation & CentroidUDF',
        type: 'WIDE_SHUFFLE',
        tasks: 3,
        shuffleBytes: '38.4 KB',
        durationMs: 18,
      },
      {
        stageId: 2,
        name: 'MLlibRandomForestClassifier.predict()',
        type: 'RESULT_STAGE',
        tasks: 1,
        shuffleBytes: '4.2 KB',
        durationMs: 11,
      },
    ],
    result: {
      isSuccess: isClearance,
      contactType,
      location: zone,
      estimatedXMeters: Number(estimatedX.toFixed(3)),
      confidence: isClearance ? 0.99 : 0.94,
      p1Peak: Number(maxP1.toFixed(3)),
      p2Peak: Number(maxP2.toFixed(3)),
      p3Peak: Number(maxP3.toFixed(3)),
    },
  });
};

app.post('/api/spark/simulate-job', handleSparkJobSimulation);
app.get('/api/spark/simulate-job', handleSparkJobSimulation);


// ============================================================
// VITE INTEGRATION
// ============================================================
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Intelligent Pole-Vault Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
