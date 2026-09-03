import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { type Track, type Bus, getLevelHealth, getHealthColor, BUS_DEFS } from '../data';
import { LevelMeter, MiniWaveform, LevelHealthBadge } from './LevelMeter';

function ChannelStrip({ track, onUpdateLevel, onToggleMute, onToggleSolo, onSetPan }: {
  track: Track;
  onUpdateLevel: (id: string, db: number) => void;
  onToggleMute: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onSetPan: (id: string, pan: number) => void;
}) {
  const health = getLevelHealth(track.currentDb, track.dbRange);
  const busDef = BUS_DEFS[track.bus];

  return (
    <motion.div
      layout
      className="flex flex-col items-center w-14 rounded-xl p-1.5 backdrop-blur-md border"
      style={{
        background: `${track.color}06`,
        borderColor: `${track.color}15`,
      }}
    >
      {/* Track name */}
      <div className="text-[8px] font-mono text-white/60 text-center truncate w-full mb-1">
        {track.name}
      </div>

      {/* Color indicator */}
      <div className="w-3 h-3 rounded-full mb-1" style={{ background: track.color, boxShadow: `0 0 6px ${track.color}40` }} />

      {/* Mini waveform */}
      <MiniWaveform color={track.color} width={40} height={14} muted={track.muted} />

      {/* Level meter */}
      <div className="my-1">
        <LevelMeter db={track.currentDb} range={[-60, 0]} height={80} width={8} showLabel={false} color={track.color} />
      </div>

      {/* dB display */}
      <div className="text-[7px] font-mono mb-1" style={{ color: getHealthColor(health) }}>
        {track.currentDb.toFixed(1)}
      </div>

      {/* Fader */}
      <div className="relative h-20 w-3 rounded-full bg-white/5 mb-1">
        <input
          type="range"
          min={-60}
          max={0}
          step={0.5}
          value={track.currentDb}
          onChange={e => onUpdateLevel(track.id, parseFloat(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            height: `${((track.currentDb + 60) / 60) * 100}%`,
            background: `linear-gradient(to top, ${track.color}40, ${track.color})`,
          }}
        />
        <div
          className="absolute left-0 right-0 h-2 rounded-full"
          style={{
            bottom: `${((track.currentDb + 60) / 60) * 100}%`,
            background: track.color,
            boxShadow: `0 0 4px ${track.color}60`,
          }}
        />
      </div>

      {/* Pan control */}
      <div className="w-full mb-1">
        <input
          type="range"
          min={-100}
          max={100}
          value={track.pan * 100}
          onChange={e => onSetPan(track.id, parseFloat(e.target.value) / 100)}
          className="w-full h-1 appearance-none rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        />
        <div className="text-[6px] font-mono text-white/20 text-center">
          {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
        </div>
      </div>

      {/* Mute/Solo */}
      <div className="flex gap-0.5">
        <button
          onClick={() => onToggleMute(track.id)}
          className={`w-5 h-4 rounded text-[7px] font-bold ${track.muted ? 'bg-red-500/40 text-red-400' : 'bg-white/5 text-white/30'}`}
        >
          M
        </button>
        <button
          onClick={() => onToggleSolo(track.id)}
          className={`w-5 h-4 rounded text-[7px] font-bold ${track.soloed ? 'bg-yellow-500/40 text-yellow-400' : 'bg-white/5 text-white/30'}`}
        >
          S
        </button>
      </div>

      {/* Bus label */}
      <div className="text-[6px] font-mono mt-1" style={{ color: busDef.color }}>
        →{busDef.name.replace(' Bus', '')}
      </div>
    </motion.div>
  );
}

function BusStrip({ bus, trackCount }: { bus: Bus; trackCount: number }) {
  return (
    <motion.div
      layout
      className="flex flex-col items-center w-16 rounded-xl p-2 backdrop-blur-md border"
      style={{
        background: `${bus.color}08`,
        borderColor: `${bus.color}20`,
      }}
    >
      <div className="text-[8px] font-mono font-bold mb-1" style={{ color: bus.color }}>
        {bus.name.replace(' Bus', '')}
      </div>
      <div className="w-4 h-4 rounded-full mb-1" style={{ background: bus.color, boxShadow: `0 0 8px ${bus.color}40` }} />
      <LevelMeter db={bus.currentDb} range={[-60, 0]} height={80} width={10} showLabel={true} color={bus.color} />
      <div className="text-[7px] font-mono mt-1" style={{ color: bus.color }}>{bus.currentDb.toFixed(1)}</div>
      <div className="text-[6px] font-mono text-white/20 mt-0.5">{trackCount} ch</div>
    </motion.div>
  );
}

export function MixerView() {
  const { state, dispatch } = useSession();
  const { tracks, buses } = state;

  const tracksByBus = buses.map(bus => ({
    bus,
    tracks: tracks.filter(t => t.bus === bus.type),
  }));

  return (
    <div className="h-full overflow-x-auto custom-scrollbar">
      <div className="min-w-fit p-4">
        {/* Track channels */}
        <div className="mb-4">
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-2">
            Channels — {tracks.length} tracks
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
            {tracks.map(track => (
              <ChannelStrip
                key={track.id}
                track={track}
                onUpdateLevel={(id, db) => dispatch({ type: 'UPDATE_LEVEL', trackId: id, db })}
                onToggleMute={id => dispatch({ type: 'TOGGLE_MUTE', trackId: id })}
                onToggleSolo={id => dispatch({ type: 'TOGGLE_SOLO', trackId: id })}
                onSetPan={(id, pan) => dispatch({ type: 'SET_PAN', trackId: id, pan })}
              />
            ))}
          </div>
        </div>

        {/* Bus channels */}
        <div className="mb-4">
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-2">
            Buses — {buses.length} groups
          </div>
          <div className="flex gap-2">
            {buses.map(bus => (
              <BusStrip key={bus.id} bus={bus} trackCount={bus.trackIds.length} />
            ))}
          </div>
        </div>

        {/* Mix Bus + Pre-Master */}
        <div>
          <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-2">
            Output
          </div>
          <div className="flex gap-3">
            {['mixBus', 'preMaster'].map(bt => {
              const def = BUS_DEFS[bt as keyof typeof BUS_DEFS];
              return (
                <div
                  key={bt}
                  className="flex flex-col items-center w-20 rounded-xl p-3 backdrop-blur-md border"
                  style={{
                    background: `${def.color}08`,
                    borderColor: `${def.color}20`,
                  }}
                >
                  <div className="text-xs font-bold mb-1" style={{ color: def.color }}>{def.name}</div>
                  <div className="text-2xl mb-2">{def.icon}</div>
                  <LevelMeter db={def.dbRange[0]} range={[-60, 0]} height={90} width={14} showLabel={true} color={def.color} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
