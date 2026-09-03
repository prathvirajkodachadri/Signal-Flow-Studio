import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Sparkles, AlertTriangle, ShieldCheck,
  Activity, Info, Radio, Zap, HelpCircle, CheckCircle2,
  Sliders, ArrowRight, CornerDownRight, BarChart2,
} from 'lucide-react';
import { LevelMeter, AnalogVuMeter, LufsMeter, MiniWaveform, LevelHealthBadge } from './LevelMeter';
import { audioEngine } from '../utils/audioEngine';

interface LevelZoneDef {
  name: string;
  range: [number, number];
  color: string;
  badge: string;
  description: string;
  whatHappens: string;
  analogy: string;
}

const LEVEL_ZONES: LevelZoneDef[] = [
  {
    name: 'Clipping & Digital Distortion',
    range: [0, 6],
    color: '#EF476F',
    badge: 'DANGER / CLIPPING',
    description: '0 dBFS is the absolute physical ceiling of digital audio. Signals exceeding 0 dBFS are truncated flat.',
    whatHappens: 'Produces harsh non-harmonic odd-order square-wave distortion and crackling.',
    analogy: 'Smashing your head directly into a concrete ceiling.',
  },
  {
    name: 'Inter-Sample Risk Zone',
    range: [-3, 0],
    color: '#F97316',
    badge: 'HOT / INTER-SAMPLE RISK',
    description: 'Peaks between -3 and 0 dBFS can cause inter-sample clipping during MP3/AAC encoding.',
    whatHappens: 'Streaming encoders (Spotify, Apple) will generate distortion when reconstructing continuous waveforms.',
    analogy: 'Driving 95 MPH in a 65 MPH zone — you might not crash yet, but risk is very high.',
  },
  {
    name: 'Mix Bus Headroom Target',
    range: [-6, -3],
    color: '#FFD166',
    badge: 'MIX BUS TARGET',
    description: 'The recommended peak target for your final mix bus before sending to mastering.',
    whatHappens: 'Leaves 3 to 6 dB clean headroom for the mastering engineer to EQ and compress cleanly.',
    analogy: 'Leaving plenty of room in your suitcase so you can pack souvenirs later.',
  },
  {
    name: 'The 0 VU Golden Sweet Spot',
    range: [-18, -12],
    color: '#06D6A0',
    badge: '★ 0 VU SWEET SPOT',
    description: 'Calibrated to 0 VU (+4 dBu) in analog gear. Optimal for all individual tracks and plugin emulations.',
    whatHappens: 'Plugins run with zero internal distortion, maximum dynamic range, and effortless summing.',
    analogy: 'The engine running at its smoothest cruising RPM for maximum efficiency.',
  },
  {
    name: 'Safe Floor / Background',
    range: [-36, -18],
    color: '#3A86FF',
    badge: 'SAFE FLOOR',
    description: 'Ideal range for auxiliary reverbs, room mics, atmospheric pads, and subtle background textures.',
    whatHappens: 'Allows ambient elements to sit naturally behind foreground lead instruments.',
    analogy: 'Warm background lighting that sets the room mood without blinding you.',
  },
  {
    name: 'Noise Floor / Too Low',
    range: [-60, -36],
    color: '#6B7280',
    badge: 'TOO LOW / NOISE FLOOR',
    description: 'Signal is too close to preamp self-noise and microphone thermal hiss.',
    whatHappens: 'Boosting later will bring up annoying hiss, hum, and digital quantization noise.',
    analogy: 'Whispering from the opposite side of a noisy restaurant.',
  },
];

const SIGNAL_PRESETS = [
  {
    id: 'drums',
    name: 'Drum Transient',
    icon: '🥁',
    dbPeak: -12,
    dbRms: -21,
    vuValue: -18,
    lufs: -20,
    desc: 'High transient crest factor (punchy peaks)',
  },
  {
    id: 'bass',
    name: 'Sustained Bass',
    icon: '🎸',
    dbPeak: -14,
    dbRms: -17,
    vuValue: -15,
    lufs: -16,
    desc: 'Dense sustained low-end RMS energy',
  },
  {
    id: 'vocal',
    name: 'Dynamic Lead Vocal',
    icon: '🎤',
    dbPeak: -12,
    dbRms: -19,
    vuValue: -18,
    lufs: -18,
    desc: 'Wide natural acoustic dynamics',
  },
  {
    id: 'master',
    name: 'Streaming Master',
    icon: '✨',
    dbPeak: -1.0,
    dbRms: -11,
    vuValue: -10,
    lufs: -14,
    desc: 'Spotify / YouTube -14 LUFS target',
  },
  {
    id: 'tone',
    name: '1 kHz Reference Sine',
    icon: '∿',
    dbPeak: -18,
    dbRms: -18,
    vuValue: -18,
    lufs: -18,
    desc: '0 VU = -18 dBFS Calibration Standard',
  },
];

const INSTRUMENT_TARGET_GUIDES = [
  {
    name: 'Lead Vocals',
    icon: '🎤',
    color: '#FF006E',
    peakTarget: '-18 to -12 dBFS',
    rmsTarget: '-20 to -16 dBFS',
    bus: 'Vocal Bus',
    tip: 'Leave 12-18 dB headroom for 2-stage optical + FET compressor leveling.',
  },
  {
    name: 'Kick & Snare',
    icon: '🥁',
    color: '#FF6B35',
    peakTarget: '-18 to -12 dBFS',
    rmsTarget: '-24 to -19 dBFS',
    bus: 'Drum Bus',
    tip: 'Transients are short and sharp. Keep peaks under -12 dBFS to prevent sum overload.',
  },
  {
    name: 'Electric / Sub Bass',
    icon: '🎸',
    color: '#118AB2',
    peakTarget: '-16 to -12 dBFS',
    rmsTarget: '-16 to -14 dBFS',
    bus: 'Bass Bus',
    tip: 'Low-frequency waves carry massive energy. Steady RMS prevents limiter pumping.',
  },
  {
    name: 'Guitars & Keys',
    icon: '🎹',
    color: '#8338EC',
    peakTarget: '-18 to -14 dBFS',
    rmsTarget: '-22 to -18 dBFS',
    bus: 'Inst Bus',
    tip: 'Pan away from center to create wide stereo spread and leave room for vocals.',
  },
  {
    name: 'FX, Reverb & Aux',
    icon: '✦',
    color: '#00F5D4',
    peakTarget: '-24 to -18 dBFS',
    rmsTarget: '-28 to -24 dBFS',
    bus: 'FX Bus',
    tip: 'Aux returns should sit 4-6 dB quieter than lead tracks for natural spatial depth.',
  },
  {
    name: 'Mix Bus (2-Bus)',
    icon: 'Σ',
    color: '#FFD700',
    peakTarget: '-6 to -3 dBFS',
    rmsTarget: '-16 to -12 dBFS',
    bus: 'Pre-Master',
    tip: 'Crucial for mastering: retain 3 to 6 dB true headroom before output limiting.',
  },
];

export function LevelReference() {
  const [dbLevel, setDbLevel] = useState<number>(-18);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('tone');

  // Find active zone
  const activeZone = LEVEL_ZONES.find(z => dbLevel >= z.range[0] && dbLevel <= z.range[1]) ||
    (dbLevel > 0 ? LEVEL_ZONES[0] : LEVEL_ZONES[LEVEL_ZONES.length - 1]);

  const handleSliderChange = (newVal: number) => {
    setDbLevel(newVal);
    if (isPlayingAudio) {
      audioEngine.updateToneLevel(newVal);
    }
  };

  const handleSelectPreset = (preset: typeof SIGNAL_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setDbLevel(preset.dbPeak);
    if (isPlayingAudio) {
      audioEngine.updateToneLevel(preset.dbPeak);
    }
  };

  const toggleAudioTone = () => {
    if (isPlayingAudio) {
      audioEngine.stopTone();
      setIsPlayingAudio(false);
    } else {
      audioEngine.playTone(dbLevel, 440, 'sine');
      setIsPlayingAudio(true);
    }
  };

  useEffect(() => {
    return () => {
      audioEngine.stopTone();
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 max-w-6xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
              ★ AUDIO ENGINEERING STANDARD
            </span>
            <span className="text-xs font-mono text-white/40">dBFS • VU • LUFS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white/95 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Visual Level Reference & Gain Staging Guide
          </h2>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            Interactive multi-standard meters and zone explanations for clean, dynamic audio
          </p>
        </div>

        {/* Audio Test Tone Button */}
        <button
          onClick={toggleAudioTone}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-lg ${
            isPlayingAudio
              ? 'bg-red-500 text-white shadow-red-500/25 animate-pulse'
              : 'bg-white/10 hover:bg-white/15 text-white/80'
          }`}
        >
          {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isPlayingAudio ? 'Stop Calibration Tone' : 'Play Reference Tone'}</span>
        </button>
      </div>

      {/* Main Interactive Level Station */}
      <div
        className="rounded-3xl p-5 sm:p-7 border shadow-2xl space-y-6"
        style={{
          background: 'linear-gradient(180deg, #13192a 0%, #0c101d 100%)',
          borderColor: `${activeZone.color}40`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px ${activeZone.color}15`,
        }}
      >
        {/* Preset Selector Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs font-mono font-bold text-white/50 shrink-0">Signal Presets:</span>
          <div className="flex gap-2 shrink-0">
            {SIGNAL_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedPresetId === preset.id
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Meter Interactive Station */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Meter 1: High-Resolution dBFS LED Ladder Meter */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-between h-64">
            <div className="text-center w-full">
              <div className="text-[10px] font-mono text-white/40 uppercase font-bold">Digital Peak Meter</div>
              <div className="text-xs font-mono font-bold text-white">Full Scale (dBFS)</div>
            </div>

            <div className="my-2">
              <LevelMeter
                db={dbLevel}
                range={[-60, 0]}
                height={130}
                width={26}
                showScale={true}
                showLabel={false}
                color={activeZone.color}
              />
            </div>

            <div className="text-center">
              <div className="text-lg font-mono font-black" style={{ color: activeZone.color }}>
                {dbLevel.toFixed(1)} <span className="text-xs text-white/40">dBFS</span>
              </div>
            </div>
          </div>

          {/* Meter 2: Vintage Analog VU Meter */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-between h-64">
            <div className="text-center w-full">
              <div className="text-[10px] font-mono text-white/40 uppercase font-bold">Analog Ballistics</div>
              <div className="text-xs font-mono font-bold text-amber-300">Volume Units (0 VU = -18 dBFS)</div>
            </div>

            <div className="my-2">
              <AnalogVuMeter dbFS={dbLevel} width={200} height={120} />
            </div>

            <div className="text-[9px] font-mono text-amber-200/60 text-center">
              {dbLevel >= -18 && dbLevel <= -12
                ? '✓ Optimal Analog Saturation Range'
                : dbLevel > -12
                ? '⚠ Pushing into Analog Saturation / Tape Warmth'
                : 'Conservative Linear Range'}
            </div>
          </div>

          {/* Meter 3: Loudness LUFS & Dynamic Waveform */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between h-64">
            <div className="text-center">
              <div className="text-[10px] font-mono text-white/40 uppercase font-bold">Loudness & Dynamic Wave</div>
              <div className="text-xs font-mono font-bold text-emerald-400">LUFS Integrated & True Peak</div>
            </div>

            <LufsMeter
              lufs={Math.max(-36, Math.min(-6, dbLevel + 2))}
              target={-14}
              truePeak={dbLevel > -0.2 ? 0.8 : dbLevel}
            />

            {/* Live Waveform graphic */}
            <div className="p-2 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-mono text-white/40">Live Wave:</span>
              <MiniWaveform
                color={activeZone.color}
                width={130}
                height={20}
                amplitude={Math.max(0.1, (dbLevel + 60) / 60)}
              />
            </div>
          </div>
        </div>

        {/* Master Interactive Slider Control */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-white/60 font-semibold">Interactive Level Fader</span>
            <span className="font-bold text-base" style={{ color: activeZone.color }}>
              {dbLevel.toFixed(1)} dBFS
            </span>
          </div>

          <input
            type="range"
            min={-60}
            max={3}
            step={0.5}
            value={dbLevel}
            onChange={e => handleSliderChange(parseFloat(e.target.value))}
            className="w-full h-3 rounded-full cursor-pointer"
            style={{
              background: 'linear-gradient(to right, #6B7280 0%, #3A86FF 30%, #06D6A0 65%, #FFD166 82%, #F97316 92%, #EF476F 98%)',
            }}
          />

          {/* Scale labels */}
          <div className="flex justify-between text-[8px] font-mono text-white/30 pt-1">
            <span>-60 dBFS (Silence)</span>
            <span>-36 dBFS (Floor)</span>
            <span className="text-emerald-400 font-bold">★ -18 dBFS (0 VU)</span>
            <span>-6 dBFS (Bus)</span>
            <span className="text-red-400 font-bold">0 dBFS (Clip)</span>
            <span>+3 dB (Overs)</span>
          </div>
        </div>

        {/* Active Zone Explanatory Card */}
        <div
          className="p-5 rounded-2xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: `${activeZone.color}0c`,
            borderColor: `${activeZone.color}35`,
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${activeZone.color}25`, color: activeZone.color }}
              >
                {activeZone.badge}
              </span>
              <span className="text-xs font-mono text-white/40">
                Range: {activeZone.range[0]} to {activeZone.range[1]} dBFS
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">{activeZone.name}</h4>
            <p className="text-xs text-white/70 font-sans leading-relaxed">{activeZone.description}</p>
            <div className="text-[11px] font-mono text-white/50 pt-1">
              💬 <strong>Everyday Analogy:</strong> {activeZone.analogy}
            </div>
          </div>

          <div className="shrink-0 p-3 rounded-xl bg-black/40 border border-white/5 text-right font-mono">
            <div className="text-[8px] text-white/30 uppercase">Audio Result</div>
            <div className="text-xs font-bold" style={{ color: activeZone.color }}>
              {activeZone.whatHappens}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Level Zones Detailed Breakdown Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
            The 6 Color-Coded Audio Level Zones
          </h3>
          <p className="text-xs text-white/40 font-mono">
            Visual guidance on where to aim for every stage of production
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVEL_ZONES.map(zone => (
            <div
              key={zone.name}
              onClick={() => handleSliderChange(zone.range[0] + (zone.range[1] - zone.range[0]) / 2)}
              className="p-4 rounded-2xl border backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
              style={{
                background: `${zone.color}08`,
                borderColor: `${zone.color}25`,
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${zone.color}20`, color: zone.color }}
                  >
                    {zone.range[0]} to {zone.range[1]} dBFS
                  </span>
                  <span className="text-[9px] font-mono text-white/30">Click to jump</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{zone.name}</h4>
                <p className="text-xs text-white/60 font-sans leading-relaxed mb-3">
                  {zone.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[10px] font-mono" style={{ color: zone.color }}>
                {zone.whatHappens}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Waveform Distortion Comparison */}
      <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Waveform Distortion Comparison: Clean vs Clipped
            </h3>
            <p className="text-xs text-white/40 font-mono">
              Why -18 dBFS preserves full dynamic punch while above 0 dBFS destroys audio information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pristine -18 dBFS */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">Pristine -18 dBFS</span>
              <span className="text-[8px] font-mono text-white/40">0 VU CALIBRATED</span>
            </div>
            <div className="h-16 flex items-center justify-center bg-black/40 rounded-xl p-2">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <path d="M 0,20 Q 25,2 50,20 T 100,20" fill="none" stroke="#06D6A0" strokeWidth="2.5" />
                <path d="M 0,20 Q 25,38 50,20 T 100,20" fill="none" stroke="#06D6A0" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
            <div className="text-[11px] font-sans text-white/70">
              Smooth, natural sine waves. 100% linear converter operation with 18 dB dynamic crest headroom.
            </div>
          </div>

          {/* Card 2: Mix Bus -3 dBFS */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400">Mix Bus -3 dBFS</span>
              <span className="text-[8px] font-mono text-white/40">CONTROLLED PEAK</span>
            </div>
            <div className="h-16 flex items-center justify-center bg-black/40 rounded-xl p-2">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <path d="M 0,20 Q 25,-4 50,20 T 100,20" fill="none" stroke="#FFD166" strokeWidth="2.5" />
                <path d="M 0,20 Q 25,44 50,20 T 100,20" fill="none" stroke="#FFD166" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>
            <div className="text-[11px] font-sans text-white/70">
              Full energetic punch while maintaining 3 dB safety buffer for mastering limiter curves.
            </div>
          </div>

          {/* Card 3: Clipped > 0 dBFS */}
          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400">Clipped &gt; 0 dBFS</span>
              <span className="text-[8px] font-mono text-white/40">FLAT-TOPPED DESTRUCTION</span>
            </div>
            <div className="h-16 flex items-center justify-center bg-black/40 rounded-xl p-2">
              <svg viewBox="0 0 100 40" className="w-full h-full">
                <path d="M 0,20 L 15,2 L 35,2 L 50,20 L 65,38 L 85,38 L 100,20" fill="none" stroke="#EF476F" strokeWidth="2.5" />
                <line x1="15" y1="2" x2="35" y2="2" stroke="#ff0000" strokeWidth="3" />
                <line x1="65" y1="38" x2="85" y2="38" stroke="#ff0000" strokeWidth="3" />
              </svg>
            </div>
            <div className="text-[11px] font-sans text-white/70">
              Peaks exceed 0 dBFS and are flat-topped into square waves, generating harsh digital distortion.
            </div>
          </div>
        </div>
      </div>

      {/* Instrument & Bus Target Quick Reference Cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Instrument Level Targets (Practical Cheat Sheet)
          </h3>
          <p className="text-xs text-white/40 font-mono">
            Standard starting levels for clean tracking, mixing, and summing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSTRUMENT_TARGET_GUIDES.map(item => (
            <div
              key={item.name}
              className="p-4 rounded-2xl border backdrop-blur-md space-y-3"
              style={{
                background: `${item.color}08`,
                borderColor: `${item.color}25`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold text-white">{item.name}</div>
                    <div className="text-[8px] font-mono text-white/40">→ {item.bus}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-center">
                <div>
                  <div className="text-[7px] text-white/40 uppercase">Peak Target</div>
                  <div className="text-xs font-bold text-emerald-400">{item.peakTarget}</div>
                </div>
                <div>
                  <div className="text-[7px] text-white/40 uppercase">RMS Target</div>
                  <div className="text-xs font-bold text-white/80">{item.rmsTarget}</div>
                </div>
              </div>

              <p className="text-[11px] font-sans text-white/60 leading-relaxed">
                {item.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
