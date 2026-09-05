import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Disc, Globe } from 'lucide-react';
import {
  GENRE_PRESETS, getGenrePresetsByGroup, type Genre, type TrackType, TRACK_DEFS,
} from '../data';
import { PlatformCardGrid, PlatformSummaryBadge } from './PlatformSelector';

interface GenreSelectorProps {
  onSelect: (genre: Genre, tracks: TrackType[]) => void;
}

export function GenreSelector({ onSelect }: GenreSelectorProps) {
  const [step, setStep] = useState<'platform' | 'style'>('platform');
  const [building, setBuilding] = useState<Genre | null>(null);
  const [buildStep, setBuildStep] = useState(0);

  const handleSelect = (genre: Genre, tracks: TrackType[]) => {
    setBuilding(genre);
    setBuildStep(0);
    // Animate through build steps
    const steps = [0, 1, 2];
    steps.forEach((s, i) => {
      setTimeout(() => setBuildStep(s), (i + 1) * 400);
    });
    setTimeout(() => {
      onSelect(genre, tracks);
      setBuilding(null);
    }, 1600);
  };

  const preset = building ? GENRE_PRESETS.find(p => p.genre === building) : null;
  const groups = getGenrePresetsByGroup();

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <AnimatePresence mode="wait">
        {building && preset ? (
          <BuildingView key="building" preset={preset} buildStep={buildStep} />
        ) : step === 'platform' ? (
          <motion.div
            key="platform"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center w-full"
          >
            <div className="text-center mb-6">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">
                STEP 1 OF 2
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white/95 mt-2.5 mb-1"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Where will you upload the song?
              </h2>
              <p className="text-xs text-white/35 font-mono max-w-xl mx-auto">
                Every dB target in the session — subgroup buses, mix-bus headroom, limiter ceiling
                and the LUFS target — is set from this choice.
              </p>
            </div>

            <PlatformCardGrid />

            <button
              onClick={() => setStep('style')}
              className="mt-6 flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold text-white transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
              style={{ background: 'linear-gradient(135deg, #3A86FF, #8338EC)' }}
            >
              Choose the song style
              <ArrowRight size={13} />
            </button>

            <div className="mt-4 text-[10px] font-mono text-white/20 text-center">
              Default is <span className="text-white/40">YouTube + Spotify</span> — one master that
              passes both pipelines
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="style"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center w-full"
          >
            <div className="flex flex-col items-center text-center mb-5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono font-bold">
                STEP 2 OF 2
              </span>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white/95 mt-2.5 mb-2"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                What are you making?
              </h2>
              <PlatformSummaryBadge />
            </div>

            {groups.map(group => (
              <div key={group.group} className="w-full mb-5">
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className="text-base">{group.icon}</span>
                  <h3 className="text-xs font-mono font-bold text-white/60 uppercase tracking-wider">
                    {group.label}
                  </h3>
                  <span className="text-[9px] font-mono text-white/20">
                    {group.presets.length} presets
                  </span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {group.presets.map((p, i) => (
                    <motion.button
                      key={p.genre}
                      initial={{ opacity: 0, y: 16, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                      whileHover={{ scale: 1.04, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(p.genre, p.tracks)}
                      className="relative rounded-2xl p-3.5 backdrop-blur-md border cursor-pointer overflow-hidden group transition-all duration-300 text-left"
                      style={{ background: `${p.color}06`, borderColor: `${p.color}20` }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `radial-gradient(circle at 50% 50%, ${p.color}15, transparent 70%)` }}
                      />

                      <div className="relative z-10 flex flex-col items-center gap-1.5">
                        <motion.div
                          className="text-2xl"
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          {p.icon}
                        </motion.div>
                        <div className="text-[11px] font-bold text-center leading-tight" style={{ color: p.color }}>
                          {p.name}
                        </div>
                        {p.region && (
                          <div className="text-[8px] font-mono text-white/30 -mt-0.5">{p.region}</div>
                        )}
                        <div className="text-[9px] text-white/25 font-mono text-center leading-tight">
                          {p.description}
                        </div>

                        {p.referenceSongs && p.referenceSongs.length > 0 && (
                          <div className="w-full mt-1 pt-1.5 border-t border-white/5">
                            <div className="text-[7px] font-mono text-white/20 uppercase tracking-wider mb-0.5">
                              Reference
                            </div>
                            <div className="text-[8px] font-mono text-white/35 leading-tight line-clamp-2">
                              {p.referenceSongs.slice(0, 2).join(' · ')}
                            </div>
                          </div>
                        )}

                        {p.tracks.length > 0 && (
                          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
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
              </div>
            ))}

            <button
              onClick={() => setStep('platform')}
              className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/70 transition-colors mt-1"
            >
              <ArrowLeft size={11} />
              Back to upload destination
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BuildingView({ preset, buildStep }: { preset: (typeof GENRE_PRESETS)[number]; buildStep: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[340px]"
    >
      <motion.div
        className="text-5xl mb-4"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {preset.icon}
      </motion.div>
      <motion.div
        className="text-xl font-bold mb-1"
        style={{ color: preset.color, fontFamily: 'Outfit, sans-serif' }}
      >
        Building {preset.name} Session
      </motion.div>
      {preset.region && (
        <div className="text-[10px] font-mono text-white/35 mb-3">{preset.region}</div>
      )}

      {/* Build progress steps */}
      <div className="flex items-center gap-3 mt-3">
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
            <span
              className="text-[9px] font-mono"
              style={{ color: buildStep >= s.step ? preset.color : 'rgba(255,255,255,0.2)' }}
            >
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

      {/* Reference songs & mix notes */}
      {preset.referenceSongs && preset.referenceSongs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-5 max-w-md w-full p-3 rounded-2xl border"
          style={{ background: `${preset.color}08`, borderColor: `${preset.color}22` }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Disc size={10} style={{ color: preset.color }} />
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: preset.color }}>
              Reference songs to A/B against
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {preset.referenceSongs.map(song => (
              <span
                key={song}
                className="text-[9px] font-mono text-white/50 px-2 py-0.5 rounded-full bg-white/5 border border-white/5"
              >
                {song}
              </span>
            ))}
          </div>
          {preset.mixNotes && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex gap-1.5">
              <Sparkles size={10} className="text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-[9px] font-mono text-white/45 leading-snug">{preset.mixNotes}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export function GenreGlobeHint() {
  return <Globe size={11} />;
}
