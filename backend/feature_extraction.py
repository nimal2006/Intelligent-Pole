"""
Intelligent Pole-Vault Crossbar - Feature Extraction Module
Extracts multimodal features from piezoelectric sensors, strain gauges, and IMU.
"""

from typing import List, Dict, Any, Tuple
import numpy as np

try:
    from backend.models import SensorSample, SensorFeatureVector
    from backend.signal_processing import (
        preprocess_signal,
        detect_peaks,
        calculate_rms,
        calculate_energy,
        calculate_dominant_frequency,
        estimate_impact_timing_and_duration
    )
except ImportError:
    from models import SensorSample, SensorFeatureVector
    from signal_processing import (
        preprocess_signal,
        detect_peaks,
        calculate_rms,
        calculate_energy,
        calculate_dominant_frequency,
        estimate_impact_timing_and_duration
    )


def extract_features(
    samples: List[SensorSample],
    sample_rate_hz: int = 1000
) -> Tuple[SensorFeatureVector, Dict[str, Any]]:
    """
    Extract 10-dimensional multimodal feature vector from raw sensor time series:
    1. p1_peak: Max absolute voltage of P1 (1.125m)
    2. p2_peak: Max absolute voltage of P2 (2.250m)
    3. p3_peak: Max absolute voltage of P3 (3.375m)
    4. sg1_peak: Max dynamic strain of SG1 (1.650m)
    5. sg2_peak: Max dynamic strain of SG2 (2.850m)
    6. imu_acceleration: Max dynamic linear acceleration magnitude at center
    7. imu_angular_velocity: Max dynamic angular rate magnitude at center
    8. energy: Combined normalized signal energy across sensors
    9. frequency: Dominant impact frequency (Hz)
    10. duration: Disturbance event duration (s)
    """
    if not samples:
        zero_vec = SensorFeatureVector(
            p1_peak=0.0,
            p2_peak=0.0,
            p3_peak=0.0,
            sg1_peak=0.0,
            sg2_peak=0.0,
            imu_acceleration=0.0,
            imu_angular_velocity=0.0,
            energy=0.0,
            frequency=0.0,
            duration=0.0
        )
        return zero_vec, {}

    # Extract channel arrays
    p1 = np.array([s.p1 for s in samples], dtype=float)
    p2 = np.array([s.p2 for s in samples], dtype=float)
    p3 = np.array([s.p3 for s in samples], dtype=float)
    sg1 = np.array([s.sg1 for s in samples], dtype=float)
    sg2 = np.array([s.sg2 for s in samples], dtype=float)
    ax = np.array([s.ax for s in samples], dtype=float)
    ay = np.array([s.ay for s in samples], dtype=float)
    az = np.array([s.az for s in samples], dtype=float)
    gx = np.array([s.gx for s in samples], dtype=float)
    gy = np.array([s.gy for s in samples], dtype=float)
    gz = np.array([s.gz for s in samples], dtype=float)

    # Preprocess & filter signals
    p1_filt = preprocess_signal(p1, sample_rate_hz, filter_type="bandpass", lowcut=15.0, highcut=450.0)
    p2_filt = preprocess_signal(p2, sample_rate_hz, filter_type="bandpass", lowcut=15.0, highcut=450.0)
    p3_filt = preprocess_signal(p3, sample_rate_hz, filter_type="bandpass", lowcut=15.0, highcut=450.0)

    # Detrend strain gauges (baseline offset removal)
    sg1_dyn = np.abs(sg1 - np.median(sg1[:100] if len(sg1) > 100 else sg1))
    sg2_dyn = np.abs(sg2 - np.median(sg2[:100] if len(sg2) > 100 else sg2))

    # IMU dynamic magnitude (subtract gravity from vertical Z)
    accel_mag = np.sqrt(ax**2 + ay**2 + (az - 9.81)**2)
    gyro_mag = np.sqrt(gx**2 + gy**2 + gz**2)

    # 1-3. Piezo peaks
    _, p1_peaks = detect_peaks(p1_filt, threshold=0.15)
    _, p2_peaks = detect_peaks(p2_filt, threshold=0.15)
    _, p3_peaks = detect_peaks(p3_filt, threshold=0.15)

    p1_max = float(np.max(np.abs(p1_filt))) if len(p1_filt) > 0 else 0.0
    p2_max = float(np.max(np.abs(p2_filt))) if len(p2_filt) > 0 else 0.0
    p3_max = float(np.max(np.abs(p3_filt))) if len(p3_filt) > 0 else 0.0

    # 4-5. Strain peaks
    sg1_max = float(np.max(sg1_dyn)) if len(sg1_dyn) > 0 else 0.0
    sg2_max = float(np.max(sg2_dyn)) if len(sg2_dyn) > 0 else 0.0

    # 6-7. IMU dynamic peaks
    imu_accel_peak = float(np.max(accel_mag)) if len(accel_mag) > 0 else 0.0
    imu_gyro_peak = float(np.max(gyro_mag)) if len(gyro_mag) > 0 else 0.0

    # 8. Combined signal energy
    e_p1 = calculate_energy(p1_filt)
    e_p2 = calculate_energy(p2_filt)
    e_p3 = calculate_energy(p3_filt)
    total_energy = float(e_p1 + e_p2 + e_p3 + (sg1_max + sg2_max) * 0.1)

    # 9. Dominant frequency (from strongest piezo response)
    strongest_piezo = p2_filt
    if p1_max > p2_max and p1_max > p3_max:
        strongest_piezo = p1_filt
    elif p3_max > p2_max and p3_max > p1_max:
        strongest_piezo = p3_filt

    dom_freq, _ = calculate_dominant_frequency(strongest_piezo, sample_rate_hz=sample_rate_hz)

    # 10. Impact timing and duration
    impact_time, duration = estimate_impact_timing_and_duration(strongest_piezo, sample_rate_hz=sample_rate_hz)
    if duration == 0.0 and (sg1_max > 80.0 or imu_accel_peak > 5.0):
        # Fallback to strain/IMU duration if piezo was soft
        _, duration = estimate_impact_timing_and_duration(accel_mag, sample_rate_hz=sample_rate_hz)

    feature_vec = SensorFeatureVector(
        p1_peak=round(p1_max, 4),
        p2_peak=round(p2_max, 4),
        p3_peak=round(p3_max, 4),
        sg1_peak=round(sg1_max, 2),
        sg2_peak=round(sg2_max, 2),
        imu_acceleration=round(imu_accel_peak, 3),
        imu_angular_velocity=round(imu_gyro_peak, 3),
        energy=round(total_energy, 2),
        frequency=round(dom_freq, 1),
        duration=round(duration, 3)
    )

    diagnostic = {
        "rms": {
            "p1": round(calculate_rms(p1_filt), 4),
            "p2": round(calculate_rms(p2_filt), 4),
            "p3": round(calculate_rms(p3_filt), 4),
            "sg1": round(calculate_rms(sg1_dyn), 2),
            "sg2": round(calculate_rms(sg2_dyn), 2),
        },
        "impact_time_s": impact_time,
        "p1_peak_count": len(p1_peaks),
        "p2_peak_count": len(p2_peaks),
        "p3_peak_count": len(p3_peaks)
    }

    return feature_vec, diagnostic
