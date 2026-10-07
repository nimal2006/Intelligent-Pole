/**
 * Intelligent Pole-Vault Crossbar - Signal Processing Module (TypeScript)
 * Implements digital filtering, RMS, energy, peak detection, and FFT dominant frequency.
 */

export function movingAverageFilter(signal: number[], windowSize = 5): number[] {
  const result: number[] = new Array(signal.length);
  const half = Math.floor(windowSize / 2);

  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = -half; j <= half; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < signal.length) {
        sum += signal[idx];
        count++;
      }
    }
    result[i] = sum / count;
  }
  return result;
}

export function removeDCOffset(signal: number[]): number[] {
  if (signal.length === 0) return [];
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  return signal.map((v) => v - mean);
}

export function calculateRMS(signal: number[]): number {
  if (signal.length === 0) return 0;
  const sumSq = signal.reduce((acc, v) => acc + v * v, 0);
  return Math.sqrt(sumSq / signal.length);
}

export function calculateEnergy(signal: number[]): number {
  return signal.reduce((acc, v) => acc + v * v, 0);
}

export function detectPeaks(
  signal: number[],
  threshold?: number,
  minDistance = 8
): { peakIndices: number[]; peakAmps: number[] } {
  const absSig = signal.map(Math.abs);
  const n = absSig.length;

  if (threshold === undefined) {
    const mean = absSig.reduce((a, b) => a + b, 0) / (n || 1);
    const variance = absSig.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n || 1);
    threshold = mean + 2.0 * Math.sqrt(variance);
  }

  const indices: number[] = [];
  const amps: number[] = [];

  for (let i = 1; i < n - 1; i++) {
    if (absSig[i] > threshold && absSig[i] > absSig[i - 1] && absSig[i] >= absSig[i + 1]) {
      if (indices.length === 0 || i - indices[indices.length - 1] >= minDistance) {
        indices.push(i);
        amps.push(absSig[i]);
      }
    }
  }

  return { peakIndices: indices, peakAmps: amps };
}

export function calculateDominantFrequency(
  signal: number[],
  sampleRateHz = 1000,
  minFreq = 5.0,
  maxFreq = 480.0
): { dominantFreq: number; peakPower: number } {
  const n = signal.length;
  if (n < 8) return { dominantFreq: 0, peakPower: 0 };

  // Sample or slice up to 1024 points for fast in-browser discrete Fourier analysis
  const maxN = Math.min(n, 1024);
  const startIdx = Math.max(0, Math.floor((n - maxN) / 2));
  const slice = signal.slice(startIdx, startIdx + maxN);
  const L = slice.length;

  // Windowed DFT over target frequency bands
  const numBins = 120;
  const freqStep = (maxFreq - minFreq) / numBins;

  let maxMag = 0;
  let domFreq = 0;

  for (let b = 0; b < numBins; b++) {
    const f = minFreq + b * freqStep;
    const omega = 2 * Math.PI * f / sampleRateHz;

    let real = 0;
    let imag = 0;

    for (let k = 0; k < L; k++) {
      // Hanning window
      const w = 0.5 * (1 - Math.cos((2 * Math.PI * k) / (L - 1)));
      const val = slice[k] * w;
      real += val * Math.cos(omega * k);
      imag -= val * Math.sin(omega * k);
    }

    const mag = Math.sqrt(real * real + imag * imag);
    if (mag > maxMag) {
      maxMag = mag;
      domFreq = f;
    }
  }

  return { dominantFreq: domFreq, peakPower: maxMag };
}

export function estimateImpactTimingAndDuration(
  signal: number[],
  sampleRateHz = 1000,
  thresholdFactor = 3.0
): { impactTimeS: number | null; durationS: number } {
  const absSig = signal.map(Math.abs);
  const n = absSig.length;
  if (n === 0) return { impactTimeS: null, durationS: 0 };

  const baselineLen = Math.min(300, Math.floor(n * 0.25));
  let sumBase = 0;
  for (let i = 0; i < baselineLen; i++) sumBase += absSig[i];
  const baseMean = sumBase / (baselineLen || 1);

  let varBase = 0;
  for (let i = 0; i < baselineLen; i++) varBase += Math.pow(absSig[i] - baseMean, 2);
  const baseStd = Math.sqrt(varBase / (baselineLen || 1));

  const threshold = Math.max(0.18, baseMean + thresholdFactor * baseStd);

  let firstIdx = -1;
  let lastIdx = -1;

  for (let i = 0; i < n; i++) {
    if (absSig[i] > threshold) {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    }
  }

  if (firstIdx === -1) {
    return { impactTimeS: null, durationS: 0 };
  }

  return {
    impactTimeS: Number((firstIdx / sampleRateHz).toFixed(4)),
    durationS: Number(((lastIdx - firstIdx) / sampleRateHz).toFixed(4)),
  };
}
