import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { type Track, getLevelHealth, BUS_DEFS } from '../data';
import { LevelMeter, MiniWaveform, LevelHealthBadge } from './LevelMeter';

interface TrackCardProps {
  track: Track;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onUpdateLevel: (id: string, db: number) => void;
  onRemove: (id: string) => void;
}

const WHY_TEXTS: Record<string, string> = {
  kick: 'Kicks need headroom for transient peaks. -18 to -12 dBFS gives plenty of room.',
  snare: 'Snares are punchy and transient-heavy. Keep peaks below -12 dBFS for clean processing.',
  hihat: 'Hi-hats are high-frequency and often loud. -22 to -16 keeps them controlled.',
  overheads: 'Overheads capture the full kit. Let them breathe with -20 to -14 dBFS.',
  toms: 'Toms have big dynamic swings. -18 to -12 gives room for the hits.',
  bass: 'Bass carries low-end energy. -18 to -12 keeps the foundation solid without clipping.',
  guitar: 'Guitars vary widely. -18 to -12 is a safe starting point for most styles.',
  piano: 'Piano has huge dynamic range. -20 to -14 preserves quiet and loud passages.',
  synth: 'Synths can be unpredictable. -18 to -12 gives headroom for filter sweeps.',
  pad: 'Pads are sustained and quiet. -22 to -16 keeps them in their place.',
  strings: 'Strings need dynamics. -20 to -14 preserves swells and fades.',
  brass: 'Brass is loud and bright. -18 to -12 tames the peaks.',
  leadVocal: 'The most important track! -18 to -12 keeps it clear and present.',
  bgVocal: 'Backing vocals support the lead. -20 to -14 keeps them in check.',
  fx: 'FX are often quiet and sporadic. -24 to -18 is plenty.',
  aux: 'Aux returns vary. -22 to -16 is a good starting point.',
  dialogue: 'Speech needs clarity. -18 to -12 keeps words intelligible.',
  sfx: 'Sound effects are quick and loud. -24 to -18 prevents surprises.',
  ambient: 'Ambience is subtle. -26 to -20 keeps it in the background.',
};

export function TrackCard({
  track, selected, highlighted, dimmed, onSelect, onToggleMute, onToggleSolo, onUpdateLevel, onRemove,
}: TrackCardProps) {
  const health = getLevelHealth(track.currentDb, track.dbRange);
  const busDef = BUS_DEFS[track.bus];
  const [showWhy, setShowWhy] = useState(false);
  const [hoverRemove, setHoverRemove] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: dimmed ? 0.2 : 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => onSelect(track.id)}
      className={`
        relative cursor-pointer rounded-xl p-2
        backdrop-blur-md border transition-all duration-200
        ${dimmed ? 'saturate-[0.3]' : ''}
      `}
      style={{
        background: selected ? `${track.color}12` : highlighted ? `${track.color}08` : 'rgba(255,255,255,0.025)',
        borderColor: selected ? `${track.color}70` : highlighted ? `${track.color}30` : 'rgba(255,255,255,0.05)',
        outline: selected ? `2px solid ${track.color}` : 'none',
        outlineOffset: '-1px',
        boxShadow: selected
          ? `0 0 20px ${track.color}25, inset 0 0 15px ${track.color}06`
          : highlighted
          ? `0 0 10px ${track.color}10`
          : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold"
            style={{ background: `${track.color}20`, color: track.color }}
          >
            {track.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-white/85 leading-tight truncate">{track.name}</div>
            <div className="text-[7px] font-mono" style={{ color: `${busDef.color}90` }}>{busDef.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={e => { e.stopPropagation(); onToggleMute(track.id); }}
            className={`w-4 h-4 rounded flex items-center justify-center transition-all ${track.muted ? 'bg-red-500/30 text-red-400' : 'bg-white/5 text-white/25 hover:text-white/50'}`}
          >
            {track.muted ? <VolumeX size={8} /> : <Volume2 size={8} />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); onToggleSolo(track.id); }}
            className={`w-4 h-4 rounded flex items-center justify-center text-[7px] font-bold transition-all ${track.soloed ? 'bg-yellow-500/30 text-yellow-400' : 'bg-white/5 text-white/25 hover:text-white/50'}`}
          >
            S
          </button>
        </div>
      </div>

      {/* Waveform */}
      <div className="mb-1">
        <MiniWaveform color={track.color} width={90} height={16} muted={track.muted} />
      </div>

      {/* Level Meter + Fader */}
      <div className="flex items-end gap-1.5">
        <LevelMeter
          db={track.currentDb}
          range={[-60, 0]}
          height={50}
          width={8}
          showLabel={false}
          color={track.color}
        />
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min={-60}
            max={0}
            step={0.5}
            value={track.currentDb}
            onChange={e => { e.stopPropagation(); onUpdateLevel(track.id, parseFloat(e.target.value)); }}
            onClick={e => e.stopPropagation()}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ background: 'linear-gradient(to right, #06D6A0, #FFD166 60%, #EF476F 85%, #ff0000)' }}
          />
          <div className="flex justify-between mt-0.5">
            <span className="text-[6px] font-mono text-white/20">-60</span>
            <span className="text-[7px] font-mono font-bold" style={{ color: track.color }}>
              {track.currentDb.toFixed(1)}
            </span>
            <span className="text-[6px] font-mono text-white/20">0</span>
          </div>
          {/* Recommended range bar */}
          <div className="relative h-0.5 mt-0.5 rounded-full bg-white/5">
            <div
              className="absolute h-full rounded-full"
              style={{
                left: `${((track.dbRange[0] + 60) / 60) * 100}%`,
                width: `${((track.dbRange[1] - track.dbRange[0]) / 60) * 100}%`,
                background: `${track.color}35`,
              }}
            />
            <div
              className="absolute w-0.5 h-1 -mt-[1px] rounded-full bg-white/50"
              style={{ left: `${((track.currentDb + 60) / 60) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <span className="text-[6px] font-mono text-white/15">
              {track.dbRange[0]}→{track.dbRange[1]}
            </span>
            <button
              onClick={e => { e.stopPropagation(); setShowWhy(!showWhy); }}
              className="text-[7px] text-white/15 hover:text-white/40 transition-colors"
            >
              <HelpCircle size={7} />
            </button>
          </div>
        </div>
      </div>

      {/* Why tooltip */}
      {showWhy && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-1 px-1.5 py-1 rounded text-[7px] font-mono text-white/40 bg-white/3 border border-white/5"
          onClick={e => e.stopPropagation()}
        >
          {WHY_TEXTS[track.type] || 'This range provides good headroom for processing.'}
        </motion.div>
      )}

      {/* Health Badge */}
      <div className="mt-1 flex justify-center">
        <LevelHealthBadge health={health} size="sm" />
      </div>

      {/* Remove button */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(track.id); }}
        onMouseEnter={() => setHoverRemove(true)}
        onMouseLeave={() => setHoverRemove(false)}
        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500/80 text-white text-[7px] flex items-center justify-center transition-opacity"
        style={{ opacity: hoverRemove ? 1 : 0 }}
      >
        ×
      </button>
    </motion.div>
  );
}
