import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Sliders, Sparkles, Layers, ArrowRight, CheckCircle2,
  XCircle, AlertTriangle, HelpCircle, Activity, Zap, ShieldCheck,
  Disc, BarChart2, Radio, SlidersHorizontal,
} from 'lucide-react';
import { LevelMeter, MiniWaveform, AnalogVuMeter, LufsMeter } from './LevelMeter';
import { PlatformChipRow, DeliveryBoard } from './PlatformSelector';
import { useSession, useSignalFlowStages } from '../context/SessionContext';
import {
  PLATFORM_PRESETS, getPlatform, getSignalFlowStages, GENRE_PRESETS,
  TRACK_DEFS, INDIAN_TRACK_TYPES, BUS_DEFS,
} from '../data';

type GuideTab =
  | 'signalpath' | 'recording' | 'mixing' | 'mastering' | 'gainstaging' | 'routing'
  | 'delivery' | 'indian';

export function Guides() {
  const [activeTab, setActiveTab] = useState<GuideTab>('signalpath');

  const tabs: { id: GuideTab; label: string; icon: string; color: string }[] = [
    { id: 'signalpath', label: '0. Full Signal Path', icon: '🔗', color: '#00F5D4' },
    { id: 'recording', label: '1. Recording Guide', icon: '🎙️', color: '#06D6A0' },
    { id: 'mixing', label: '2. Mixing Guide', icon: '🎚️', color: '#3A86FF' },
    { id: 'mastering', label: '3. Mastering Guide', icon: '✨', color: '#FFD700' },
    { id: 'delivery', label: '4. YouTube + Spotify Delivery', icon: '🚀', color: '#FF2D55' },
    { id: 'indian', label: 'Indian Songs & Styles', icon: '🇮🇳', color: '#FF9933' },
    { id: 'gainstaging', label: 'Gain Staging Rules', icon: '⚡', color: '#8338EC' },
    { id: 'routing', label: 'Bus Routing Logic', icon: '🔀', color: '#FF006E' },
  ];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
              AUDIO ENGINEERING VISUAL WORKFLOW
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white/95 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Production Visual Guides & Headroom Rules
          </h2>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            Glanceable diagrams, target meters, and before/after comparisons for each stage
          </p>
        </div>
      </div>

      {/* Guide Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all shrink-0 border ${
              activeTab === tab.id
                ? 'shadow-lg scale-105'
                : 'bg-white/3 text-white/40 border-white/5 hover:bg-white/8 hover:text-white'
            }`}
            style={{
              background: activeTab === tab.id ? `${tab.color}25` : undefined,
              borderColor: activeTab === tab.id ? `${tab.color}60` : undefined,
              color: activeTab === tab.id ? tab.color : undefined,
              boxShadow: activeTab === tab.id ? `0 0 20px ${tab.color}20` : undefined,
            }}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Guide Content Display */}
      <AnimatePresence mode="wait">
        {activeTab === 'signalpath' && <SignalPathGuide key="sp" />}
        {activeTab === 'recording' && <RecordingGuide key="rec" />}
        {activeTab === 'mixing' && <MixingGuide key="mix" />}
        {activeTab === 'mastering' && <MasteringGuide key="mst" />}
        {activeTab === 'gainstaging' && <GainStagingGuide key="gs" />}
        {activeTab === 'routing' && <BusRoutingGuide key="br" />}
        {activeTab === 'delivery' && <PlatformDeliveryGuide key="dlv" />}
        {activeTab === 'indian' && <IndianMusicGuide key="ind" />}
      </AnimatePresence>
    </div>
  );
}

/* ========================================================================== */
/* 0. FULL SIGNAL PATH — LEVEL MAP                                            */
/*                                                                            */
/* The whole production chain on one page: raw recording → professional       */
/* output, with the level to aim for at every station and the one rule that   */
/* station exists to enforce.                                                 */
/* ========================================================================== */

/** dB scale shared by every little window bar in the level map. */
const PATH_SCALE: [number, number] = [-30, 0];

interface PathLevel {
  label: string;
  value: string;
  /** dB window drawn on the scale, e.g. [-12, -6]. */
  window?: [number, number];
  /** Single dB point drawn on the scale, e.g. a -1.0 dBTP ceiling. */
  marker?: number;
  /** 'text' keeps the value neutral white instead of the stage colour. */
  tone?: 'db' | 'text';
}

interface PathStage {
  id: string;
  icon: string;
  name: string;
  color: string;
  /** Processing order, rendered as chips joined by arrows. */
  chain?: string[];
  levels?: PathLevel[];
  /** Short factual bullets (used by the pre-master). */
  points?: string[];
  note?: string;
  /** Closing station gets a live waveform instead of numbers. */
  waveform?: boolean;
}

const SIGNAL_PATH_STAGES: PathStage[] = [
  {
    id: 'raw',
    icon: '🎙️',
    name: 'RAW RECORDING',
    color: '#06D6A0',
    levels: [
      { label: 'Average:', value: '≈ −18 dBFS', marker: -18 },
      { label: 'Typical Peak:', value: '≈ −12 to −10 dBFS', window: [-12, -10] },
    ],
    note: 'Record cleanly with sufficient headroom.',
  },
  {
    id: 'input',
    icon: '🎛️',
    name: 'INPUT GAIN / PRE-GAIN',
    color: '#00F5D4',
    levels: [{ label: 'Average:', value: '≈ −18 dBFS', marker: -18 }],
    note: 'Set the signal level before processing.',
  },
  {
    id: 'inserts',
    icon: '🎚️',
    name: 'INSERT PROCESSING',
    color: '#3A86FF',
    chain: ['EQ', 'Compression', 'Saturation', 'Other FX'],
    levels: [
      { label: 'Input:', value: '≈ −18 dBFS average', marker: -18 },
      { label: 'Output:', value: 'Level-match for A/B comparison', tone: 'text' },
    ],
    note: 'Process the sound without unnecessarily increasing its loudness.',
  },
  {
    id: 'channel',
    icon: '🎚️',
    name: 'CHANNEL / TRACK',
    color: '#8338EC',
    levels: [{ label: 'Peak:', value: '≈ −12 to −6 dBFS*', window: [-12, -6] }],
    note: 'Set the fader according to the musical balance.',
  },
  {
    id: 'group',
    icon: '🎛️',
    name: 'GROUP / INSTRUMENT BUS',
    color: '#FF006E',
    levels: [{ label: 'Peak:', value: '≈ −12 to −6 dBFS*', window: [-12, -6] }],
    note: 'Combine related instruments while maintaining sufficient headroom.',
  },
  {
    id: 'mixbus',
    icon: '🎚️',
    name: 'MIX BUS',
    color: '#FFD166',
    levels: [{ label: 'Typical working peak:', value: '≈ −6 to −3 dBFS*', window: [-6, -3] }],
    note: 'Maintain headroom while the complete arrangement plays together.',
  },
  {
    id: 'premaster',
    icon: '📦',
    name: 'PREMASTER',
    color: '#FF9F1C',
    points: ['No clipping', 'Preserve dynamics', 'Maintain practical mastering headroom'],
    note: 'Avoid unnecessary limiting.',
  },
  {
    id: 'mastering',
    icon: '🎚️',
    name: 'MASTERING',
    color: '#FFD700',
    chain: [
      'EQ',
      'Dynamic EQ / Compression (if required)',
      'Saturation / Clipping (if required)',
      'Limiting',
    ],
    note: 'Shape the final tonal balance, dynamics and level.',
  },
  {
    id: 'final',
    icon: '🔊',
    name: 'FINAL MASTER',
    color: '#FF2D55',
    levels: [
      { label: 'True Peak Ceiling:', value: '≈ −1.0 dBTP', marker: -1 },
      { label: 'LUFS:', value: 'Genre / arrangement dependent', tone: 'text' },
    ],
    note: 'Final loudness is chosen according to the music, not an arbitrary LUFS number.',
  },
  {
    id: 'output',
    icon: '🎵',
    name: 'PROFESSIONAL OUTPUT',
    color: '#06D6A0',
    waveform: true,
    note: 'Clean, dynamic and loud on purpose — ready for the platform.',
  },
];

/** The six moves the whole path is built from. */
const PATH_PRINCIPLES = [
  { label: 'HEALTHY LEVEL', hint: 'Start near −18 dBFS', color: '#06D6A0' },
  { label: 'PROCESS', hint: 'Shape the sound, do not inflate it', color: '#3A86FF' },
  { label: 'LEVEL-MATCH', hint: 'A/B every plugin at equal loudness', color: '#00F5D4' },
  { label: 'BALANCE', hint: 'Faders follow the musical balance', color: '#8338EC' },
  { label: 'HEADROOM', hint: 'Leave the master room to work', color: '#FFD166' },
  { label: 'MASTER', hint: 'Loudness serves the song, not the meter', color: '#FF2D55' },
];

/** Small horizontal scale bar: where this station's level window sits. */
function PathLevelScale({
  window: win,
  marker,
  color,
}: {
  window?: [number, number];
  marker?: number;
  color: string;
}) {
  const [min, max] = PATH_SCALE;
  const pct = (db: number) =>
    ((Math.max(min, Math.min(max, db)) - min) / (max - min)) * 100;

  return (
    <div className="relative h-1.5 rounded-full bg-white/5 border border-white/5 overflow-hidden">
      {/* Hot region above -3 dBFS */}
      <div
        className="absolute top-0 bottom-0 bg-red-500/25"
        style={{ left: `${pct(-3)}%`, right: 0 }}
      />
      {/* -18 dBFS (0 VU) calibration reference */}
      <div
        className="absolute top-0 bottom-0 w-px bg-emerald-400/50"
        style={{ left: `${pct(-18)}%` }}
      />
      {win && (
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${pct(win[0])}%`,
            width: `${Math.max(pct(win[1]) - pct(win[0]), 2.5)}%`,
            background: color,
            boxShadow: `0 0 8px ${color}90`,
          }}
        />
      )}
      {marker !== undefined && (
        <div
          className="absolute top-0 bottom-0 w-[3px] rounded-full"
          style={{ left: `${pct(marker)}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      )}
    </div>
  );
}

/** Glowing ↓ between two stations. */
function PathConnector({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex flex-col items-center py-0.5" aria-hidden="true">
      <div className="w-px h-2.5" style={{ background: `linear-gradient(${from}00, ${from})` }} />
      <div className="text-[12px] leading-none font-mono" style={{ color: `${to}cc` }}>
        ↓
      </div>
      <div className="w-px h-2.5" style={{ background: `linear-gradient(${to}, ${to}00)` }} />
    </div>
  );
}

/** One station of the level map. */
function PathStageNode({ stage, index }: { stage: PathStage; index: number }) {
  const isLast = index === SIGNAL_PATH_STAGES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.045, 0.4), duration: 0.25 }}
      className="relative overflow-hidden p-4 pl-5 rounded-2xl border"
      style={{
        borderColor: `${stage.color}35`,
        background: `linear-gradient(135deg, ${stage.color}12 0%, rgba(0,0,0,0.35) 60%)`,
      }}
    >
      {/* Left accent rail */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: stage.color, opacity: 0.75 }}
      />

      {/* Station header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-lg leading-none border"
            style={{ background: `${stage.color}18`, borderColor: `${stage.color}40` }}
          >
            {stage.icon}
          </span>
          <div className="min-w-0">
            <div className="text-[8px] font-mono text-white/30 tracking-[0.2em]">
              STAGE {String(index + 1).padStart(2, '0')}
            </div>
            <div
              className="text-sm font-bold tracking-wide leading-tight"
              style={{ color: stage.color, fontFamily: 'Outfit, sans-serif' }}
            >
              {stage.name}
            </div>
          </div>
        </div>
        {isLast && (
          <span className="shrink-0 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            DELIVERED
          </span>
        )}
      </div>

      {/* Processing order */}
      {stage.chain && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {stage.chain.map((step, i) => (
            <span key={step} className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-mono px-2 py-1 rounded-lg border"
                style={{
                  background: `${stage.color}12`,
                  borderColor: `${stage.color}30`,
                  color: `${stage.color}`,
                }}
              >
                {step}
              </span>
              {i < stage.chain!.length - 1 && (
                <span className="text-[10px] font-mono text-white/25">→</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Level targets */}
      {stage.levels && (
        <div className="mt-3 space-y-2">
          {stage.levels.map(level => (
            <div key={level.label} className="font-mono">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[10px] text-white/40 w-[8.5rem] shrink-0">{level.label}</span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: level.tone === 'text' ? 'rgba(255,255,255,0.8)' : stage.color }}
                >
                  {level.value}
                </span>
              </div>
              {(level.window || level.marker !== undefined) && (
                <div className="mt-1 sm:pl-[8.5rem]">
                  <PathLevelScale window={level.window} marker={level.marker} color={stage.color} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Factual bullets */}
      {stage.points && (
        <ul className="mt-3 space-y-1">
          {stage.points.map(point => (
            <li key={point} className="flex items-center gap-2 text-[10px] font-mono text-white/65">
              <span style={{ color: stage.color }}>✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Live waveform on the closing station */}
      {stage.waveform && (
        <div className="mt-3 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
          <MiniWaveform color={stage.color} width={520} height={34} />
        </div>
      )}

      {/* The one rule for this station */}
      {stage.note && (
        <p
          className="mt-3 pl-2.5 border-l-2 text-[11px] font-sans text-white/60 leading-relaxed"
          style={{ borderColor: `${stage.color}55` }}
        >
          {stage.note}
        </p>
      )}
    </motion.div>
  );
}

function SignalPathGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-400/10 via-black/40 to-black/60 border border-cyan-400/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/25 text-[10px] font-mono font-bold">
              RAW RECORDING → PROFESSIONAL OUTPUT
            </span>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              The whole signal path, with the level to aim for at every stage
            </h3>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Ten stations, one job each. The signal stays near{' '}
              <strong className="text-emerald-300">−18 dBFS</strong> while it is recorded and processed,
              climbs gently through channels and buses, and only the mastering limiter is allowed to
              approach the ceiling — with the true peak stopping at{' '}
              <strong className="text-rose-300">−1.0 dBTP</strong>. Loudness at the end is a musical
              decision, not a number to hit.
            </p>
          </div>

          {/* At-a-glance readout */}
          <div className="shrink-0 grid grid-cols-3 gap-2 font-mono">
            {[
              { k: 'NOMINAL', v: '−18', u: 'dBFS', c: '#06D6A0' },
              { k: 'MIX BUS', v: '−6 / −3', u: 'dBFS', c: '#FFD166' },
              { k: 'CEILING', v: '−1.0', u: 'dBTP', c: '#FF2D55' },
            ].map(item => (
              <div
                key={item.k}
                className="px-3 py-2.5 rounded-2xl bg-black/50 border text-center"
                style={{ borderColor: `${item.c}35` }}
              >
                <div className="text-[7px] text-white/35 tracking-[0.15em]">{item.k}</div>
                <div className="text-base font-black leading-tight" style={{ color: item.c }}>
                  {item.v}
                </div>
                <div className="text-[8px] text-white/40">{item.u}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chain + principles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* The level map */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-black/40 border border-white/10">
          <div className="flex flex-wrap items-end justify-between gap-2 pb-3 mb-4 border-b border-white/5">
            <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
              Signal path &amp; level map
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-mono text-white/35">
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 rounded-full bg-white/40" /> target window
              </span>
              <span className="flex items-center gap-1">
                <span className="w-px h-2.5 bg-emerald-400/60" /> −18 dBFS (0 VU)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-1 rounded-full bg-red-500/40" /> hot
              </span>
              <span>scale −30 … 0 dBFS</span>
            </div>
          </div>

          {SIGNAL_PATH_STAGES.map((stage, i) => (
            <div key={stage.id}>
              <PathStageNode stage={stage} index={i} />
              {i < SIGNAL_PATH_STAGES.length - 1 && (
                <PathConnector from={stage.color} to={SIGNAL_PATH_STAGES[i + 1].color} />
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-0">
          {/* Six principles */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
              Read it as six moves
            </h4>
            {PATH_PRINCIPLES.map((p, i) => (
              <div key={p.label}>
                <div
                  className="flex items-center gap-2 p-2 rounded-xl border"
                  style={{ background: `${p.color}0d`, borderColor: `${p.color}28` }}
                >
                  <span
                    className="w-5 h-5 shrink-0 rounded-md flex items-center justify-center text-[9px] font-mono font-bold"
                    style={{ background: `${p.color}25`, color: p.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block text-[11px] font-mono font-bold tracking-wide leading-tight"
                      style={{ color: p.color }}
                    >
                      {p.label}
                    </span>
                    <span className="block text-[9px] font-sans text-white/45 leading-tight">
                      {p.hint}
                    </span>
                  </span>
                </div>
                {i < PATH_PRINCIPLES.length - 1 && (
                  <div className="text-center text-[10px] leading-none text-white/20 py-0.5 font-mono">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footnote for the starred windows */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono font-bold text-white/60 uppercase">
              * About those peak windows
            </div>
            <p className="text-[11px] font-sans text-white/55 leading-relaxed">
              The starred numbers are working references, not a meter to hit to the decimal. Genre,
              arrangement and track count decide how much a channel, a group or the mix bus actually
              needs. What does not change: keep the front end near −18 dBFS, never let any stage clip,
              and pick the final loudness from the music instead of from an arbitrary LUFS number.
            </p>
          </div>

          {/* Where the path usually breaks */}
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Where the path usually breaks
            </div>
            <ul className="space-y-1.5">
              {[
                'Recording hot, then trying to fix it with the channel fader.',
                'An insert that is louder on output than on input — the A/B is lost.',
                'Limiting the premaster, so the mastering chain has nothing left to shape.',
                'Chasing a LUFS number instead of the song, and paying for it in dynamics.',
              ].map(item => (
                <li key={item} className="text-[10px] font-mono text-white/60 flex gap-1.5">
                  <span className="text-red-400">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 1. RECORDING GUIDE
 */
function RecordingGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Top Graphic Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-black/40 to-black/60 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                STAGE 1: RECORDING & TRACKING
              </span>
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Golden Rule: Aim for -18 dBFS Nominal (Peaks under -12 dBFS)
            </h3>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              In modern 24-bit digital recording, you have <strong>144 dB of dynamic range</strong>. You do NOT need to record loud near 0 dBFS. Recording at -18 dBFS keeps preamps in their analog sweet spot and prevents accidental digital clipping during passionate takes.
            </p>
          </div>

          {/* Level Target Graphic */}
          <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 flex items-center gap-4 shrink-0 font-mono">
            <LevelMeter db={-14} range={[-60, 0]} height={110} width={20} color="#06D6A0" targetRange={[-18, -12]} />
            <div className="text-left space-y-1">
              <div className="text-[9px] text-white/40 uppercase">Optimal Target</div>
              <div className="text-lg font-bold text-emerald-400">-18 to -12 dBFS</div>
              <div className="text-[10px] text-white/70">12–18 dB Safety Headroom</div>
              <div className="text-[9px] text-emerald-300 font-bold mt-2">✓ 0 VU Analog Emulation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Waveform Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Good Recording Card */}
        <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Ideal Recording Level</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
              PEAKS AT -14 dBFS
            </span>
          </div>

          <div className="h-20 bg-black/40 rounded-2xl p-3 flex items-center justify-center border border-white/5">
            <MiniWaveform color="#06D6A0" width={320} height={40} />
          </div>

          <ul className="text-xs font-mono text-white/70 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> 14 dB headroom for sudden loud vocal screams or snare hits
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Preamps operate in linear low-distortion zone
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Zero risk of digital flat-topping
            </li>
          </ul>
        </div>

        {/* Bad / Too Hot Recording Card */}
        <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-400" />
              <h4 className="text-sm font-bold text-white">Too Hot / Dangerous</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
              PEAKS AT -1 dBFS (CLIPPING)
            </span>
          </div>

          <div className="h-20 bg-black/40 rounded-2xl p-3 flex items-center justify-center border border-white/5">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path d="M 0,20 L 15,2 L 35,2 L 50,20 L 65,38 L 85,38 L 100,20" fill="none" stroke="#EF476F" strokeWidth="2.5" />
              <line x1="15" y1="2" x2="35" y2="2" stroke="#ff0000" strokeWidth="3" />
            </svg>
          </div>

          <ul className="text-xs font-mono text-white/70 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-red-400">✕</span> 0 dB headroom — singer gets loud and instantly distorts
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400">✕</span> Digital clipping cannot be removed later in the mix
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400">✕</span> Pushes plugins into harsh non-linear distortion
            </li>
          </ul>
        </div>
      </div>

      {/* Recording Workflow Checklist */}
      <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
        <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
          Pre-Tracking Level Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="text-xs font-bold text-white mb-1">1. Set Preamp Gain</div>
            <p className="text-[11px] text-white/60 font-sans">
              Have the performer perform their loudest part. Adjust gain until peaks hit -12 dBFS max.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="text-xs font-bold text-white mb-1">2. Enable 24-bit / 32-bit</div>
            <p className="text-[11px] text-white/60 font-sans">
              24-bit audio provides ultra-low noise floor (-144 dBFS), making high headroom 100% safe.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/5">
            <div className="text-xs font-bold text-white mb-1">3. Engage High-Pass</div>
            <p className="text-[11px] text-white/60 font-sans">
              Cut subsonic mic stand rumbles below 80 Hz on vocals and guitars to conserve headroom.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 2. MIXING GUIDE
 */
function MixingGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-black/40 to-black/60 border border-blue-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
                STAGE 2: MIXING & BUS SUMMING
              </span>
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              The Headroom Stacking Law: Mix Bus Peaks at -6 to -3 dBFS
            </h3>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              When 20 to 50 audio tracks play together, their acoustic energy sums logarithmically. If every track is set at -6 dBFS, the mix bus will overload by +12 dBFS! Keep individual faders conservative so the Mix Bus peaks cleanly at -6 to -3 dBFS.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-blue-500/30 flex items-center gap-4 shrink-0 font-mono">
            <LevelMeter db={-4} range={[-60, 0]} height={110} width={20} color="#3A86FF" targetRange={[-6, -3]} />
            <div className="text-left space-y-1">
              <div className="text-[9px] text-white/40 uppercase">Mix Bus Peak Target</div>
              <div className="text-lg font-bold text-blue-400">-6 to -3 dBFS</div>
              <div className="text-[10px] text-white/70">3 to 6 dB Mastering Headroom</div>
              <div className="text-[9px] text-emerald-400 font-bold mt-2">✓ No Inter-Sample Overs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Headroom Summing Visual Graphic */}
      <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
          Visualizing Signal Summing (Why Stems Add Up)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/3 border border-white/5 space-y-1">
            <div className="text-xs font-bold text-amber-400">🥁 Drum Bus</div>
            <div className="text-sm font-mono font-bold text-white">-6.0 dBFS</div>
            <div className="text-[8px] font-mono text-white/40">Kick, Snare, Cymbals</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/3 border border-white/5 space-y-1">
            <div className="text-xs font-bold text-cyan-400">🎸 Bass Bus</div>
            <div className="text-sm font-mono font-bold text-white">-8.0 dBFS</div>
            <div className="text-[8px] font-mono text-white/40">Bass DI & Sub 808</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/3 border border-white/5 space-y-1">
            <div className="text-xs font-bold text-rose-400">🎤 Vocal Bus</div>
            <div className="text-sm font-mono font-bold text-white">-6.0 dBFS</div>
            <div className="text-[8px] font-mono text-white/40">Lead, Doubles, Harmony</div>
          </div>

          <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 space-y-1">
            <div className="text-xs font-bold text-yellow-300">Σ Mix Bus Sum</div>
            <div className="text-sm font-mono font-black text-yellow-400">-3.2 dBFS</div>
            <div className="text-[8px] font-mono text-emerald-400 font-bold">✓ PERFECT 3.2 dB HEADROOM</div>
          </div>
        </div>
      </div>

      {/* Mixing Best Practices Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> DO: Best Mixing Habits
          </div>
          <ul className="text-xs font-sans text-white/70 space-y-1.5">
            <li>• Use VCA trim or pre-fader gain to level match before adding plugins.</li>
            <li>• Group instruments into Subgroup Buses for unified glue compression.</li>
            <li>• Check your mix in Mono to confirm no phase cancellation in low frequencies.</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
          <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
            <XCircle size={14} /> DON'T: Common Mixing Mistakes
          </div>
          <ul className="text-xs font-sans text-white/70 space-y-1.5">
            <li>• Don't push individual track faders past +6 dB when you can't hear them.</li>
            <li>• Don't put a brickwall limiter on your mix bus to make it "fake loud".</li>
            <li>• Don't let the mix bus clip into the red (above 0 dBFS).</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 3. MASTERING GUIDE
 */
function MasteringGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-500/10 via-black/40 to-black/60 border border-yellow-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-mono text-[10px] font-bold">
                STAGE 3: MASTERING & LOUDNESS
              </span>
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Final Polish: Streaming Targets (-14 LUFS / -1.0 dBTP Ceiling)
            </h3>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Mastering prepares the stereo audio file for commercial distribution. Setting your True Peak ceiling to <strong>-1.0 dBTP</strong> prevents inter-sample clipping when streaming platforms transcode your master to lossy AAC and MP3 codecs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-yellow-500/30 flex items-center gap-4 shrink-0 font-mono">
            <LufsMeter lufs={-14} target={-14} truePeak={-1.0} />
          </div>
        </div>
      </div>

      {/* Streaming Platform Target Matrix Table */}
      <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-4">
        <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
          Streaming Platform Loudness Standards Matrix
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Spotify / YouTube</span>
              <span className="text-[10px] font-mono text-white/30">Streaming</span>
            </div>
            <div className="text-lg font-mono font-black text-white">-14 LUFS</div>
            <div className="text-[9px] font-mono text-white/50">Ceiling: -1.0 dBTP</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
              <span>Apple Music</span>
              <span className="text-[10px] font-mono text-white/30">Sound Check</span>
            </div>
            <div className="text-lg font-mono font-black text-white">-16 LUFS</div>
            <div className="text-[9px] font-mono text-white/50">Ceiling: -1.0 dBTP</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-purple-400 flex items-center justify-between">
              <span>Club / CD Master</span>
              <span className="text-[10px] font-mono text-white/30">Loud / DJ</span>
            </div>
            <div className="text-lg font-mono font-black text-white">-9 to -7 LUFS</div>
            <div className="text-[9px] font-mono text-white/50">Ceiling: -0.3 dBTP</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/3 border border-white/5 space-y-1.5">
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>Broadcast (EBU R128)</span>
              <span className="text-[10px] font-mono text-white/30">TV & Film</span>
            </div>
            <div className="text-lg font-mono font-black text-white">-23 LUFS</div>
            <div className="text-[9px] font-mono text-white/50">Ceiling: -1.0 dBTP</div>
          </div>
        </div>
      </div>

      {/* Dynamic Range vs Sausage Waveform Graphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">Dynamic Master (-14 LUFS)</span>
            <span className="text-[8px] font-mono text-white/40">TRANSIENTS PRESERVED</span>
          </div>
          <div className="h-16 bg-black/40 rounded-xl p-2 flex items-center justify-center">
            <MiniWaveform color="#06D6A0" width={240} height={32} />
          </div>
          <div className="text-[11px] font-sans text-white/70">
            Drums kick hard with punch, vocals breathe naturally, zero listener fatigue.
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400">Over-Limited "Sausage" (-6 LUFS)</span>
            <span className="text-[8px] font-mono text-white/40">SQUASHED DYNAMICS</span>
          </div>
          <div className="h-16 bg-black/40 rounded-xl p-2 flex items-center justify-center">
            <div className="w-full h-8 bg-red-500/40 rounded border border-red-500/60" />
          </div>
          <div className="text-[11px] font-sans text-white/70">
            Transients flattened into a solid block. Spotify will turn this down by 8 dB, making it sound weak and flat.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 4. GAIN STAGING GUIDE
 */
function GainStagingGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-black/40 to-black/60 border border-purple-500/30 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          The Philosophy of Gain Staging (0 VU = -18 dBFS)
        </h3>
        <p className="text-xs text-white/70 font-sans leading-relaxed max-w-2xl">
          Analog hardware consoles (Neve, SSL, API) were calibrated around <strong>0 VU (+4 dBu / 1.23V RMS)</strong>. When developers model analog plugins (compressors, tape machines, preamps), they program the sweet spot to respond identically when fed a nominal signal of <strong>-18 dBFS</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
          <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
            Analog Hardware vs Digital DAW
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center">
              <span>Analog Console 0 VU</span>
              <span className="text-amber-400 font-bold">+4 dBu (1.23 Volts)</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
              <span>Digital DAW Calibration</span>
              <span className="text-blue-400 font-bold">-18 dBFS</span>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex justify-between items-center">
              <span>Digital Hard Ceiling</span>
              <span className="text-red-400 font-bold">0 dBFS (Hard Clip)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
          <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
            3-Step Gain Staging Routine
          </h4>
          <div className="space-y-2 text-xs font-sans text-white/70">
            <div className="p-2.5 rounded-xl bg-white/3 border border-white/5">
              <strong>Step 1: Trim at Clip Gain.</strong> Before touching faders, trim audio clips so peaks hit around -12 dBFS.
            </div>
            <div className="p-2.5 rounded-xl bg-white/3 border border-white/5">
              <strong>Step 2: Maintain Unity Gain.</strong> Always adjust plugin makeup gain so output volume matches bypass volume.
            </div>
            <div className="p-2.5 rounded-xl bg-white/3 border border-white/5">
              <strong>Step 3: Mix with Faders.</strong> Use the 100mm faders for relative track balance, not to fix huge level mismatches.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 5. BUS ROUTING GUIDE
 */
function BusRoutingGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 via-black/40 to-black/60 border border-pink-500/30 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Subgroup Busses & Stem Routing Architecture
        </h3>
        <p className="text-xs text-white/70 font-sans leading-relaxed max-w-2xl">
          Rather than routing 60 individual channels directly into the master bus, professional audio engineers group related instruments into <strong>4 to 8 Subgroup Busses</strong> (Drums, Bass, Instruments, Vocals, FX).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-center">
          <div className="text-2xl mb-1">🥁</div>
          <div className="text-sm font-bold text-amber-400">Drum Bus</div>
          <p className="text-[11px] text-white/60 font-sans">
            Sums Kick, Snare, Hi-Hats, Toms, and Overheads. Apply SSL G-Master bus compression (2-3 dB gain reduction) to glue the kit.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2 text-center">
          <div className="text-2xl mb-1">🎤</div>
          <div className="text-sm font-bold text-rose-400">Vocal Bus</div>
          <p className="text-[11px] text-white/60 font-sans">
            Sums Lead, Harmonies, and Ad-libs. Apply gentle bus leveling and high-frequency silk EQ to bind vocals together.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-2 text-center">
          <div className="text-2xl mb-1">🌊</div>
          <div className="text-sm font-bold text-cyan-400">Time & Space FX Bus</div>
          <p className="text-[11px] text-white/60 font-sans">
            Receives all post-fader auxiliary sends. Keeps CPU usage low and places the entire mix into a single coherent acoustic room.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ========================================================================== */
/* 4. YOUTUBE + SPOTIFY DELIVERY GUIDE                                         */
/* ========================================================================== */

function PlatformDeliveryGuide() {
  const { state } = useSession();
  const stages = useSignalFlowStages();
  const platform = getPlatform(state.platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Banner */}
      <div
        className="p-6 rounded-3xl border shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${platform.color}18 0%, rgba(0,0,0,0.4) 60%)`,
          borderColor: `${platform.color}40`,
        }}
      >
        <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                style={{ background: `${platform.color}25`, color: platform.color }}
              >
                STAGE 4: DELIVERY — {platform.services.join(' + ').toUpperCase()}
              </span>
              <PlatformChipRow />
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {platform.icon} {platform.name}: {platform.targetLufs} LUFS integrated,{' '}
              {platform.truePeakCeiling.toFixed(1)} dBTP ceiling
            </h3>
            <p className="text-xs text-white/70 font-sans leading-relaxed">{platform.summary}</p>
            <p className="text-[11px] font-mono text-white/45 leading-relaxed">
              {platform.normalizationDetail}
            </p>
          </div>

          <div className="shrink-0 w-60">
            <LufsMeter lufs={platform.targetLufs} target={platform.targetLufs} truePeak={platform.truePeakCeiling} />
          </div>
        </div>
      </div>

      {/* The two pipelines side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'youtube' as const,
            title: 'YouTube',
            lines: [
              'Normalization: DOWN-ONLY (about -14 LUFS)',
              'Louder uploads get turned down',
              'Quieter uploads stay quieter',
              'True peak: keep at or below -1.0 dBTP',
              '48 kHz when the audio is muxed into video',
            ],
          },
          {
            id: 'spotify' as const,
            title: 'Spotify',
            lines: [
              'Normalization: UP and DOWN (-14 LUFS)',
              'Louder masters are attenuated by simple gain',
              'Quiet masters are boosted until headroom runs out',
              'True peak below -1.0 dBTP — below -2.0 dBTP if louder than -14 LUFS',
              'Deliver lossless WAV/FLAC through the distributor',
            ],
          },
          {
            id: 'youtube-spotify' as const,
            title: 'Both, one master',
            lines: [
              'Target -14.0 to -13.5 LUFS integrated',
              'Never under -14 LUFS: YouTube will not boost it',
              'Limiter ceiling -1.0 dBTP (lossy-encode safe)',
              'Keep the PLR at 10-13 dB so it still punches',
              'Same 24-bit WAV/FLAC upload for both destinations',
            ],
          },
        ].map(col => {
          const spec = getPlatform(col.id);
          const active = state.platform === col.id;
          return (
            <div
              key={col.id}
              className="p-4 rounded-2xl border space-y-2"
              style={{
                background: `${spec.color}08`,
                borderColor: active ? `${spec.color}55` : `${spec.color}25`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: spec.color }}>
                  {spec.icon} {col.title}
                </span>
                <span className="text-[9px] font-mono text-white/30">{spec.targetLufs} LUFS</span>
              </div>
              <ul className="space-y-1">
                {col.lines.map(l => (
                  <li key={l} className="text-[10px] font-mono text-white/55 flex gap-1.5">
                    <span style={{ color: spec.color }}>▸</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Signal flow with platform-driven dB numbers */}
      <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
            Signal flow with {platform.shortName} dB targets
          </h4>
          <span className="text-[9px] font-mono text-white/30">
            Stages 1-4 are universal · stages 5-8 move with the upload destination
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <div className="flex items-stretch gap-2 min-w-[900px]">
            {stages.map((st, i) => (
              <div key={st.id} className="flex items-center flex-1">
                <div
                  className="flex-1 p-2.5 rounded-xl border text-center"
                  style={{
                    background: st.scope === 'platform' ? `${platform.color}12` : 'rgba(255,255,255,0.02)',
                    borderColor: st.scope === 'platform' ? `${platform.color}40` : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="text-[8px] font-mono text-white/30">STEP {st.step}</div>
                  <div className="text-base">{st.icon}</div>
                  <div className="text-[9px] font-bold text-white/85 leading-tight">{st.shortName}</div>
                  <div className="text-[10px] font-mono font-black mt-1" style={{ color: st.color }}>
                    {st.id === 'delivery' ? `${st.targetDb} LUFS` : `${st.targetDb} dBFS`}
                  </div>
                  <div className="text-[7px] font-mono text-white/35">{st.targetText}</div>
                  <div
                    className="text-[7px] font-mono mt-1 px-1 rounded"
                    style={{
                      background: st.scope === 'platform' ? `${platform.color}22` : 'rgba(255,255,255,0.05)',
                      color: st.scope === 'platform' ? platform.color : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {st.scope === 'platform' ? 'PLATFORM' : 'UNIVERSAL'}
                  </div>
                </div>
                {i < stages.length - 1 && (
                  <div className="w-4 h-0.5 shrink-0" style={{ background: `${st.color}50` }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Every platform's dB plan */}
      <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
        <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
          Level plan comparison — what changes per destination
        </h4>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full font-mono text-[9px] min-w-[720px]">
            <thead>
              <tr className="text-white/35 border-b border-white/10">
                <th className="text-left p-2">Destination</th>
                <th className="p-2">Integrated</th>
                <th className="p-2">True peak</th>
                <th className="p-2">Mix bus peak</th>
                <th className="p-2">Bus trim</th>
                <th className="p-2">Channel trim</th>
                <th className="p-2">Headroom</th>
                <th className="p-2">Normalization</th>
              </tr>
            </thead>
            <tbody>
              {PLATFORM_PRESETS.map(pp => {
                const active = pp.id === state.platform;
                return (
                  <tr
                    key={pp.id}
                    className="border-b border-white/5"
                    style={active ? { background: `${pp.color}12` } : undefined}
                  >
                    <td className="p-2 text-left">
                      <span className="mr-1">{pp.icon}</span>
                      <span style={{ color: pp.color }}>{pp.shortName}</span>
                    </td>
                    <td className="p-2 text-center text-white/70">{pp.targetLufs} LUFS</td>
                    <td className="p-2 text-center text-white/70">{pp.truePeakCeiling.toFixed(1)} dBTP</td>
                    <td className="p-2 text-center text-white/70">
                      {pp.mixBusPeak[0]} to {pp.mixBusPeak[1]}
                    </td>
                    <td className="p-2 text-center" style={{ color: pp.busTrimDb === 0 ? 'rgba(255,255,255,0.35)' : pp.color }}>
                      {pp.busTrimDb === 0 ? '—' : `${pp.busTrimDb} dB`}
                    </td>
                    <td className="p-2 text-center" style={{ color: pp.trackTrimDb === 0 ? 'rgba(255,255,255,0.35)' : pp.color }}>
                      {pp.trackTrimDb === 0 ? '—' : `${pp.trackTrimDb} dB`}
                    </td>
                    <td className="p-2 text-center text-white/70">{pp.headroomDb} dB</td>
                    <td className="p-2 text-center text-white/45">{pp.normalizationLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] font-mono text-white/30">
          Switching the destination re-targets the session: subgroup buses and channel windows shift by the
          trim above, the limiter ceiling and LUFS target change, and the upload check re-runs.
        </p>
      </div>

      {/* Live delivery board */}
      <DeliveryBoard />

      {/* Upload day checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <div className="text-xs font-bold text-emerald-400">
            ✓ Upload day checklist — {platform.services.join(' + ')}
          </div>
          <ul className="space-y-1">
            {platform.uploadChecklist.map(c => (
              <li key={c} className="text-[10px] font-mono text-white/60 flex gap-1.5">
                <span className="text-emerald-400">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
          <div className="text-xs font-bold text-red-400">✕ Mistakes that get your song turned down</div>
          <ul className="space-y-1">
            {platform.avoidList.map(c => (
              <li key={c} className="text-[10px] font-mono text-white/60 flex gap-1.5">
                <span className="text-red-400">✕</span>
                <span>{c}</span>
              </li>
            ))}
            <li className="text-[10px] font-mono text-white/60 flex gap-1.5">
              <span className="text-red-400">✕</span>
              <span>Mastering to the meter instead of the song — if it needs -12 LUFS to feel right, keep -12 and let the platform gain it down.</span>
            </li>
            <li className="text-[10px] font-mono text-white/60 flex gap-1.5">
              <span className="text-red-400">✕</span>
              <span>Checking the WAV only. Always audition the encoded AAC/Ogg render before publishing.</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ========================================================================== */
/* INDIAN SONGS & STYLES GUIDE                                                 */
/* ========================================================================== */

function IndianMusicGuide() {
  const indianPresets = GENRE_PRESETS.filter(p => p.group === 'indian');
  const platform = getPlatform('youtube-spotify');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Banner */}
      <div
        className="p-6 rounded-3xl border shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,153,51,0.16) 0%, rgba(19,136,8,0.10) 50%, rgba(0,0,0,0.4) 100%)',
          borderColor: 'rgba(255,153,51,0.35)',
        }}
      >
        <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/25 text-[10px] font-mono font-bold">
              INDIAN REPERTOIRE — FILMI • CLASSICAL • FOLK • DEVOIONAL • INDIE
            </span>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              🇮🇳 Indian songs: instruments, routing and loudness targets
            </h3>
            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Indian sessions are built the same way — source → inserts → faders → sends → subgroups →
              mix bus → pre-master → delivery — but the instrument palette changes: tabla, dholak, dhol and
              mridangam instead of (or alongside) a drum kit, and sitar, sarod, veena, santoor, bansuri,
              shehnai and harmonium instead of guitars and synths.
            </p>
            <p className="text-[11px] font-mono text-white/50 leading-relaxed">
              Almost every Indian release lands on YouTube first (official video or lyric video) and on
              Spotify plus the local DSPs the same week. One master at{' '}
              <span className="text-orange-300">-14 LUFS / -1.0 dBTP</span> satisfies all of them —
              that is the default target of this studio.
            </p>
          </div>

          <div className="shrink-0 w-60">
            <LufsMeter lufs={-14} target={platform.targetLufs} truePeak={-1.0} />
          </div>
        </div>
      </div>

      {/* Genre cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {indianPresets.map(preset => (
          <div
            key={preset.genre}
            className="p-4 rounded-2xl border space-y-2.5"
            style={{ background: `${preset.color}08`, borderColor: `${preset.color}28` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{preset.icon}</span>
                <div>
                  <div className="text-sm font-bold" style={{ color: preset.color }}>
                    {preset.name}
                  </div>
                  <div className="text-[8px] font-mono text-white/35">{preset.region}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[9px] font-mono text-white/40">
                  {preset.bpm > 0 ? `${preset.bpm} BPM` : 'free'}
                </div>
                <div className="text-[8px] font-mono text-white/30">{preset.key}</div>
              </div>
            </div>

            <p className="text-[11px] font-sans text-white/60 leading-relaxed">{preset.description}</p>

            {/* Loudness / crest guidance */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
              <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                <div className="text-[7px] text-white/30 uppercase">Crest</div>
                <div className="text-[10px] font-bold text-emerald-400">{preset.crestDb} dB</div>
              </div>
              <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                <div className="text-[7px] text-white/30 uppercase">Master</div>
                <div className="text-[10px] font-bold" style={{ color: preset.color }}>
                  {preset.crestDb && preset.crestDb >= 15 ? '-16 LUFS' : '-14 LUFS'}
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
                <div className="text-[7px] text-white/30 uppercase">Ceiling</div>
                <div className="text-[10px] font-bold text-yellow-400">-1.0 dBTP</div>
              </div>
            </div>

            {preset.mixNotes && (
              <p className="text-[10px] font-mono text-white/50 leading-relaxed">{preset.mixNotes}</p>
            )}

            <div className="pt-1.5 border-t border-white/5">
              <div className="text-[7px] font-mono text-white/25 uppercase tracking-wider mb-1">
                Signal flow for this style
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(preset.tracks)).map(tt => (
                  <span
                    key={tt}
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded-md border"
                    style={{
                      background: `${TRACK_DEFS[tt].color}12`,
                      borderColor: `${TRACK_DEFS[tt].color}30`,
                      color: TRACK_DEFS[tt].color,
                    }}
                  >
                    {TRACK_DEFS[tt].icon} {TRACK_DEFS[tt].name}
                  </span>
                ))}
              </div>
            </div>

            {preset.referenceSongs && (
              <div className="pt-1.5 border-t border-white/5">
                <div className="text-[7px] font-mono text-white/25 uppercase tracking-wider mb-1">
                  Reference songs
                </div>
                <div className="flex flex-wrap gap-1">
                  {preset.referenceSongs.map(song => (
                    <span
                      key={song}
                      className="text-[8px] font-mono text-white/45 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5"
                    >
                      ♪ {song}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instrument target table */}
      <div className="p-5 rounded-3xl bg-black/40 border border-white/10 space-y-3">
        <div>
          <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
            Indian instrument level targets (dBFS peak windows)
          </h4>
          <p className="text-[9px] font-mono text-white/30">
            Same gain-staging rule as any other session: channels sit around -18 dBFS nominal so 20+ tracks
            never threaten the mix bus.
          </p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full font-mono text-[9px] min-w-[680px]">
            <thead>
              <tr className="text-white/35 border-b border-white/10">
                <th className="text-left p-2">Instrument</th>
                <th className="p-2">Peak window</th>
                <th className="p-2">Pan</th>
                <th className="p-2">Frequency</th>
                <th className="p-2">Bus</th>
                <th className="text-left p-2">Mixing note</th>
              </tr>
            </thead>
            <tbody>
              {INDIAN_TRACK_TYPES.map(type => {
                const def = TRACK_DEFS[type];
                return (
                  <tr key={type} className="border-b border-white/5">
                    <td className="p-2 text-left">
                      <span className="mr-1">{def.icon}</span>
                      <span style={{ color: def.color }}>{def.name}</span>
                    </td>
                    <td className="p-2 text-center text-emerald-400">
                      {def.dbRange[0]} to {def.dbRange[1]}
                    </td>
                    <td className="p-2 text-center text-white/50">
                      {def.panDefault === 0 ? 'C' : def.panDefault < 0 ? `L${Math.abs(Math.round(def.panDefault * 100))}` : `R${Math.round(def.panDefault * 100)}`}
                    </td>
                    <td className="p-2 text-center text-white/45">{def.frequencyRange}</td>
                    <td className="p-2 text-center text-white/45">{BUS_DEFS[def.bus].name.replace(' Bus', '')}</td>
                    <td className="p-2 text-left text-white/50 max-w-[280px]">{def.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practical notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 space-y-2">
          <div className="text-xs font-bold text-orange-300">🥁 Percussion first</div>
          <p className="text-[11px] font-sans text-white/60">
            Dhol, dholak and mridangam carry far more low-mid energy than a recorded kit. Mono everything
            below 120 Hz and sidechain the bass to the dhol, or your -14 LUFS master will pump.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 space-y-2">
          <div className="text-xs font-bold text-green-300">🎤 Voice is the song</div>
          <p className="text-[11px] font-sans text-white/60">
            In filmi, ghazal, qawwali and bhajan the vocal sits 2-4 dB hotter than a Western pop mix and
            the reverb is bigger. Keep the tanpura and harmonium 8-12 dB under the voice so the raga stays
            clear without eating headroom.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
          <div className="text-xs font-bold text-purple-300">📊 Classical needs dynamics</div>
          <p className="text-[11px] font-sans text-white/60">
            Hindustani and Carnatic recordings live at -16 to -18 LUFS with 16-20 LU of range. Do not
            let the limiter flatten an alap: master the arc, not the meter, and keep the ceiling at
            -1.0 dBTP.
          </p>
        </div>
      </div>

      {/* Delivery reminder */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🚀</span>
          <span className="text-xs font-mono font-bold text-white/75 uppercase">
            Releasing an Indian track on YouTube + Spotify
          </span>
        </div>
        <ol className="space-y-1 list-decimal list-inside">
          {[
            'Mix with -18 dBFS channel targets and the mix bus peaking -6 to -3 dBFS.',
            'Master to -14 LUFS integrated with a -1.0 dBTP ceiling (drop to -2.0 dBTP if you push louder).',
            'Export 24-bit WAV/FLAC at the session rate; use 48 kHz if the master is going into a video.',
            'Upload the same lossless master to YouTube (video/artwork track) and to Spotify through your distributor.',
            'A/B against the reference songs for the style before you publish — loudness is easy, translation is the work.',
          ].map(step => (
            <li key={step} className="text-[10px] font-mono text-white/55">{step}</li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
