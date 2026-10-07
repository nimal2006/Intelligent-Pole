"""
Intelligent Pole-Vault Crossbar - Model Training Script
Generates synthetic dataset from multimodal physics simulator, extracts feature vectors,
trains a scikit-learn Random Forest Classifier, evaluates metrics (Accuracy, Precision,
Recall, F1-score, Confusion Matrix), and persists model to ml/model.pkl.
"""

import os
import csv
import json
import random
import numpy as np

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    import joblib
    SKLEARN_READY = True
except ImportError:
    SKLEARN_READY = False

try:
    from backend.models import SimulationScenario, ContactType
    from backend.simulator import simulate_crossbar_event
    from backend.feature_extraction import extract_features
except ImportError:
    from models import SimulationScenario, ContactType
    from simulator import simulate_crossbar_event
    from feature_extraction import extract_features


def generate_dataset(num_samples: int = 400):
    """
    Generate balanced dataset across the physical scenarios:
    - Successful clearance (0: NO_CONTACT)
    - Pole contact left/center/right (1: POLE_CONTACT)
    - Body contact (2: BODY_CONTACT)
    - Other contact (3: OTHER_CONTACT)
    """
    print(f"Generating {num_samples} simulated jump attempts...")
    rows = []
    
    scenarios = [
        (SimulationScenario.CLEARANCE, 0, "NO_CONTACT"),
        (SimulationScenario.POLE_LEFT, 1, "POLE_CONTACT"),
        (SimulationScenario.POLE_CENTER, 1, "POLE_CONTACT"),
        (SimulationScenario.POLE_RIGHT, 1, "POLE_CONTACT"),
        (SimulationScenario.BODY_CONTACT, 2, "BODY_CONTACT"),
        (SimulationScenario.OTHER_CONTACT, 3, "OTHER_CONTACT"),
    ]

    per_scenario = num_samples // len(scenarios)

    for scenario, label_idx, label_name in scenarios:
        for _ in range(per_scenario):
            noise = random.uniform(0.015, 0.05)
            contact_t = random.uniform(0.70, 0.95)
            duration = random.uniform(1.8, 2.2)
            
            samples, _ = simulate_crossbar_event(
                scenario=scenario,
                duration_s=duration,
                sample_rate_hz=1000,
                noise_level=noise,
                contact_timestamp=contact_t
            )
            
            feats, _ = extract_features(samples, sample_rate_hz=1000)
            
            rows.append({
                "p1_peak": feats.p1_peak,
                "p2_peak": feats.p2_peak,
                "p3_peak": feats.p3_peak,
                "sg1_peak": feats.sg1_peak,
                "sg2_peak": feats.sg2_peak,
                "imu_acceleration": feats.imu_acceleration,
                "imu_angular_velocity": feats.imu_angular_velocity,
                "energy": feats.energy,
                "frequency": feats.frequency,
                "duration": feats.duration,
                "label": label_idx,
                "label_name": label_name,
                "scenario": scenario.value
            })

    return rows


def save_dataset_csv(rows, filepath: str):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    fieldnames = list(rows[0].keys())
    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Dataset successfully saved to {filepath} ({len(rows)} samples).")


def train_and_evaluate(dataset_path: str, model_save_path: str):
    """
    Train Random Forest and print classification metrics.
    """
    rows = []
    with open(dataset_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

    feature_cols = [
        "p1_peak", "p2_peak", "p3_peak", "sg1_peak", "sg2_peak",
        "imu_acceleration", "imu_angular_velocity", "energy", "frequency", "duration"
    ]

    X = np.array([[float(r[col]) for col in feature_cols] for r in rows])
    y = np.array([int(r["label"]) for r in rows])

    if not SKLEARN_READY:
        print("Note: scikit-learn is not installed in current environment.")
        print(f"Simulated dataset generated with {len(rows)} samples.")
        return

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )

    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    print("\n================ ML MODEL EVALUATION ================")
    print(f"Test Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    target_names = ["NO_CONTACT", "POLE_CONTACT", "BODY_CONTACT", "OTHER_CONTACT"]
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    print("\nFeature Importances:")
    importances = sorted(
        zip(feature_cols, clf.feature_importances_),
        key=lambda x: x[1],
        reverse=True
    )
    for feat, imp in importances:
        print(f"  {feat:22s}: {imp * 100:5.2f}%")

    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(clf, model_save_path)
    print(f"\nTrained model persisted to {model_save_path}")


if __name__ == "__main__":
    ml_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml")
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    dataset_csv = os.path.join(ml_dir, "dataset.csv")
    simulated_csv = os.path.join(data_dir, "simulated_sensor_data.csv")
    model_path = os.path.join(ml_dir, "model.pkl")

    data = generate_dataset(num_samples=360)
    save_dataset_csv(data, dataset_csv)
    # Also save copy to data/
    save_dataset_csv(data, simulated_csv)
    train_and_evaluate(dataset_csv, model_path)
