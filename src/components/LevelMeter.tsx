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
  showScale?: boolean;
  animated?: boolean;
  color?: string;
  className?: string;
  targetRange?: [number, number];
}

export function LevelMeter({
  db,
  range = [-60, 0],
  height = 120,
  width = 16,
  vertical = true,
  showLabel = true,
  showScale = false,
  animated = true,
  color,
  className = '',
  targetRange,
}: LevelMeterProps) {
  const [displayDb, setDisplayDb] = useState(db);
  const [peakDb, setPeakDb] = useState(db);
  const peakTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!animated) {
      setDisplayDb(db);
      return;
    }
    const diff = db - displayDb;
    // Snap once the needle has effectively arrived — otherwise the asymptotic
    // animation never settles and keeps scheduling renders forever (which is
    // very visible when a whole session is re-targeted at once).
    if (Math.abs(diff) < 0.05) {
      if (displayDb !== db) setDisplayDb(db);
      return;
    }
    const step = diff * 0.35;
    setDisplayDb(prev => prev + step);
  }, [db, animated, displayDb]);

  useEffect(() => {
    if (displayDb > peakDb) {
      setPeakDb(displayDb);
      if (peakTimer.current) clearTimeout(peakTimer.current);
      peakTimer.current = setTimeout(() => {
        setPeakDb(prev => Math.max(-60, prev - 2));
      }, 1200);
    }
    return () => {
      if (peakTimer.current) clearTimeout(peakTimer.current);
    };
  }, [displayDb, peakDb]);

  const min = range[0];
  const max = range[1];
  const span = max - min;

  const normalize = (val: number) => Math.max(0, Math.min(1, (val - min) / span));

  const normalizedLevel = normalize(displayDb);
  const normalizedPeak = normalize(peakDb);
  const health = getLevelHealth(displayDb, targetRange || [-24, -6]);
  const healthColor = color || getHealthColor(health);

  // Key zone points
  const sweetSpotLow = normalize(-18);
  const sweetSpotHigh = normalize(-12);
  const cautionPoint = normalize(-3);
  const clipPoint = normalize(-0.2);

  const scaleTicks = [0, -6, -12, -18, -24, -36, -48, -60];

  if (vertical) {
    return (
      <div className={`flex items-center gap-1 select-none ${className}`}>
        {showScale && (
          <div className="flex flex-col justify-between text-[7px] font-mono text-white/30 h-full py-0.5 text-right w-4">
            {scaleTicks.map(tick => (
              <span key={tick} className={tick === -18 ? 'text-emerald-400 font-bold' : tick === 0 ? 'text-red-400 font-bold' : ''}>
                {tick}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-1">
          <div
            className="relative rounded-sm overflow-hidden border border-white/10 shadow-inner"
            style={{
              height,
              width,
              background: '#070b14',
            }}
          >
            {/* LED Ladder Background Grid */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="h-px bg-white/40 w-full" />
              ))}
            </div>

            {/* Target Sweet Spot Highlight Glow */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                bottom: `${sweetSpotLow * 100}%`,
                height: `${(sweetSpotHigh - sweetSpotLow) * 100}%`,
                background: 'rgba(6, 214, 160, 0.15)',
                borderTop: '1px dashed rgba(6, 214, 160, 0.5)',
                borderBottom: '1px dashed rgba(6, 214, 160, 0.5)',
              }}
            />

            {/* Danger Clipping Zone Background */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                bottom: `${cautionPoint * 100}%`,
                top: 0,
                background: 'rgba(239, 71, 111, 0.12)',
              }}
            />

            {/* Meter Bar */}
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{
                background: `linear-gradient(to top, 
                  #06D6A0 0%, 
                  #06D6A0 65%, 
                  #FFD166 80%, 
                  #EF476F 92%, 
                  #FF0055 100%)`,
                boxShadow: displayDb > -3 ? '0 0 10px rgba(239, 71, 111, 0.6)' : 'none',
              }}
              animate={{ height: `${normalizedLevel * 100}%` }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />

            {/* Peak Hold Line */}
            <div
              className="absolute left-0 right-0 h-[2px] z-10"
              style={{
                bottom: `${normalizedPeak * 100}%`,
                background: peakDb > -0.5 ? '#FF0055' : peakDb > -3 ? '#FFD166' : '#FFFFFF',
                boxShadow: peakDb > -0.5 ? '0 0 6px #FF0055' : '0 0 4px rgba(255,255,255,0.6)',
              }}
            />

            {/* 0 VU (-18 dBFS) Reference Line */}
            <div
              className="absolute left-0 right-0 h-px pointer-events-none z-10"
              style={{
                bottom: `${sweetSpotLow * 100}%`,
                background: '#06D6A0',
                opacity: 0.8,
              }}
            />
          </div>

          {showLabel && (
            <span
              className="text-[9px] font-mono font-bold tracking-tighter"
              style={{ color: displayDb > -0.5 ? '#FF0055' : healthColor }}
            >
              {displayDb > -59 ? `${displayDb.toFixed(1)}` : '-∞'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal Meter
  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <div
        className="relative rounded-sm overflow-hidden border border-white/10 shadow-inner"
        style={{
          height: width,
          width: height,
          background: '#070b14',
        }}
      >
        {/* Sweet spot zone */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${sweetSpotLow * 100}%`,
            width: `${(sweetSpotHigh - sweetSpotLow) * 100}%`,
            background: 'rgba(6, 214, 160, 0.2)',
            borderLeft: '1px dashed rgba(6, 214, 160, 0.6)',
            borderRight: '1px dashed rgba(6, 214, 160, 0.6)',
          }}
        />

        {/* Level Fill */}
        <motion.div
          className="absolute top-0 bottom-0 left-0"
          style={{
            background: `linear-gradient(to right, 
              #06D6A0 0%, 
              #06D6A0 65%, 
              #FFD166 80%, 
              #EF476F 92%, 
              #FF0055 100%)`,
          }}
          animate={{ width: `${normalizedLevel * 100}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />

        {/* Peak Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] z-10"
          style={{
            left: `${normalizedPeak * 100}%`,
            background: peakDb > -0.5 ? '#FF0055' : '#FFFFFF',
            boxShadow: peakDb > -0.5 ? '0 0 6px #FF0055' : 'none',
          }}
        />
      </div>

      {showLabel && (
        <span
          className="text-[9px] font-mono font-bold w-9 text-right"
          style={{ color: displayDb > -0.5 ? '#FF0055' : healthColor }}
        >
          {displayDb > -59 ? `${displayDb.toFixed(1)}` : '-∞'}
        </span>
      )}
    </div>
  );
}

/**
 * Authentic Vintage Analog VU Meter with moving needle and warm illumination
 */
interface AnalogVuMeterProps {
  dbFS: number; // e.g. -18 dBFS = 0 VU
  label?: string;
  width?: number;
  height?: number;
}

export function AnalogVuMeter({ dbFS, label = 'VU METER', width = 180, height = 110 }: AnalogVuMeterProps) {
  // Convert dBFS to VU: -18 dBFS = 0 VU.
  // Standard VU range: -20 VU to +3 VU
  const vuValue = dbFS + 18; // so -18 dBFS -> 0 VU, -6 dBFS -> +12 VU (pegged)

  // Needle angle mapping: -20 VU -> -45 deg, 0 VU -> 0 deg, +3 VU -> +35 deg
  const clampVu = Math.max(-20, Math.min(4, vuValue));
  let needleAngle = 0;
  if (clampVu <= 0) {
    // -20 to 0 VU maps to -45 to 0 degrees
    needleAngle = -45 + ((clampVu + 20) / 20) * 45;
  } else {
    // 0 to +3 VU maps to 0 to +35 degrees
    needleAngle = (clampVu / 3) * 35;
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-amber-900/40 shadow-2xl flex flex-col items-center justify-between p-3 select-none"
      style={{
        width,
        height,
        background: 'radial-gradient(ellipse at 50% 90%, #ffe9b8 0%, #e0c896 60%, #b89f6d 100%)',
        boxShadow: 'inset 0 0 25px rgba(160, 110, 40, 0.4), 0 10px 25px -5px rgba(0,0,0,0.6)',
      }}
    >
      {/* Vintage Bezel Screw Accents */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-950/40 border border-amber-800/40" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-950/40 border border-amber-800/40" />

      {/* Meter Scale Arc */}
      <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 200 120">
        {/* Scale Arc Background */}
        <path
          d="M 30,85 A 90,90 0 0,1 170,85"
          fill="none"
          stroke="#3d2a14"
          strokeWidth="1.5"
          strokeDasharray="1 3"
        />
        {/* Red +VU Danger Arc */}
        <path
          d="M 130,55 A 90,90 0 0,1 170,85"
          fill="none"
          stroke="#c92a2a"
          strokeWidth="3.5"
        />

        {/* Major Tick Marks */}
        {/* -20 VU */}
        <line x1="32" y1="83" x2="38" y2="79" stroke="#2b1805" strokeWidth="1.5" />
        {/* -10 VU */}
        <line x1="58" y1="58" x2="63" y2="55" stroke="#2b1805" strokeWidth="1.5" />
        {/* -7 VU */}
        <line x1="75" y1="46" x2="79" y2="44" stroke="#2b1805" strokeWidth="1.5" />
        {/* -5 VU */}
        <line x1="88" y1="40" x2="91" y2="38" stroke="#2b1805" strokeWidth="1.5" />
        {/* -3 VU */}
        <line x1="102" y1="37" x2="103" y2="34" stroke="#2b1805" strokeWidth="1.5" />
        {/* 0 VU (Sweet Spot Highlight!) */}
        <line x1="128" y1="42" x2="132" y2="38" stroke="#c92a2a" strokeWidth="2.5" />
        {/* +1 VU */}
        <line x1="142" y1="49" x2="147" y2="46" stroke="#c92a2a" strokeWidth="1.5" />
        {/* +2 VU */}
        <line x1="156" y1="60" x2="161" y2="57" stroke="#c92a2a" strokeWidth="1.5" />
        {/* +3 VU */}
        <line x1="168" y1="74" x2="173" y2="72" stroke="#c92a2a" strokeWidth="2" />

        {/* Numerical Labels */}
        <text x="35" y="93" fill="#2b1805" fontSize="7" fontFamily="monospace" fontWeight="bold">-20</text>
        <text x="56" y="70" fill="#2b1805" fontSize="7" fontFamily="monospace">-10</text>
        <text x="73" y="58" fill="#2b1805" fontSize="7" fontFamily="monospace">-7</text>
        <text x="87" y="51" fill="#2b1805" fontSize="7" fontFamily="monospace">-5</text>
        <text x="99" y="47" fill="#2b1805" fontSize="7" fontFamily="monospace">-3</text>
        <text x="127" y="52" fill="#c92a2a" fontSize="8" fontFamily="monospace" fontWeight="900">0</text>
        <text x="144" y="60" fill="#c92a2a" fontSize="7" fontFamily="monospace">+1</text>
        <text x="157" y="72" fill="#c92a2a" fontSize="7" fontFamily="monospace">+2</text>
        <text x="169" y="85" fill="#c92a2a" fontSize="7" fontFamily="monospace">+3</text>
      </svg>

      {/* Label and 0 VU calibration text */}
      <div className="z-10 text-center mt-1">
        <div className="text-[9px] font-mono tracking-widest font-black text-amber-950/80 uppercase">
          {label}
        </div>
        <div className="text-[7px] font-mono text-amber-900/60 -mt-0.5 font-bold">
          0 VU = -18 dBFS CALIBRATED
        </div>
      </div>

      {/* Needle with Ballistic Physics */}
      <div className="absolute bottom-1 inset-x-0 flex justify-center items-end pointer-events-none">
        <motion.div
          className="origin-bottom"
          style={{
            width: 2,
            height: height * 0.75,
            background: '#1a0d00',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
          animate={{ rotate: needleAngle }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 14,
            mass: 0.6,
          }}
        >
          {/* Red tip */}
          <div className="w-full h-3 bg-red-600 rounded-t-full" />
        </motion.div>

        {/* Pivot Cap */}
        <div className="absolute bottom-0 w-8 h-4 bg-gradient-to-t from-stone-900 to-stone-700 rounded-t-full border border-stone-600 shadow-md" />
      </div>

      {/* Bottom Readout */}
      <div className="z-10 flex items-center justify-between w-full px-2 mt-auto">
        <span className="text-[8px] font-mono font-bold text-amber-950/70">
          {vuValue >= 0 ? `+${vuValue.toFixed(1)}` : vuValue.toFixed(1)} VU
        </span>
        <span className="text-[8px] font-mono font-bold text-amber-950/70">
          {dbFS.toFixed(1)} dBFS
        </span>
      </div>
    </div>
  );
}

/**
 * Loudness LUFS Meter (Integrated, Short-Term, Momentary)
 */
interface LufsMeterProps {
  lufs: number;
  target?: number; // default -14 for Spotify
  truePeak?: number;
}

export function LufsMeter({ lufs, target = -14, truePeak = -1.0 }: LufsMeterProps) {
  // Map LUFS from -36 to -4
  const minLufs = -36;
  const maxLufs = -4;
  const normalizedLufs = Math.max(0, Math.min(1, (lufs - minLufs) / (maxLufs - minLufs)));
  const targetPos = Math.max(0, Math.min(1, (target - minLufs) / (maxLufs - minLufs)));

  return (
    <div className="rounded-xl p-3 bg-black/40 border border-white/10 flex flex-col gap-2 font-mono">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-white/60 font-bold">LUFS Loudness</span>
        <span className="text-emerald-400 font-bold">{lufs.toFixed(1)} LUFS</span>
      </div>

      {/* Horizontal LUFS Bar */}
      <div className="relative h-4 rounded-md bg-white/5 overflow-hidden border border-white/10">
        {/* Background gradient zones */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-400 to-rose-500 opacity-20" />

        {/* Current LUFS level bar */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-500"
          animate={{ width: `${normalizedLufs * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />

        {/* Target Marker (-14 LUFS Spotify) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_8px_#fff]"
          style={{ left: `${targetPos * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[8px] text-white/40">
        <span>-36 LUFS</span>
        <span className="text-white/80 font-bold">{target} Target</span>
        <span>-4 LUFS</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px]">
        <span className="text-white/40">True Peak Ceiling</span>
        <span className={truePeak > -0.1 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
          {truePeak.toFixed(1)} dBTP
        </span>
      </div>
    </div>
  );
}

/**
 * Animated Interactive Mini Waveform
 */
interface MiniWaveformProps {
  color: string;
  width?: number;
  height?: number;
  active?: boolean;
  muted?: boolean;
  amplitude?: number;
}

export function MiniWaveform({
  color,
  width = 80,
  height = 20,
  active = true,
  muted = false,
  amplitude = 1,
}: MiniWaveformProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active || muted) return;
    const interval = setInterval(() => setOffset(o => o + 1.5), 45);
    return () => clearInterval(interval);
  }, [active, muted]);

  const points: string[] = [];
  const segments = 24;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width;
    const wave = Math.sin((i * 0.7 + offset * 0.15)) * 0.45 +
                 Math.sin((i * 1.4 + offset * 0.25)) * 0.35 +
                 Math.cos((i * 2.8 + offset * 0.1)) * 0.2;
    const currentAmp = muted ? 0.05 : amplitude;
    const y = height / 2 + wave * (height * 0.42) * currentAmp;
    points.push(`${x},${y}`);
  }

  return (
    <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
      {/* Center line */}
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* Top waveform */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={muted ? 'rgba(255,255,255,0.1)' : color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Mirrored bottom waveform for realistic audio display */}
      <polyline
        points={points.map(p => {
          const [x, y] = p.split(',');
          return `${x},${height - (parseFloat(y) - height / 2) - height / 2}`;
        }).join(' ')}
        fill="none"
        stroke={muted ? 'rgba(255,255,255,0.05)' : `${color}70`}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Animated Frequency Spectrum Analyzer
 */
export function FrequencySpectrum({ color = '#3A86FF', active = true }: { color?: string; active?: boolean }) {
  const [bars, setBars] = useState([35, 60, 80, 70, 55, 40, 25]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setBars([
        30 + Math.random() * 25,
        50 + Math.random() * 35,
        70 + Math.random() * 25,
        60 + Math.random() * 30,
        45 + Math.random() * 30,
        35 + Math.random() * 25,
        20 + Math.random() * 20,
      ]);
    }, 120);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex items-end gap-1 h-8 px-2 py-1 bg-black/40 rounded-lg border border-white/5">
      {bars.map((val, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-t-sm"
          style={{ background: color }}
          animate={{ height: `${val}%` }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  );
}

/**
 * Status Health Badge
 */
interface LevelHealthBadgeProps {
  health: LevelHealth;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelHealthBadge({ health, size = 'md' }: LevelHealthBadgeProps) {
  const color = getHealthColor(health);
  const label = health === 'healthy' ? 'OPTIMAL HEADROOM' :
                health === 'check' ? 'HOT / MONITOR' :
                health === 'low' ? 'LOW LEVEL' : 'CLIPPING DANGER!';

  const sizeClasses = size === 'sm'
    ? 'text-[8px] px-1.5 py-0.5 gap-1'
    : size === 'md'
    ? 'text-[10px] px-2 py-1 gap-1.5'
    : 'text-xs px-3 py-1.5 gap-2';

  return (
    <motion.div
      className={`inline-flex items-center rounded-full font-mono font-bold tracking-wider ${sizeClasses}`}
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        boxShadow: health === 'hot' ? `0 0 15px ${color}50` : 'none',
      }}
      animate={health === 'hot' ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.4 }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </motion.div>
  );
}
