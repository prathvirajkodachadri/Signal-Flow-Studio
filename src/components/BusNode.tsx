import { motion } from 'framer-motion';
import { Layers, SlidersHorizontal, CornerDownRight, Zap } from 'lucide-react';
import { type Bus, getLevelHealth, getHealthColor } from '../data';
import { LevelMeter, LevelHealthBadge } from './LevelMeter';

interface BusNodeProps {
  bus: Bus;
  selected: boolean;
  highlighted: boolean;
  dimmed: boolean;
  trackCount: number;
  onSelect: (id: string) => void;
  onTogglePlugin?: (busId: string, idx: number) => void;
}

const MINI_BAR_HEIGHTS = [24, 38, 18, 44, 32, 28, 40, 36];

export function BusNode({
  bus,
  selected,
  highlighted,
  dimmed,
  trackCount,
  onSelect,
  onTogglePlugin,
}: BusNodeProps) {
  const health = getLevelHealth(bus.currentDb, bus.dbRange);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: dimmed ? 0.2 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
      onClick={() => onSelect(bus.id)}
      className={`
        relative cursor-pointer rounded-xl p-3
        backdrop-blur-xl border transition-all duration-200 select-none
        ${dimmed ? 'saturate-[0.2]' : ''}
      `}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${bus.color}20 0%, rgba(17,24,39,0.95) 100%)`
          : highlighted
          ? `linear-gradient(135deg, ${bus.color}0f 0%, rgba(17,24,39,0.7) 100%)`
          : 'rgba(255,255,255,0.03)',
        borderColor: selected
          ? bus.color
          : highlighted
          ? `${bus.color}50`
          : 'rgba(255,255,255,0.08)',
        boxShadow: selected
          ? `0 0 25px ${bus.color}30, inset 0 0 20px ${bus.color}08`
          : highlighted
          ? `0 0 14px ${bus.color}15`
          : '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {/* Bus Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shadow-inner"
            style={{
              background: `${bus.color}25`,
              color: bus.color,
              boxShadow: `0 0 10px ${bus.color}30`,
            }}
          >
            {bus.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-white/95 leading-tight">{bus.name}</div>
            <div className="text-[8px] font-mono text-white/40">
              {trackCount} track{trackCount !== 1 ? 's' : ''} summing
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono font-bold" style={{ color: bus.color }}>
            {bus.currentDb.toFixed(1)} dBFS
          </div>
          <div className="text-[7px] font-mono text-white/25">
            {bus.dbRange[0]} to {bus.dbRange[1]} dB
          </div>
        </div>
      </div>

      {/* Summing Visualizer + LED Ladder */}
      <div className="flex items-end justify-between gap-2 mb-2 p-2 rounded-lg bg-black/30 border border-white/5">
        {/* Visual representation of summed track energy */}
        <div className="flex-1">
          <div className="text-[7px] font-mono text-white/30 uppercase mb-1">Summing Input Matrix</div>
          <div className="flex items-end gap-1 h-10">
            {Array.from({ length: Math.max(1, Math.min(trackCount, 8)) }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 rounded-t-sm"
                style={{
                  background: `linear-gradient(to top, #06D6A0, #FFD166, #EF476F)`,
                  boxShadow: `0 0 6px ${bus.color}40`,
                }}
                animate={{
                  height: [
                    `${MINI_BAR_HEIGHTS[i % MINI_BAR_HEIGHTS.length] * 0.6}%`,
                    `${MINI_BAR_HEIGHTS[i % MINI_BAR_HEIGHTS.length]}%`,
                    `${MINI_BAR_HEIGHTS[i % MINI_BAR_HEIGHTS.length] * 0.8}%`,
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2 + (i * 0.2),
                  ease: 'easeInOut',
                }}
              />
            ))}
            {trackCount === 0 && (
              <span className="text-[8px] font-mono text-white/20">No tracks routed</span>
            )}
          </div>
        </div>

        {/* Bus master meter */}
        <div className="shrink-0">
          <LevelMeter
            db={bus.currentDb}
            range={[-60, 0]}
            height={48}
            width={10}
            showLabel={false}
            color={bus.color}
            targetRange={bus.dbRange}
          />
        </div>
      </div>

      {/* Insert Glue Plugins Chips */}
      {bus.plugins && bus.plugins.length > 0 && (
        <div className="flex gap-1 mb-2 overflow-x-auto custom-scrollbar pb-0.5">
          {bus.plugins.map((plugin, idx) => (
            <div
              key={idx}
              className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-semibold flex items-center gap-1 border ${
                plugin.enabled
                  ? 'bg-white/10 text-white/90 border-white/20'
                  : 'bg-white/2 text-white/30 border-white/5'
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${plugin.enabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
              <span className="truncate max-w-[90px]">{plugin.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer / Health Status */}
      <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
        <span className="text-[8px] font-mono text-white/30 flex items-center gap-1">
          <CornerDownRight size={9} />
          → Mix Bus (2-Bus)
        </span>
        <LevelHealthBadge health={health} size="sm" />
      </div>
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

export function MixBusNode({
  name,
  color,
  icon,
  db,
  dbRange,
  busCount,
  selected,
  highlighted,
  dimmed,
  onSelect,
}: MixBusNodeProps) {
  const health = getLevelHealth(db, dbRange);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: dimmed ? 0.2 : 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
      onClick={onSelect}
      className={`
        relative cursor-pointer rounded-2xl p-4
        backdrop-blur-xl border transition-all duration-200 select-none
        ${dimmed ? 'saturate-[0.2]' : ''}
      `}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${color}25 0%, rgba(18,24,38,0.95) 100%)`
          : highlighted
          ? `linear-gradient(135deg, ${color}12 0%, rgba(18,24,38,0.75) 100%)`
          : 'rgba(255,255,255,0.03)',
        borderColor: selected
          ? color
          : highlighted
          ? `${color}60`
          : 'rgba(255,255,255,0.1)',
        boxShadow: selected
          ? `0 0 30px ${color}35, inset 0 0 25px ${color}08`
          : highlighted
          ? `0 0 18px ${color}20`
          : '0 6px 16px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner"
            style={{ background: `${color}25`, color, boxShadow: `0 0 15px ${color}35` }}
          >
            {icon}
          </div>
          <div>
            <div className="text-sm font-bold text-white/95">{name}</div>
            <div className="text-[9px] font-mono" style={{ color: `${color}90` }}>
              Master Summing ({busCount} Groups)
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold" style={{ color }}>
            {db.toFixed(1)} dBFS
          </div>
          <div className="text-[8px] font-mono text-white/30">
            Target: {dbRange[0]} to {dbRange[1]} dBFS
          </div>
        </div>
      </div>

      {/* Meter Bar Section */}
      <div className="flex items-center justify-center gap-4 py-2 px-3 rounded-xl bg-black/40 border border-white/5 mb-3">
        <LevelMeter
          db={db}
          range={[-60, 0]}
          height={64}
          width={18}
          showLabel={false}
          color={color}
          targetRange={dbRange}
        />
        <div className="flex-1 text-left font-mono">
          <div className="text-xs font-bold text-white mb-0.5">Headroom Margin</div>
          <div className="text-[10px] text-emerald-400 font-semibold">
            {Math.abs(db).toFixed(1)} dB to 0 dBFS Peak
          </div>
          <div className="text-[8px] text-white/40 mt-1">
            {db <= -3 ? '✓ Healthy mastering headroom' : '⚠ High risk of digital inter-sample overs'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[8px] font-mono text-white/30">
          Stereo Bus Compressor & Limiter
        </span>
        <LevelHealthBadge health={health} size="sm" />
      </div>
    </motion.div>
  );
}
