import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { FOLLOW_STEPS, BUS_DEFS } from '../data';

export function FollowTheSignal() {
  const { state, dispatch } = useSession();
  const { tracks, buses } = state;

  useEffect(() => {
    if (!state.followPlaying) return;
    const timer = setTimeout(() => {
      if (state.followStep < FOLLOW_STEPS.length - 1) {
        dispatch({ type: 'SET_FOLLOW_STEP', step: state.followStep + 1 });
      } else {
        dispatch({ type: 'TOGGLE_FOLLOW_PLAY' });
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [state.followPlaying, state.followStep, dispatch]);

  const step = FOLLOW_STEPS[state.followStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(10,14,26,0.97)', backdropFilter: 'blur(30px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="text-lg"
          >
            ⚡
          </motion.div>
          <div>
            <div className="text-base font-bold text-white/90" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Follow the Signal
            </div>
            <div className="text-[9px] font-mono text-white/25">
              Step {state.followStep + 1} of {FOLLOW_STEPS.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch({ type: 'SET_FOLLOW_STEP', step: Math.max(0, state.followStep - 1) })}
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FOLLOW_PLAY' })}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: state.followPlaying ? '#FF006E15' : '#06D6A015',
              color: state.followPlaying ? '#FF006E' : '#06D6A0',
              border: `1px solid ${state.followPlaying ? '#FF006E25' : '#06D6A025'}`,
            }}
          >
            {state.followPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_FOLLOW_STEP', step: Math.min(FOLLOW_STEPS.length - 1, state.followStep + 1) })}
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => { dispatch({ type: 'SET_FOLLOW_STEP', step: 0 }); if (state.followPlaying) dispatch({ type: 'TOGGLE_FOLLOW_PLAY' }); }}
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors ml-1"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={() => dispatch({ type: 'STOP_FOLLOW' })}
            className="ml-2 px-3 py-1.5 rounded-lg bg-white/5 text-[9px] font-mono text-white/40 hover:text-white/80 transition-colors"
          >
            Close ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-5 pt-3">
        {FOLLOW_STEPS.map((s, i) => (
          <div key={s.id} className="flex-1">
            <motion.div
              className="h-1 rounded-full"
              animate={{
                background: i <= state.followStep
                  ? `linear-gradient(to right, #06D6A0, #3A86FF)`
                  : 'rgba(255,255,255,0.04)',
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.followStep}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="text-center max-w-2xl"
          >
            <motion.div
              className="text-6xl mb-5"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {step.icon}
            </motion.div>
            <h3 className="text-2xl font-bold text-white/95 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {step.title}
            </h3>
            <p className="text-sm text-white/40 font-mono mb-8">
              {step.description}
            </p>

            {/* Visual representation */}
            <div className="flex justify-center">
              {state.followStep === 0 && (
                <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                  {tracks.map((track, i) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, scale: 0, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
                      className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl"
                      style={{
                        background: `${track.color}08`,
                        border: `1px solid ${track.color}20`,
                        boxShadow: `0 0 15px ${track.color}10`,
                      }}
                    >
                      <span className="text-base">{track.icon}</span>
                      <span className="text-[8px] font-mono" style={{ color: track.color }}>{track.name}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {state.followStep === 1 && (
                <div className="flex gap-3 flex-wrap justify-center">
                  {buses.map((bus, i) => (
                    <motion.div
                      key={bus.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12, type: 'spring', stiffness: 300 }}
                      className="px-5 py-4 rounded-xl"
                      style={{
                        background: `${bus.color}08`,
                        border: `1px solid ${bus.color}25`,
                        boxShadow: `0 0 20px ${bus.color}10`,
                      }}
                    >
                      <div className="text-2xl mb-1.5">{bus.icon}</div>
                      <div className="text-[11px] font-mono font-bold" style={{ color: bus.color }}>{bus.name}</div>
                      <div className="text-[8px] font-mono text-white/25 mt-0.5">{bus.trackIds.length} tracks combined</div>
                      <div className="flex gap-0.5 mt-2 justify-center">
                        {bus.trackIds.slice(0, 6).map((tid, j) => {
                          const t = tracks.find(tr => tr.id === tid);
                          return t ? (
                            <div key={j} className="w-2 h-2 rounded-full" style={{ background: t.color, opacity: 0.6 }} />
                          ) : null;
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {state.followStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex gap-2 mb-3 items-center">
                    {buses.map((bus, i) => (
                      <motion.div
                        key={bus.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ background: `${bus.color}15`, border: `1px solid ${bus.color}25`, color: bus.color }}
                      >
                        {bus.icon}
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <span className="text-white/15 text-xl">⬇</span>
                  </motion.div>
                  <div
                    className="mt-2 px-8 py-5 rounded-2xl"
                    style={{
                      background: '#FFD70008',
                      border: '1px solid #FFD70025',
                      boxShadow: '0 0 30px #FFD70010',
                    }}
                  >
                    <div className="text-3xl mb-2">Σ</div>
                    <div className="text-sm font-bold text-yellow-400">Mix Bus</div>
                    <div className="text-[9px] font-mono text-white/25 mt-1">All {buses.length} groups combine here</div>
                  </div>
                </motion.div>
              )}

              {state.followStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-3 rounded-xl" style={{ background: '#FFD70008', border: '1px solid #FFD70020' }}>
                      <span className="text-xl">Σ</span>
                      <div className="text-[8px] font-mono text-yellow-400/60">Mix Bus</div>
                    </div>
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                      <span className="text-white/15 text-lg">→</span>
                    </motion.div>
                    <div
                      className="px-6 py-5 rounded-2xl"
                      style={{
                        background: '#FFFFFF06',
                        border: '1px solid #FFFFFF15',
                        boxShadow: '0 0 30px #FFFFFF08',
                      }}
                    >
                      <div className="text-3xl mb-2">◉</div>
                      <div className="text-sm font-bold text-white/90">Pre-Master</div>
                      <div className="text-[9px] font-mono text-white/25 mt-1">Final output — ready for mastering</div>
                    </div>
                  </div>
                  <motion.div
                    className="mt-4 px-4 py-2 rounded-lg"
                    style={{ background: '#06D6A008', border: '1px solid #06D6A020' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <span className="text-[10px] font-mono text-green-400/80">✓ Signal reaches the output successfully</span>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step navigation */}
      <div className="flex gap-1 px-5 py-3 border-t border-white/5">
        {FOLLOW_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => dispatch({ type: 'SET_FOLLOW_STEP', step: i })}
            className={`flex-1 py-2 rounded-lg text-[9px] font-mono transition-all ${
              i === state.followStep ? 'text-white/85 bg-white/5' : 'text-white/20 hover:text-white/40'
            }`}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
