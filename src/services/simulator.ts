/**
 * Intelligent Pole-Vault Crossbar - Sensor Data Simulator (TypeScript Engine)
 * Physics model for 4.50m beam with multimodal sensors:
 *   P1: 1.125m | SG1: 1.650m | P2: 2.250m | IMU: 2.250m | SG2: 2.850m | P3: 3.375m
 */

import { SensorSample, SimulationScenario } from '../types/poleVault';

export const CROSSBAR_LENGTH = 4.50; // meters

export const SENSOR_POSITIONS = {
  P1: 1.125,
  SG1: 1.650,
  P2: 2.250,
  IMU: 2.250,
  SG2: 2.850,
  P3: 3.375,
} as const;

const WAVE_VELOCITY = 3200.0; // m/s flexural stress wave velocity

function randGaussian(mean = 0, std = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function simulateSensorReadings(
  scenario: SimulationScenario,
  durationS = 2.0,
  sampleRateHz = 1000,
  noiseLevel = 0.02,
  contactTimeS = 0.85
): { samples: SensorSample[]; nominalImpactX: number; contactSource: string } {
  const totalSamples = Math.floor(durationS * sampleRateHz);
  const samples: SensorSample[] = [];

  // Determine nominal physical impact position on 4.5m bar
  let nominalImpactX = 2.25;
  let contactSource = 'NONE';

  switch (scenario) {
    case 'CLEARANCE':
      nominalImpactX = 2.25;
      contactSource = 'NONE';
      break;
    case 'POLE_LEFT':
      nominalImpactX = 1.18 + (Math.random() - 0.5) * 0.15;
      contactSource = 'POLE';
      break;
    case 'POLE_CENTER':
      nominalImpactX = 2.25 + (Math.random() - 0.5) * 0.15;
      contactSource = 'POLE';
      break;
    case 'POLE_RIGHT':
      nominalImpactX = 3.32 + (Math.random() - 0.5) * 0.15;
      contactSource = 'POLE';
      break;
    case 'BODY_CONTACT':
      nominalImpactX = 2.12 + (Math.random() - 0.5) * 0.35;
      contactSource = 'BODY';
      break;
    case 'OTHER_CONTACT':
      nominalImpactX = 0.75 + Math.random() * 3.0;
      contactSource = 'OTHER';
      break;
  }

  // Wave arrival delays
  const d_p1 = Math.abs(SENSOR_POSITIONS.P1 - nominalImpactX);
  const d_p2 = Math.abs(SENSOR_POSITIONS.P2 - nominalImpactX);
  const d_p3 = Math.abs(SENSOR_POSITIONS.P3 - nominalImpactX);
  const d_sg1 = Math.abs(SENSOR_POSITIONS.SG1 - nominalImpactX);
  const d_sg2 = Math.abs(SENSOR_POSITIONS.SG2 - nominalImpactX);
  const d_imu = Math.abs(SENSOR_POSITIONS.IMU - nominalImpactX);

  const t_p1 = contactTimeS + d_p1 / WAVE_VELOCITY;
  const t_p2 = contactTimeS + d_p2 / WAVE_VELOCITY;
  const t_p3 = contactTimeS + d_p3 / WAVE_VELOCITY;
  const t_sg1 = contactTimeS + d_sg1 / WAVE_VELOCITY;
  const t_sg2 = contactTimeS + d_sg2 / WAVE_VELOCITY;
  const t_imu = contactTimeS + d_imu / WAVE_VELOCITY;

  const amp_p1 = Math.exp(-0.75 * d_p1);
  const amp_p2 = Math.exp(-0.75 * d_p2);
  const amp_p3 = Math.exp(-0.75 * d_p3);

  // Simply supported beam bending moment factor
  const sg1_weight = (4.5 - Math.max(nominalImpactX, SENSOR_POSITIONS.SG1)) * Math.min(nominalImpactX, SENSOR_POSITIONS.SG1) / 2.25;
  const sg2_weight = (4.5 - Math.max(nominalImpactX, SENSOR_POSITIONS.SG2)) * Math.min(nominalImpactX, SENSOR_POSITIONS.SG2) / 2.25;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRateHz;

    // Ambient noise & slight 2.4Hz wind sway
    const ambientSway = 0.04 * Math.sin(2 * Math.PI * 2.4 * t);
    let p1 = randGaussian(0, noiseLevel * 0.2) + ambientSway * 0.08;
    let p2 = randGaussian(0, noiseLevel * 0.2) + ambientSway * 0.12;
    let p3 = randGaussian(0, noiseLevel * 0.2) + ambientSway * 0.08;

    let sg1 = randGaussian(12.0, noiseLevel * 1.5) + ambientSway * 8.0;
    let sg2 = randGaussian(11.8, noiseLevel * 1.5) + ambientSway * 8.0;

    let ax = randGaussian(0, noiseLevel * 0.3);
    let ay = randGaussian(0, noiseLevel * 0.3);
    let az = randGaussian(9.81, noiseLevel * 0.4) + ambientSway * 0.5;
    let gx = randGaussian(0, noiseLevel * 0.05);
    let gy = randGaussian(0, noiseLevel * 0.05);
    let gz = randGaussian(0, noiseLevel * 0.05);

    if (scenario === 'CLEARANCE') {
      // Clean passage: aerodynamic vortex shedding as athlete passes at t ~ 0.85s - 1.25s
      if (t >= 0.75 && t <= 1.35) {
        const flutter = Math.exp(-Math.pow(t - 1.0, 2) / 0.04) * 0.12 * Math.sin(2 * Math.PI * 5.2 * t);
        p2 += flutter * 0.4;
        sg1 += flutter * 12.0;
        sg2 += flutter * 12.0;
        az += flutter * 0.8;
      }
    } else if (contactSource === 'POLE') {
      // Rigid pole shock wave: 420 Hz, sharp envelope, fast decay (45/s)
      const freq = 420.0;
      const decay = 45.0;
      const peakV = 5.2;

      if (t >= t_p1) {
        const tau = t - t_p1;
        p1 += peakV * amp_p1 * Math.exp(-decay * tau) * Math.sin(2 * Math.PI * freq * tau);
      }
      if (t >= t_p2) {
        const tau = t - t_p2;
        p2 += peakV * amp_p2 * Math.exp(-decay * tau) * Math.sin(2 * Math.PI * freq * tau);
      }
      if (t >= t_p3) {
        const tau = t - t_p3;
        p3 += peakV * amp_p3 * Math.exp(-decay * tau) * Math.sin(2 * Math.PI * freq * tau);
      }

      // Strain gauge dynamic response
      if (t >= t_sg1) {
        const tau = t - t_sg1;
        sg1 += (280.0 * sg1_weight + 50.0) * Math.exp(-12.0 * tau) * Math.sin(2 * Math.PI * 32.0 * tau);
      }
      if (t >= t_sg2) {
        const tau = t - t_sg2;
        sg2 += (280.0 * sg2_weight + 50.0) * Math.exp(-12.0 * tau) * Math.sin(2 * Math.PI * 32.0 * tau);
      }

      // IMU center dynamics
      if (t >= t_imu) {
        const tau = t - t_imu;
        const imuAtten = Math.exp(-0.6 * d_imu);
        ay += 18.0 * imuAtten * Math.exp(-18.0 * tau) * Math.sin(2 * Math.PI * 85.0 * tau);
        az += 26.0 * imuAtten * Math.exp(-14.0 * tau) * Math.sin(2 * Math.PI * 48.0 * tau);
        gx += 9.5 * imuAtten * Math.exp(-16.0 * tau) * Math.sin(2 * Math.PI * 60.0 * tau);
        gz += 6.0 * imuAtten * Math.exp(-20.0 * tau) * Math.cos(2 * Math.PI * 75.0 * tau);
      }
    } else if (contactSource === 'BODY') {
      // Body contact: broad duration, massive bending strain (600-1200 με), 65 Hz oscillation
      const freq = 65.0;
      const decay = 14.0;
      const peakV = 3.1;

      if (t >= t_p1) {
        const tau = t - t_p1;
        p1 += peakV * amp_p1 * Math.exp(-decay * tau) * (0.7 * Math.sin(2 * Math.PI * freq * tau) + 0.3 * Math.sin(2 * Math.PI * 28 * tau));
      }
      if (t >= t_p2) {
        const tau = t - t_p2;
        p2 += peakV * amp_p2 * Math.exp(-decay * tau) * (0.7 * Math.sin(2 * Math.PI * freq * tau) + 0.3 * Math.sin(2 * Math.PI * 28 * tau));
      }
      if (t >= t_p3) {
        const tau = t - t_p3;
        p3 += peakV * amp_p3 * Math.exp(-decay * tau) * (0.7 * Math.sin(2 * Math.PI * freq * tau) + 0.3 * Math.sin(2 * Math.PI * 28 * tau));
      }

      if (t >= t_sg1) {
        const tau = t - t_sg1;
        sg1 += 650.0 * Math.exp(-4.5 * tau) * Math.sin(2 * Math.PI * 14.0 * tau + 0.4);
      }
      if (t >= t_sg2) {
        const tau = t - t_sg2;
        sg2 += 620.0 * Math.exp(-4.5 * tau) * Math.sin(2 * Math.PI * 14.0 * tau + 0.4);
      }

      if (t >= t_imu) {
        const tau = t - t_imu;
        ay += 12.0 * Math.exp(-6.0 * tau) * Math.sin(2 * Math.PI * 18.0 * tau);
        az += 38.0 * Math.exp(-5.0 * tau) * Math.sin(2 * Math.PI * 12.0 * tau);
        gx += 15.0 * Math.exp(-7.0 * tau) * Math.sin(2 * Math.PI * 15.0 * tau);
        gy += 7.0 * Math.exp(-8.0 * tau) * Math.cos(2 * Math.PI * 16.0 * tau);
      }
    } else if (contactSource === 'OTHER') {
      // Glancing tap, moderate vibration
      const freq = 140.0;
      const decay = 25.0;
      const peakV = 1.2;

      if (t >= t_p1) p1 += peakV * amp_p1 * Math.exp(-decay * (t - t_p1)) * Math.sin(2 * Math.PI * freq * (t - t_p1));
      if (t >= t_p2) p2 += peakV * amp_p2 * Math.exp(-decay * (t - t_p2)) * Math.sin(2 * Math.PI * freq * (t - t_p2));
      if (t >= t_p3) p3 += peakV * amp_p3 * Math.exp(-decay * (t - t_p3)) * Math.sin(2 * Math.PI * freq * (t - t_p3));

      if (t >= t_sg1) sg1 += 80.0 * Math.exp(-8.0 * (t - t_sg1)) * Math.sin(2 * Math.PI * 20.0 * (t - t_sg1));
      if (t >= t_sg2) sg2 += 60.0 * Math.exp(-8.0 * (t - t_sg2)) * Math.sin(2 * Math.PI * 20.0 * (t - t_sg2));

      if (t >= t_imu) {
        az += 6.5 * Math.exp(-10.0 * (t - t_imu)) * Math.sin(2 * Math.PI * 25.0 * (t - t_imu));
        gx += 3.2 * Math.exp(-12.0 * (t - t_imu)) * Math.sin(2 * Math.PI * 30.0 * (t - t_imu));
      }
    }

    samples.push({
      timestamp: Number(t.toFixed(4)),
      p1: Number(p1.toFixed(4)),
      p2: Number(p2.toFixed(4)),
      p3: Number(p3.toFixed(4)),
      sg1: Number(sg1.toFixed(2)),
      sg2: Number(sg2.toFixed(2)),
      ax: Number(ax.toFixed(3)),
      ay: Number(ay.toFixed(3)),
      az: Number(az.toFixed(3)),
      gx: Number(gx.toFixed(4)),
      gy: Number(gy.toFixed(4)),
      gz: Number(gz.toFixed(4)),
    });
  }

  return { samples, nominalImpactX, contactSource };
}
