import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { TrackCard } from './TrackCard';
import { BusNode, MixBusNode } from './BusNode';
import { MiniWaveform } from './LevelMeter';
import { BUS_DEFS, type Track, type Bus } from '../data';

interface SignalFlowCanvasProps {
  onTrackSelect: (id: string | null) => void;
  onBusSelect: (id: string | null) => void;
}

interface NodePos {
  x: number; y: number; w: number; h: number; color: string;
}

function FlowParticles({ from, to, color, count = 3, speed = 1, dimmed = false }: {
  from: NodePos; to: NodePos; color: string; count?: number; speed?: number; dimmed?: boolean;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (dimmed) return;
    const id = setInterval(() => setTick(t => t + 1), 40);
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
      x: u*u*u*sx + 3*u*u*t*mx + 3*u*t*t*mx + t*t*t*ex,
      y: u*u*u*sy + 3*u*u*t*sy + 3*u*t*t*ey + t*t*t*ey,
    };
  };

  return (
    <g>
      <path
        d={`M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`}
        fill="none" stroke={color} strokeWidth={1.5} opacity={0.12}
      />
      <path
        d={`M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`}
        fill="none" stroke={color} strokeWidth={4} opacity={0.04}
        filter="url(#softGlow)"
      />
      {Array.from({ length: count }).map((_, i) => {
        const p = ((tick * 0.012 * speed + i / count) % 1);
        const pt = bezier(p);
        const op = Math.sin(p * Math.PI) * 0.9;
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={3} fill={color} opacity={op * 0.3} filter="url(#particleGlow)" />
            <circle cx={pt.x} cy={pt.y} r={1.5} fill={color} opacity={op} />
          </g>
        );
      })}
    </g>
  );
}

export function SignalFlowCanvas({ onTrackSelect, onBusSelect }: SignalFlowCanvasProps) {
  const { state, dispatch } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgSize, setSvgSize] = useState({ width: 1200, height: 600 });
  const [positions, setPositions] = useState<{
    tracks: Record<string, NodePos>;
    buses: Record<string, NodePos>;
    mixBus: NodePos;
    preMaster: NodePos;
  }>({
    tracks: {}, buses: {},
    mixBus: { x: 0, y: 0, w: 0, h: 0, color: '#FFD700' },
    preMaster: { x: 0, y: 0, w: 0, h: 0, color: '#fff' },
  });

  const { tracks, buses, selectedTrackId, selectedBusId } = state;

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    setSvgSize({ width: cr.width, height: cr.height });

    const tp: Record<string, NodePos> = {};
    const bp: Record<string, NodePos> = {};

    tracks.forEach(t => {
      const el = document.getElementById(`tn-${t.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        tp[t.id] = { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height, color: t.color };
      }
    });

    buses.forEach(b => {
      const el = document.getElementById(`bn-${b.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        bp[b.id] = { x: r.left - cr.left, y: r.top - cr.top, w: r.width, h: r.height, color: b.color };
      }
    });

    let mb: NodePos = { x: 0, y: 0, w: 0, h: 0, color: '#FFD700' };
    let pm: NodePos = { x: 0, y: 0, w: 0, h: 0, color: '#fff' };
    const mEl = document.getElementById('mb-node');
    if (mEl) { const r = mEl.getBoundingClientRect(); mb = { x: r.left-cr.left, y: r.top-cr.top, w: r.width, h: r.height, color: '#FFD700' }; }
    const pEl = document.getElementById('pm-node');
    if (pEl) { const r = pEl.getBoundingClientRect(); pm = { x: r.left-cr.left, y: r.top-cr.top, w: r.width, h: r.height, color: '#fff' }; }

    setPositions({ tracks: tp, buses: bp, mixBus: mb, preMaster: pm });
  }, [tracks, buses]);

  useEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    const t = setTimeout(measure, 100);
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
    <div ref={containerRef} className="relative w-full h-full min-h-[400px] overflow-auto">
      {/* SVG overlay */}
      <svg className="absolute inset-0 pointer-events-none z-20" width={svgSize.width} height={svgSize.height}>
        <defs>
          <filter id="softGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="particleGlow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {tracks.map(track => {
          const bid = `bus-${track.bus}`;
          const tp = positions.tracks[track.id];
          const bp = positions.buses[bid];
          if (!tp || !bp) return null;
          return <FlowParticles key={`c-${track.id}`} from={tp} to={bp} color={track.color} count={2} speed={0.7 + Math.random()*0.5} dimmed={isConnDim(track.id, bid)} />;
        })}

        {buses.map(bus => {
          const bp = positions.buses[bus.id];
          const mp = positions.mixBus;
          if (!bp || !mp.w) return null;
          return <FlowParticles key={`bm-${bus.id}`} from={bp} to={mp} color={bus.color} count={3} speed={0.5} dimmed={!isOutHL && (!!selectedTrackId || !!selectedBusId)} />;
        })}

        {positions.mixBus.w > 0 && positions.preMaster.w > 0 && (
          <FlowParticles from={positions.mixBus} to={positions.preMaster} color="#FFD700" count={4} speed={0.4} dimmed={!isOutHL && (!!selectedTrackId || !!selectedBusId)} />
        )}
      </svg>

      {/* Layout */}
      <div className="relative z-10 flex gap-2 p-2 h-full">
        {/* Tracks */}
        <div className="w-[148px] flex-shrink-0 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/50 animate-pulse" />
            Tracks · {tracks.length}
          </div>
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-1.5">
              {tracks.map(track => (
                <motion.div key={track.id} id={`tn-${track.id}`} layout layoutId={`tl-${track.id}`}>
                  <TrackCard
                    track={track}
                    selected={selectedTrackId === track.id}
                    highlighted={isTrackHL(track.id)}
                    dimmed={!isTrackHL(track.id) && (!!selectedTrackId || !!selectedBusId)}
                    onSelect={id => onTrackSelect(selectedTrackId === id ? null : id)}
                    onToggleMute={id => dispatch({ type: 'TOGGLE_MUTE', trackId: id })}
                    onToggleSolo={id => dispatch({ type: 'TOGGLE_SOLO', trackId: id })}
                    onUpdateLevel={(id, db) => dispatch({ type: 'UPDATE_LEVEL', trackId: id, db })}
                    onRemove={id => dispatch({ type: 'REMOVE_TRACK', trackId: id })}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Buses */}
        <div className="w-[185px] flex-shrink-0 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/50 animate-pulse" />
            Groups · {buses.length}
          </div>
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-2">
              {buses.map(bus => (
                <motion.div key={bus.id} id={`bn-${bus.id}`} layout layoutId={`bl-${bus.id}`}>
                  <BusNode
                    bus={bus}
                    selected={selectedBusId === bus.id}
                    highlighted={isBusHL(bus.id)}
                    dimmed={!isBusHL(bus.id) && (!!selectedTrackId || !!selectedBusId)}
                    trackCount={bus.trackIds.length}
                    onSelect={id => onBusSelect(selectedBusId === id ? null : id)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300/60 animate-pulse" />
            Output
          </div>
          <div className="flex flex-col gap-3">
            <div id="mb-node">
              <MixBusNode name="Mix Bus" color="#FFD700" icon="Σ" db={-3} dbRange={[-3,-1]} busCount={buses.length}
                selected={selectedBusId==='bus-mixBus'} highlighted={isOutHL}
                dimmed={!isOutHL && (!!selectedTrackId||!!selectedBusId)}
                onSelect={() => onBusSelect(selectedBusId==='bus-mixBus' ? null : 'bus-mixBus')} />
            </div>

            <div className="flex justify-center py-1">
              <motion.div className="flex flex-col items-center gap-0.5"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}>
                <div className="w-0.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #FFD700, #FFFFFF)' }} />
                <svg width="8" height="6" className="text-white/20"><path d="M0,0 L4,6 L8,0" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
              </motion.div>
            </div>

            <div id="pm-node">
              <MixBusNode name="Pre-Master" color="#FFFFFF" icon="◉" db={-1} dbRange={[-1,-0.3]} busCount={1}
                selected={selectedBusId==='bus-preMaster'} highlighted={isOutHL}
                dimmed={!isOutHL && (!!selectedTrackId||!!selectedBusId)}
                onSelect={() => onBusSelect(selectedBusId==='bus-preMaster' ? null : 'bus-preMaster')} />
            </div>

            {/* Signal flow diagram */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="mt-3 rounded-xl p-3 backdrop-blur-md border border-white/5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest mb-2">Signal Path</div>
              <div className="flex items-center justify-center gap-1 flex-wrap">
                {[
                  { label: `${tracks.length} Tracks`, color: '#06D6A0', icon: '🎵' },
                  { label: '→', color: '#ffffff20', icon: '' },
                  { label: `${buses.length} Groups`, color: '#FFD166', icon: '📦' },
                  { label: '→', color: '#ffffff20', icon: '' },
                  { label: 'Mix', color: '#FFD700', icon: 'Σ' },
                  { label: '→', color: '#ffffff20', icon: '' },
                  { label: 'Pre-Master', color: '#FFFFFF', icon: '◉' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    {step.icon && <span className="text-[10px]">{step.icon}</span>}
                    <span className="text-[9px] font-mono font-bold" style={{ color: step.color }}>{step.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Click hint */}
            <div className="text-center text-[8px] font-mono text-white/10 mt-1">
              Click any track or group to trace its signal path
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
