import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getLevelHealth, getHealthColor, type LevelHealth } from '../data';

interface LevelMeterProps {
  db: number;
  range?: [number, number];
  height?: number;
  width?: number;
  vertical?: boolean;
  showLabel?: boolean;
  animated?: boolean;
  color?: string;
  className?: string;
}

export function LevelMeter({
  db, range = [-60, 0], height = 120, width = 20,
  vertical = true, showLabel = true, animated = true, color, className = '',
}: LevelMeterProps) {
  const [displayDb, setDisplayDb] = useState(db);
  const [peak, setPeak] = useState(db);
  const peakTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!animated) { setDisplayDb(db); return; }
    const diff = db - displayDb;
    setDisplayDb(prev => prev + diff * 0.3);
  }, [db, animated]);

  useEffect(() => {
    if (displayDb > peak) {
      setPeak(displayDb);
      if (peakTimer.current) clearTimeout(peakTimer.current);
      peakTimer.current = setTimeout(() => setPeak(prev => prev - 1), 1500);
    }
    return () => { if (peakTimer.current) clearTimeout(peakTimer.current); };
  }, [displayDb]);

  const normalizedLevel = Math.max(0, Math.min(1, (displayDb - range[0]) / (range[1] - range[0])));
  const normalizedPeak = Math.max(0, Math.min(1, (peak - range[0]) / (range[1] - range[0])));
  const health = getLevelHealth(db, range);
  const healthColor = color || getHealthColor(health);

  const greenZone = Math.max(0, ((-18 - range[0]) / (range[1] - range[0])));
  const yellowZone = Math.max(0, ((-6 - range[0]) / (range[1] - range[0])));

  if (vertical) {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <div
          className="relative rounded-sm overflow-hidden"
          style={{ height, width, background: 'rgba(255,255,255,0.05)' }}
        >
          {/* Zone indicators */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div style={{ height: `${(1 - yellowZone) * 100}%`, background: 'rgba(239,71,111,0.15)' }} />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end">
            <div style={{ height: `${(1 - greenZone) * 100}%`, background: 'rgba(6,214,160,0.08)' }} />
          </div>

          {/* Level fill */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{ background: `linear-gradient(to top, #06D6A0, #FFD166 60%, #EF476F 85%, #ff0000)` }}
            animate={{ height: `${normalizedLevel * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Peak indicator */}
          <div
            className="absolute left-0 right-0 h-[2px]"
            style={{
              bottom: `${normalizedPeak * 100}%`,
              background: health === 'hot' ? '#ff0000' : healthColor,
              boxShadow: health === 'hot' ? '0 0 6px #ff0000' : 'none',
            }}
          />

          {/* Range indicator marks */}
          <div
            className="absolute left-0 right-0 h-px opacity-50"
            style={{ bottom: `${greenZone * 100}%`, background: '#06D6A0' }}
          />
          <div
            className="absolute left-0 right-0 h-px opacity-50"
            style={{ bottom: `${yellowZone * 100}%`, background: '#FFD166' }}
          />
        </div>
        {showLabel && (
          <span className="text-[9px] font-mono opacity-70" style={{ color: healthColor }}>
            {db > -60 ? `${db.toFixed(1)}` : '-∞'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="relative rounded-sm overflow-hidden"
        style={{ height: width, width: height, background: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div
          className="absolute top-0 bottom-0 left-0"
          style={{ background: `linear-gradient(to right, #06D6A0, #FFD166 60%, #EF476F 85%, #ff0000)` }}
          animate={{ width: `${normalizedLevel * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      {showLabel && (
        <span className="text-[9px] font-mono opacity-70" style={{ color: healthColor }}>
          {db > -60 ? `${db.toFixed(1)}` : '-∞'}
        </span>
      )}
    </div>
  );
}

interface LevelHealthBadgeProps {
  health: LevelHealth;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelHealthBadge({ health, size = 'md' }: LevelHealthBadgeProps) {
  const color = getHealthColor(health);
  const label = health === 'healthy' ? 'GOOD HEADROOM' : health === 'check' ? 'CHECK' : 'TOO HOT!';
  const sizeClasses = size === 'sm' ? 'text-[8px] px-1.5 py-0.5' : size === 'md' ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5';

  return (
    <motion.div
      className={`inline-flex items-center gap-1 rounded-full font-mono font-bold ${sizeClasses}`}
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        boxShadow: health === 'hot' ? `0 0 12px ${color}60` : 'none',
      }}
      animate={health === 'hot' ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
    >
      <span>{health === 'healthy' ? '✓' : health === 'check' ? '⚠' : '✕'}</span>
      <span>{label}</span>
    </motion.div>
  );
}

interface MiniWaveformProps {
  color: string;
  width?: number;
  height?: number;
  active?: boolean;
  muted?: boolean;
}

export function MiniWaveform({ color, width = 60, height = 24, active = true, muted = false }: MiniWaveformProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active || muted) return;
    const interval = setInterval(() => setOffset(o => o + 2), 50);
    return () => clearInterval(interval);
  }, [active, muted]);

  const points: string[] = [];
  const segments = 20;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const noise = Math.sin((i + offset) * 0.8) * 0.4 + Math.sin((i + offset) * 1.6) * 0.3 + Math.sin((i + offset) * 3.2) * 0.15;
    const y = height / 2 + noise * (height / 2) * (muted ? 0.1 : 1);
    points.push(`${x},${y}`);
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={muted ? `${color}30` : color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <polyline
        points={points.map(p => {
          const [x, y] = p.split(',');
          return `${x},${height - parseFloat(y)}`;
        }).join(' ')}
        fill="none"
        stroke={muted ? `${color}30` : `${color}80`}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  );
}
