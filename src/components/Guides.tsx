import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Sliders, Sparkles, Layers, ArrowRight, CheckCircle2,
  XCircle, AlertTriangle, HelpCircle, Activity, Zap, ShieldCheck,
  Disc, BarChart2, Radio, SlidersHorizontal,
} from 'lucide-react';
import { LevelMeter, MiniWaveform, AnalogVuMeter, LufsMeter } from './LevelMeter';

type GuideTab = 'recording' | 'mixing' | 'mastering' | 'gainstaging' | 'routing';

export function Guides() {
  const [activeTab, setActiveTab] = useState<GuideTab>('recording');

  const tabs: { id: GuideTab; label: string; icon: string; color: string }[] = [
    { id: 'recording', label: '1. Recording Guide', icon: '🎙️', color: '#06D6A0' },
    { id: 'mixing', label: '2. Mixing Guide', icon: '🎚️', color: '#3A86FF' },
    { id: 'mastering', label: '3. Mastering Guide', icon: '✨', color: '#FFD700' },
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
        {activeTab === 'recording' && <RecordingGuide key="rec" />}
        {activeTab === 'mixing' && <MixingGuide key="mix" />}
        {activeTab === 'mastering' && <MasteringGuide key="mst" />}
        {activeTab === 'gainstaging' && <GainStagingGuide key="gs" />}
        {activeTab === 'routing' && <BusRoutingGuide key="br" />}
      </AnimatePresence>
    </div>
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
