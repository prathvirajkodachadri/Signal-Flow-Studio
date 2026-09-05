import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Check, ChevronDown, Upload, Gauge, ShieldCheck, AlertTriangle,
  XCircle, Sparkles, ArrowRight, Music2, Disc, SlidersHorizontal,
} from 'lucide-react';
import { useSession, useDeliveryAnalysis } from '../context/SessionContext';
import {
  PLATFORM_PRESETS, getPlatform, getDeliveryStatusColor, getDeliveryStatusLabel,
  type PlatformId,
} from '../data';
import { LufsMeter } from './LevelMeter';

/* -------------------------------------------------------------------------- */
/* Compact chip row — used in the DAW header and the session toolbar           */
/* -------------------------------------------------------------------------- */

export function PlatformChipRow({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { state, dispatch } = useSession();

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-0.5 border border-white/5">
      {PLATFORM_PRESETS.map(p => {
        const active = state.platform === p.id;
        return (
          <button
            key={p.id}
            onClick={() => dispatch({ type: 'SET_PLATFORM', platform: p.id })}
            title={`${p.name} — ${p.targetLufs} LUFS / ${p.truePeakCeiling.toFixed(1)} dBTP`}
            className={`flex items-center gap-1 rounded-lg font-mono font-bold transition-all whitespace-nowrap ${
              size === 'sm' ? 'px-2 py-1 text-[9px]' : 'px-2.5 py-1.5 text-[10px]'
            } ${active ? 'text-white shadow-sm' : 'text-white/35 hover:text-white/75'}`}
            style={{
              background: active ? `${p.color}35` : undefined,
              border: active ? `1px solid ${p.color}70` : '1px solid transparent',
            }}
          >
            <span>{p.icon}</span>
            <span>{p.shortName}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Big card grid — used as step 1 of the session builder                       */
/* -------------------------------------------------------------------------- */

export function PlatformCardGrid() {
  const { state, dispatch } = useSession();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
      {PLATFORM_PRESETS.map((p, i) => {
        const active = state.platform === p.id;
        return (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => dispatch({ type: 'SET_PLATFORM', platform: p.id })}
            className="relative text-left rounded-2xl p-3.5 border backdrop-blur-md transition-all overflow-hidden"
            style={{
              background: active ? `${p.color}12` : 'rgba(255,255,255,0.02)',
              borderColor: active ? `${p.color}55` : 'rgba(255,255,255,0.06)',
              boxShadow: active ? `0 0 25px ${p.color}22` : undefined,
            }}
          >
            {p.recommended && (
              <div
                className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl text-[8px] font-mono font-bold"
                style={{ background: `${p.color}30`, color: p.color }}
              >
                RECOMMENDED
              </div>
            )}

            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">{p.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: p.color }}>
                  {p.name}
                </div>
                <div className="text-[9px] font-mono text-white/35 truncate">
                  {p.services.join(' · ')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <Metric label="Target" value={`${p.targetLufs} LUFS`} color={p.color} />
              <Metric label="Ceiling" value={`${p.truePeakCeiling.toFixed(1)} dBTP`} color="#FFD700" />
              <Metric label="Mix peak" value={`${p.mixBusPeak[0]} to ${p.mixBusPeak[1]}`} color="#06D6A0" />
              <Metric label="Headroom" value={`${p.headroomDb} dB`} color="#3A86FF" />
            </div>

            <div className="text-[9px] font-mono text-white/35 leading-snug">
              {p.normalizationLabel}
            </div>

            {active && (
              <motion.div
                layoutId="platform-active"
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ background: p.color }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-2 py-1 rounded-lg bg-black/30 border border-white/5">
      <div className="text-[7px] font-mono text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-[10px] font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Header dropdown variant                                                     */
/* -------------------------------------------------------------------------- */

export function PlatformDropdown() {
  const { state, dispatch } = useSession();
  const [open, setOpen] = useState(false);
  const p = getPlatform(state.platform);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-mono font-bold border transition-all"
        style={{
          background: `${p.color}18`,
          borderColor: `${p.color}45`,
          color: p.color,
        }}
      >
        <Upload size={11} />
        <span className="text-white/45">TARGET:</span>
        <span>{p.shortName}</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              className="absolute right-0 mt-1.5 w-64 z-40 rounded-2xl border border-white/10 bg-[#0c1120]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-white/5 text-[8px] font-mono text-white/35 uppercase tracking-wider">
                Upload destination — drives every dB target
              </div>
              {PLATFORM_PRESETS.map(pp => {
                const active = state.platform === pp.id;
                return (
                  <button
                    key={pp.id}
                    onClick={() => {
                      dispatch({ type: 'SET_PLATFORM', platform: pp.id });
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      active ? 'bg-white/8' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base">{pp.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold truncate" style={{ color: pp.color }}>
                        {pp.name}
                      </div>
                      <div className="text-[8px] font-mono text-white/35">
                        {pp.targetLufs} LUFS · {pp.truePeakCeiling.toFixed(1)} dBTP
                      </div>
                    </div>
                    {active && <Check size={12} style={{ color: pp.color }} />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delivery readiness panel — the "will it pass on YouTube / Spotify?" readout */
/* -------------------------------------------------------------------------- */

export function DeliveryReadinessPanel({ compact = false }: { compact?: boolean }) {
  const { state, dispatch } = useSession();
  const analysis = useDeliveryAnalysis();
  const p = getPlatform(state.platform);
  const [showAll, setShowAll] = useState(false);

  const statusColor = getDeliveryStatusColor(analysis.status);
  const statusLabel = getDeliveryStatusLabel(analysis.status);

  const otherPlatforms = useMemo(
    () => analysis.platformResults.filter(r => !r.active),
    [analysis.platformResults],
  );
  const activePlatforms = analysis.platformResults.filter(r => r.active);

  if (analysis.status === 'empty' && state.tracks.length === 0) {
    return (
      <div className="p-3 border-b border-white/5">
        <SectionTitle icon={<Upload size={11} />} label="Upload Check" color={p.color} />
        <div className="text-[9px] font-mono text-white/30 mt-2">
          Target: <span style={{ color: p.color }}>{p.name}</span> — {p.targetLufs} LUFS /{' '}
          {p.truePeakCeiling.toFixed(1)} dBTP. Add tracks to model the master.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-white/5 space-y-2.5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<Upload size={11} />} label="Upload Check" color={p.color} />
        <span
          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${statusColor}20`, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Platform + target */}
      <div
        className="p-2 rounded-xl border"
        style={{ background: `${p.color}0d`, borderColor: `${p.color}30` }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold" style={{ color: p.color }}>
            {p.icon} {p.name}
          </span>
          <span className="text-[8px] font-mono text-white/40">
            {p.targetLufs} LUFS · {p.truePeakCeiling.toFixed(1)} dBTP
          </span>
        </div>
        <div className="text-[8px] font-mono text-white/35 mt-0.5">{p.normalizationLabel}</div>
      </div>

      {/* LUFS meter */}
      <LufsMeter
        lufs={analysis.estimatedLufs}
        target={p.targetLufs}
        truePeak={analysis.truePeak}
      />

      {/* Numbers */}
      <div className="grid grid-cols-2 gap-1.5 text-center">
        <Stat label="Mix peak" value={`${analysis.mixPeakDb.toFixed(1)}`} unit="dBFS" color="#FFD700" />
        <Stat label="Limiter GR" value={`${analysis.gainReductionDb.toFixed(1)}`} unit="dB" color={analysis.gainReductionDb > 4 ? '#EF476F' : '#06D6A0'} />
        <Stat label="PLR" value={`${analysis.plr.toFixed(1)}`} unit="dB" color="#3A86FF" />
        <Stat
          label="Normalize"
          value={`${analysis.normalizationDb > 0 ? '+' : ''}${analysis.normalizationDb.toFixed(1)}`}
          unit="dB"
          color={Math.abs(analysis.normalizationDb) < 1 ? '#06D6A0' : '#FFD166'}
        />
      </div>

      <div
        className="text-[9px] font-mono leading-snug px-2 py-1.5 rounded-lg"
        style={{ background: `${statusColor}12`, color: statusColor }}
      >
        {analysis.normalizationAction}
      </div>

      {/* Checklist */}
      {!compact && (
        <div className="space-y-1">
          {analysis.checks.slice(0, showAll ? analysis.checks.length : 3).map(c => (
            <div key={c.label} className="flex items-start gap-1.5">
              {c.pass ? (
                <Check size={9} className="text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={9} className="text-amber-400 mt-0.5 shrink-0" />
              )}
              <div className="text-[8px] font-mono leading-snug">
                <span className={c.pass ? 'text-white/55' : 'text-amber-300'}>{c.label}</span>
                <span className="text-white/25"> — {c.detail}</span>
              </div>
            </div>
          ))}
          {analysis.checks.length > 3 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-[8px] font-mono text-blue-400 hover:text-blue-300"
            >
              {showAll ? '− show less' : `+ ${analysis.checks.length - 3} more checks`}
            </button>
          )}
        </div>
      )}

      {/* Cross-platform comparison */}
      {activePlatforms.length > 0 && (
        <div className="pt-1.5 border-t border-white/5 space-y-1">
          <div className="text-[8px] font-mono text-white/30 uppercase tracking-wider font-bold">
            Delivered master on each platform
          </div>
          {activePlatforms.map(r => (
            <PlatformRow key={r.id} result={r} highlight />
          ))}
          {otherPlatforms.slice(0, showAll ? otherPlatforms.length : 2).map(r => (
            <PlatformRow key={r.id} result={r} />
          ))}
          {otherPlatforms.length > 2 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-[8px] font-mono text-white/30 hover:text-white/60"
            >
              {showAll ? '− collapse' : `+ ${otherPlatforms.length - 2} more platforms`}
            </button>
          )}
        </div>
      )}

      {/* Fixes */}
      <div className="pt-1.5 border-t border-white/5">
        <div className="text-[8px] font-mono text-white/30 uppercase tracking-wider font-bold mb-1">
          Next move
        </div>
        <div className="text-[9px] font-mono text-white/60 leading-snug flex gap-1.5">
          <Sparkles size={9} className="text-emerald-400 mt-0.5 shrink-0" />
          <span>{analysis.fixes[0]}</span>
        </div>
        <TrimButton analysis={analysis} />
      </div>
    </div>
  );
}

/** One-click fix: move every channel fader by the suggested amount. */
function TrimButton({ analysis }: { analysis: ReturnType<typeof useDeliveryAnalysis> }) {
  const { state, dispatch } = useSession();
  const delta = analysis.suggestedTrackTrimDb;

  if (Math.abs(delta) < 0.3 || state.tracks.length === 0) return null;

  const apply = () => {
    state.tracks.forEach(t => {
      const next = Math.max(-60, Math.min(0, Math.round((t.currentDb + delta) * 10) / 10));
      dispatch({ type: 'UPDATE_LEVEL', trackId: t.id, db: next });
    });
  };

  return (
    <button
      onClick={apply}
      className="w-full mt-1.5 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all hover:scale-[1.02]"
      style={{
        background: delta > 0 ? 'rgba(6,214,160,0.15)' : 'rgba(255,209,102,0.15)',
        border: `1px solid ${delta > 0 ? 'rgba(6,214,160,0.35)' : 'rgba(255,209,102,0.35)'}`,
        color: delta > 0 ? '#06D6A0' : '#FFD166',
      }}
    >
      <SlidersHorizontal size={10} />
      <span>
        Apply {delta > 0 ? '+' : ''}{delta.toFixed(1)} dB to all {state.tracks.length} faders
      </span>
    </button>
  );
}

function PlatformRow({
  result,
  highlight,
}: {
  result: ReturnType<typeof useDeliveryAnalysis>['platformResults'][number];
  highlight?: boolean;
}) {
  const color =
    result.status === 'pass' ? '#06D6A0' : result.status === 'loud' ? '#FFD166' : result.status === 'clip' ? '#EF476F' : '#3A86FF';
  return (
    <div
      className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg"
      style={highlight ? { background: `${result.color}12` } : undefined}
    >
      <span className="text-[9px]">{result.icon}</span>
      <span className="text-[8px] font-mono text-white/55 flex-1 truncate">{result.name}</span>
      <span className="text-[8px] font-mono font-bold" style={{ color }}>
        {result.deltaDb > 0 ? '+' : ''}{result.deltaDb.toFixed(1)} dB
      </span>
    </div>
  );
}

function SectionTitle({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color }}>{icon}</span>
      <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold">
        {label}
      </span>
    </div>
  );
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="p-1.5 rounded-lg bg-black/30 border border-white/5">
      <div className="text-[9px] font-mono font-bold" style={{ color }}>
        {value} <span className="text-white/30">{unit}</span>
      </div>
      <div className="text-[7px] font-mono text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Full-width delivery board (Mix tab / Guides)                                */
/* -------------------------------------------------------------------------- */

export function DeliveryBoard() {
  const { state } = useSession();
  const analysis = useDeliveryAnalysis();
  const p = getPlatform(state.platform);

  return (
    <div className="rounded-3xl border p-5 space-y-4" style={{ background: '#0c101d', borderColor: `${p.color}30` }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
              style={{ background: `${p.color}20`, color: p.color }}
            >
              DELIVERY TARGET: {p.name.toUpperCase()}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
              style={{
                background: `${getDeliveryStatusColor(analysis.status)}20`,
                color: getDeliveryStatusColor(analysis.status),
              }}
            >
              {getDeliveryStatusLabel(analysis.status)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {analysis.estimatedLufs.toFixed(1)} LUFS at {analysis.truePeak.toFixed(1)} dBTP
          </h3>
          <p className="text-[10px] font-mono text-white/40 mt-0.5">{analysis.headline}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {analysis.fixes.slice(0, 2).map(f => (
              <span
                key={f}
                className="text-[9px] font-mono px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-white/55"
              >
                {f}
              </span>
            ))}
          </div>
          <div className="w-64 mt-2">
            <TrimButton analysis={analysis} />
          </div>
        </div>

        <div className="w-56">
          <LufsMeter lufs={analysis.estimatedLufs} target={p.targetLufs} truePeak={analysis.truePeak} />
        </div>
      </div>

      {/* Chain: mix peak -> limiter -> platform */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <ChainCard
          icon="Σ"
          label="Mix bus peak"
          value={`${analysis.mixPeakDb.toFixed(1)} dBFS`}
          note={`Target ${p.mixBusPeak[0]} to ${p.mixBusPeak[1]} dBFS`}
          color="#FFD700"
        />
        <ChainCard
          icon="◉"
          label="Limiter makeup"
          value={`+${Math.max(0, analysis.masterGainDb).toFixed(1)} dB`}
          note={`${analysis.gainReductionDb.toFixed(1)} dB gain reduction`}
          color="#FF9F1C"
        />
        <ChainCard
          icon="📊"
          label="True peak out"
          value={`${analysis.truePeak.toFixed(1)} dBTP`}
          note={`Ceiling ${p.truePeakCeiling.toFixed(1)} dBTP`}
          color="#06D6A0"
        />
        <ChainCard
          icon="🚀"
          label={`${p.shortName} playback`}
          value={`${analysis.normalizationDb > 0 ? '+' : ''}${analysis.normalizationDb.toFixed(1)} dB`}
          note={analysis.normalizationAction}
          color={p.color}
        />
      </div>

      {/* Do / avoid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Do this</span>
          </div>
          <ul className="space-y-1">
            {p.doList.map(d => (
              <li key={d} className="text-[10px] font-mono text-white/60 flex gap-1.5">
                <span className="text-emerald-400">✓</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-1.5 mb-2">
            <XCircle size={12} className="text-red-400" />
            <span className="text-[10px] font-mono font-bold text-red-400 uppercase">Avoid this</span>
          </div>
          <ul className="space-y-1">
            {p.avoidList.map(d => (
              <li key={d} className="text-[10px] font-mono text-white/60 flex gap-1.5">
                <span className="text-red-400">✕</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cross-platform table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-3 py-2 bg-white/5 text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold">
          What this same master does on every platform
        </div>
        <div className="divide-y divide-white/5">
          {analysis.platformResults.map(r => {
            const inRange = Math.abs(r.deltaDb) <= 1.5;
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 px-3 py-2"
                style={r.active ? { background: `${r.color}10` } : undefined}
              >
                <span className="text-sm">{r.icon}</span>
                <span className="text-[10px] font-mono text-white/70 w-40 shrink-0">{r.name}</span>
                <span className="text-[9px] font-mono text-white/30 w-24 shrink-0">
                  {r.targetLufs} LUFS
                </span>
                <span
                  className="text-[10px] font-mono font-bold w-20 shrink-0"
                  style={{ color: inRange ? '#06D6A0' : r.deltaDb < 0 ? '#FFD166' : '#3A86FF' }}
                >
                  {r.deltaDb > 0 ? '+' : ''}{r.deltaDb.toFixed(1)} dB
                </span>
                <span className="text-[9px] font-mono text-white/45 flex-1">{r.action}</span>
                <span className="text-[8px] font-mono" style={{ color: r.color }}>
                  {r.active ? 'SELECTED' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload checklist */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center gap-1.5 mb-2">
          <Disc size={12} className="text-blue-400" />
          <span className="text-[10px] font-mono font-bold text-white/70 uppercase">
            Upload checklist — {p.services.join(' + ')}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {p.uploadChecklist.map(c => (
            <div key={c} className="flex items-start gap-1.5">
              <ArrowRight size={9} className="text-blue-400 mt-0.5 shrink-0" />
              <span className="text-[9px] font-mono text-white/55">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9px] font-mono">
          <div><span className="text-white/30">Codec:</span> <span className="text-white/60">{p.codec}</span></div>
          <div><span className="text-white/30">Deliver:</span> <span className="text-white/60">{p.deliveryFormat}</span></div>
          <div><span className="text-white/30">Rate:</span> <span className="text-white/60">{p.sampleRate}</span></div>
        </div>
      </div>
    </div>
  );
}

function ChainCard({
  icon,
  label,
  value,
  note,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-2xl border" style={{ background: `${color}0a`, borderColor: `${color}25` }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs" style={{ color }}>{icon}</span>
        <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="text-sm font-mono font-black" style={{ color }}>{value}</div>
      <div className="text-[8px] font-mono text-white/30 mt-0.5 leading-snug">{note}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small helper used by the GenreSelector header                               */
/* -------------------------------------------------------------------------- */

export function PlatformSummaryBadge() {
  const { state } = useSession();
  const p = getPlatform(state.platform);
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-mono"
      style={{ background: `${p.color}12`, borderColor: `${p.color}35`, color: p.color }}
    >
      <Radio size={10} />
      <span className="font-bold">{p.name}</span>
      <span className="text-white/40">
        {p.targetLufs} LUFS · {p.truePeakCeiling.toFixed(1)} dBTP · mix peak {p.mixBusPeak[0]} to {p.mixBusPeak[1]} dBFS
      </span>
    </div>
  );
}

export function PlatformIcon({ id, size = 14 }: { id: PlatformId; size?: number }) {
  const p = getPlatform(id);
  return (
    <span style={{ fontSize: size }} title={p.name}>
      {p.icon}
    </span>
  );
}

export function MusicNote() {
  return <Music2 size={11} />;
}

export function GaugeIcon() {
  return <Gauge size={11} />;
}
