import { useState } from 'react';
import { motion } from 'framer-motion';
import { LevelMeter, LevelHealthBadge } from './LevelMeter';
import { getLevelHealth } from '../data';

export function LevelReference() {
  const [dbLevel, setDbLevel] = useState(-18);
  const [lufsLevel, setLufsLevel] = useState(-14);
  const health = getLevelHealth(dbLevel, [-24, -6]);

  const getDbLabel = (db: number) => {
    if (db > -1) return { text: 'CLIPPING', color: '#EF476F' };
    if (db > -3) return { text: 'Risk of Clipping', color: '#EF476F' };
    if (db > -6) return { text: 'Strong', color: '#FFD166' };
    if (db > -12) return { text: 'Healthy', color: '#06D6A0' };
    if (db > -24) return { text: 'Good', color: '#06D6A0' };
    if (db > -40) return { text: 'Quiet', color: '#FFD166' };
    return { text: 'Too Low', color: '#EF476F' };
  };

  const getLufsLabel = (lufs: number) => {
    if (lufs > -5) return { text: 'Very Loud', color: '#EF476F' };
    if (lufs > -8) return { text: 'Loud', color: '#FFD166' };
    if (lufs > -14) return { text: 'Normal', color: '#06D6A0' };
    if (lufs > -23) return { text: 'Quiet', color: '#FFD166' };
    return { text: 'Very Quiet', color: '#EF476F' };
  };

  const dbLabel = getDbLabel(dbLevel);
  const lufsLabel = getLufsLabel(lufsLevel);

  const dbMarks = [
    { db: 0, label: '0', desc: 'Full scale' },
    { db: -3, label: '-3', desc: 'Danger zone' },
    { db: -6, label: '-6', desc: 'Strong signal' },
    { db: -12, label: '-12', desc: 'Healthy peak' },
    { db: -18, label: '-18', desc: 'Sweet spot' },
    { db: -24, label: '-24', desc: 'Conservative' },
    { db: -48, label: '-48', desc: 'Very quiet' },
    { db: -60, label: '-60', desc: 'Silence' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white/90 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
        Level Reference
      </h2>
      <p className="text-xs text-white/30 font-mono mb-6">
        Move the sliders to see what different levels mean
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* dBFS Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 backdrop-blur-md border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="text-sm font-bold text-white/80 mb-4">dBFS Peak Levels</div>

          {/* Large meter */}
          <div className="flex items-center gap-4 mb-4">
            <LevelMeter db={dbLevel} range={[-60, 0]} height={180} width={30} showLabel={true} />
            <div className="flex-1">
              <motion.div
                className="text-3xl font-mono font-bold mb-2"
                style={{ color: dbLabel.color }}
                key={dbLabel.text}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {dbLevel.toFixed(1)} dBFS
              </motion.div>
              <div
                className="text-sm font-bold mb-3"
                style={{ color: dbLabel.color }}
              >
                {dbLabel.text}
              </div>
              <LevelHealthBadge health={health} size="lg" />
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={-60}
            max={0}
            step={0.5}
            value={dbLevel}
            onChange={e => setDbLevel(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-4"
            style={{
              background: `linear-gradient(to right, #06D6A0, #FFD166 60%, #EF476F 85%, #ff0000)`,
            }}
          />

          {/* Reference marks */}
          <div className="space-y-1.5">
            {dbMarks.map(mark => (
              <div key={mark.db} className="flex items-center gap-2">
                <div
                  className="w-8 text-[9px] font-mono text-right"
                  style={{ color: getDbLabel(mark.db).color }}
                >
                  {mark.label}
                </div>
                <div className="flex-1 h-px" style={{ background: `${getDbLabel(mark.db).color}30` }} />
                <div className="text-[8px] font-mono text-white/25 w-24">{mark.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* LUFS Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 backdrop-blur-md border border-white/5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="text-sm font-bold text-white/80 mb-4">LUFS Integrated Loudness</div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-10 h-[180px] rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="absolute bottom-0 left-0 right-0"
                style={{ background: `linear-gradient(to top, #3A86FF, #06D6A0 40%, #FFD166 70%, #EF476F 90%)` }}
                animate={{ height: `${((lufsLevel + 40) / 40) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <div className="flex-1">
              <motion.div
                className="text-3xl font-mono font-bold mb-2"
                style={{ color: lufsLabel.color }}
                key={lufsLabel.text}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {lufsLevel.toFixed(1)} LUFS
              </motion.div>
              <div className="text-sm font-bold mb-3" style={{ color: lufsLabel.color }}>
                {lufsLabel.text}
              </div>
              <div className="text-[10px] font-mono text-white/30">
                LUFS measures perceived loudness over time
              </div>
            </div>
          </div>

          <input
            type="range"
            min={-40}
            max={0}
            step={0.5}
            value={lufsLevel}
            onChange={e => setLufsLevel(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mb-4"
            style={{
              background: `linear-gradient(to right, #3A86FF, #06D6A0 40%, #FFD166 70%, #EF476F 90%)`,
            }}
          />

          {/* LUFS targets */}
          <div className="space-y-2 mt-4">
            <div className="text-[10px] font-mono text-white/40 mb-2">Common Targets:</div>
            {[
              { target: -14, label: 'Spotify / YouTube', color: '#06D6A0' },
              { target: -16, label: 'Apple Music / Tidal', color: '#3A86FF' },
              { target: -24, label: 'Broadcast (EBU R128)', color: '#FFD166' },
              { target: -18, label: 'Podcast (typical)', color: '#8338EC' },
            ].map(item => (
              <button
                key={item.target}
                onClick={() => setLufsLevel(item.target)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-[10px] font-mono" style={{ color: item.color }}>{item.target} LUFS</span>
                <span className="text-[9px] font-mono text-white/25 ml-auto">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* True Peak explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-2xl p-5 backdrop-blur-md border border-white/5"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="text-sm font-bold text-white/80 mb-3">True Peak vs Sample Peak</div>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-sm bg-blue-400" />
              <span className="text-[11px] font-mono text-white/60">Sample Peak</span>
            </div>
            <div className="text-[10px] font-mono text-white/30 ml-5">
              What your DAW meter shows — the loudest sample value
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-sm bg-red-400" />
              <span className="text-[11px] font-mono text-white/60">True Peak</span>
            </div>
            <div className="text-[10px] font-mono text-white/30 ml-5">
              The actual peak between samples — can be up to 1–3 dB higher
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px] font-mono text-white/25">
          💡 Keep True Peak below -1 dBTP to prevent inter-sample clipping on playback
        </div>
      </motion.div>
    </div>
  );
}
