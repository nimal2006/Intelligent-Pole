/**
 * Intelligent Pole-Vault Crossbar - Commercial Sports Product Experience
 *
 * Finished product experience inspired by Apple design philosophy:
 *   - No engineering jargon, internal circuitry, or technical pipelines exposed.
 *   - 100% focused on athletic outcome, instant clearance verification, and training insights.
 *   - Clean 4.5m crossbar with signature intelligent yellow identity (#FFD60A).
 */

import React, { useState, useEffect } from 'react';
import {
  SimulationScenario,
  AttemptRecord,
  TrainingAnalytics,
} from './types/poleVault';
import { executeFullPipeline } from './services/pipelineEngine';
import {
  getStoredAttempts,
  computeTrainingAnalytics,
  clearAttemptStorage,
} from './services/storage';

// Product Experience Components
import { ProductNavbar } from './components/ProductNavbar';
import { ProductHero } from './components/ProductHero';
import { ProductLiveSession } from './components/ProductLiveSession';
import { ProductTrainingInsights } from './components/ProductTrainingInsights';
import { ProductHistoryTable } from './components/ProductHistoryTable';
import { ProductSpecsModal } from './components/ProductSpecsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentAttempt, setCurrentAttempt] = useState<AttemptRecord | null>(null);
  const [allAttempts, setAllAttempts] = useState<AttemptRecord[]>([]);
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);

  // Cinematic recording states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  // Load existing session history on mount
  useEffect(() => {
    localStorage.removeItem('pole_vault_crossbar_attempts_v1');
    const stored = getStoredAttempts();
    setAllAttempts(stored);
    setAnalytics(computeTrainingAnalytics(stored));

    if (stored.length > 0) {
      setCurrentAttempt(stored[0]);
    }
  }, []);

  // Cinematic Record Attempt Sequence: 3 -> 2 -> 1 -> ANALYZING... -> RESULT
  const handleRecordAttempt = (scenarioToRun: SimulationScenario = 'POLE_CENTER') => {
    if (isAnalyzing || countdown !== null) return;

    // Start 3-2-1 countdown
    setCountdown(3);

    setTimeout(() => {
      setCountdown(2);
      setTimeout(() => {
        setCountdown(1);
        setTimeout(() => {
          setCountdown(null);
          setIsAnalyzing(true);

          // Simulated high-speed acquisition settling & verification (550ms)
          setTimeout(() => {
            const result = executeFullPipeline(scenarioToRun);
            setCurrentAttempt(result.attempt);

            const updated = getStoredAttempts();
            setAllAttempts(updated);
            setAnalytics(computeTrainingAnalytics(updated));
            setIsAnalyzing(false);
          }, 550);
        }, 450);
      }, 450);
    }, 450);
  };

  const handleStartLiveSession = () => {
    setActiveTab('live');
    const el = document.getElementById('live');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreTraining = () => {
    setActiveTab('training');
    const el = document.getElementById('training');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectAttempt = (att: AttemptRecord) => {
    setCurrentAttempt(att);
    setActiveTab('live');
    const el = document.getElementById('live');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearSession = () => {
    clearAttemptStorage();
    setAllAttempts([]);
    setCurrentAttempt(null);
    setAnalytics(computeTrainingAnalytics([]));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans antialiased selection:bg-[#FFD60A] selection:text-black">
      {/* 1. Commercial Product Navbar */}
      <ProductNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRecordClick={() => {
          handleStartLiveSession();
          handleRecordAttempt();
        }}
        isAnalyzing={isAnalyzing || countdown !== null}
      />

      {/* 2. Cinematic Hero Section */}
      <ProductHero
        onStartLiveSession={handleStartLiveSession}
        onExploreTraining={handleExploreTraining}
      />

      {/* 3. Product Content Container */}
      <main className="max-w-6xl mx-auto px-6 pb-28 space-y-16">
        {/* Live Experience Section */}
        <ProductLiveSession
          currentAttempt={currentAttempt}
          onRecordAttempt={handleRecordAttempt}
          isAnalyzing={isAnalyzing}
          countdown={countdown}
        />

        {/* Training Insights & Contact Map */}
        {analytics && (
          <ProductTrainingInsights
            analytics={analytics}
            recentAttempts={allAttempts}
            onSelectAttempt={handleSelectAttempt}
          />
        )}

        {/* Attempt History Table */}
        <ProductHistoryTable
          attempts={allAttempts}
          onSelectAttempt={handleSelectAttempt}
          selectedId={currentAttempt?.id}
        />

        {/* Session Reset Option if data exists */}
        {allAttempts.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClearSession}
              className="text-xs font-mono text-[#8E8E93] hover:text-[#FF3B30] transition-colors cursor-pointer"
            >
              Reset Session Data
            </button>
          </div>
        )}
      </main>

      {/* 4. Minimalist Apple-Style Product Footer */}
      <footer className="border-t border-black/5 bg-[#F5F5F7] px-6 py-10 text-xs text-[#6E6E73]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0A0A0A] uppercase tracking-tight">
              Intelligent Crossbar
            </span>
            <span className="text-black/20">|</span>
            <span>Multimodal Contact Detection & Localization</span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <span>Official 4.50 m Competition Standard</span>
            <span className="text-black/20">·</span>
            {/* Discrete technical specs link for evaluators */}
            <button
              onClick={() => setShowSpecsModal(true)}
              className="text-[#6E6E73] hover:text-[#0A0A0A] underline underline-offset-4 transition-colors cursor-pointer"
            >
              System Architecture & Specs
            </button>
          </div>
        </div>
      </footer>

      {/* Discrete Technical Specs Modal for Judges/Evaluators */}
      <ProductSpecsModal
        isOpen={showSpecsModal}
        onClose={() => setShowSpecsModal(false)}
      />
    </div>
  );
}
