import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, CornerDownRight } from 'lucide-react';
import { type Track, BUS_DEFS } from '../data';

interface ConfirmDeleteModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({ track, isOpen, onClose, onConfirm }: ConfirmDeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen || !track) return null;

  const busDef = BUS_DEFS[track.bus];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/20 shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #161c2c 0%, #0d121f 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 71, 111, 0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-amber-500" />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Remove Track
                  </h3>
                  <p className="text-xs text-white/40 font-mono">
                    Confirm deletion from audio routing
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Track Info Card */}
            <div
              className="rounded-xl p-3 mb-4 border"
              style={{
                background: `${track.color}08`,
                borderColor: `${track.color}25`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner"
                    style={{ background: `${track.color}20`, color: track.color }}
                  >
                    {track.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">{track.name}</div>
                    <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: busDef.color }}>
                      <CornerDownRight size={10} />
                      Routed to {busDef.name}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white/70">
                    {track.currentDb.toFixed(1)} dBFS
                  </div>
                  <div className="text-[9px] font-mono text-white/30">
                    {track.pan === 0 ? 'Center' : track.pan < 0 ? `L ${Math.round(Math.abs(track.pan) * 100)}%` : `R ${Math.round(track.pan * 100)}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning description */}
            <p className="text-xs text-white/60 leading-relaxed mb-5 font-sans">
              Are you sure you want to remove <span className="text-white font-semibold">{track.name}</span>? This will permanently disconnect its channel strip and all routing into <span style={{ color: busDef.color }} className="font-semibold">{busDef.name}</span>.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white transition-all shadow-lg hover:shadow-red-500/25 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #EF476F, #E63946)',
                  border: '1px solid rgba(239, 71, 111, 0.4)',
                }}
              >
                <Trash2 size={13} />
                Confirm Remove
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
