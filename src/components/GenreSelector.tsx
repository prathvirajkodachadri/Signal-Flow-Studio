import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GENRE_PRESETS, type Genre, type TrackType, TRACK_DEFS, BUS_DEFS } from '../data';

interface GenreSelectorProps {
  onSelect: (genre: Genre, tracks: TrackType[]) => void;
}

export function GenreSelector({ onSelect }: GenreSelectorProps) {
  const [building, setBuilding] = useState<Genre | null>(null);
  const [buildStep, setBuildStep] = useState(0);

  const handleSelect = (genre: Genre, tracks: TrackType[]) => {
    setBuilding(genre);
    setBuildStep(0);
    // Animate through build steps
    const steps = [0, 1, 2];
    steps.forEach((step, i) => {
      setTimeout(() => setBuildStep(step), (i + 1) * 400);
    });
    setTimeout(() => {
      onSelect(genre, tracks);
      setBuilding(null);
    }, 1600);
  };

  const preset = building ? GENRE_PRESETS.find(p => p.genre === building) : null;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl">
      <AnimatePresence mode="wait">
        {building && preset ? (
          <motion.div
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[300px]"
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {preset.icon}
            </motion.div>
            <motion.div
              className="text-xl font-bold mb-2"
              style={{ color: preset.color, fontFamily: 'Outfit, sans-serif' }}
            >
              Building {preset.name} Session
            </motion.div>

            {/* Build progress steps */}
            <div className="flex items-center gap-3 mt-4">
              {[
                { step: 0, label: 'Creating tracks', icon: '🎵' },
                { step: 1, label: 'Routing to groups', icon: '🔀' },
                { step: 2, label: 'Connecting buses', icon: '⚡' },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: buildStep >= s.step ? 1 : 0.2,
                    y: 0,
                    scale: buildStep === s.step ? 1.1 : 1,
                  }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                  style={{
                    background: buildStep >= s.step ? `${preset.color}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${buildStep >= s.step ? `${preset.color}25` : 'rgba(255,255,255,0.03)'}`,
                  }}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[9px] font-mono" style={{ color: buildStep >= s.step ? preset.color : 'rgba(255,255,255,0.2)' }}>
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Animated track icons appearing */}
            <div className="flex gap-1 mt-4 flex-wrap justify-center max-w-sm">
              {preset.tracks.map((tt, i) => {
                const def = TRACK_DEFS[tt];
                return (
                  <motion.div
                    key={`${tt}-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: buildStep >= 0 ? 0.8 : 0, scale: buildStep >= 0 ? 1 : 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 500 }}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[8px]"
                    style={{ background: `${def.color}15`, border: `1px solid ${def.color}25`, color: def.color }}
                  >
                    {def.icon}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-white/95 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                What are you making?
              </h2>
              <p className="text-sm text-white/30 font-mono">
                Choose a style — we'll build your session
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
              {GENRE_PRESETS.map((p, i) => (
                <motion.button
                  key={p.genre}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  whileHover={{ scale: 1.06, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(p.genre, p.tracks)}
                  className="relative rounded-2xl p-4 backdrop-blur-md border cursor-pointer overflow-hidden group transition-all duration-300"
                  style={{
                    background: `${p.color}06`,
                    borderColor: `${p.color}20`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${p.color}15, transparent 70%)` }}
                  />

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <motion.div
                      className="text-3xl"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      {p.icon}
                    </motion.div>
                    <div className="text-sm font-bold" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-[9px] text-white/25 font-mono text-center leading-tight">{p.description}</div>
                    {p.tracks.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {p.tracks.slice(0, 6).map((tt, j) => {
                          const def = TRACK_DEFS[tt];
                          return (
                            <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: def.color, opacity: 0.5 }} />
                          );
                        })}
                        {p.tracks.length > 6 && (
                          <span className="text-[7px] font-mono text-white/15 ml-0.5">+{p.tracks.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-[10px] font-mono text-white/10 text-center"
            >
              Each preset creates a pre-routed session with recommended starting levels
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
