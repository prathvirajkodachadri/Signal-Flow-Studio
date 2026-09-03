import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, RotateCcw, X, Layers, Zap } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { GenreSelector } from '../components/GenreSelector';
import { SignalFlowCanvas } from '../components/SignalFlowCanvas';
import { FollowTheSignal } from '../components/FollowTheSignal';
import {
  AVAILABLE_TRACK_TYPES, TRACK_DEFS, BUS_DEFS,
  type TrackType, type SessionSize, type Genre,
  getLevelHealth, getHealthColor,
} from '../data';

const GENRE_COLORS: Record<Genre, string> = {
  pop: '#FF006E', rock: '#EF476F', hiphop: '#FB5607', electronic: '#3A86FF',
  acoustic: '#8338EC', cinematic: '#FFD700', podcast: '#06D6A0', custom: '#4CC9F0',
};

export function SessionBuilder() {
  const { state, dispatch } = useSession();
  const [showTrackMenu, setShowTrackMenu] = useState(false);

  const handleGenreSelect = useCallback((genre: Genre, tracks: TrackType[]) => {
    dispatch({ type: 'SET_GENRE', genre, tracks });
  }, [dispatch]);

  const handleAddTrack = useCallback((trackType: TrackType) => {
    dispatch({ type: 'ADD_TRACK', trackType });
    setShowTrackMenu(false);
  }, [dispatch]);

  const handleTrackSelect = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_TRACK', trackId: id });
  }, [dispatch]);

  const handleBusSelect = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_BUS', busId: id });
  }, [dispatch]);

  const handleBgClick = useCallback(() => {
    dispatch({ type: 'SELECT_TRACK', trackId: null });
    dispatch({ type: 'SELECT_BUS', busId: null });
  }, [dispatch]);

  if (!state.genre) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <GenreSelector onSelect={handleGenreSelect} />
      </div>
    );
  }

  const { tracks, buses } = state;
  const selectedTrack = tracks.find(t => t.id === state.selectedTrackId);
  const selectedBus = buses.find(b => b.id === state.selectedBusId);

  return (
    <div className="h-full flex flex-col relative">
      {state.followMode && <FollowTheSignal />}

      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono hover:bg-white/5 transition-colors"
            style={{ color: GENRE_COLORS[state.genre] || '#fff' }}
          >
            <RotateCcw size={10} />
            {state.genre.toUpperCase()}
          </button>

          <div className="flex items-center gap-0.5 bg-white/3 rounded-lg p-0.5">
            {(['small', 'medium', 'large'] as SessionSize[]).map(size => (
              <button
                key={size}
                onClick={() => dispatch({ type: 'SET_SIZE', size })}
                className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold transition-all ${
                  state.size === size ? 'bg-white/8 text-white/90' : 'text-white/25 hover:text-white/50'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>

          <div className="text-[8px] font-mono text-white/15">
            {tracks.length} tracks · {buses.length} buses
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch({ type: 'START_FOLLOW' })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06D6A015, #3A86FF15)',
              color: '#06D6A0',
              border: '1px solid #06D6A025',
            }}
          >
            <Play size={10} />
            Follow Signal
          </button>

          <div className="relative">
            <button
              onClick={() => setShowTrackMenu(!showTrackMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FF006E15, #8338EC15)',
                color: '#FF006E',
                border: '1px solid #FF006E25',
              }}
            >
              <Plus size={10} />
              Add Track
            </button>

            <AnimatePresence>
              {showTrackMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl p-1.5 backdrop-blur-xl border border-white/8"
                  style={{ background: 'rgba(10,14,26,0.95)' }}
                >
                  <div className="text-[8px] font-mono text-white/20 uppercase tracking-wider mb-1 px-1.5">
                    Track Types
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                    {AVAILABLE_TRACK_TYPES.map(tt => {
                      const def = TRACK_DEFS[tt];
                      return (
                        <button
                          key={tt}
                          onClick={() => handleAddTrack(tt)}
                          className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div
                            className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px]"
                            style={{ background: `${def.color}20`, color: def.color }}
                          >
                            {def.icon}
                          </div>
                          <span className="text-[9px] font-mono text-white/60">{def.name}</span>
                          <span className="text-[7px] font-mono text-white/15 ml-auto">
                            →{BUS_DEFS[def.bus].name.replace(' Bus', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden" onClick={handleBgClick}>
        <div className="flex-1 overflow-auto" onClick={e => e.stopPropagation()}>
          <SignalFlowCanvas onTrackSelect={handleTrackSelect} onBusSelect={handleBusSelect} />
        </div>

        {/* Right panel */}
        <div className="w-52 border-l border-white/5 bg-black/10 overflow-y-auto custom-scrollbar">
          <WhatIfPanel />
          <SessionInfo />
        </div>
      </div>

      {/* Selection bar */}
      <AnimatePresence>
        {(selectedTrack || selectedBus) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-1.5">
              {selectedTrack && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: selectedTrack.color, boxShadow: `0 0 6px ${selectedTrack.color}40` }} />
                  <span className="text-[10px] font-mono text-white/60">{selectedTrack.name}</span>
                  <span className="text-[9px] font-mono" style={{ color: BUS_DEFS[selectedTrack.bus].color }}>
                    → {BUS_DEFS[selectedTrack.bus].name}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: getHealthColor(getLevelHealth(selectedTrack.currentDb, selectedTrack.dbRange)) }}>
                    {selectedTrack.currentDb.toFixed(1)} dB
                  </span>
                </div>
              )}
              {selectedBus && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: selectedBus.color, boxShadow: `0 0 6px ${selectedBus.color}40` }} />
                  <span className="text-[10px] font-mono text-white/60">{selectedBus.name}</span>
                  <span className="text-[9px] font-mono text-white/25">{selectedBus.trackIds.length} tracks</span>
                </div>
              )}
              <button onClick={handleBgClick} className="text-white/25 hover:text-white/50 transition-colors">
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WhatIfPanel() {
  const { dispatch } = useSession();

  const whatIfs = [
    { label: 'Add 5 more drums', action: () => {
      ['kick', 'snare', 'hihat', 'toms', 'overheads'].forEach((t, i) => {
        setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t as TrackType }), i * 150);
      });
    }, icon: '🥁', color: '#FF9F1C' },
    { label: 'Add 5 more vocals', action: () => {
      ['leadVocal', 'bgVocal', 'bgVocal', 'bgVocal', 'bgVocal'].forEach((t, i) => {
        setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t as TrackType }), i * 150);
      });
    }, icon: '🎤', color: '#E63946' },
    { label: 'Add 8 more synths', action: () => {
      ['synth', 'synth', 'pad', 'synth', 'pad', 'synth', 'synth', 'aux'].forEach((t, i) => {
        setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t as TrackType }), i * 100);
      });
    }, icon: '🎛️', color: '#3A86FF' },
    { label: 'Make it 40+ tracks', action: () => {
      const extra: TrackType[] = [
        'kick', 'snare', 'hihat', 'hihat', 'overheads', 'toms',
        'bass', 'guitar', 'guitar', 'piano', 'synth', 'synth', 'synth', 'pad', 'strings', 'brass',
        'leadVocal', 'bgVocal', 'bgVocal', 'bgVocal',
        'fx', 'fx', 'aux',
      ];
      extra.forEach((t, i) => {
        setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t }), i * 80);
      });
    }, icon: '🔥', color: '#FF006E' },
  ];

  return (
    <div className="p-2.5 border-b border-white/5">
      <div className="flex items-center gap-1 mb-1.5">
        <Zap size={10} className="text-yellow-400/70" />
        <span className="text-[8px] font-mono text-white/25 uppercase tracking-wider">What If?</span>
      </div>
      <div className="space-y-1">
        {whatIfs.map(wi => (
          <button
            key={wi.label}
            onClick={wi.action}
            className="w-full flex items-center gap-1.5 px-2 py-1 rounded-lg text-left transition-all hover:bg-white/5 group"
          >
            <span className="text-xs">{wi.icon}</span>
            <span className="text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-colors">{wi.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionInfo() {
  const { state } = useSession();
  const { tracks, buses } = state;

  const healthCounts = {
    healthy: tracks.filter(t => getLevelHealth(t.currentDb, t.dbRange) === 'healthy').length,
    check: tracks.filter(t => getLevelHealth(t.currentDb, t.dbRange) === 'check').length,
    hot: tracks.filter(t => getLevelHealth(t.currentDb, t.dbRange) === 'hot').length,
  };

  return (
    <div className="p-2.5">
      <div className="flex items-center gap-1 mb-1.5">
        <Layers size={10} className="text-blue-400/70" />
        <span className="text-[8px] font-mono text-white/25 uppercase tracking-wider">Session Health</span>
      </div>

      {/* Health bars */}
      <div className="flex gap-1.5 mb-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400/80" />
          <span className="text-[8px] font-mono text-green-400/80">{healthCounts.healthy}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
          <span className="text-[8px] font-mono text-yellow-400/80">{healthCounts.check}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/80" />
          <span className="text-[8px] font-mono text-red-400/80">{healthCounts.hot}</span>
        </div>
      </div>

      {/* Bus breakdown */}
      <div className="space-y-.5">
        {buses.map(bus => (
          <div key={bus.id} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: bus.color }} />
            <span className="text-[8px] font-mono" style={{ color: `${bus.color}80` }}>{bus.name}</span>
            <span className="text-[7px] font-mono text-white/15 ml-auto">{bus.trackIds.length}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t border-white/5">
        <div className="text-[8px] font-mono text-white/12 text-center">
          {tracks.length} tracks → {buses.length} groups → Mix → Master
        </div>
      </div>
    </div>
  );
}
