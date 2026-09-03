import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Edit3, Trash2, Copy, ChevronUp, ChevronDown,
  HelpCircle, MoreVertical, Sliders, CornerDownRight, Zap,
} from 'lucide-react';
import { type Track, getLevelHealth, BUS_DEFS, TRACK_DEFS } from '../data';
import { LevelMeter, MiniWaveform, LevelHealthBadge } from './LevelMeter';

interface TrackCardProps {
  track: Track;
  index: number;
  totalTracks: number;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onUpdateLevel: (id: string, db: number) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRequestRemove: (id: string) => void;
}

export function TrackCard({
  track,
  index,
  totalTracks,
  selected,
  highlighted,
  dimmed,
  onSelect,
  onToggleMute,
  onToggleSolo,
  onUpdateLevel,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDuplicate,
  onRequestRemove,
}: TrackCardProps) {
  const def = TRACK_DEFS[track.type] || TRACK_DEFS.synth;
  const busDef = BUS_DEFS[track.bus] || BUS_DEFS.instruments;
  const effectiveDb = track.currentDb + (track.gainTrimDb || 0);
  const health = getLevelHealth(effectiveDb, track.dbRange);

  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: dimmed ? 0.25 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
      onClick={() => onSelect(track.id)}
      className={`
        group relative rounded-xl p-2.5 backdrop-blur-xl border transition-all duration-200 select-none
        ${dimmed ? 'saturate-[0.2]' : ''}
      `}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${track.color}18 0%, rgba(15,21,37,0.95) 100%)`
          : highlighted
          ? `linear-gradient(135deg, ${track.color}0c 0%, rgba(15,21,37,0.7) 100%)`
          : 'rgba(255, 255, 255, 0.025)',
        borderColor: selected
          ? track.color
          : highlighted
          ? `${track.color}45`
          : 'rgba(255, 255, 255, 0.07)',
        boxShadow: selected
          ? `0 0 24px ${track.color}30, inset 0 0 16px ${track.color}08`
          : highlighted
          ? `0 0 12px ${track.color}15`
          : '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Left Color Identifier Bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all"
        style={{
          background: track.color,
          boxShadow: `0 0 8px ${track.color}80`,
        }}
      />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-1.5 pl-1.5">
        {/* Track Icon & Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 shadow-inner"
            style={{ background: `${track.color}25`, color: track.color }}
          >
            {track.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-white/95 leading-tight truncate flex items-center gap-1">
              <span>{track.name}</span>
              {track.isStereo && (
                <span className="text-[7px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/50">
                  ST
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[8px] font-mono" style={{ color: `${busDef.color}` }}>
              <CornerDownRight size={8} className="opacity-70" />
              <span className="truncate">{busDef.name.replace(' Bus', '')}</span>
            </div>
          </div>
        </div>

        {/* Solo / Mute Buttons */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            title="Solo Track"
            onClick={e => {
              e.stopPropagation();
              onToggleSolo(track.id);
            }}
            className={`w-4 h-4 rounded text-[8px] font-black font-mono transition-all flex items-center justify-center ${
              track.soloed
                ? 'bg-amber-400 text-black shadow-[0_0_8px_#f59e0b]'
                : 'bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            S
          </button>

          <button
            type="button"
            title="Mute Track"
            onClick={e => {
              e.stopPropagation();
              onToggleMute(track.id);
            }}
            className={`w-4 h-4 rounded text-[8px] font-black font-mono transition-all flex items-center justify-center ${
              track.muted
                ? 'bg-red-500 text-white shadow-[0_0_8px_#ef4444]'
                : 'bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            M
          </button>

          {/* Quick options dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-4 h-4 rounded bg-white/5 text-white/30 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <MoreVertical size={10} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl p-1 bg-[#101524] border border-white/15 shadow-2xl backdrop-blur-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(track.id);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-left"
                  >
                    <Edit3 size={10} /> Edit & Inspect
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicate(track.id);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-left"
                  >
                    <Copy size={10} /> Duplicate Track
                  </button>

                  <div className="h-px bg-white/5 my-0.5" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onRequestRemove(track.id);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-left"
                  >
                    <Trash2 size={10} /> Remove Track...
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-2 pl-1.5 flex items-center justify-between">
        <MiniWaveform
          color={track.color}
          width={100}
          height={16}
          active={!track.muted}
          muted={track.muted}
        />
        <div className="flex items-center gap-1 text-[8px] font-mono text-white/30">
          <span>{track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.round(Math.abs(track.pan) * 100)}` : `R${Math.round(track.pan * 100)}`}</span>
        </div>
      </div>

      {/* Level Meter & Fader Section */}
      <div className="flex items-end gap-2 pl-1.5">
        <LevelMeter
          db={effectiveDb}
          range={[-60, 0]}
          height={52}
          width={7}
          showLabel={false}
          color={track.color}
          targetRange={track.dbRange}
        />

        <div className="flex-1 min-w-0">
          {/* Fader slider */}
          <input
            type="range"
            min={-60}
            max={0}
            step={0.5}
            value={track.currentDb}
            onChange={e => {
              e.stopPropagation();
              onUpdateLevel(track.id, parseFloat(e.target.value));
            }}
            onClick={e => e.stopPropagation()}
            className="w-full h-1.5 rounded-full cursor-pointer"
            style={{
              background: 'linear-gradient(to right, #06D6A0, #FFD166 60%, #EF476F 85%, #ff0000)',
            }}
          />

          {/* Value and Target Range Bar */}
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[7px] font-mono text-white/25">-60</span>
            <span
              className="text-[8px] font-mono font-bold"
              style={{ color: track.color }}
            >
              {effectiveDb.toFixed(1)} <span className="text-[6px] text-white/30">dBFS</span>
            </span>
            <span className="text-[7px] font-mono text-white/25">0</span>
          </div>

          {/* Sweet spot visual indicator */}
          <div className="relative h-1 mt-0.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute h-full rounded-full"
              style={{
                left: `${((track.dbRange[0] + 60) / 60) * 100}%`,
                width: `${((track.dbRange[1] - track.dbRange[0]) / 60) * 100}%`,
                background: `${track.color}50`,
              }}
            />
            {/* Pointer */}
            <div
              className="absolute top-0 bottom-0 w-1 rounded-full bg-white shadow-sm"
              style={{ left: `${((effectiveDb + 60) / 60) * 100}%` }}
            />
          </div>

          {/* Target label & info trigger */}
          <div className="flex items-center justify-between mt-1 text-[7px] font-mono text-white/30">
            <span>Target: {track.dbRange[0]} to {track.dbRange[1]} dB</span>
            <button
              onClick={e => {
                e.stopPropagation();
                setShowHelp(!showHelp);
              }}
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <HelpCircle size={8} />
            </button>
          </div>
        </div>
      </div>

      {/* Help tooltip */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-1.5 rounded-lg text-[8px] font-mono text-white/70 bg-white/5 border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-white font-bold mb-0.5">Gain Staging Target:</div>
            {def.description}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Footer: Reorder Buttons + Health Badge */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 pl-1.5">
        {/* Reorder up/down */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={e => {
              e.stopPropagation();
              onMoveUp(track.id);
            }}
            title="Move Up"
            className="w-4 h-4 rounded bg-white/5 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-colors"
          >
            <ChevronUp size={10} />
          </button>
          <button
            type="button"
            disabled={index === totalTracks - 1}
            onClick={e => {
              e.stopPropagation();
              onMoveDown(track.id);
            }}
            title="Move Down"
            className="w-4 h-4 rounded bg-white/5 text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center transition-colors"
          >
            <ChevronDown size={10} />
          </button>
        </div>

        {/* Health status badge */}
        <LevelHealthBadge health={health} size="sm" />
      </div>
    </motion.div>
  );
}
