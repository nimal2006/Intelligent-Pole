"""
Intelligent Pole-Vault Crossbar - Data Models
Defines Pydantic schemas for data validation, API requests, and responses.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum


class ContactType(str, Enum):
    NO_CONTACT = "NO_CONTACT"
    POLE_CONTACT = "POLE_CONTACT"
    BODY_CONTACT = "BODY_CONTACT"
    OTHER_CONTACT = "OTHER_CONTACT"


class ContactLocation(str, Enum):
    LEFT = "LEFT"
    CENTER = "CENTER"
    RIGHT = "RIGHT"
    NONE = "NONE"


class SimulationScenario(str, Enum):
    CLEARANCE = "CLEARANCE"
    POLE_LEFT = "POLE_LEFT"
    POLE_CENTER = "POLE_CENTER"
    POLE_RIGHT = "POLE_RIGHT"
    BODY_CONTACT = "BODY_CONTACT"
    OTHER_CONTACT = "OTHER_CONTACT"


class SensorSample(BaseModel):
    timestamp: float = Field(..., description="Timestamp in seconds from jump start")
    p1: float = Field(..., description="Piezoelectric sensor 1 voltage (V) at 1.125m")
    p2: float = Field(..., description="Piezoelectric sensor 2 voltage (V) at 2.250m")
    p3: float = Field(..., description="Piezoelectric sensor 3 voltage (V) at 3.375m")
    sg1: float = Field(..., description="Strain gauge 1 deformation (microstrain) at 1.650m")
    sg2: float = Field(..., description="Strain gauge 2 deformation (microstrain) at 2.850m")
    ax: float = Field(..., description="IMU X-axis acceleration (m/s^2) at 2.250m")
    ay: float = Field(..., description="IMU Y-axis acceleration (m/s^2) at 2.250m")
    az: float = Field(..., description="IMU Z-axis acceleration (m/s^2) at 2.250m")
    gx: float = Field(..., description="IMU X-axis angular velocity (rad/s) at 2.250m")
    gy: float = Field(..., description="IMU Y-axis angular velocity (rad/s) at 2.250m")
    gz: float = Field(..., description="IMU Z-axis angular velocity (rad/s) at 2.250m")


class SimulationRequest(BaseModel):
    scenario: SimulationScenario = Field(
        default=SimulationScenario.POLE_CENTER,
        description="Scenario to simulate"
    )
    duration_s: float = Field(default=2.0, ge=0.5, le=5.0, description="Duration in seconds")
    sample_rate_hz: int = Field(default=1000, ge=100, le=5000, description="Sampling rate in Hz")
    noise_level: float = Field(default=0.03, ge=0.0, le=0.5, description="Gaussian noise magnitude")
    contact_timestamp: Optional[float] = Field(default=0.85, description="Time of impact in seconds")


class SimulationResponse(BaseModel):
    scenario: str
    sample_count: int
    duration_s: float
    sample_rate_hz: int
    readings: List[SensorSample]
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SignalProcessingRequest(BaseModel):
    readings: List[SensorSample]
    sample_rate_hz: int = 1000


class SensorFeatureVector(BaseModel):
    p1_peak: float
    p2_peak: float
    p3_peak: float
    sg1_peak: float
    sg2_peak: float
    imu_acceleration: float
    imu_angular_velocity: float
    energy: float
    frequency: float
    duration: float


class PredictionResponse(BaseModel):
    contact_detected: bool
    contact_type: ContactType
    location: ContactLocation
    confidence: float
    sensor_response: Dict[str, float]
    features: SensorFeatureVector
    decision_reasoning: Optional[str] = None


class AttemptRecord(BaseModel):
    id: Optional[int] = None
    attempt_number: int
    athlete_id: str = "ATH-001"
    athlete_name: str = "Elena Rostova"
    timestamp: str
    scenario: str
    contact_detected: bool
    contact_type: ContactType
    location: ContactLocation
    confidence: float
    features: SensorFeatureVector
    sensor_response: Dict[str, float]
    readings_summary: Optional[Dict[str, Any]] = None


class AnalyticsSummary(BaseModel):
    total_attempts: int
    successful_attempts: int
    failed_attempts: int
    success_rate_pct: float
    pole_contacts: int
    body_contacts: int
    other_contacts: int
    left_contacts: int
    center_contacts: int
    right_contacts: int
    repeated_patterns: List[Dict[str, Any]]
    recommendations: List[str]
