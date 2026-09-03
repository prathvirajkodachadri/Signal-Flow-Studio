import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Play, RotateCcw, X, Layers, Zap, Sliders, Volume2, VolumeX,
  SlidersHorizontal, CheckCircle2, LayoutGrid, Cpu, ArrowUpDown, HelpCircle,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { GenreSelector } from '../components/GenreSelector';
import { SignalFlowCanvas } from '../components/SignalFlowCanvas';
import { FollowTheSignal } from '../components/FollowTheSignal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { TrackEditModal } from '../components/TrackEditModal';
import { AddTrackModal } from '../components/AddTrackModal';
import { LevelMeter, MiniWaveform, LevelHealthBadge } from '../components/LevelMeter';
import {
  type TrackType, type SessionSize, type Genre,
  getLevelHealth, getHealthColor, BUS_DEFS, TRACK_DEFS,
} from '../data';

const GENRE_COLORS: Record<Genre, string> = {
  pop: '#FF006E',
  rock: '#EF476F',
  hiphop: '#FB5607',
  electronic: '#3A86FF',
  acoustic: '#8338EC',
  cinematic: '#FFD700',
  podcast: '#06D6A0',
  custom: '#4CC9F0',
};

export function SessionBuilder() {
  const { state, dispatch } = useSession();
  const [activeSubView, setActiveSubView] = useState<'flow' | 'rack' | 'matrix'>('flow');

  const handleGenreSelect = useCallback((genre: Genre, tracks: TrackType[]) => {
    dispatch({ type: 'SET_GENRE', genre, tracks });
  }, [dispatch]);

  const handleAddTrack = useCallback((trackType: TrackType) => {
    dispatch({ type: 'ADD_TRACK', trackType });
  }, [dispatch]);

  const handleAddCustomTrack = useCallback((track: { name: string; type: TrackType; bus: any; color: string; currentDb: number }) => {
    dispatch({ type: 'ADD_CUSTOM_TRACK', track });
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
      <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
        <GenreSelector onSelect={handleGenreSelect} />
      </div>
    );
  }

  const { tracks, buses, selectedTrackId, selectedBusId, deleteConfirmTrackId, editTrackId, addTrackModalOpen } = state;
  const selectedTrack = tracks.find(t => t.id === selectedTrackId);
  const selectedBus = buses.find(b => b.id === selectedBusId);
  const trackToDelete = tracks.find(t => t.id === deleteConfirmTrackId) || null;
  const trackToEdit = tracks.find(t => t.id === editTrackId) || null;

  const anyMuted = tracks.some(t => t.muted);
  const anySoloed = tracks.some(t => t.soloed);

  return (
    <div className="h-full flex flex-col relative bg-[#090d18]">
      {state.followMode && <FollowTheSignal />}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmTrackId}
        track={trackToDelete}
        onClose={() => dispatch({ type: 'SET_DELETE_CONFIRM', trackId: null })}
        onConfirm={() => {
          if (deleteConfirmTrackId) {
            dispatch({ type: 'REMOVE_TRACK', trackId: deleteConfirmTrackId });
          }
        }}
      />

      {/* Track Edit & Inspector Modal */}
      <TrackEditModal
        isOpen={!!editTrackId}
        track={trackToEdit}
        onClose={() => dispatch({ type: 'SET_EDIT_TRACK', trackId: null })}
        onUpdateTrack={(id, updates) => dispatch({ type: 'UPDATE_TRACK', trackId: id, updates })}
        onDeleteRequest={id => dispatch({ type: 'SET_DELETE_CONFIRM', trackId: id })}
        onDuplicate={id => dispatch({ type: 'DUPLICATE_TRACK', trackId: id })}
      />

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={addTrackModalOpen}
        onClose={() => dispatch({ type: 'SET_ADD_MODAL_OPEN', open: false })}
        onAddTrack={handleAddTrack}
        onAddCustomTrack={handleAddCustomTrack}
      />

      {/* Studio Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        {/* Left: Genre Preset & Size */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            title="Switch Genre Template"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold hover:bg-white/10 transition-all border border-white/10"
            style={{
              color: GENRE_COLORS[state.genre] || '#fff',
              background: `${GENRE_COLORS[state.genre]}15`,
            }}
          >
            <RotateCcw size={11} />
            <span>{state.genre.toUpperCase()}</span>
          </button>

          {/* Session Size Selector */}
          <div className="flex items-center gap-0.5 bg-white/5 rounded-xl p-0.5 border border-white/5">
            {(['small', 'medium', 'large'] as SessionSize[]).map(size => (
              <button
                key={size}
                onClick={() => dispatch({ type: 'SET_SIZE', size })}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                  state.size === size
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/30 hover:text-white/70'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-white/30">
            <span>{tracks.length} Tracks</span>
            <span>•</span>
            <span>{buses.length} Groups</span>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setActiveSubView('flow')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              activeSubView === 'flow' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            <Zap size={11} />
            <span>Flow Canvas</span>
          </button>
          <button
            onClick={() => setActiveSubView('rack')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              activeSubView === 'rack' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            <Sliders size={11} />
            <span>Rack Strips</span>
          </button>
          <button
            onClick={() => setActiveSubView('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
              activeSubView === 'matrix' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
            }`}
          >
            <LayoutGrid size={11} />
            <span>Matrix</span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mute/Solo Global Clear */}
          {anySoloed && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_SOLOS' })}
              className="px-2 py-1 rounded-lg text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all font-bold"
            >
              Clear Solos
            </button>
          )}

          {anyMuted && (
            <button
              onClick={() => dispatch({ type: 'CLEAR_MUTES' })}
              className="px-2 py-1 rounded-lg text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all font-bold"
            >
              Unmute All
            </button>
          )}

          {/* Follow the Signal Tour */}
          <button
            onClick={() => dispatch({ type: 'START_FOLLOW' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all hover:scale-105 shadow-md shadow-emerald-500/10"
            style={{
              background: 'linear-gradient(135deg, #06D6A020, #3A86FF20)',
              color: '#06D6A0',
              border: '1px solid #06D6A040',
            }}
          >
            <Play size={11} />
            <span>Signal Tour</span>
          </button>

          {/* Add Track Button */}
          <button
            onClick={() => dispatch({ type: 'SET_ADD_MODAL_OPEN', open: true })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold text-white transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
            style={{
              background: 'linear-gradient(135deg, #3A86FF, #8338EC)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Plus size={13} />
            <span>Add Track</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden" onClick={handleBgClick}>
        {/* Central Viewport */}
        <div className="flex-1 overflow-auto" onClick={e => e.stopPropagation()}>
          {activeSubView === 'flow' && (
            <SignalFlowCanvas
              onTrackSelect={handleTrackSelect}
              onBusSelect={handleBusSelect}
              onEditTrack={id => dispatch({ type: 'SET_EDIT_TRACK', trackId: id })}
              onRequestRemove={id => dispatch({ type: 'SET_DELETE_CONFIRM', trackId: id })}
            />
          )}

          {activeSubView === 'rack' && (
            <RackStripsView
              tracks={tracks}
              buses={buses}
              selectedTrackId={selectedTrackId}
              onSelect={handleTrackSelect}
              onEdit={id => dispatch({ type: 'SET_EDIT_TRACK', trackId: id })}
              onRemove={id => dispatch({ type: 'SET_DELETE_CONFIRM', trackId: id })}
            />
          )}

          {activeSubView === 'matrix' && (
            <RoutingMatrixView
              tracks={tracks}
              buses={buses}
              onTrackBusChange={(trackId, bus) => dispatch({ type: 'UPDATE_TRACK', trackId, updates: { bus } })}
            />
          )}
        </div>

        {/* Right Info & Headroom Panel */}
        <div className="w-56 border-l border-white/5 bg-black/30 backdrop-blur-md overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div>
            <SessionHeadroomSummary />
            <WhatIfStressPanel />
          </div>

          <QuickWorkflowTips />
        </div>
      </div>

      {/* Bottom Track / Bus Quick Inspector Bar */}
      <AnimatePresence>
        {(selectedTrack || selectedBus) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-2.5">
              {selectedTrack && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      background: selectedTrack.color,
                      boxShadow: `0 0 10px ${selectedTrack.color}`,
                    }}
                  />
                  <span className="text-xs font-bold text-white/95">{selectedTrack.name}</span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      background: `${BUS_DEFS[selectedTrack.bus].color}20`,
                      color: BUS_DEFS[selectedTrack.bus].color,
                    }}
                  >
                    → {BUS_DEFS[selectedTrack.bus].name}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold"
                    style={{ color: getHealthColor(getLevelHealth(selectedTrack.currentDb, selectedTrack.dbRange)) }}
                  >
                    {selectedTrack.currentDb.toFixed(1)} dBFS
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'SET_EDIT_TRACK', trackId: selectedTrack.id })}
                    className="text-[10px] font-mono text-blue-400 hover:text-blue-300 underline ml-2"
                  >
                    Open Inspector
                  </button>
                </div>
              )}

              {selectedBus && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{
                      background: selectedBus.color,
                      boxShadow: `0 0 10px ${selectedBus.color}`,
                    }}
                  />
                  <span className="text-xs font-bold text-white/95">{selectedBus.name}</span>
                  <span className="text-[10px] font-mono text-white/40">
                    {selectedBus.trackIds.length} tracks summing into {selectedBus.currentDb.toFixed(1)} dBFS
                  </span>
                </div>
              )}

              <button
                onClick={handleBgClick}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Rack Strips View: Compact DAW Rack
 */
function RackStripsView({
  tracks,
  buses,
  selectedTrackId,
  onSelect,
  onEdit,
  onRemove,
}: {
  tracks: any[];
  buses: any[];
  selectedTrackId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { dispatch } = useSession();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider">
          Channel Rack & Gain Trim ({tracks.length} Tracks)
        </h3>
        <span className="text-[10px] font-mono text-white/30">
          Click any channel to inspect or adjust levels
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tracks.map((t, idx) => {
          const busDef = BUS_DEFS[t.bus as keyof typeof BUS_DEFS] || BUS_DEFS.instruments;
          const health = getLevelHealth(t.currentDb, t.dbRange);

          return (
            <div
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`p-3 rounded-xl border backdrop-blur-md cursor-pointer transition-all ${
                selectedTrackId === t.id
                  ? 'bg-white/10 border-blue-500 shadow-xl'
                  : 'bg-white/2 border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: `${t.color}25`, color: t.color }}
                  >
                    {t.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white truncate max-w-[120px]">{t.name}</div>
                    <div className="text-[8px] font-mono text-white/40">#{idx + 1} • {busDef.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); onEdit(t.id); }}
                    className="p-1 rounded bg-white/5 text-white/40 hover:text-white"
                  >
                    <Sliders size={11} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(t.id); }}
                    className="p-1 rounded bg-red-500/10 text-red-400 hover:text-red-300"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>

              {/* Fader slider */}
              <div className="flex items-center gap-2">
                <LevelMeter db={t.currentDb} range={[-60, 0]} height={32} width={6} showLabel={false} color={t.color} />
                <div className="flex-1">
                  <input
                    type="range"
                    min={-60}
                    max={0}
                    step={0.5}
                    value={t.currentDb}
                    onChange={e => {
                      e.stopPropagation();
                      dispatch({ type: 'UPDATE_LEVEL', trackId: t.id, db: parseFloat(e.target.value) });
                    }}
                    className="w-full h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] font-mono text-white/30 mt-0.5">
                    <span>-60</span>
                    <span className="text-white font-bold">{t.currentDb.toFixed(1)} dBFS</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Routing Matrix View
 */
function RoutingMatrixView({
  tracks,
  buses,
  onTrackBusChange,
}: {
  tracks: any[];
  buses: any[];
  onTrackBusChange: (trackId: string, bus: any) => void;
}) {
  return (
    <div className="p-4 overflow-x-auto">
      <div className="mb-3">
        <h3 className="text-xs font-mono font-bold text-white/70 uppercase tracking-wider">
          Signal Cross-Routing Matrix
        </h3>
        <p className="text-[10px] font-mono text-white/30">
          Route individual channels to specific subgroup buses
        </p>
      </div>

      <div className="min-w-[600px] border border-white/10 rounded-2xl overflow-hidden bg-black/40">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-3 text-white/60 font-semibold">Track</th>
              {buses.map(b => (
                <th key={b.id} className="p-3 text-center" style={{ color: b.color }}>
                  {b.name.replace(' Bus', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tracks.map(t => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/2">
                <td className="p-3 flex items-center gap-2 text-white font-medium">
                  <span style={{ color: t.color }}>{t.icon}</span>
                  <span>{t.name}</span>
                </td>
                {buses.map(b => {
                  const isAssigned = t.bus === b.type;
                  return (
                    <td key={b.id} className="p-3 text-center">
                      <button
                        onClick={() => onTrackBusChange(t.id, b.type)}
                        className={`w-6 h-6 rounded-lg font-bold text-[10px] transition-all ${
                          isAssigned
                            ? 'shadow-md scale-110'
                            : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/60'
                        }`}
                        style={{
                          background: isAssigned ? b.color : undefined,
                          color: isAssigned ? '#000' : undefined,
                        }}
                      >
                        {isAssigned ? '✓' : '•'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Headroom & Session Status
 */
function SessionHeadroomSummary() {
  const { state } = useSession();
  const { tracks, buses, mixBusDb } = state;

  const healthCounts = {
    healthy: tracks.filter(t => getLevelHealth(t.currentDb, t.dbRange) === 'healthy').length,
    check: tracks.filter(t => getLevelHealth(t.currentDb, t.dbRange) === 'check').length,
    hot: tracks.filter(t => getLevelHealth(t.currentDb, t.dbRange) === 'hot').length,
  };

  return (
    <div className="p-3 border-b border-white/5">
      <div className="flex items-center gap-1.5 mb-2">
        <Layers size={11} className="text-blue-400" />
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold">
          Headroom Health
        </span>
      </div>

      {/* Health Counter Pills */}
      <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-xs font-bold text-emerald-400">{healthCounts.healthy}</div>
          <div className="text-[7px] font-mono text-white/40">Optimal</div>
        </div>
        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="text-xs font-bold text-amber-400">{healthCounts.check}</div>
          <div className="text-[7px] font-mono text-white/40">Hot</div>
        </div>
        <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="text-xs font-bold text-red-400">{healthCounts.hot}</div>
          <div className="text-[7px] font-mono text-white/40">Clip</div>
        </div>
      </div>

      {/* Mix Bus Peak Readout */}
      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
        <div className="flex justify-between items-center text-[9px] font-mono text-white/40 mb-1">
          <span>Mix Bus Sum</span>
          <span className="text-yellow-400 font-bold">{mixBusDb.toFixed(1)} dBFS</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${((mixBusDb + 60) / 60) * 100}%`,
              background: mixBusDb > -3 ? '#EF476F' : '#FFD700',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Stress Test / What If Panel
 */
function WhatIfStressPanel() {
  const { dispatch } = useSession();

  const scenarios = [
    {
      label: '+5 Drum Layers',
      icon: '🥁',
      action: () => {
        ['kick', 'snare', 'hihat', 'toms', 'percussion'].forEach((t, i) => {
          setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t as TrackType }), i * 120);
        });
      },
    },
    {
      label: '+4 Vocal Doubles',
      icon: '🎤',
      action: () => {
        ['leadVocal', 'bgVocal', 'harmony', 'adlibs'].forEach((t, i) => {
          setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t as TrackType }), i * 120);
        });
      },
    },
    {
      label: '+6 Synth Layers',
      icon: '🎹',
      action: () => {
        ['synth', 'synth', 'pad', 'synthBass', 'strings', 'brass'].forEach((t, i) => {
          setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t as TrackType }), i * 100);
        });
      },
    },
    {
      label: 'Mega 30+ Tracks',
      icon: '🔥',
      action: () => {
        const extra: TrackType[] = [
          'kick', 'snare', 'hihat', 'overheads', 'bass', 'guitar', 'piano',
          'synth', 'leadVocal', 'bgVocal', 'fx', 'reverbReturn',
        ];
        extra.forEach((t, i) => {
          setTimeout(() => dispatch({ type: 'ADD_TRACK', trackType: t }), i * 70);
        });
      },
    },
  ];

  return (
    <div className="p-3 border-b border-white/5">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap size={11} className="text-amber-400" />
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold">
          Stress Test Summing
        </span>
      </div>

      <div className="space-y-1">
        {scenarios.map(s => (
          <button
            key={s.label}
            onClick={s.action}
            className="w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-all hover:bg-white/5 group border border-transparent hover:border-white/5"
          >
            <span className="text-xs">{s.icon}</span>
            <span className="text-[9px] font-mono text-white/50 group-hover:text-white transition-colors">
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuickWorkflowTips() {
  return (
    <div className="p-3 bg-black/40 border-t border-white/5 text-[8px] font-mono text-white/30 space-y-1">
      <div className="text-white/60 font-bold flex items-center gap-1">
        <HelpCircle size={9} /> Gain Staging Rule
      </div>
      <p>Keep tracks at -18 to -12 dBFS so 20+ channels won't clip the mix bus.</p>
    </div>
  );
}
