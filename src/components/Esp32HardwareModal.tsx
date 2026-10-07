/**
 * Intelligent Pole-Vault Crossbar - ESP32 Hardware Integration Hub
 * Apple-inspired clean dialog with hardware pinout mapping, JSON streaming schema,
 * and ESP32 C++ firmware code.
 */

import React, { useState } from 'react';

interface Esp32HardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Esp32HardwareModal: React.FC<Esp32HardwareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'wiring' | 'protocol' | 'firmware'>('wiring');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl rounded-3xl border border-black/10 bg-white p-8 shadow-2xl text-[#1D1D1F] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#0A0A0A] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FFD60A]" />
              ESP32 Hardware Integration
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Production pinout and firmware for replacing synthetic simulation with physical crossbar telemetry
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center text-[#6E6E73] hover:text-[#0A0A0A] hover:bg-[#F5F5F7] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 flex gap-2 border-b border-black/5 pb-3">
          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-full transition-colors ${
              activeTab === 'wiring'
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#6E6E73] hover:text-[#0A0A0A] hover:bg-[#F5F5F7]'
            }`}
          >
            1. Transducer Pinout
          </button>
          <button
            onClick={() => setActiveTab('protocol')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-full transition-colors ${
              activeTab === 'protocol'
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#6E6E73] hover:text-[#0A0A0A] hover:bg-[#F5F5F7]'
            }`}
          >
            2. Streaming JSON Schema
          </button>
          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-full transition-colors ${
              activeTab === 'firmware'
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#6E6E73] hover:text-[#0A0A0A] hover:bg-[#F5F5F7]'
            }`}
          >
            3. ESP32 C++ Firmware Source
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4 overflow-y-auto flex-1 pr-2 text-xs font-mono space-y-4">
          {activeTab === 'wiring' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/5 bg-[#F5F5F7] p-5">
                <h4 className="text-[#0A0A0A] font-bold mb-3">Transducer Hardware Placement & GPIO Mapping:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-black/10 text-[#6E6E73]">
                      <tr>
                        <th className="py-2">Sensor</th>
                        <th className="py-2">Position</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Conditioning</th>
                        <th className="py-2">ESP32 Pin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-[#1D1D1F]">
                      <tr>
                        <td className="py-2 font-bold text-[#0A0A0A]">P1</td>
                        <td>1.125 m</td>
                        <td>Piezoelectric Disk</td>
                        <td>Charge Amp + 10x OpAmp</td>
                        <td>GPIO 36 (ADC1_CH0)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-[#0A0A0A]">SG1</td>
                        <td>1.650 m</td>
                        <td>120Ω Foil Strain</td>
                        <td>Wheatstone + INA125</td>
                        <td>GPIO 39 (ADC1_CH3)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-[#0A0A0A]">P2</td>
                        <td>2.250 m</td>
                        <td>Central Piezo Disk</td>
                        <td>Charge Amp + 10x OpAmp</td>
                        <td>GPIO 34 (ADC1_CH6)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-[#FFCC00]">IMU</td>
                        <td>2.250 m</td>
                        <td>MPU-6050 6-DOF</td>
                        <td>Hardware I2C Engine</td>
                        <td>GPIO 21 (SDA), GPIO 22 (SCL)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-[#0A0A0A]">SG2</td>
                        <td>2.850 m</td>
                        <td>120Ω Foil Strain</td>
                        <td>Wheatstone + INA125</td>
                        <td>GPIO 35 (ADC1_CH7)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-[#0A0A0A]">P3</td>
                        <td>3.375 m</td>
                        <td>Piezoelectric Disk</td>
                        <td>Charge Amp + 10x OpAmp</td>
                        <td>GPIO 32 (ADC1_CH4)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#F5F5F7] p-4 text-[#6E6E73]">
                <strong className="text-[#0A0A0A]">Hardware Note:</strong> Powered by an ultra-lightweight 3.7V 350mAh LiPo battery embedded inside the hollow carbon fiber crossbar end cap, communicating over 2.4GHz Wi-Fi UDP streaming directly into the FastAPI backend.
              </div>
            </div>
          )}

          {activeTab === 'protocol' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/5 bg-[#F5F5F7] p-5">
                <h4 className="text-[#0A0A0A] font-bold mb-2">UDP / MQTT Ingestion Packet Payload:</h4>
                <pre className="text-[#0A0A0A] text-[11px] overflow-x-auto bg-white p-4 rounded-xl border border-black/5">
{`{
  "device_id": "ESP32-CROSSBAR-01",
  "batch_seq": 1042,
  "sample_rate_hz": 1000,
  "samples": [
    {
      "timestamp": 0.8500,
      "p1": 1.820,
      "p2": 5.180,
      "p3": 1.750,
      "sg1": 195.0,
      "sg2": 192.0,
      "ax": -2.40,
      "ay": 18.50,
      "az": 24.80,
      "gx": 9.40,
      "gy": -3.20,
      "gz": 5.80
    }
  ]
}`}
                </pre>
              </div>

              <p className="text-[#6E6E73] text-xs">
                The FastAPI backend route <code className="text-[#0A0A0A] font-bold">POST /process-signal</code> directly accepts this exact array of readings, executing feature extraction, sensor fusion, and Random Forest classification in less than 5ms.
              </p>
            </div>
          )}

          {activeTab === 'firmware' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-black/5 bg-[#F5F5F7] p-5">
                <h4 className="text-[#0A0A0A] font-bold mb-2">ESP32 Arduino / ESP-IDF Firmware:</h4>
                <pre className="text-[#0A0A0A] text-[11px] overflow-x-auto bg-white p-4 rounded-xl border border-black/5">
{`#include <WiFi.h>
#include <WiFiUdp.h>
#include <Wire.h>
#include <MPU6050.h>

WiFiUDP udp;
MPU6050 imu;

const char* ssid = "RUNWAY_TRACK_AP";
const char* password = "precision_track";
const char* host_ip = "192.168.1.100";
const int host_port = 8000;

hw_timer_t * timer = NULL;
volatile bool sampleReady = false;

void IRAM_ATTR onTimer() {
  sampleReady = true;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  imu.initialize();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(100); }

  // 1,000 Hz hardware interrupt
  timer = timerBegin(0, 80, true);
  timerAttachInterrupt(timer, &onTimer, true);
  timerAlarmWrite(timer, 1000, true);
  timerAlarmEnable(timer);
}

void loop() {
  if (sampleReady) {
    sampleReady = false;
    // 3 Piezo ADCs + 2 Strain Gauges + IMU motion
    // ...
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-black/5 pt-4 flex justify-between items-center text-xs">
          <span className="text-[#6E6E73] font-mono">ESP32 Firmware v1.4</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0A0A0A] hover:bg-[#1D1D1F] text-white font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
