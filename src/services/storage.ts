/**
 * Intelligent Pole-Vault Crossbar - Persistent Storage & Analytics Engine
 * Stores athlete attempts without demo data. Only user-simulated jumps are recorded.
 */

import { AttemptRecord, TrainingAnalytics, FailurePattern } from '../types/poleVault';

const STORAGE_KEY = 'pole_vault_crossbar_attempts_v2';

export function getStoredAttempts(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAttemptToStorage(attempt: AttemptRecord): void {
  try {
    const list = getStoredAttempts();
    const updated = [attempt, ...list];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save attempt to localStorage', e);
  }
}

export function clearAttemptStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('pole_vault_crossbar_attempts_v1');
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}

export function computeTrainingAnalytics(attempts: AttemptRecord[]): TrainingAnalytics {
  const total = attempts.length;
  if (total === 0) {
    return {
      total_attempts: 0,
      successful_attempts: 0,
      failed_attempts: 0,
      success_rate_pct: 0,
      pole_contacts: 0,
      body_contacts: 0,
      other_contacts: 0,
      left_contacts: 0,
      center_contacts: 0,
      right_contacts: 0,
      repeated_patterns: [],
      recommendations: ['Awaiting vault telemetry. Run a simulation to generate training data.'],
    };
  }

  const successes = attempts.filter((a) => a.is_success).length;
  const fails = total - successes;
  const successRate = Number(((successes / total) * 100).toFixed(1));

  const poleContacts = attempts.filter((a) => a.contact_type === 'POLE_CONTACT').length;
  const bodyContacts = attempts.filter((a) => a.contact_type === 'BODY_CONTACT').length;
  const otherContacts = attempts.filter((a) => a.contact_type === 'OTHER_CONTACT').length;

  const leftContacts = attempts.filter((a) => a.location === 'LEFT').length;
  const centerContacts = attempts.filter((a) => a.location === 'CENTER').length;
  const rightContacts = attempts.filter((a) => a.location === 'RIGHT').length;

  const repeated_patterns: FailurePattern[] = [];
  const recommendations: string[] = [];

  // Repeated Center-Region Pole Contact Pattern
  const centerFails = attempts.filter((a) => !a.is_success && a.location === 'CENTER' && a.contact_type === 'POLE_CONTACT').length;
  if (centerFails >= 2) {
    const pct = Number(((centerFails / Math.max(1, fails)) * 100).toFixed(1));
    repeated_patterns.push({
      id: 'center_pole_recoil',
      pattern: 'Repeated Center-Region Pole Contact',
      occurrences: centerFails,
      percentage: pct,
      severity: pct >= 50 ? 'HIGH' : 'MEDIUM',
      diagnosis: 'Empirical recoil and shock waves indicate pole strikes at the 2.250m crossbar apex during late push-off.',
      coaching_advice: 'Observed late grip retention during bar inversion. Recommend earlier pole push-away toward the runway.',
    });
    recommendations.push('Earlier pole release before apex inversion.');
  }

  // Hip / Body drag pattern
  if (bodyContacts >= 2) {
    const pct = Number(((bodyContacts / Math.max(1, fails)) * 100).toFixed(1));
    repeated_patterns.push({
      id: 'body_hip_drag',
      pattern: 'Frequent Hip / Torso Drag at Apex',
      occurrences: bodyContacts,
      percentage: pct,
      severity: 'MEDIUM',
      diagnosis: 'High sustained strain measurements indicate torso or hip drag across the crossbar.',
      coaching_advice: 'Deeper pike angle required during bar clearance.',
    });
    recommendations.push('Focus on deep pike angle during bar clearance.');
  }

  // Left-Side plant drift pattern
  if (leftContacts >= 2 && leftContacts > rightContacts) {
    const pct = Number(((leftContacts / Math.max(1, fails)) * 100).toFixed(1));
    repeated_patterns.push({
      id: 'left_drift_plant',
      pattern: 'Left-Side Asymmetrical Contact Drift',
      occurrences: leftContacts,
      percentage: pct,
      severity: 'LOW',
      diagnosis: 'Impacts consistently localized on the Left span (1.125m – 1.650m).',
      coaching_advice: 'Runway plant angle appears aligned 3° left of the midline.',
    });
    recommendations.push('Re-verify runway tape markers and plant box alignment.');
  }

  return {
    total_attempts: total,
    successful_attempts: successes,
    failed_attempts: fails,
    success_rate_pct: successRate,
    pole_contacts: poleContacts,
    body_contacts: bodyContacts,
    other_contacts: otherContacts,
    left_contacts: leftContacts,
    center_contacts: centerContacts,
    right_contacts: rightContacts,
    repeated_patterns,
    recommendations,
  };
}
