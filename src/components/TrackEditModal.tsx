import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders, X, SlidersHorizontal, Volume2, VolumeX, CornerDownRight,
  Activity, Check, Trash2, Copy, Sparkles, AlertCircle,
} from 'lucide-react';
import {
  type Track, type BusType, type TrackType,
  BUS_DEFS, TRACK_DEFS, getLevelHealth, getHealthColor, getHealthLabel,
} from '../data';
import { LevelMeter, MiniWaveform, LevelHealthBadge } from './LevelMeter';

interface TrackEditModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onDeleteRequest: (trackId: string) => void;
  onDuplicate: (trackId: string) => void;
}

export function TrackEditModal({
  track, isOpen, onClose, onUpdateTrack, onDeleteRequest, onDuplicate,
}: TrackEditModalProps) {
  const [name, setName] = useState('');
  const [bus, setBus] = useState<BusType>('instruments');
  const [gainTrim, setGainTrim] = useState(0);
  const [pan, setPan] = useState(0);
  const [faderDb, setFaderDb] = useState(-18);
  const [color, setColor] = useState('#3A86FF');
  const [isStereo, setIsStereo] = useState(false);

  useEffect(() => {
    if (track) {
      setName(track.name);
      setBus(track.bus);
      setGainTrim(track.gainTrimDb || 0);
      setPan(track.pan || 0);
      setFaderDb(track.currentDb);
      setColor(track.color);
      setIsStereo(track.isStereo || false);
    }
  }, [track]);

  if (!isOpen || !track) return null;

  const def = TRACK_DEFS[track.type] || TRACK_DEFS.synth;
  const busDef = BUS_DEFS[bus] || BUS_DEFS.instruments;
  const effectiveDb = faderDb + gainTrim;
  const health = getLevelHealth(effectiveDb, track.dbRange);

  const handleSave = () => {
    onUpdateTrack(track.id, {
      name: name.trim() || track.name,
      bus,
      gainTrimDb: gainTrim,
      pan,
      currentDb: faderDb,
      color,
      isStereo,
    });
    onClose();
  };

  const handleTogglePlugin = (index: number) => {
    const updated = track.plugins.map((p, i) => i === index ? { ...p, enabled: !p.enabled } : p);
    onUpdateTrack(track.id, { plugins: updated });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #151b2c 0%, #0d121f 100%)',
            borderColor: `${color}40`,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px ${color}15`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner"
                style={{ background: `${color}25`, color, boxShadow: `0 0 15px ${color}30` }}
              >
                {track.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Track Inspector: {track.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                  <span>ID: {track.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>{isStereo ? 'Stereo Track' : 'Mono Track'}</span>
                  <span>•</span>
                  <span style={{ color: busDef.color }}>→ {busDef.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { onDuplicate(track.id); onClose(); }}
                title="Duplicate Track"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => { onDeleteRequest(track.id); onClose(); }}
                title="Remove Track"
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors ml-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* Real-time Meter & Waveform Bar */}
            <div
              className="rounded-2xl p-4 border flex items-center justify-between gap-4"
              style={{ background: `${color}06`, borderColor: `${color}20` }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Live Output & Waveform</span>
                  <LevelHealthBadge health={health} size="sm" />
                </div>
                <MiniWaveform color={color} width={280} height={32} active={!track.muted} muted={track.muted} />
              </div>

              <div className="flex items-center gap-3 shrink-0 pl-3 border-l border-white/5">
                <LevelMeter db={effectiveDb} range={[-60, 0]} height={70} width={14} showLabel={false} color={color} />
                <div>
                  <div className="text-lg font-mono font-bold" style={{ color: getHealthColor(health) }}>
                    {effectiveDb.toFixed(1)} <span className="text-xs text-white/30">dBFS</span>
                  </div>
                  <div className="text-[9px] font-mono text-white/30 mt-0.5">
                    Target: {track.dbRange[0]} to {track.dbRange[1]} dBFS
                  </div>
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">Track Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Routing Bus */}
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">Destination Group Bus</label>
                <select
                  value={bus}
                  onChange={e => setBus(e.target.value as BusType)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  {Object.values(BUS_DEFS).filter(b => b.type !== 'mixBus' && b.type !== 'preMaster').map(b => (
                    <option key={b.type} value={b.type}>
                      {b.name} ({b.dbRange[0]} to {b.dbRange[1]} dBFS)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fader & Gain Staging Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/25 rounded-2xl p-4 border border-white/5">
              {/* Fader */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-white/60">Channel Fader</label>
                  <span className="text-xs font-mono font-bold text-white">{faderDb.toFixed(1)} dBFS</span>
                </div>
                <input
                  type="range"
                  min={-60}
                  max={0}
                  step={0.5}
                  value={faderDb}
                  onChange={e => setFaderDb(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full cursor-pointer"
                  style={{ background: 'linear-gradient(to right, #06D6A0, #FFD166 60%, #EF476F 85%, #ff0000)' }}
                />
                <div className="flex justify-between text-[8px] font-mono text-white/20 mt-1">
                  <span>-60 dB</span>
                  <span>-18 (0 VU)</span>
                  <span>0 dB</span>
                </div>
              </div>

              {/* Preamp Trim */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-white/60">Preamp Gain Staging Trim</label>
                  <span className="text-xs font-mono font-bold" style={{ color: gainTrim !== 0 ? '#3A86FF' : '#ffffff80' }}>
                    {gainTrim > 0 ? `+${gainTrim.toFixed(1)}` : gainTrim.toFixed(1)} dB
                  </span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={gainTrim}
                  onChange={e => setGainTrim(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[8px] font-mono text-white/20 mt-1">
                  <span>-12 dB (Pad)</span>
                  <span>0 dB</span>
                  <span>+12 dB (Boost)</span>
                </div>
              </div>

              {/* Pan */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-white/60">Stereo Panning</label>
                  <span className="text-xs font-mono font-bold text-white">
                    {pan === 0 ? 'Center (C)' : pan < 0 ? `L ${Math.round(Math.abs(pan) * 100)}%` : `R ${Math.round(pan * 100)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.05}
                  value={pan}
                  onChange={e => setPan(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full cursor-pointer bg-white/10"
                />
                <div className="flex justify-between text-[8px] font-mono text-white/20 mt-1">
                  <span>100% Left</span>
                  <span>Center</span>
                  <span>100% Right</span>
                </div>
              </div>

              {/* Channel Mode */}
              <div className="flex flex-col justify-between">
                <label className="text-xs font-mono text-white/60 mb-1">Format & Width</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsStereo(false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                      !isStereo ? 'bg-white/15 text-white shadow-sm' : 'bg-white/3 text-white/30 hover:bg-white/8'
                    }`}
                  >
                    Mono (1 ch)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsStereo(true)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                      isStereo ? 'bg-white/15 text-white shadow-sm' : 'bg-white/3 text-white/30 hover:bg-white/8'
                    }`}
                  >
                    Stereo (2 ch)
                  </button>
                </div>
              </div>
            </div>

            {/* Plugin Inserts Rack */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-semibold text-white/80 flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-blue-400" />
                  Channel Inserts & Processing Chain
                </span>
                <span className="text-[10px] font-mono text-white/30">
                  {track.plugins.filter(p => p.enabled).length} active / {track.plugins.length} slots
                </span>
              </div>

              <div className="space-y-1.5">
                {track.plugins.map((plugin, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTogglePlugin(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      plugin.enabled
                        ? 'bg-white/8 border-white/20 text-white'
                        : 'bg-white/2 border-white/5 text-white/30 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          plugin.enabled ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {plugin.enabled ? '✓' : ''}
                      </div>
                      <span className="text-xs font-mono font-semibold">{plugin.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {plugin.param && (
                        <span className="text-[10px] font-mono text-white/40 bg-black/30 px-2 py-0.5 rounded-md">
                          {plugin.param}
                        </span>
                      )}
                      <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        plugin.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/20'
                      }`}>
                        {plugin.enabled ? 'ACTIVE' : 'BYPASS'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Engineering Advice */}
            <div className="rounded-xl p-3 bg-blue-500/5 border border-blue-500/15 flex items-start gap-2.5">
              <Sparkles size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <div className="text-[11px] font-mono text-white/60 leading-relaxed">
                <strong className="text-white">Pro Tip for {track.name}:</strong> {def.description} Standard frequency focus is <span className="text-blue-300">{def.frequencyRange}</span>.
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/40">
            <div className="text-[10px] font-mono text-white/30">
              Changes apply instantly to live signal flow
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all"
              >
                Save & Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
