import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Sliders, SlidersHorizontal, Activity, Zap,
  CheckCircle2, AlertTriangle, ArrowRight, CornerDownRight,
  Radio, Sparkles, Filter, Disc, Speaker, Layers,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import {
  type Track, type Bus, getLevelHealth, getHealthColor,
  BUS_DEFS, TRACK_DEFS, SIGNAL_FLOW_STAGES,
} from '../data';
import {
  LevelMeter, MiniWaveform, AnalogVuMeter, LufsMeter,
  LevelHealthBadge, FrequencySpectrum,
} from './LevelMeter';

export function MixerView() {
  const { state, dispatch } = useSession();
  const { tracks, buses, mixBusDb, preMasterDb } = state;

  const [activeTab, setActiveTab] = useState<'chain' | 'console' | 'inspector'>('chain');
  const [activeStageId, setActiveStageId] = useState<string>('input');
  const [selectedTrackIdForChain, setSelectedTrackIdForChain] = useState<string>(tracks[0]?.id || '');

  // Select first track if none selected
  const currentTrack = tracks.find(t => t.id === selectedTrackIdForChain) || tracks[0] || null;

  // Interactive stage states
  const [hpfEnabled, setHpfEnabled] = useState(true);
  const [hpfFreq, setHpfFreq] = useState(80);
  const [compThreshold, setCompThreshold] = useState(-18);
  const [compRatio, setCompRatio] = useState(4);
  const [eqHighBoost, setEqHighBoost] = useState(2.5);
  const [satDrive, setSatDrive] = useState(1.5);

  return (
    <div className="h-full flex flex-col bg-[#0a0e1a] overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <SlidersHorizontal size={14} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Signal Flow & Mix Architecture
              </h2>
              <p className="text-[8px] font-mono text-white/30">
                End-to-End Signal Routing • Input to Master Output
              </p>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('chain')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              activeTab === 'chain' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            <Zap size={11} />
            <span>Signal Chain Flow</span>
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              activeTab === 'console' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            <Sliders size={11} />
            <span>Console Mixer</span>
          </button>
        </div>

        {/* Master Output Badge */}
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-[9px] font-mono text-white/50 uppercase">Mix Bus:</span>
            <span className="text-[10px] font-mono font-bold text-yellow-400">{mixBusDb.toFixed(1)} dBFS</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/50 uppercase">Master:</span>
            <span className="text-[10px] font-mono font-bold text-white">{preMasterDb.toFixed(1)} dBTP</span>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        {activeTab === 'chain' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Track Selector for Signal Chain */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/3 border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white/70">Trace Track:</span>
                <div className="flex gap-1.5 overflow-x-auto max-w-2xl custom-scrollbar py-0.5">
                  {tracks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrackIdForChain(t.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all shrink-0 ${
                        currentTrack?.id === t.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[9px] font-mono text-white/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Click any stage below to inspect & tweak
              </div>
            </div>

            {/* Complete Interactive Horizontal Signal Flow Diagram */}
            <div className="relative p-5 rounded-3xl bg-black/40 border border-white/10 shadow-2xl overflow-x-auto custom-scrollbar">
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4 font-bold flex items-center justify-between">
                <span>Complete Audio Path: Source → Inserts → Groups → Master</span>
                <span className="text-emerald-400">⚡ Live Audio Cable Pulse</span>
              </div>

              {/* Connected Stages Flow Strip */}
              <div className="flex items-center gap-3 min-w-[980px] justify-between relative py-2">
                {SIGNAL_FLOW_STAGES.map((stage, idx) => {
                  const isSelected = activeStageId === stage.id;
                  const isLast = idx === SIGNAL_FLOW_STAGES.length - 1;

                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      {/* Stage Node Box */}
                      <motion.div
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveStageId(stage.id)}
                        className={`relative flex-1 p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between min-h-[140px] ${
                          isSelected
                            ? 'shadow-2xl'
                            : 'bg-white/2 hover:bg-white/5 border-white/5'
                        }`}
                        style={{
                          background: isSelected
                            ? `linear-gradient(145deg, ${stage.color}25 0%, rgba(15,22,36,0.95) 100%)`
                            : undefined,
                          borderColor: isSelected ? stage.color : undefined,
                          boxShadow: isSelected ? `0 0 25px ${stage.color}35` : undefined,
                        }}
                      >
                        {/* Step Number Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold"
                            style={{
                              background: isSelected ? stage.color : 'rgba(255,255,255,0.1)',
                              color: isSelected ? '#000' : '#fff',
                            }}
                          >
                            {stage.step}
                          </span>
                          <span className="text-lg">{stage.icon}</span>
                        </div>

                        {/* Title & Short role */}
                        <div>
                          <div className="text-xs font-bold text-white/95 leading-tight mb-0.5 truncate">
                            {stage.name}
                          </div>
                          <div className="text-[8px] font-mono text-white/40 line-clamp-2">
                            {stage.role}
                          </div>
                        </div>

                        {/* Target Level Chip */}
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono">
                          <span className="text-white/30">Target</span>
                          <span className="font-bold" style={{ color: stage.color }}>
                            {stage.targetDb} dBFS
                          </span>
                        </div>
                      </motion.div>

                      {/* Connecting Cable Graphic with Flow Pulse */}
                      {!isLast && (
                        <div className="relative w-8 h-1 flex items-center justify-center shrink-0">
                          <div
                            className="h-1 w-full rounded-full"
                            style={{
                              background: `linear-gradient(to right, ${stage.color}60, ${SIGNAL_FLOW_STAGES[idx + 1].color}60)`,
                            }}
                          />
                          <motion.div
                            className="absolute w-2 h-2 rounded-full shadow-[0_0_8px_#fff]"
                            style={{ background: stage.color }}
                            animate={{ x: [-12, 12] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deep Stage Inspector Details */}
            {activeStageId && (
              <StageDetailInspector
                stageId={activeStageId}
                currentTrack={currentTrack}
                mixBusDb={mixBusDb}
                preMasterDb={preMasterDb}
                hpfEnabled={hpfEnabled}
                setHpfEnabled={setHpfEnabled}
                hpfFreq={hpfFreq}
                setHpfFreq={setHpfFreq}
                compThreshold={compThreshold}
                setCompThreshold={setCompThreshold}
                compRatio={compRatio}
                setCompRatio={setCompRatio}
                eqHighBoost={eqHighBoost}
                setEqHighBoost={setEqHighBoost}
                satDrive={satDrive}
                setSatDrive={setSatDrive}
              />
            )}
          </div>
        )}

        {/* Console Mixer View */}
        {activeTab === 'console' && (
          <ConsoleMixerView
            tracks={tracks}
            buses={buses}
            mixBusDb={mixBusDb}
            preMasterDb={preMasterDb}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Interactive Stage Detail Inspector
 */
function StageDetailInspector({
  stageId,
  currentTrack,
  mixBusDb,
  preMasterDb,
  hpfEnabled,
  setHpfEnabled,
  hpfFreq,
  setHpfFreq,
  compThreshold,
  setCompThreshold,
  compRatio,
  setCompRatio,
  eqHighBoost,
  setEqHighBoost,
  satDrive,
  setSatDrive,
}: any) {
  const stage = SIGNAL_FLOW_STAGES.find(s => s.id === stageId) || SIGNAL_FLOW_STAGES[0];
  const { dispatch } = useSession();

  return (
    <motion.div
      key={stageId}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 border shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #121828 0%, #0c101d 100%)',
        borderColor: `${stage.color}35`,
        boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${stage.color}15`,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner"
            style={{ background: `${stage.color}25`, color: stage.color, boxShadow: `0 0 20px ${stage.color}30` }}
          >
            {stage.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                Stage {stage.step} of 7
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: stage.color }}>
                {stage.targetText}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white/95 mt-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {stage.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LevelHealthBadge health="healthy" size="md" />
        </div>
      </div>

      {/* Stage Interactive Simulator Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Audio Engineering Concept & Rules */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <h4 className="text-xs font-mono font-bold text-white/80 uppercase mb-2 flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-400" />
              Stage Purpose & Function
            </h4>
            <p className="text-xs text-white/60 leading-relaxed font-sans mb-3">
              {stage.details}
            </p>
            <div className="p-2.5 rounded-xl bg-white/3 border border-white/5 text-[10px] font-mono text-emerald-400">
              💡 Target: Aim for nominal signals near {stage.targetDb} dBFS.
            </div>
          </div>

          {/* Real-time Spectrum / Ballistic Meter Preview */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-[10px] font-mono text-white/40 uppercase mb-2">Stage Signal Activity</div>
            <FrequencySpectrum color={stage.color} />
          </div>
        </div>

        {/* Column 2: Interactive Controls for this stage */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-black/30 border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold text-white/80 uppercase">
              Interactive Hardware & Processing Controls
            </h4>
            <span className="text-[9px] font-mono text-white/40">Real-time parameters</span>
          </div>

          {/* Dynamic controls according to current stage */}
          {stageId === 'input' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex justify-between text-xs font-mono text-white/70 mb-1">
                    <span>Analog Preamp Trim</span>
                    <span className="text-emerald-400 font-bold">+18.0 dB (Calibrated)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    defaultValue={18}
                    className="w-full h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="text-[8px] font-mono text-white/30 mt-1">
                    Sets analog mic input to line level (0 VU = +4 dBu = -18 dBFS)
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col justify-between">
                  <span className="text-xs font-mono text-white/70">Phantom Power / Pad</span>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-mono font-bold border border-red-500/30">
                      +48V Active
                    </button>
                    <button className="flex-1 py-1 rounded-lg bg-white/5 text-white/40 text-xs font-mono font-bold">
                      -20dB Pad
                    </button>
                  </div>
                </div>
              </div>

              {/* Waveform graphic */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white mb-0.5">Pristine Input Waveform</div>
                  <div className="text-[9px] font-mono text-emerald-400">Clean 18 dB dynamic headroom preserved</div>
                </div>
                <MiniWaveform color="#06D6A0" width={180} height={32} />
              </div>
            </div>
          )}

          {stageId === 'inserts' && (
            <div className="space-y-4">
              {/* High-Pass Filter */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHpfEnabled(!hpfEnabled)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                      hpfEnabled ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'
                    }`}
                  >
                    HPF {hpfEnabled ? 'ON' : 'OFF'}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-white">High-Pass Low Cut</div>
                    <div className="text-[9px] font-mono text-white/30">{hpfFreq} Hz (18 dB/oct slope)</div>
                  </div>
                </div>
                <input
                  type="range"
                  min={20}
                  max={200}
                  value={hpfFreq}
                  onChange={e => setHpfFreq(parseFloat(e.target.value))}
                  className="w-32 h-1.5 rounded-full"
                />
              </div>

              {/* Parametric EQ High Shelf */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Air / High Shelf Boost</div>
                  <div className="text-[9px] font-mono text-blue-400">+{eqHighBoost} dB @ 12 kHz</div>
                </div>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={0.5}
                  value={eqHighBoost}
                  onChange={e => setEqHighBoost(parseFloat(e.target.value))}
                  className="w-32 h-1.5 rounded-full"
                />
              </div>

              {/* VCA Compressor */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-white">VCA Compressor Threshold</span>
                  <span className="text-amber-400 font-bold">{compThreshold} dBFS (Ratio {compRatio}:1)</span>
                </div>
                <input
                  type="range"
                  min={-36}
                  max={0}
                  value={compThreshold}
                  onChange={e => setCompThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full"
                />
              </div>
            </div>
          )}

          {stageId === 'fader' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-center">
                <div className="text-xs font-mono font-bold text-white mb-2">100mm Logarithmic Console Fader</div>
                <div className="flex justify-center items-center gap-6">
                  {currentTrack ? (
                    <>
                      <LevelMeter db={currentTrack.currentDb} height={90} width={16} color={currentTrack.color} />
                      <div className="text-left font-mono space-y-2">
                        <div className="text-sm font-bold text-white">{currentTrack.name}</div>
                        <div className="text-xs text-emerald-400">{currentTrack.currentDb.toFixed(1)} dBFS</div>
                        <input
                          type="range"
                          min={-60}
                          max={0}
                          step={0.5}
                          value={currentTrack.currentDb}
                          onChange={e => dispatch({ type: 'UPDATE_LEVEL', trackId: currentTrack.id, db: parseFloat(e.target.value) })}
                          className="w-40 h-2 rounded-full cursor-pointer"
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-white/30 text-xs">No track selected</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {stageId === 'buses' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-white mb-1">Subgroup Stem Consolidation</div>
              <p className="text-xs text-white/60 font-sans leading-relaxed">
                Tracks sum together into cohesive instrument stems with SSL bus glue compression:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(BUS_DEFS).filter(b => b.type !== 'mixBus' && b.type !== 'preMaster').map(b => (
                  <div key={b.type} className="p-2.5 rounded-xl border text-center" style={{ background: `${b.color}10`, borderColor: `${b.color}25` }}>
                    <div className="text-base mb-1">{b.icon}</div>
                    <div className="text-[10px] font-bold text-white">{b.name}</div>
                    <div className="text-[8px] font-mono text-emerald-400">{b.dbRange[0]} to {b.dbRange[1]} dB</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stageId === 'mixBus' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div>
                  <div className="text-xs font-bold text-amber-400">Master Mix Bus (2-Bus) Headroom</div>
                  <div className="text-[10px] font-mono text-white/50">Current Sum: {mixBusDb.toFixed(1)} dBFS (Ideal: -6 to -3 dBFS)</div>
                </div>
                <AnalogVuMeter dbFS={mixBusDb} width={140} height={85} />
              </div>
            </div>
          )}

          {stageId === 'master' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LufsMeter lufs={-14} target={-14} truePeak={preMasterDb} />
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-2 font-mono">
                  <div className="text-xs font-bold text-white">Streaming Delivery Standards</div>
                  <div className="text-[9px] text-white/60 space-y-1">
                    <div>• <strong>Spotify / YouTube:</strong> -14 LUFS / -1.0 dBTP</div>
                    <div>• <strong>Apple Music:</strong> -16 LUFS / -1.0 dBTP</div>
                    <div>• <strong>Broadcast TV (EBU):</strong> -23 LUFS / -1.0 dBTP</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stageId === 'sends' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-white">Parallel Space & Time FX Sends</div>
              <p className="text-xs text-white/60 font-sans leading-relaxed">
                Sends tap audio post-fader into shared reverb and tempo-synced delay units:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="text-xs font-bold text-cyan-400 mb-1">🌊 Lexicon 480L Hall Aux</div>
                  <div className="text-[9px] font-mono text-white/50">2.4s Decay • 100% Wet</div>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-xs font-bold text-indigo-400 mb-1">⌛ 1/4 Note Tape Delay Aux</div>
                  <div className="text-[9px] font-mono text-white/50">35% Feedback • High Rolloff</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Console Mixer View (Hardware DAW Desk)
 */
function ConsoleMixerView({ tracks, buses, mixBusDb, preMasterDb }: any) {
  const { dispatch } = useSession();

  return (
    <div className="space-y-6">
      {/* Channel Strips Console */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider">
            Channel Strips ({tracks.length} Channels)
          </h3>
          <span className="text-[10px] font-mono text-white/30">
            Scroll horizontally for full console
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          {tracks.map((t: Track) => {
            const busDef = BUS_DEFS[t.bus] || BUS_DEFS.instruments;
            const health = getLevelHealth(t.currentDb, t.dbRange);

            return (
              <div
                key={t.id}
                className="w-20 shrink-0 rounded-2xl p-2.5 backdrop-blur-xl border flex flex-col items-center justify-between"
                style={{
                  background: 'linear-gradient(180deg, #121828 0%, #0c101d 100%)',
                  borderColor: `${t.color}30`,
                  boxShadow: `0 8px 20px rgba(0,0,0,0.4), inset 0 0 15px ${t.color}05`,
                }}
              >
                {/* Channel Header */}
                <div className="text-center w-full mb-1.5">
                  <div className="text-[8px] font-mono text-white/30 truncate">{busDef.name.replace(' Bus', '')}</div>
                  <div className="text-[10px] font-bold text-white truncate">{t.name}</div>
                </div>

                {/* Color Pin */}
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />

                {/* Mini Waveform */}
                <MiniWaveform color={t.color} width={55} height={14} active={!t.muted} muted={t.muted} />

                {/* Meter */}
                <div className="my-2">
                  <LevelMeter db={t.currentDb} height={90} width={10} showLabel={false} color={t.color} />
                </div>

                {/* dB Readout */}
                <div className="text-[8px] font-mono font-bold mb-2" style={{ color: getHealthColor(health) }}>
                  {t.currentDb.toFixed(1)}
                </div>

                {/* Vertical Fader */}
                <div className="relative h-24 w-3 rounded-full bg-white/5 mb-2">
                  <input
                    type="range"
                    min={-60}
                    max={0}
                    step={0.5}
                    value={t.currentDb}
                    onChange={e => dispatch({ type: 'UPDATE_LEVEL', trackId: t.id, db: parseFloat(e.target.value) })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-full"
                    style={{
                      height: `${((t.currentDb + 60) / 60) * 100}%`,
                      background: `linear-gradient(to top, ${t.color}40, ${t.color})`,
                    }}
                  />
                  <div
                    className="absolute left-0 right-0 h-2.5 rounded-sm"
                    style={{
                      bottom: `${((t.currentDb + 60) / 60) * 100}%`,
                      background: '#fff',
                      boxShadow: '0 0 6px rgba(255,255,255,0.6)',
                    }}
                  />
                </div>

                {/* Solo / Mute */}
                <div className="flex gap-1 w-full justify-center">
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_SOLO', trackId: t.id })}
                    className={`w-6 h-5 rounded text-[8px] font-black font-mono transition-all ${
                      t.soloed ? 'bg-amber-400 text-black font-bold' : 'bg-white/5 text-white/40'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_MUTE', trackId: t.id })}
                    className={`w-6 h-5 rounded text-[8px] font-black font-mono transition-all ${
                      t.muted ? 'bg-red-500 text-white font-bold' : 'bg-white/5 text-white/40'
                    }`}
                  >
                    M
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subgroup Buses & Master Center Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buses */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-black/40 border border-white/10">
          <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider mb-3">
            Subgroup Stems & Buses ({buses.length} Groups)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {buses.map((b: Bus) => (
              <div
                key={b.id}
                className="p-3 rounded-2xl border text-center flex flex-col items-center justify-between"
                style={{
                  background: `${b.color}0a`,
                  borderColor: `${b.color}25`,
                }}
              >
                <div className="text-xs font-bold" style={{ color: b.color }}>{b.name}</div>
                <div className="my-2">
                  <LevelMeter db={b.currentDb} height={70} width={12} color={b.color} />
                </div>
                <div className="text-[9px] font-mono text-white/50">{b.trackIds.length} ch summing</div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Center Console */}
        <div className="p-5 rounded-3xl bg-black/50 border border-amber-500/20 shadow-2xl flex flex-col items-center justify-between">
          <div className="text-center">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Master Section
            </div>
            <div className="text-[8px] font-mono text-white/30">Mix Bus & Pre-Master VU</div>
          </div>

          <div className="my-3">
            <AnalogVuMeter dbFS={mixBusDb} width={180} height={105} />
          </div>

          <div className="w-full text-center space-y-1 text-[9px] font-mono text-white/50">
            <div className="flex justify-between">
              <span>Mix Bus Peak:</span>
              <span className="text-yellow-400 font-bold">{mixBusDb.toFixed(1)} dBFS</span>
            </div>
            <div className="flex justify-between">
              <span>True Peak Limiter:</span>
              <span className="text-white font-bold">{preMasterDb.toFixed(1)} dBTP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
