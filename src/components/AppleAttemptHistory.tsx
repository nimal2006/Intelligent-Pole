/**
 * Apple-inspired Attempt History Table
 * Minimal, spacious table layout with subtle hover elevation and clear metadata.
 */

import React from 'react';
import { motion } from 'motion/react';
import { AttemptRecord } from '../types/poleVault';

interface AppleAttemptHistoryProps {
  attempts: AttemptRecord[];
  onSelectAttempt: (attempt: AttemptRecord) => void;
  selectedId?: number;
}

export const AppleAttemptHistory: React.FC<AppleAttemptHistoryProps> = ({
  attempts,
  onSelectAttempt,
  selectedId,
}) => {
  return (
    <div id="history" className="apple-card p-8 sm:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0A0A0A] uppercase">
            Attempt History
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
            Timestamped vault telemetry records and classified contact outcomes
          </p>
        </div>

        <span className="text-xs font-mono text-[#6E6E73]">
          {attempts.length === 0
            ? '0 Recorded Attempts'
            : `Showing ${attempts.length} Recorded Attempts`}
        </span>
      </div>

      {/* Clean Minimal Table or Empty State */}
      {attempts.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-[#6E6E73] bg-[#FAFAFC] rounded-2xl border border-black/5">
          <div className="text-base font-sans font-bold text-[#0A0A0A] mb-1">
            No Attempts Logged
          </div>
          <div>All demo data removed. Click &ldquo;Simulate Jump&rdquo; above to log the first attempt.</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono uppercase tracking-wider text-[#6E6E73] border-b border-black/5 pb-2">
              <tr>
                <th className="py-3 px-3 font-semibold">Attempt</th>
                <th className="py-3 px-3 font-semibold">Time</th>
                <th className="py-3 px-3 font-semibold">Result</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Location</th>
                <th className="py-3 px-3 font-semibold text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-mono text-[#1D1D1F]">
              {attempts.map((att) => {
                const isSelected = selectedId === att.id;
                const isSuccess = att.is_success;

                return (
                  <motion.tr
                    key={att.id}
                    whileHover={{ backgroundColor: '#FAFAFC' }}
                    onClick={() => onSelectAttempt(att)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#FFD60A]/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 font-bold text-[#0A0A0A]">
                      #{String(att.attempt_number).padStart(3, '0')}
                    </td>
                    <td className="py-3.5 px-3 text-[#6E6E73]">
                      {att.timestamp.split(' ')[1] || att.timestamp}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isSuccess
                            ? 'bg-[#34C759]/15 text-[#34C759]'
                            : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                        }`}
                      >
                        {isSuccess ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#0A0A0A] font-sans font-medium">
                      {att.contact_type === 'NO_CONTACT'
                        ? '—'
                        : att.contact_type === 'POLE_CONTACT'
                        ? 'Pole'
                        : att.contact_type === 'BODY_CONTACT'
                        ? 'Body'
                        : 'Other'}
                    </td>
                    <td className="py-3.5 px-3 text-[#0A0A0A] font-sans font-medium">
                      {att.location === 'NONE'
                        ? '—'
                        : `${att.location} (${att.estimated_x_m.toFixed(2)}m)`}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold tabular-nums">
                      {(att.confidence * 100).toFixed(0)}%
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
