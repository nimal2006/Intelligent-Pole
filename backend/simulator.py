"""
Intelligent Pole-Vault Crossbar - Sensor Data Simulator
Generates physically grounded synthetic data for 4.5m crossbar with multimodal sensor placement:
  P1  = 1.125m (Piezoelectric)
  SG1 = 1.650m (Strain gauge)
  P2  = 2.250m (Piezoelectric, center)
  IMU = 2.250m (6-DOF IMU, center)
  SG2 = 2.850m (Strain gauge)
  P3  = 3.375m (Piezoelectric)
Crossbar length: 4.500m
"""

import math
import numpy as np
from typing import List, Dict, Any, Tuple
try:
    from backend.models import SensorSample, SimulationScenario
except ImportError:
    from models import SensorSample, SimulationScenario

# Crossbar physical parameters
CROSSBAR_LENGTH = 4.50  # meters
SENSOR_POSITIONS = {
    "P1": 1.125,
    "SG1": 1.650,
    "P2": 2.250,
    "IMU": 2.250,
    "SG2": 2.850,
    "P3": 3.375,
}
WAVE_VELOCITY = 3200.0  # m/s acoustic flexural wave velocity in carbon/fiberglass crossbar


def simulate_crossbar_event(
    scenario: SimulationScenario,
    duration_s: float = 2.0,
    sample_rate_hz: int = 1000,
    noise_level: float = 0.02,
    contact_timestamp: float = 0.85
) -> Tuple[List[SensorSample], Dict[str, Any]]:
    """
    Synthesize realistic continuous time-series data for all sensors.
    """
    total_samples = int(duration_s * sample_rate_hz)
    t = np.linspace(0, duration_s, total_samples, endpoint=False)
    dt = 1.0 / sample_rate_hz

    # Base noise floors
    p1 = np.random.normal(0, noise_level * 0.2, total_samples)
    p2 = np.random.normal(0, noise_level * 0.2, total_samples)
    p3 = np.random.normal(0, noise_level * 0.2, total_samples)
    
    # Strain gauge ambient offsets (slight pre-tension)
    sg1 = np.random.normal(12.0, noise_level * 1.5, total_samples)
    sg2 = np.random.normal(11.8, noise_level * 1.5, total_samples)

    # IMU base: gravity on Z axis ~9.81 m/s^2, slight drift
    ax = np.random.normal(0.0, noise_level * 0.3, total_samples)
    ay = np.random.normal(0.0, noise_level * 0.3, total_samples)
    az = np.random.normal(9.81, noise_level * 0.4, total_samples)
    gx = np.random.normal(0.0, noise_level * 0.05, total_samples)
    gy = np.random.normal(0.0, noise_level * 0.05, total_samples)
    gz = np.random.normal(0.0, noise_level * 0.05, total_samples)

    # Ambient natural bar oscillation (fundamental mode ~2.4 Hz, low amplitude)
    natural_freq = 2.4
    ambient_sway = 0.04 * np.sin(2 * np.pi * natural_freq * t)
    p1 += ambient_sway * 0.1
    p2 += ambient_sway * 0.15
    p3 += ambient_sway * 0.1
    sg1 += ambient_sway * 8.0
    sg2 += ambient_sway * 8.0
    az += ambient_sway * 0.5

    meta = {
        "scenario": scenario.value,
        "impact_time_s": contact_timestamp if scenario != SimulationScenario.CLEARANCE else None,
        "duration_s": duration_s,
        "sample_rate_hz": sample_rate_hz
    }

    if scenario == SimulationScenario.CLEARANCE:
        # Successful clearance: athlete passes over cleanly.
        # Slight aerodynamic flutter as athlete clears (around t = 0.8s - 1.2s)
        flutter_mask = (t >= 0.75) & (t <= 1.35)
        flutter_env = np.exp(-((t[flutter_mask] - 1.0) ** 2) / 0.04)
        flutter_wave = 0.12 * np.sin(2 * np.pi * 5.2 * t[flutter_mask]) * flutter_env
        p2[flutter_mask] += flutter_wave * 0.4
        sg1[flutter_mask] += flutter_wave * 12.0
        sg2[flutter_mask] += flutter_wave * 12.0
        az[flutter_mask] += flutter_wave * 0.8

    else:
        # Impact scenarios
        t0 = contact_timestamp
        
        # Determine nominal physical impact position (meters along 4.5m bar)
        if scenario == SimulationScenario.POLE_LEFT:
            x_impact = 1.20
            contact_source = "POLE"
        elif scenario == SimulationScenario.POLE_CENTER:
            x_impact = 2.25
            contact_source = "POLE"
        elif scenario == SimulationScenario.POLE_RIGHT:
            x_impact = 3.30
            contact_source = "POLE"
        elif scenario == SimulationScenario.BODY_CONTACT:
            x_impact = 2.10
            contact_source = "BODY"
        elif scenario == SimulationScenario.OTHER_CONTACT:
            x_impact = 0.60
            contact_source = "OTHER"
        else:
            x_impact = 2.25
            contact_source = "POLE"

        meta["nominal_impact_position_m"] = x_impact
        meta["contact_source"] = contact_source

        # Wave travel time to each sensor
        d_p1 = abs(SENSOR_POSITIONS["P1"] - x_impact)
        d_p2 = abs(SENSOR_POSITIONS["P2"] - x_impact)
        d_p3 = abs(SENSOR_POSITIONS["P3"] - x_impact)
        d_sg1 = abs(SENSOR_POSITIONS["SG1"] - x_impact)
        d_sg2 = abs(SENSOR_POSITIONS["SG2"] - x_impact)
        d_imu = abs(SENSOR_POSITIONS["IMU"] - x_impact)

        t_p1 = t0 + (d_p1 / WAVE_VELOCITY)
        t_p2 = t0 + (d_p2 / WAVE_VELOCITY)
        t_p3 = t0 + (d_p3 / WAVE_VELOCITY)
        t_sg1 = t0 + (d_sg1 / WAVE_VELOCITY)
        t_sg2 = t0 + (d_sg2 / WAVE_VELOCITY)
        t_imu = t0 + (d_imu / WAVE_VELOCITY)

        # Attenuation factor over distance
        attenuation_coeff = 0.75
        amp_p1 = math.exp(-attenuation_coeff * d_p1)
        amp_p2 = math.exp(-attenuation_coeff * d_p2)
        amp_p3 = math.exp(-attenuation_coeff * d_p3)

        if contact_source == "POLE":
            # Pole contact: rigid carbon/fiberglass pole strikes crossbar.
            # Very sharp shock impulse (15-35ms), high dominant frequency (350 - 650 Hz),
            # sharp ring-down, rapid IMU angular recoil and acceleration spike.
            peak_voltage = 5.2
            decay_rate = 45.0  # 1/s fast damping of high-frequency stress waves
            freq_impact = 420.0  # Hz

            # P1 response
            idx_p1 = t >= t_p1
            tau_p1 = t[idx_p1] - t_p1
            p1[idx_p1] += peak_voltage * amp_p1 * np.exp(-decay_rate * tau_p1) * np.sin(2 * np.pi * freq_impact * tau_p1)

            # P2 response
            idx_p2 = t >= t_p2
            tau_p2 = t[idx_p2] - t_p2
            p2[idx_p2] += peak_voltage * amp_p2 * np.exp(-decay_rate * tau_p2) * np.sin(2 * np.pi * freq_impact * tau_p2)

            # P3 response
            idx_p3 = t >= t_p3
            tau_p3 = t[idx_p3] - t_p3
            p3[idx_p3] += peak_voltage * amp_p3 * np.exp(-decay_rate * tau_p3) * np.sin(2 * np.pi * freq_impact * tau_p3)

            # Strain gauges: dynamic bending moment.
            # Leverage response: beam simply supported at ends (0m and 4.5m).
            # Bending moment at x for point load at x_impact: M(x) = F * (4.5 - x_impact) * x / 4.5 for x <= x_impact
            sg1_weight = (4.5 - max(x_impact, SENSOR_POSITIONS["SG1"])) * min(x_impact, SENSOR_POSITIONS["SG1"]) / 2.25
            sg2_weight = (4.5 - max(x_impact, SENSOR_POSITIONS["SG2"])) * min(x_impact, SENSOR_POSITIONS["SG2"]) / 2.25

            idx_sg1 = t >= t_sg1
            tau_sg1 = t[idx_sg1] - t_sg1
            sg1[idx_sg1] += (280.0 * sg1_weight + 50.0) * np.exp(-12.0 * tau_sg1) * np.sin(2 * np.pi * 32.0 * tau_sg1)

            idx_sg2 = t >= t_sg2
            tau_sg2 = t[idx_sg2] - t_sg2
            sg2[idx_sg2] += (280.0 * sg2_weight + 50.0) * np.exp(-12.0 * tau_sg2) * np.sin(2 * np.pi * 32.0 * tau_sg2)

            # IMU response: center vibration
            idx_imu = t >= t_imu
            tau_imu = t[idx_imu] - t_imu
            imu_atten = math.exp(-0.6 * d_imu)
            ay[idx_imu] += 18.0 * imu_atten * np.exp(-18.0 * tau_imu) * np.sin(2 * np.pi * 85.0 * tau_imu)
            az[idx_imu] += 26.0 * imu_atten * np.exp(-14.0 * tau_imu) * np.sin(2 * np.pi * 48.0 * tau_imu)
            gx[idx_imu] += 9.5 * imu_atten * np.exp(-16.0 * tau_imu) * np.sin(2 * np.pi * 60.0 * tau_imu)
            gz[idx_imu] += 6.0 * imu_atten * np.exp(-20.0 * tau_imu) * np.cos(2 * np.pi * 75.0 * tau_imu)

        elif contact_source == "BODY":
            # Body contact: athlete's body (torso/thigh/arm) brushes or drags bar.
            # Broader duration (150-350ms), lower frequency (35 - 90 Hz),
            # massive sustained bending deformation (strain gauge 600 - 1400 microstrain),
            # high Z-axis deflection and steady displacement.
            peak_voltage = 3.1
            decay_rate = 14.0
            freq_impact = 65.0

            idx_p1 = t >= t_p1
            tau_p1 = t[idx_p1] - t_p1
            p1[idx_p1] += peak_voltage * amp_p1 * np.exp(-decay_rate * tau_p1) * (
                0.7 * np.sin(2 * np.pi * freq_impact * tau_p1) + 0.3 * np.sin(2 * np.pi * 28.0 * tau_p1)
            )

            idx_p2 = t >= t_p2
            tau_p2 = t[idx_p2] - t_p2
            p2[idx_p2] += peak_voltage * amp_p2 * np.exp(-decay_rate * tau_p2) * (
                0.7 * np.sin(2 * np.pi * freq_impact * tau_p2) + 0.3 * np.sin(2 * np.pi * 28.0 * tau_p2)
            )

            idx_p3 = t >= t_p3
            tau_p3 = t[idx_p3] - t_p3
            p3[idx_p3] += peak_voltage * amp_p3 * np.exp(-decay_rate * tau_p3) * (
                0.7 * np.sin(2 * np.pi * freq_impact * tau_p3) + 0.3 * np.sin(2 * np.pi * 28.0 * tau_p3)
            )

            # High persistent strain deformation
            idx_sg1 = t >= t_sg1
            tau_sg1 = t[idx_sg1] - t_sg1
            sg1[idx_sg1] += 650.0 * np.exp(-4.5 * tau_sg1) * np.sin(2 * np.pi * 14.0 * tau_sg1 + 0.4)

            idx_sg2 = t >= t_sg2
            tau_sg2 = t[idx_sg2] - t_sg2
            sg2[idx_sg2] += 620.0 * np.exp(-4.5 * tau_sg2) * np.sin(2 * np.pi * 14.0 * tau_sg2 + 0.4)

            # IMU: large displacement, low frequency rock
            idx_imu = t >= t_imu
            tau_imu = t[idx_imu] - t_imu
            ay[idx_imu] += 12.0 * np.exp(-6.0 * tau_imu) * np.sin(2 * np.pi * 18.0 * tau_imu)
            az[idx_imu] += 38.0 * np.exp(-5.0 * tau_imu) * np.sin(2 * np.pi * 12.0 * tau_imu)
            gx[idx_imu] += 15.0 * np.exp(-7.0 * tau_imu) * np.sin(2 * np.pi * 15.0 * tau_imu)
            gy[idx_imu] += 7.0 * np.exp(-8.0 * tau_imu) * np.cos(2 * np.pi * 16.0 * tau_imu)

        elif contact_source == "OTHER":
            # Other contact: light wind turbulence, tip peg slip, or hand tap
            peak_voltage = 1.2
            decay_rate = 25.0
            freq_impact = 140.0

            idx_p1 = t >= t_p1
            tau_p1 = t[idx_p1] - t_p1
            p1[idx_p1] += peak_voltage * amp_p1 * np.exp(-decay_rate * tau_p1) * np.sin(2 * np.pi * freq_impact * tau_p1)

            idx_p2 = t >= t_p2
            tau_p2 = t[idx_p2] - t_p2
            p2[idx_p2] += peak_voltage * amp_p2 * np.exp(-decay_rate * tau_p2) * np.sin(2 * np.pi * freq_impact * tau_p2)

            idx_p3 = t >= t_p3
            tau_p3 = t[idx_p3] - t_p3
            p3[idx_p3] += peak_voltage * amp_p3 * np.exp(-decay_rate * tau_p3) * np.sin(2 * np.pi * freq_impact * tau_p3)

            idx_sg1 = t >= t_sg1
            tau_sg1 = t[idx_sg1] - t_sg1
            sg1[idx_sg1] += 80.0 * np.exp(-8.0 * tau_sg1) * np.sin(2 * np.pi * 20.0 * tau_sg1)

            idx_sg2 = t >= t_sg2
            tau_sg2 = t[idx_sg2] - t_sg2
            sg2[idx_sg2] += 60.0 * np.exp(-8.0 * tau_sg2) * np.sin(2 * np.pi * 20.0 * tau_sg2)

            idx_imu = t >= t_imu
            tau_imu = t[idx_imu] - t_imu
            az[idx_imu] += 6.5 * np.exp(-10.0 * tau_imu) * np.sin(2 * np.pi * 25.0 * tau_imu)
            gx[idx_imu] += 3.2 * np.exp(-12.0 * tau_imu) * np.sin(2 * np.pi * 30.0 * tau_imu)

    # Convert into list of SensorSample objects
    samples: List[SensorSample] = []
    for i in range(total_samples):
        samples.append(
            SensorSample(
                timestamp=round(float(t[i]), 4),
                p1=round(float(p1[i]), 4),
                p2=round(float(p2[i]), 4),
                p3=round(float(p3[i]), 4),
                sg1=round(float(sg1[i]), 2),
                sg2=round(float(sg2[i]), 2),
                ax=round(float(ax[i]), 3),
                ay=round(float(ay[i]), 3),
                az=round(float(az[i]), 3),
                gx=round(float(gx[i]), 4),
                gy=round(float(gy[i]), 4),
                gz=round(float(gz[i]), 4),
            )
        )

    return samples, meta
