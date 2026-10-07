/**
 * Intelligent Pole-Vault Crossbar - TypeScript Domain Types
 */

export type ContactType = 'NO_CONTACT' | 'POLE_CONTACT' | 'BODY_CONTACT' | 'OTHER_CONTACT';

export type ContactLocation = 'LEFT' | 'CENTER' | 'RIGHT' | 'NONE';

export type SimulationScenario =
  | 'CLEARANCE'
  | 'POLE_LEFT'
  | 'POLE_CENTER'
  | 'POLE_RIGHT'
  | 'BODY_CONTACT'
  | 'OTHER_CONTACT';

export interface SensorSample {
  timestamp: number;
  p1: number;
  p2: number;
  p3: number;
  sg1: number;
  sg2: number;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}

export interface SensorFeatureVector {
  p1_peak: number;
  p2_peak: number;
  p3_peak: number;
  sg1_peak: number;
  sg2_peak: number;
  imu_acceleration: number;
  imu_angular_velocity: number;
  energy: number;
  frequency: number;
  duration: number;
}

export interface PredictionResult {
  contact_detected: boolean;
  contact_type: ContactType;
  location: ContactLocation;
  estimated_x_m: number;
  confidence: number;
  sensor_response: {
    p1: number;
    p2: number;
    p3: number;
    sg1: number;
    sg2: number;
    imu_accel: number;
    imu_gyro: number;
  };
  features: SensorFeatureVector;
  probabilities: Record<ContactType, number>;
  fusion_reasoning: string;
}

export interface AttemptRecord {
  id: number;
  attempt_number: number;
  athlete_id: string;
  athlete_name: string;
  timestamp: string;
  scenario: SimulationScenario;
  contact_detected: boolean;
  contact_type: ContactType;
  location: ContactLocation;
  estimated_x_m: number;
  confidence: number;
  is_success: boolean;
  features: SensorFeatureVector;
  sensor_response: {
    p1: number;
    p2: number;
    p3: number;
    sg1: number;
    sg2: number;
    imu_accel: number;
    imu_gyro: number;
  };
  fusion_reasoning: string;
  readings?: SensorSample[];
}

export interface FailurePattern {
  id: string;
  pattern: string;
  occurrences: number;
  percentage: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  diagnosis: string;
  coaching_advice: string;
}

export interface TrainingAnalytics {
  total_attempts: number;
  successful_attempts: number;
  failed_attempts: number;
  success_rate_pct: number;
  pole_contacts: number;
  body_contacts: number;
  other_contacts: number;
  left_contacts: number;
  center_contacts: number;
  right_contacts: number;
  repeated_patterns: FailurePattern[];
  recommendations: string[];
}
