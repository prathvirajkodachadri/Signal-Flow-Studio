import { motion } from 'framer-motion';
import { LevelMeter, MiniWaveform } from './LevelMeter';

export function Guides() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Recording */}
      <GuideSection
        title="Recording"
        icon="🎙️"
        color="#06D6A0"
        subtitle="Capture clean audio with good headroom"
      >
        <div className="grid grid-cols-2 gap-4">
          <VisualCard color="#06D6A0" title="Good Recording Level">
            <LevelMeter db={-18} range={[-60, 0]} height={80} width={20} showLabel={true} color="#06D6A0" />
            <div className="text-[10px] font-mono text-green-400 mt-2">Peaks around -18 to -12 dBFS</div>
            <div className="text-[9px] font-mono text-white/25 mt-1">Plenty of headroom above</div>
          </VisualCard>
          <VisualCard color="#EF476F" title="Too Hot!">
            <LevelMeter db={-2} range={[-60, 0]} height={80} width={20} showLabel={true} color="#EF476F" />
            <div className="text-[10px] font-mono text-red-400 mt-2">Peaks near 0 dBFS</div>
            <div className="text-[9px] font-mono text-white/25 mt-1">No headroom — risk of clipping</div>
          </VisualCard>
        </div>
        <TipBox>
          Aim for peaks between -18 and -12 dBFS. This leaves room for
          processing later and prevents clipping.
        </TipBox>
      </GuideSection>

      {/* Mixing */}
      <GuideSection
        title="Mixing"
        icon="🎚️"
        color="#3A86FF"
        subtitle="Balance all tracks so everything is heard"
      >
        <div className="flex gap-3 justify-center mb-4">
          {[
            { name: 'Kick', db: -8, color: '#FF6B35' },
            { name: 'Bass', db: -10, color: '#118AB2' },
            { name: 'Vocal', db: -6, color: '#FF006E' },
            { name: 'Guitar', db: -14, color: '#EF476F' },
          ].map(track => (
            <div key={track.name} className="flex flex-col items-center gap-1">
              <div className="text-[9px] font-mono" style={{ color: track.color }}>{track.name}</div>
              <LevelMeter db={track.db} range={[-60, 0]} height={60} width={12} showLabel={false} color={track.color} />
              <div className="text-[8px] font-mono text-white/30">{track.db} dB</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-white/20">→</span>
          <div className="text-[10px] font-mono text-yellow-400">Mix Bus: -3 to -1 dBFS peak</div>
        </div>
        <TipBox>
          Mix so the loudest part of your song peaks around -3 to -1 dBFS
          at the Mix Bus. This gives the mastering engineer room to work.
        </TipBox>
      </GuideSection>

      {/* Bus Routing */}
      <GuideSection
        title="Bus Routing"
        icon="🔀"
        color="#8338EC"
        subtitle="Group similar tracks together for control"
      >
        <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
          {[
            { tracks: ['Kick', 'Snare', 'HH'], bus: 'Drums', color: '#FF9F1C' },
            { tracks: ['Gtr', 'Pno', 'Syn'], bus: 'Inst', color: '#7B2CBF' },
            { tracks: ['LV', 'BV'], bus: 'Vox', color: '#E63946' },
          ].map(group => (
            <div key={group.bus} className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {group.tracks.map(t => (
                  <div key={t} className="px-1.5 py-0.5 rounded text-[8px] font-mono" style={{ background: `${group.color}15`, color: group.color }}>{t}</div>
                ))}
              </div>
              <span className="text-white/20 text-xs">→</span>
              <div className="px-2 py-1 rounded-lg text-[9px] font-mono font-bold" style={{ background: `${group.color}20`, color: group.color, border: `1px solid ${group.color}30` }}>{group.bus}</div>
            </div>
          ))}
        </div>
        <TipBox>
          Buses let you control multiple tracks as one. Mute the Drum Bus
          to mute all drums. Add reverb to the Vocal Bus to affect all vocals.
        </TipBox>
      </GuideSection>

      {/* Mastering */}
      <GuideSection
        title="Mastering"
        icon="✨"
        color="#FFD700"
        subtitle="Final polish for release"
      >
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-[10px] font-mono text-white/40 mb-1">Before</div>
            <LevelMeter db={-6} range={[-60, 0]} height={70} width={20} showLabel={true} color="#FFD166" />
            <div className="text-[9px] font-mono text-yellow-400 mt-1">-6 dBFS</div>
          </div>
          <div className="text-white/20 text-xl">→</div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-white/40 mb-1">After</div>
            <LevelMeter db={-1} range={[-60, 0]} height={70} width={20} showLabel={true} color="#FFD700" />
            <div className="text-[9px] font-mono text-yellow-300 mt-1">-1 dBFS</div>
          </div>
        </div>
        <TipBox>
          Mastering brings the overall level up and ensures consistent
          loudness across platforms. Target -14 LUFS for streaming.
        </TipBox>
      </GuideSection>
    </div>
  );
}

function GuideSection({ title, icon, color, subtitle, children }: {
  title: string; icon: string; color: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 backdrop-blur-md border"
      style={{
        background: `${color}04`,
        borderColor: `${color}15`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="text-lg font-bold" style={{ color }}>
            {title}
          </h3>
          <p className="text-xs font-mono text-white/30">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function VisualCard({ color, title, children }: {
  color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3 backdrop-blur-md border flex flex-col items-center"
      style={{
        background: `${color}06`,
        borderColor: `${color}15`,
      }}
    >
      <div className="text-[10px] font-mono font-bold mb-2" style={{ color }}>{title}</div>
      {children}
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 px-4 py-2 rounded-lg bg-white/3 border border-white/5">
      <div className="text-[10px] font-mono text-white/40 flex items-start gap-2">
        <span className="text-yellow-400">💡</span>
        <span>{children}</span>
      </div>
    </div>
  );
}
