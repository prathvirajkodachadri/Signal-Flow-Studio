import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { TrackCard } from './TrackCard';
import { BusNode, MixBusNode } from './BusNode';
import { LevelMeter } from './LevelMeter';
import { Plus, ArrowRight, Activity, GitBranch } from 'lucide-react';

interface SignalFlowCanvasProps {
  onTrackSelect: (id: string | null) => void;
  onBusSelect: (id: string | null) => void;
  onEditTrack: (id: string) => void;
  onRequestRemove: (id: string) => void;
}

interface NodePos {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

function FlowParticles({
  from,
  to,
  color,
  count = 3,
  speed = 1,
  dimmed = false,
}: {
  from: NodePos;
  to: NodePos;
  color: string;
  count?: number;
  speed?: number;
  dimmed?: boolean;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (dimmed) return;
    const id = setInterval(() => setTick(t => t + 1), 35);
    return () => clearInterval(id);
  }, [dimmed]);

  if (dimmed) return null;

  const sx = from.x + from.w;
  const sy = from.y + from.h / 2;
  const ex = to.x;
  const ey = to.y + to.h / 2;
  const mx = (sx + ex) / 2;

  const bezier = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * u * sx + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * ex,
      y: u * u * u * sy + 3 * u * u * t * sy + 3 * u * t * t * ey + t * t * t * ey,
    };
  };

  return (
    <g>
      {/* Background wire path */}
      <path
        d={`M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        opacity={0.18}
      />
      {/* Glow path */}
      <path
        d={`M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`}
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        opacity={0.06}
        filter="url(#softGlow)"
      />
      {/* Moving signal particles */}
      {Array.from({ length: count }).map((_, i) => {
        const p = ((tick * 0.015 * speed + i / count) % 1);
        const pt = bezier(p);
        const op = Math.sin(p * Math.PI) * 0.95;
        return (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill={color}
              opacity={op * 0.4}
              filter="url(#particleGlow)"
            />
            <circle cx={pt.x} cy={pt.y} r={1.8} fill={color} opacity={op} />
          </g>
        );
      })}
    </g>
  );
}

export function SignalFlowCanvas({
  onTrackSelect,
  onBusSelect,
  onEditTrack,
  onRequestRemove,
}: SignalFlowCanvasProps) {
  const { state, dispatch } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 1400, height: 700 });
  const [positions, setPositions] = useState<{
    tracks: Record<string, NodePos>;
    buses: Record<string, NodePos>;
    mixBus: NodePos;
    preMaster: NodePos;
  }>({
    tracks: {},
    buses: {},
    mixBus: { x: 0, y: 0, w: 0, h: 0, color: '#FFD700' },
    preMaster: { x: 0, y: 0, w: 0, h: 0, color: '#fff' },
  });

  const { tracks, buses, selectedTrackId, selectedBusId, mixBusDb, preMasterDb } = state;

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    setSvgSize({ width: Math.max(cr.width, containerRef.current.scrollWidth), height: Math.max(cr.height, containerRef.current.scrollHeight) });

    const tp: Record<string, NodePos> = {};
    const bp: Record<string, NodePos> = {};

    tracks.forEach(t => {
      const el = document.getElementById(`tn-${t.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        tp[t.id] = {
          x: r.left - cr.left + containerRef.current!.scrollLeft,
          y: r.top - cr.top + containerRef.current!.scrollTop,
          w: r.width,
          h: r.height,
          color: t.color,
        };
      }
    });

    buses.forEach(b => {
      const el = document.getElementById(`bn-${b.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        bp[b.id] = {
          x: r.left - cr.left + containerRef.current!.scrollLeft,
          y: r.top - cr.top + containerRef.current!.scrollTop,
          w: r.width,
          h: r.height,
          color: b.color,
        };
      }
    });

    let mb: NodePos = { x: 0, y: 0, w: 0, h: 0, color: '#FFD700' };
    let pm: NodePos = { x: 0, y: 0, w: 0, h: 0, color: '#fff' };
    const mEl = document.getElementById('mb-node');
    if (mEl) {
      const r = mEl.getBoundingClientRect();
      mb = {
        x: r.left - cr.left + containerRef.current!.scrollLeft,
        y: r.top - cr.top + containerRef.current!.scrollTop,
        w: r.width,
        h: r.height,
        color: '#FFD700',
      };
    }
    const pEl = document.getElementById('pm-node');
    if (pEl) {
      const r = pEl.getBoundingClientRect();
      pm = {
        x: r.left - cr.left + containerRef.current!.scrollLeft,
        y: r.top - cr.top + containerRef.current!.scrollTop,
        w: r.width,
        h: r.height,
        color: '#fff',
      };
    }

    setPositions({ tracks: tp, buses: bp, mixBus: mb, preMaster: pm });
  }, [tracks, buses]);

  useEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const t = setTimeout(measure, 120);
    return () => clearTimeout(t);
  }, [tracks.length, buses.length, measure]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => measure());
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [measure]);

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);
  const selectedBus = buses.find(b => b.id === selectedBusId);

  const isTrackHL = useCallback((id: string) => {
    if (!selectedTrackId && !selectedBusId) return true;
    if (selectedTrackId === id) return true;
    if (selectedBus) return selectedBus.trackIds.includes(id);
    if (selectedTrack) return true;
    return false;
  }, [selectedTrackId, selectedBusId, selectedBus, selectedTrack]);

  const isBusHL = useCallback((id: string) => {
    if (!selectedTrackId && !selectedBusId) return true;
    if (selectedBusId === id) return true;
    if (selectedTrack) {
      const tb = buses.find(b => b.trackIds.includes(selectedTrack.id));
      return tb?.id === id;
    }
    return false;
  }, [selectedTrackId, selectedBusId, selectedTrack, buses]);

  const isOutHL = !selectedTrackId && !selectedBusId ? true :
    selectedBusId === 'bus-mixBus' || selectedBusId === 'bus-preMaster' ? true :
    !!selectedTrack || !!selectedBus;

  const isConnDim = (trackId: string, busId: string) => {
    if (!selectedTrackId && !selectedBusId) return false;
    if (selectedTrackId === trackId) return false;
    if (selectedBusId === busId) return false;
    if (selectedBus && selectedBus.trackIds.includes(trackId)) return false;
    return true;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] overflow-auto custom-scrollbar p-3"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* SVG Overlay for Signal Flow Cables */}
      <svg
        className="absolute inset-0 pointer-events-none z-20 min-w-full min-h-full"
        width={svgSize.width}
        height={svgSize.height}
      >
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tracks -> Buses Cables */}
        {tracks.map(track => {
          const bid = `bus-${track.bus}`;
          const tp = positions.tracks[track.id];
          const bp = positions.buses[bid];
          if (!tp || !bp) return null;
          return (
            <FlowParticles
              key={`c-${track.id}`}
              from={tp}
              to={bp}
              color={track.color}
              count={2}
              speed={0.8}
              dimmed={isConnDim(track.id, bid)}
            />
          );
        })}

        {/* Buses -> Mix Bus Cables */}
        {buses.map(bus => {
          const bp = positions.buses[bus.id];
          const mp = positions.mixBus;
          if (!bp || !mp.w) return null;
          return (
            <FlowParticles
              key={`bm-${bus.id}`}
              from={bp}
              to={mp}
              color={bus.color}
              count={3}
              speed={0.6}
              dimmed={!isOutHL && (!!selectedTrackId || !!selectedBusId)}
            />
          );
        })}

        {/* Mix Bus -> Pre-Master Cable */}
        {positions.mixBus.w > 0 && positions.preMaster.w > 0 && (
          <FlowParticles
            from={positions.mixBus}
            to={positions.preMaster}
            color="#FFD700"
            count={4}
            speed={0.5}
            dimmed={!isOutHL && (!!selectedTrackId || !!selectedBusId)}
          />
        )}
      </svg>

      {/* Grid Columns */}
      <div className="relative z-10 flex gap-4 min-w-[900px] h-full">
        {/* Column 1: Tracks */}
        <div className="w-[185px] shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              Tracks ({tracks.length})
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_ADD_MODAL_OPEN', open: true })}
              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono flex items-center gap-1 transition-all"
            >
              <Plus size={10} /> Add
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
            <AnimatePresence mode="popLayout">
              {tracks.map((track, idx) => (
                <div key={track.id} id={`tn-${track.id}`}>
                  <TrackCard
                    track={track}
                    index={idx}
                    totalTracks={tracks.length}
                    selected={selectedTrackId === track.id}
                    highlighted={isTrackHL(track.id)}
                    dimmed={!isTrackHL(track.id) && (!!selectedTrackId || !!selectedBusId)}
                    onSelect={id => onTrackSelect(selectedTrackId === id ? null : id)}
                    onToggleMute={id => dispatch({ type: 'TOGGLE_MUTE', trackId: id })}
                    onToggleSolo={id => dispatch({ type: 'TOGGLE_SOLO', trackId: id })}
                    onUpdateLevel={(id, db) => dispatch({ type: 'UPDATE_LEVEL', trackId: id, db })}
                    onMoveUp={id => dispatch({ type: 'MOVE_TRACK', trackId: id, direction: 'up' })}
                    onMoveDown={id => dispatch({ type: 'MOVE_TRACK', trackId: id, direction: 'down' })}
                    onEdit={id => onEditTrack(id)}
                    onDuplicate={id => dispatch({ type: 'DUPLICATE_TRACK', trackId: id })}
                    onRequestRemove={id => onRequestRemove(id)}
                  />
                </div>
              ))}
            </AnimatePresence>

            {tracks.length === 0 && (
              <div className="text-center py-12 text-white/30 font-mono text-xs border border-dashed border-white/10 rounded-2xl p-4">
                No tracks in session.
                <button
                  onClick={() => dispatch({ type: 'SET_ADD_MODAL_OPEN', open: true })}
                  className="mt-2 block mx-auto text-blue-400 underline"
                >
                  + Add Track
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Subgroup Buses */}
        <div className="w-[210px] shrink-0 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              Subgroups ({buses.length})
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
            <AnimatePresence mode="popLayout">
              {buses.map(bus => (
                <div key={bus.id} id={`bn-${bus.id}`}>
                  <BusNode
                    bus={bus}
                    selected={selectedBusId === bus.id}
                    highlighted={isBusHL(bus.id)}
                    dimmed={!isBusHL(bus.id) && (!!selectedTrackId || !!selectedBusId)}
                    trackCount={bus.trackIds.length}
                    onSelect={id => onBusSelect(selectedBusId === id ? null : id)}
                    onTogglePlugin={(busId, idx) => dispatch({ type: 'TOGGLE_BUS_PLUGIN', busId, pluginIndex: idx })}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Column 3: Output Mastering Stage */}
        <div className="flex-1 min-w-[260px] flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#fde047]" />
              Master Sum & Output
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
            {/* Mix Bus */}
            <div id="mb-node">
              <MixBusNode
                name="Mix Bus (2-Bus)"
                color="#FFD700"
                icon="Σ"
                db={mixBusDb}
                dbRange={[-6, -3]}
                busCount={buses.length}
                selected={selectedBusId === 'bus-mixBus'}
                highlighted={isOutHL}
                dimmed={!isOutHL && (!!selectedTrackId || !!selectedBusId)}
                onSelect={() => onBusSelect(selectedBusId === 'bus-mixBus' ? null : 'bus-mixBus')}
              />
            </div>

            {/* Downward Audio Conduit Graphic */}
            <div className="flex justify-center py-1">
              <motion.div
                className="flex flex-col items-center gap-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ background: 'linear-gradient(to bottom, #FFD700, #FFFFFF)' }}
                />
                <svg width="10" height="8" className="text-white/40">
                  <path d="M0,0 L5,8 L10,0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </motion.div>
            </div>

            {/* Pre-Master Output */}
            <div id="pm-node">
              <MixBusNode
                name="Pre-Master & Output"
                color="#FFFFFF"
                icon="◉"
                db={preMasterDb}
                dbRange={[-1, -0.3]}
                busCount={1}
                selected={selectedBusId === 'bus-preMaster'}
                highlighted={isOutHL}
                dimmed={!isOutHL && (!!selectedTrackId || !!selectedBusId)}
                onSelect={() => onBusSelect(selectedBusId === 'bus-preMaster' ? null : 'bus-preMaster')}
              />
            </div>

            {/* Glanceable Signal Flow Diagram Card */}
            <div
              className="rounded-2xl p-3.5 backdrop-blur-md border border-white/10"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5">
                <GitBranch size={11} className="text-blue-400" />
                Signal Routing Architecture
              </div>

              <div className="flex items-center justify-between gap-1 text-center">
                <div className="flex-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs font-bold text-emerald-400">{tracks.length}</div>
                  <div className="text-[7px] font-mono text-white/40 uppercase">Tracks</div>
                </div>

                <span className="text-white/20 text-xs font-mono">→</span>

                <div className="flex-1 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-xs font-bold text-amber-400">{buses.length}</div>
                  <div className="text-[7px] font-mono text-white/40 uppercase">Groups</div>
                </div>

                <span className="text-white/20 text-xs font-mono">→</span>

                <div className="flex-1 p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-xs font-bold text-yellow-400">Σ</div>
                  <div className="text-[7px] font-mono text-white/40 uppercase">Mix Bus</div>
                </div>

                <span className="text-white/20 text-xs font-mono">→</span>

                <div className="flex-1 p-2 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-xs font-bold text-white">◉</div>
                  <div className="text-[7px] font-mono text-white/40 uppercase">Master</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
