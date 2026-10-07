"""
Intelligent Pole-Vault Crossbar - FastAPI REST Backend
Multimodal contact detection, localization, and training analytics API.
"""

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np

try:
    from backend.models import (
        ContactType,
        ContactLocation,
        SimulationScenario,
        SimulationRequest,
        SimulationResponse,
        SignalProcessingRequest,
        SensorFeatureVector,
        PredictionResponse,
        AttemptRecord,
        AnalyticsSummary
    )
    from backend.simulator import simulate_crossbar_event
    from backend.feature_extraction import extract_features
    from backend.sensor_fusion import run_sensor_fusion
    from backend.classifier import predict_contact
    from backend.database import (
        save_attempt,
        get_all_attempts,
        get_attempt_by_id,
        init_db
    )
except ImportError:
    from models import (
        ContactType,
        ContactLocation,
        SimulationScenario,
        SimulationRequest,
        SimulationResponse,
        SignalProcessingRequest,
        SensorFeatureVector,
        PredictionResponse,
        AttemptRecord,
        AnalyticsSummary
    )
    from simulator import simulate_crossbar_event
    from feature_extraction import extract_features
    from sensor_fusion import run_sensor_fusion
    from classifier import predict_contact
    from database import (
        save_attempt,
        get_all_attempts,
        get_attempt_by_id,
        init_db
    )

app = FastAPI(
    title="Intelligent Pole-Vault Crossbar API",
    description="Multimodal Contact Detection and Localization on 4.5m Crossbar with Piezoelectric, Strain Gauge, and IMU Fusion",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "system": "Intelligent Pole-Vault Crossbar Multimodal Sensor Pipeline",
        "sensors": {
            "P1": "1.125m (Piezoelectric)",
            "SG1": "1.650m (Strain Gauge)",
            "P2": "2.250m (Piezoelectric)",
            "IMU": "2.250m (6-DOF IMU)",
            "SG2": "2.850m (Strain Gauge)",
            "P3": "3.375m (Piezoelectric)"
        },
        "sampling_rate_hz": 1000,
        "classifier": "Random Forest Multimodal Ensemble"
    }


@app.post("/simulate", response_model=SimulationResponse)
def simulate_sensor_data(req: SimulationRequest):
    """
    Generate synthetic multimodal sensor stream for specified scenario.
    """
    try:
        samples, meta = simulate_crossbar_event(
            scenario=req.scenario,
            duration_s=req.duration_s,
            sample_rate_hz=req.sample_rate_hz,
            noise_level=req.noise_level,
            contact_timestamp=req.contact_timestamp or 0.85
        )
        return SimulationResponse(
            scenario=req.scenario.value,
            sample_count=len(samples),
            duration_s=req.duration_s,
            sample_rate_hz=req.sample_rate_hz,
            readings=samples,
            metadata=meta
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.post("/process-signal")
def process_signals(req: SignalProcessingRequest):
    """
    Preprocess raw sensor data, filter noise, compute RMS/energy, and extract 10-D feature vector.
    """
    try:
        features, diagnostic = extract_features(req.readings, sample_rate_hz=req.sample_rate_hz)
        return {
            "features": features.dict(),
            "diagnostics": diagnostic
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signal processing error: {str(e)}")


@app.post("/predict", response_model=PredictionResponse)
def predict_contact_from_features(features: SensorFeatureVector):
    """
    Execute Sensor Fusion and ML Classifier on extracted feature vector.
    """
    try:
        # Run sensor fusion for spatial localization and impact confirmation
        fusion_result = run_sensor_fusion(features)
        
        # Run ML classifier
        contact_type, ml_confidence, probs = predict_contact(features)

        # Coordinate results: if fusion determined no impact, sync classification
        if not fusion_result["impact_present"] or contact_type == ContactType.NO_CONTACT:
            detected = False
            contact_type = ContactType.NO_CONTACT
            location = ContactLocation.NONE
            confidence = max(fusion_result["confidence"], ml_confidence)
        else:
            detected = True
            location = fusion_result["location"]
            # Combined confidence of ML class prediction and spatial fusion localization
            confidence = round(0.55 * ml_confidence + 0.45 * fusion_result["confidence"], 2)

        sensor_response = {
            "p1": features.p1_peak,
            "p2": features.p2_peak,
            "p3": features.p3_peak,
            "sg1": features.sg1_peak,
            "sg2": features.sg2_peak,
            "imu_accel": features.imu_acceleration,
            "imu_gyro": features.imu_angular_velocity
        }

        return PredictionResponse(
            contact_detected=detected,
            contact_type=contact_type,
            location=location,
            confidence=confidence,
            sensor_response=sensor_response,
            features=features,
            decision_reasoning=fusion_result.get("fusion_reasoning")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/analyze-attempt")
def analyze_full_attempt(
    scenario: SimulationScenario = Query(SimulationScenario.POLE_CENTER),
    athlete_id: str = Query("ATH-001"),
    save_to_db: bool = Query(True)
):
    """
    Executes the entire end-to-end pipeline:
    1. Sensor Data Simulation
    2. Digital Signal Processing & Filtering
    3. Multimodal Feature Extraction
    4. Sensor Fusion Layer
    5. ML Random Forest Classification
    6. Contact Localization
    7. Storage to SQLite Database
    """
    try:
        # 1. Simulate
        samples, meta = simulate_crossbar_event(scenario=scenario, duration_s=2.0, sample_rate_hz=1000)
        
        # 2-3. Signal Processing & Feature Extraction
        features, diag = extract_features(samples, sample_rate_hz=1000)

        # 4. Sensor Fusion
        fusion = run_sensor_fusion(features)

        # 5. ML Classification
        c_type, ml_conf, probs = predict_contact(features)

        # 6. Localization & Decision Coordination
        if not fusion["impact_present"] or c_type == ContactType.NO_CONTACT:
            contact_detected = False
            c_type = ContactType.NO_CONTACT
            location = ContactLocation.NONE
            confidence = max(fusion["confidence"], ml_conf)
            is_success = True
        else:
            contact_detected = True
            location = fusion["location"]
            confidence = round(0.55 * ml_conf + 0.45 * fusion["confidence"], 2)
            is_success = False

        sensor_response = {
            "p1": features.p1_peak,
            "p2": features.p2_peak,
            "p3": features.p3_peak,
            "sg1": features.sg1_peak,
            "sg2": features.sg2_peak,
            "imu_accel": features.imu_acceleration,
            "imu_gyro": features.imu_angular_velocity
        }

        attempt_id = None
        if save_to_db:
            attempt_id = save_attempt(
                athlete_id=athlete_id,
                scenario=scenario.value,
                contact_detected=contact_detected,
                contact_type=c_type.value,
                location=location.value,
                confidence=confidence,
                estimated_x_m=fusion.get("estimated_x_m", 2.25),
                features=features.dict(),
                sensor_response=sensor_response,
                is_success=is_success,
                notes=fusion.get("fusion_reasoning")
            )

        # Sample 100 points for frontend chart rendering (downsample for quick response)
        step = max(1, len(samples) // 120)
        downsampled_readings = [samples[i] for i in range(0, len(samples), step)]

        return {
            "attempt_id": attempt_id,
            "scenario": scenario.value,
            "contact_detected": contact_detected,
            "contact_type": c_type.value,
            "location": location.value,
            "estimated_x_m": fusion.get("estimated_x_m", 2.25),
            "confidence": confidence,
            "is_success": is_success,
            "features": features.dict(),
            "sensor_response": sensor_response,
            "fusion_reasoning": fusion.get("fusion_reasoning"),
            "probabilities": probs,
            "readings": downsampled_readings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analyze attempt error: {str(e)}")


@app.get("/attempts")
def list_attempts(limit: int = Query(50, ge=1, le=200)):
    """
    Get jump attempt history from SQLite database.
    """
    try:
        return get_all_attempts(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/attempts/{attempt_id}")
def get_attempt_detail(attempt_id: int):
    """
    Retrieve single attempt by ID.
    """
    res = get_attempt_by_id(attempt_id)
    if not res:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return res


@app.get("/analytics")
def get_training_analytics():
    """
    Compute aggregate training analytics and spatial failure patterns.
    """
    try:
        attempts = get_all_attempts(limit=100)
        total = len(attempts)
        if total == 0:
            return {
                "total_attempts": 0,
                "successful_attempts": 0,
                "failed_attempts": 0,
                "success_rate_pct": 0.0,
                "pole_contacts": 0,
                "body_contacts": 0,
                "other_contacts": 0,
                "left_contacts": 0,
                "center_contacts": 0,
                "right_contacts": 0,
                "repeated_patterns": [],
                "recommendations": ["No attempt data recorded yet."]
            }

        successes = sum(1 for a in attempts if a["is_success"])
        fails = total - successes
        rate = round((successes / total) * 100, 1)

        pole_cnt = sum(1 for a in attempts if a["contact_type"] == "POLE_CONTACT")
        body_cnt = sum(1 for a in attempts if a["contact_type"] == "BODY_CONTACT")
        other_cnt = sum(1 for a in attempts if a["contact_type"] == "OTHER_CONTACT")

        left_cnt = sum(1 for a in attempts if a["location"] == "LEFT")
        center_cnt = sum(1 for a in attempts if a["location"] == "CENTER")
        right_cnt = sum(1 for a in attempts if a["location"] == "RIGHT")

        # Failure pattern diagnosis
        repeated_patterns = []
        recommendations = []

        if center_cnt >= 3 and (center_cnt / max(1, fails)) >= 0.5:
            repeated_patterns.append({
                "pattern": "Repeated Center-Region Pole Contact",
                "occurrences": center_cnt,
                "severity": "HIGH",
                "diagnosis": "Pole recoil or late release trajectory striking the apex of the bar (2.25m)."
            })
            recommendations.append("Athlete is maintaining late grip during push-off. Advise earlier pole release before apex inversion.")

        if body_cnt >= 2:
            repeated_patterns.append({
                "pattern": "Frequent Hip/Torso Contact",
                "occurrences": body_cnt,
                "severity": "MEDIUM",
                "diagnosis": "High sustained strain indicates body clearance deficit."
            })
            recommendations.append("Hips dropping during bar clearance. Focus on deeper pike angle and arch extension over 5.40m.")

        if left_cnt > right_cnt and left_cnt >= 2:
            repeated_patterns.append({
                "pattern": "Left-Side Asymmetric Clearance",
                "occurrences": left_cnt,
                "severity": "MEDIUM",
                "diagnosis": "Approach or plant angle drifting toward left upright (1.125m)."
            })
            recommendations.append("Check plant alignment in the vault box. Plant angle is drifting 3-5 degrees left of center line.")

        if not recommendations:
            recommendations.append("Clearance symmetry is balanced. Continue progressive height escalation.")

        return {
            "total_attempts": total,
            "successful_attempts": successes,
            "failed_attempts": fails,
            "success_rate_pct": rate,
            "pole_contacts": pole_cnt,
            "body_contacts": body_cnt,
            "other_contacts": other_cnt,
            "left_contacts": left_cnt,
            "center_contacts": center_cnt,
            "right_contacts": right_cnt,
            "repeated_patterns": repeated_patterns,
            "recommendations": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics calculation error: {str(e)}")


@app.get("/training-summary")
def get_training_summary():
    """
    High-level coach/athlete training summary.
    """
    return get_training_analytics()
