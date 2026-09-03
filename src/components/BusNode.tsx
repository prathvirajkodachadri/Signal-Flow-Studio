import { motion } from 'framer-motion';
import { type Bus, getLevelHealth, getHealthColor } from '../data';
import { LevelMeter, LevelHealthBadge } from './LevelMeter';

interface BusNodeProps {
  bus: Bus;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  trackCount: number;
  onSelect: (id: string) => void;
}

// Deterministic mini bar heights based on index
const MINI_BAR_HEIGHTS = [28, 35, 22, 40, 30, 25, 38, 33];

export function BusNode({ bus, selected, highlighted, dimmed, trackCount, onSelect }: BusNodeProps) {
  const health = getLevelHealth(bus.currentDb, bus.dbRange);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: dimmed ? 0.15 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => onSelect(bus.id)}
      className={`
        relative cursor-pointer rounded-xl p-2.5
        backdrop-blur-md border transition-all duration-200
        ${dimmed ? 'saturate-[0.3]' : ''}
      `}
      style={{
        background: selected ? `${bus.color}12` : highlighted ? `${bus.color}08` : 'rgba(255,255,255,0.025)',
        borderColor: selected ? `${bus.color}70` : highlighted ? `${bus.color}30` : 'rgba(255,255,255,0.06)',
        outline: selected ? `2px solid ${bus.color}` : 'none',
        outlineOffset: '-1px',
        boxShadow: selected
          ? `0 0 25px ${bus.color}25, inset 0 0 20px ${bus.color}06`
          : highlighted
          ? `0 0 12px ${bus.color}10`
          : `0 0 6px ${bus.color}06`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
          style={{ background: `${bus.color}20`, color: bus.color }}
        >
          {bus.icon}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white/85">{bus.name}</div>
          <div className="text-[8px] font-mono" style={{ color: `${bus.color}90` }}>
            {trackCount} track{trackCount !== 1 ? 's' : ''} →
          </div>
        </div>
      </div>

      {/* Combined mini meters + main meter */}
      <div className="flex items-end gap-1.5 mb-1.5">
        <div className="flex gap-px items-end">
          {Array.from({ length: Math.min(trackCount, 8) }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-sm"
              style={{
                height: MINI_BAR_HEIGHTS[i % MINI_BAR_HEIGHTS.length],
                background: `linear-gradient(to top, #06D6A0, #FFD166, #EF476F)`,
                opacity: 0.3 + (i / Math.max(trackCount, 1)) * 0.4,
              }}
            />
          ))}
        </div>
        <LevelMeter
          db={bus.currentDb}
          range={[-60, 0]}
          height={45}
          width={12}
          showLabel={true}
          color={bus.color}
        />
      </div>

      {/* Level display */}
      <div className="text-center">
        <div className="text-[9px] font-mono font-bold" style={{ color: bus.color }}>
          {bus.currentDb.toFixed(1)} dB
        </div>
        <div className="text-[7px] font-mono text-white/20 mt-0.5">
          {bus.dbRange[0]} to {bus.dbRange[1]} dB
        </div>
      </div>

      {/* Health */}
      <div className="mt-1 flex justify-center">
        <LevelHealthBadge health={health} size="sm" />
      </div>

      {/* Glow animation when highlighted */}
      {highlighted && !selected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: `1.5px solid ${bus.color}30` }}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.div>
  );
}

interface MixBusNodeProps {
  name: string;
  color: string;
  icon: string;
  db: number;
  dbRange: [number, number];
  busCount: number;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onSelect: () => void;
}

export function MixBusNode({ name, color, icon, db, dbRange, busCount, selected, highlighted, dimmed, onSelect }: MixBusNodeProps) {
  const health = getLevelHealth(db, dbRange);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: dimmed ? 0.15 : 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onSelect}
      className={`
        relative cursor-pointer rounded-2xl p-3.5
        backdrop-blur-md border transition-all
        ${dimmed ? 'saturate-[0.3]' : ''}
      `}
      style={{
        background: selected ? `${color}12` : highlighted ? `${color}08` : 'rgba(255,255,255,0.025)',
        borderColor: selected ? `${color}70` : highlighted ? `${color}30` : 'rgba(255,255,255,0.08)',
        outline: selected ? `2px solid ${color}` : 'none',
        outlineOffset: '-1px',
        boxShadow: selected
          ? `0 0 30px ${color}30, inset 0 0 25px ${color}06`
          : highlighted
          ? `0 0 18px ${color}15`
          : `0 0 8px ${color}06`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold text-white/90">{name}</div>
          <div className="text-[9px] font-mono" style={{ color: `${color}90` }}>
            {busCount} group{busCount !== 1 ? 's' : ''} feed in
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-2">
        <LevelMeter db={db} range={[-60, 0]} height={65} width={16} showLabel={true} color={color} />
      </div>

      <div className="text-center">
        <div className="text-[11px] font-mono font-bold" style={{ color }}>{db.toFixed(1)} dB</div>
        <div className="text-[7px] font-mono text-white/20 mt-0.5">Target: {dbRange[0]} to {dbRange[1]}</div>
      </div>

      <div className="mt-1.5 flex justify-center">
        <LevelHealthBadge health={health} size="md" />
      </div>

      {highlighted && !selected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: `1.5px solid ${color}35` }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  );
}
