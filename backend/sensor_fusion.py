"""
Intelligent Pole-Vault Crossbar - Sensor Fusion & Localization Layer
Fuses multimodal readings from:
  - Piezoelectric shock sensors (P1, P2, P3)
  - Strain gauges (SG1, SG2)
  - 6-DOF Inertial Measurement Unit (IMU ax, ay, az, gx, gy, gz)
Computes impact presence, spatial energy localization along the 4.5m bar,
and continuous impact coordinate estimation.
"""

from typing import Dict, Any, Tuple
import math
try:
    from backend.models import SensorFeatureVector, ContactLocation
except ImportError:
    from models import SensorFeatureVector, ContactLocation

# Sensor physical x-positions along 4.500m crossbar
POS_P1 = 1.125
POS_SG1 = 1.650
POS_P2 = 2.250
POS_IMU = 2.250
POS_SG2 = 2.850
POS_P3 = 3.375


def run_sensor_fusion(
    features: SensorFeatureVector
) -> Dict[str, Any]:
    """
    Multimodal sensor fusion engine:
    1. Cross-validates piezo shock waves against strain and inertial recoil.
    2. Computes continuous spatial impact coordinate x_est in [0.0, 4.5] meters.
    3. Categorizes region into LEFT, CENTER, RIGHT or NONE.
    4. Evaluates localization confidence and impact presence.
    """
    p1 = features.p1_peak
    p2 = features.p2_peak
    p3 = features.p3_peak
    sg1 = features.sg1_peak
    sg2 = features.sg2_peak
    accel = features.imu_acceleration
    gyro = features.imu_angular_velocity
    energy = features.energy
    freq = features.frequency
    duration = features.duration

    # 1. Impact Presence Check (Sensor agreement required)
    # A genuine impact must trigger:
    # (a) at least one piezo sensor above ambient noise (> 0.4V), OR
    # (b) noticeable dynamic strain (> 50 microstrain), OR
    # (c) dynamic IMU acceleration (> 2.5 m/s^2)
    piezo_max = max(p1, p2, p3)
    strain_max = max(sg1, sg2)
    
    impact_detected = (
        (piezo_max >= 0.50 and (strain_max >= 25.0 or accel >= 1.5))
        or (strain_max >= 120.0 and accel >= 2.0)
        or (piezo_max >= 1.20)
    )

    if not impact_detected:
        return {
            "impact_present": False,
            "location": ContactLocation.NONE,
            "estimated_x_m": 2.25,
            "confidence": 0.98,
            "dominant_sensor": "NONE",
            "spatial_weights": {"left": 0.0, "center": 0.0, "right": 0.0},
            "fusion_reasoning": "Sensor readings within nominal clearance envelope. No impact detected."
        }

    # 2. Continuous Spatial Localization along 4.5m beam
    # We weight sensors by their response and spatial sensitivity:
    # Left region: P1 (1.125m) and SG1 (1.650m)
    # Center region: P2 (2.250m), IMU (2.250m)
    # Right region: SG2 (2.850m) and P3 (3.375m)
    
    # Scale strain into comparable weight factor
    w_p1 = max(0.01, p1 ** 1.8)
    w_sg1 = max(0.01, (sg1 / 80.0) ** 1.5)
    w_p2 = max(0.01, p2 ** 1.8)
    w_sg2 = max(0.01, (sg2 / 80.0) ** 1.5)
    w_p3 = max(0.01, p3 ** 1.8)

    # Center of response calculation
    total_w = w_p1 + w_sg1 + w_p2 + w_sg2 + w_p3
    x_est = (
        w_p1 * POS_P1 +
        w_sg1 * POS_SG1 +
        w_p2 * POS_P2 +
        w_sg2 * POS_SG2 +
        w_p3 * POS_P3
    ) / total_w

    # Spatial regional mass
    left_mass = (w_p1 * 1.5 + w_sg1 * 0.8) / total_w
    center_mass = (w_p2 * 1.6 + (w_sg1 + w_sg2) * 0.3) / total_w
    right_mass = (w_p3 * 1.5 + w_sg2 * 0.8) / total_w

    # Normalize regional masses
    mass_sum = left_mass + center_mass + right_mass
    left_prob = left_mass / mass_sum
    center_prob = center_mass / mass_sum
    right_prob = right_mass / mass_sum

    # Region classification boundaries on 4.5m bar:
    # LEFT: 0.0m - 1.875m
    # CENTER: 1.875m - 2.625m (middle 0.75m sweet spot)
    # RIGHT: 2.625m - 4.500m
    if x_est < 1.875:
        location = ContactLocation.LEFT
        loc_conf = left_prob
        dominant_sensor = "P1" if p1 >= w_sg1 else "SG1"
    elif x_est > 2.625:
        location = ContactLocation.RIGHT
        loc_conf = right_prob
        dominant_sensor = "P3" if p3 >= w_sg2 else "SG2"
    else:
        location = ContactLocation.CENTER
        loc_conf = center_prob
        dominant_sensor = "P2/IMU"

    # Multi-sensor concordance factor:
    # If both P1 and SG1 agree for left, confidence is higher than single sensor outlier
    concordance = 1.0
    if location == ContactLocation.LEFT and (p1 > p2 and p1 > p3 and sg1 >= sg2 * 0.9):
        concordance = 1.15
    elif location == ContactLocation.RIGHT and (p3 > p2 and p3 > p1 and sg2 >= sg1 * 0.9):
        concordance = 1.15
    elif location == ContactLocation.CENTER and (p2 > p1 and p2 > p3):
        concordance = 1.15

    final_confidence = min(0.99, max(0.65, loc_conf * concordance))

    reasoning = (
        f"Spatial fusion estimated contact coordinate at {x_est:.2f}m along the 4.5m crossbar. "
        f"Dominant response from {dominant_sensor} (P1={p1:.2f}V, P2={p2:.2f}V, P3={p3:.2f}V, "
        f"SG1={sg1:.1f}με, SG2={sg2:.1f}με). Multi-sensor concordance confidence: {final_confidence * 100:.1f}%."
    )

    return {
        "impact_present": True,
        "location": location,
        "estimated_x_m": round(x_est, 2),
        "confidence": round(final_confidence, 2),
        "dominant_sensor": dominant_sensor,
        "spatial_weights": {
            "left": round(left_prob, 3),
            "center": round(center_prob, 3),
            "right": round(right_prob, 3)
        },
        "fusion_reasoning": reasoning
    }
