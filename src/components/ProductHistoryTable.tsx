/**
 * Intelligent Crossbar - Product Attempt History Table
 * Minimal, clean table showing only product-relevant information:
 * ATTEMPT | RESULT | CONTACT | LOCATION | CONFIDENCE | TIME | DETAILS
 *
 * Integrated with framer-motion:
 * - Uses 'framer-motion' with 'AnimatePresence' and 'layout' props on row elements
 * - Staggered entrance animations: initial={{ opacity: 0, y: 20 }} and animate={{ opacity: 1, y: 0 }}
 * - Hardware-accelerated spring layout reflow as new attempts are added during live sessions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttemptRecord } from '../types/poleVault';
import { AttemptDetailModal } from './AttemptDetailModal';

interface ProductHistoryTableProps {
  attempts: AttemptRecord[];
  onSelectAttempt?: (attempt: AttemptRecord) => void;
  selectedId?: number;
}

export const ProductHistoryTable: React.FC<ProductHistoryTableProps> = ({
  attempts,
  onSelectAttempt,
  selectedId,
}) => {
  const [detailAttempt, setDetailAttempt] = useState<AttemptRecord | null>(null);

  const handleRowClick = (att: AttemptRecord) => {
    setDetailAttempt(att);
    onSelectAttempt?.(att);
  };

  return (
    <section id="history" className="apple-card p-8 sm:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0A0A0A] uppercase font-sans">
            Attempt History
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
            Click any vault attempt to view expanded impact intensity and contact duration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#6E6E73]">
            {attempts.length === 0
              ? '0 Recorded Vaults'
              : `${attempts.length} Recorded Vaults`}
          </span>
        </div>
      </div>

      {/* Clean Table or Empty Notice with AnimatePresence */}
      <AnimatePresence mode="wait">
        {attempts.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="py-16 text-center text-xs font-mono text-[#6E6E73] bg-[#FAFAFC] rounded-2xl border border-black/5"
          >
            <div className="text-sm font-sans font-bold text-[#0A0A0A] mb-1">
              No Attempts Logged
            </div>
            <div>Click &ldquo;Record Attempt&rdquo; in the live session to log your first vault.</div>
          </motion.div>
        ) : (
          <motion.div
            key="table-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase tracking-wider text-[#6E6E73] border-b border-black/5 pb-2">
                <tr>
                  <th className="py-3 px-3 font-bold text-[#0A0A0A]">Attempt</th>
                  <th className="py-3 px-3 font-semibold">Result</th>
                  <th className="py-3 px-3 font-semibold">Contact</th>
                  <th className="py-3 px-3 font-semibold">Location</th>
                  <th className="py-3 px-3 font-semibold">Confidence</th>
                  <th className="py-3 px-3 font-semibold">Time</th>
                  <th className="py-3 px-3 font-semibold text-right">Statistics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-[#1D1D1F]">
                {/* Wrapped rows with framer-motion AnimatePresence and layout props */}
                <AnimatePresence initial={false}>
                  {attempts.map((att, idx) => {
                    const isSelected = selectedId === att.id;
                    const isSuccess = att.is_success;
                    const timeStr = att.timestamp.split(' ')[1]?.slice(0, 5) || '14:05';
                    const isNewest = idx === 0;

                    return (
                      <motion.tr
                        key={att.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        transition={{
                          duration: 0.35,
                          delay: idx * 0.05,
                          ease: 'easeOut',
                          layout: { type: 'spring', stiffness: 350, damping: 28 },
                        }}
                        whileHover={{ backgroundColor: '#FAFAFC' }}
                        onClick={() => handleRowClick(att)}
                        className={`cursor-pointer transition-colors group ${
                          isSelected ? 'bg-[#FFD60A]/10 font-bold' : ''
                        }`}
                      >
                        {/* Attempt Number */}
                        <td className="py-3.5 px-3 font-bold text-[#0A0A0A]">
                          <div className="flex items-center gap-1.5">
                            <span>#{String(att.attempt_number).padStart(3, '0')}</span>
                            {isNewest && (
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-[#FFD60A] shadow-[0_0_6px_#FFD60A] animate-pulse"
                                title="Latest Recorded Attempt"
                              />
                            )}
                          </div>
                        </td>

                        {/* Result Badge */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isSuccess
                                ? 'bg-[#34C759]/15 text-[#34C759]'
                                : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                            }`}
                          >
                            {isSuccess ? 'Clearance' : 'Contact'}
                          </span>
                        </td>

                        {/* Contact Type */}
                        <td className="py-3.5 px-3 font-sans font-medium text-[#0A0A0A]">
                          {isSuccess
                            ? '—'
                            : att.contact_type === 'POLE_CONTACT'
                            ? 'Pole'
                            : att.contact_type === 'BODY_CONTACT'
                            ? 'Body'
                            : 'Other'}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-3 font-sans font-medium text-[#0A0A0A]">
                          {isSuccess ? '—' : `${att.location} (${att.estimated_x_m.toFixed(2)}m)`}
                        </td>

                        {/* Confidence */}
                        <td className="py-3.5 px-3 font-bold tabular-nums">
                          {(att.confidence * 100).toFixed(0)}%
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-3 text-[#6E6E73]">
                          {timeStr}
                        </td>

                        {/* Details Action */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-[#0A0A0A] group-hover:text-[#FFCC00] group-hover:translate-x-0.5 transition-all">
                            <span>Details</span>
                            <span>→</span>
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Detail Modal Component */}
      <AttemptDetailModal
        attempt={detailAttempt}
        onClose={() => setDetailAttempt(null)}
        onLoadIntoLiveSession={onSelectAttempt}
      />
    </section>
  );
};
