"""
Intelligent Pole-Vault Crossbar - Signal Processing Module
Implements filtering, peak detection, RMS, energy, frequency-domain analysis,
and signal metrics using NumPy and SciPy.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np

try:
    from scipy.signal import butter, filtfilt, find_peaks
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False


def preprocess_signal(
    signal: np.ndarray,
    sample_rate_hz: int = 1000,
    filter_type: str = "bandpass",
    lowcut: float = 10.0,
    highcut: float = 450.0,
    order: int = 3
) -> np.ndarray:
    """
    Remove DC offset and apply digital Butterworth filtering or moving average filter.
    """
    if len(signal) == 0:
        return signal

    # Detrend / center signal
    detrended = signal - np.mean(signal)

    if SCIPY_AVAILABLE and len(detrended) > order * 3:
        nyquist = 0.5 * sample_rate_hz
        low = max(0.01, min(lowcut / nyquist, 0.99))
        high = max(low + 0.01, min(highcut / nyquist, 0.99))

        try:
            if filter_type == "bandpass":
                b, a = butter(order, [low, high], btype="bandpass")
            elif filter_type == "lowpass":
                b, a = butter(order, high, btype="lowpass")
            elif filter_type == "highpass":
                b, a = butter(order, low, btype="highpass")
            else:
                return detrended
            return filtfilt(b, a, detrended)
        except Exception:
            pass

    # Pure NumPy fallback: Windowed smoothing if scipy is absent
    window_size = 5
    if len(detrended) >= window_size:
        kernel = np.ones(window_size) / window_size
        smoothed = np.convolve(detrended, kernel, mode="same")
        return smoothed
    return detrended


def normalize_signal(signal: np.ndarray) -> np.ndarray:
    """
    Normalize signal to zero mean and unit variance, or [0, 1] range.
    """
    if len(signal) == 0:
        return signal
    peak = np.max(np.abs(signal))
    if peak > 1e-6:
        return signal / peak
    return signal


def detect_peaks(
    signal: np.ndarray,
    threshold: Optional[float] = None,
    min_distance: int = 10
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Detect local maxima and return peak indices and peak amplitudes.
    """
    abs_sig = np.abs(signal)
    if threshold is None:
        threshold = np.mean(abs_sig) + 2.0 * np.std(abs_sig)

    if SCIPY_AVAILABLE:
        try:
            peaks, properties = find_peaks(abs_sig, height=threshold, distance=min_distance)
            peak_amps = abs_sig[peaks]
            return peaks, peak_amps
        except Exception:
            pass

    # NumPy peak finder fallback
    peaks_list = []
    n = len(abs_sig)
    for i in range(1, n - 1):
        if abs_sig[i] > threshold and abs_sig[i] > abs_sig[i - 1] and abs_sig[i] >= abs_sig[i + 1]:
            if not peaks_list or (i - peaks_list[-1]) >= min_distance:
                peaks_list.append(i)

    peaks = np.array(peaks_list, dtype=int)
    peak_amps = abs_sig[peaks] if len(peaks) > 0 else np.array([])
    return peaks, peak_amps


def calculate_rms(signal: np.ndarray) -> float:
    """
    Calculate Root Mean Square (RMS) of a signal.
    """
    if len(signal) == 0:
        return 0.0
    return float(np.sqrt(np.mean(signal ** 2)))


def calculate_energy(signal: np.ndarray) -> float:
    """
    Calculate total energy: integral of squared signal.
    """
    if len(signal) == 0:
        return 0.0
    return float(np.sum(signal ** 2))


def calculate_dominant_frequency(
    signal: np.ndarray,
    sample_rate_hz: int = 1000,
    min_freq: float = 5.0,
    max_freq: float = 480.0
) -> Tuple[float, float]:
    """
    Compute FFT and identify dominant frequency and peak spectral power.
    """
    n = len(signal)
    if n < 4:
        return 0.0, 0.0

    # Apply Hanning window to reduce spectral leakage
    windowed = signal * np.hanning(n)
    fft_vals = np.fft.rfft(windowed)
    fft_freqs = np.fft.rfftfreq(n, d=1.0 / sample_rate_hz)
    magnitudes = np.abs(fft_vals)

    # Filter frequencies of interest
    valid_mask = (fft_freqs >= min_freq) & (fft_freqs <= max_freq)
    if not np.any(valid_mask):
        return 0.0, 0.0

    valid_freqs = fft_freqs[valid_mask]
    valid_mags = magnitudes[valid_mask]

    dom_idx = np.argmax(valid_mags)
    dom_freq = float(valid_freqs[dom_idx])
    peak_power = float(valid_mags[dom_idx])

    return dom_freq, peak_power


def estimate_impact_timing_and_duration(
    signal: np.ndarray,
    sample_rate_hz: int = 1000,
    threshold_factor: float = 3.0
) -> Tuple[Optional[float], float]:
    """
    Estimate when impact occurs and duration of disturbance above noise floor.
    """
    abs_sig = np.abs(signal)
    baseline_noise = np.mean(abs_sig[: int(sample_rate_hz * 0.3)]) if len(abs_sig) > 300 else np.mean(abs_sig)
    threshold = baseline_noise + threshold_factor * (np.std(abs_sig[:300]) if len(abs_sig) > 300 else np.std(abs_sig))

    above_threshold = np.where(abs_sig > max(0.15, threshold))[0]
    if len(above_threshold) == 0:
        return None, 0.0

    start_idx = above_threshold[0]
    end_idx = above_threshold[-1]

    impact_time_s = float(start_idx / sample_rate_hz)
    duration_s = float((end_idx - start_idx) / sample_rate_hz)

    return impact_time_s, duration_s
