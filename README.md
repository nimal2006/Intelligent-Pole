# Intelligent Pole-Vault Crossbar with Multimodal Contact Detection and Localization

An intelligent sports-technology software prototype for pole-vault athletics that detects crossbar contact, classifies contact sources (Successful Clearance, Pole Contact, Body Contact, Other Contact), estimates spatial contact localization (Left, Center, Right along the 4.5 m bar), and provides continuous coaching and repeated failure analytics.

---

## 1. System Architecture & Crossbar Sensor Layout

The crossbar is a standard 4.50 m pole-vault beam instrumented with high-bandwidth piezoelectric shock transducers, precision strain gauges, and a 6-DOF Inertial Measurement Unit (IMU):

```
       0.0 m (Left Support)                                                                4.5 m (Right Support)
         |---------|--------------|-------------------|------------------|--------------|---------|
                  P1             SG1                P2 + IMU            SG2            P3
               (1.125 m)      (1.650 m)             (2.250 m)        (2.850 m)      (3.375 m)
               Piezo #1      Strain Gauge #1       Piezo #2 & IMU   Strain Gauge #2 Piezo #3
```

### Sensor Specifications:
- **P1 (1.125 m)**: High-frequency piezoelectric impact sensor (stress wave arrival on left span).
- **SG1 (1.650 m)**: Dynamic strain gauge measuring beam flexural deformation and bending moments.
- **P2 (2.250 m)**: Central piezoelectric transducer positioned at the bar apex.
- **IMU (2.250 m)**: 6-DOF Inertial Measurement Unit (Tri-axial accelerometer $a_x, a_y, a_z$ and rate gyro $g_x, g_y, g_z$).
- **SG2 (2.850 m)**: Symmetrical strain gauge for right span bending response.
- **P3 (3.375 m)**: High-frequency piezoelectric impact sensor (stress wave arrival on right span).

---

## 2. End-to-End Processing Pipeline

```
Raw Sensor Stream (P1, P2, P3, SG1, SG2, IMU [ax,ay,az,gx,gy,gz])
                     │
                     ▼
             Data Acquisition (1000 Hz)
                     │
                     ▼
             Signal Processing
             (Butterworth Bandpass Filter, Detrending, Peak Detection, RMS, FFT Dominant Freq)
                     │
                     ▼
          Multimodal Feature Extraction (10-D Feature Vector)
          [p1_peak, p2_peak, p3_peak, sg1_peak, sg2_peak, imu_acc, imu_gyro, energy, freq, duration]
                     │
                     ▼
             Sensor Fusion Layer
             (Spatial energy centroid x_est, Concordance validation, Multi-channel agreement)
                     │
                     ▼
             ML Classifier (Random Forest Ensemble)
             - Class 0: NO_CONTACT (Successful Clearance)
             - Class 1: POLE_CONTACT (Sharp high-freq impulse 350-650Hz, rapid recoil)
             - Class 2: BODY_CONTACT (Broad duration, low-freq 35-90Hz, sustained strain)
             - Class 3: OTHER_CONTACT (Glancing tap, wind buffeting, peg shift)
                     │
                     ▼
       Contact Localization & Decision Synthesis
       (LEFT: < 1.875m | CENTER: 1.875m - 2.625m | RIGHT: > 2.625m)
                     │
                     ▼
   Training Analytics & Repeated Failure Diagnosis
   (Spatial heatmaps, coach feedback, persistent fault alerts)
```

---

## 3. Project Directory Structure

```
intelligent-pole-vault/
├── spark-pipeline/           # Apache Spark 3.5 & Scala 2.12/2.13 Module
│   ├── build.sbt             # SBT build dependencies (spark-core, sql, mllib, streaming)
│   └── src/
│       ├── main/scala/com/polevault/
│       │   ├── models/SensorModels.scala              # Scala ADTs, case classes & pattern matching
│       │   ├── rdd/SparkRDDFundamentals.scala         # RDD transformations, actions, broadcast, accumulators
│       │   ├── streaming/SparkStructuredStreamingPipeline.scala # 1kHz watermarked sliding window streaming
│       │   └── analytics/SparkBatchAnalytics.scala    # Spark SQL Window functions & MLlib Random Forest
│       └── test/scala/com/polevault/models/SensorModelsSpec.scala # FlatSpec test suite
├── backend/
│   ├── main.py               # FastAPI REST API endpoints
│   ├── database.py           # SQLite persistence layer
│   ├── models.py             # Pydantic data schemas
│   ├── simulator.py          # Multimodal physics sensor simulator
│   ├── signal_processing.py  # SciPy/NumPy digital signal filters & FFT
│   ├── feature_extraction.py # 10-D multimodal feature extractor
│   ├── sensor_fusion.py      # Crossbar spatial fusion & coordinate localization
│   ├── classifier.py         # Random Forest ML model & inference engine
│   ├── train_model.py        # Model training, test metrics, confusion matrix
│   └── requirements.txt      # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Crossbar, status, telemetry, analytics UI
│   │   ├── services/         # API & in-browser pipeline engine
│   │   ├── App.tsx           # Main dashboard orchestrator
│   │   └── main.tsx          # React application root
│   ├── package.json
│   └── vite.config.ts
├── ml/
│   ├── dataset.csv           # Synthesized multi-scenario training dataset
│   └── model.pkl             # Trained Random Forest model binary
├── data/
│   ├── simulated_sensor_data.csv
│   └── pole_vault.db         # SQLite persistent database
├── README.md
└── docker-compose.yml
```

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System status, sensor hardware topology & classifier state |
| `POST` | `/simulate` | Generate synthetic time-series sensor data |
| `POST` | `/process-signal` | Filter signals, compute RMS, energy, FFT dominant freq |
| `POST` | `/predict` | Run sensor fusion & ML classifier on feature vector |
| `POST` | `/analyze-attempt` | Execute full pipeline and persist attempt to DB |
| `GET` | `/attempts` | Retrieve recent jump attempts history |
| `GET` | `/attempts/{id}` | Inspect single jump attempt detail |
| `GET` | `/analytics` | Aggregate clearance statistics and spatial metrics |
| `GET` | `/training-summary`| Coach recommendations and repeated failure alerts |

---

## 5. Quickstart & Installation

### Backend Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Train model and generate dataset:
python train_model.py

# Run FastAPI server:
uvicorn main:app --reload --port 8000
```

### Frontend Setup:
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to open the Intelligent Pole-Vault Analytics Dashboard.
Click **SIMULATE JUMP** to trigger real-time sensor generation, digital filtering, feature extraction, sensor fusion, ML classification, and crossbar localization!
