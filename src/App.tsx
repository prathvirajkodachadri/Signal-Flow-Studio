import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionProvider, useSession } from './context/SessionContext';
import { SessionBuilder } from './pages/SessionBuilder';
import { MixerView } from './components/MixerView';
import { LevelReference } from './components/LevelReference';
import { Guides } from './components/Guides';
import {
  LayoutGrid, SlidersHorizontal, BarChart3, BookOpen, Radio,
  Activity, Zap, Disc, Volume2, Sparkles, Layers,
} from 'lucide-react';

type Tab = 'session' | 'mixer' | 'levels' | 'guides';

function AppContent() {
  const { state } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('session');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; shortLabel: string; badge?: string }[] = [
    { id: 'session', label: 'Session Builder', icon: <LayoutGrid size={15} />, shortLabel: 'Session', badge: state.tracks.length > 0 ? `${state.tracks.length}` : undefined },
    { id: 'mixer', label: 'Signal Flow & Mix', icon: <SlidersHorizontal size={15} />, shortLabel: 'Mix', badge: 'Flow' },
    { id: 'levels', label: 'Level Reference', icon: <BarChart3 size={15} />, shortLabel: 'Level Reference', badge: '-18 0VU' },
    { id: 'guides', label: 'Visual Guides', icon: <BookOpen size={15} />, shortLabel: 'Visual Guides' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#070b14] text-white select-none">
      {/* Background Ambience & Studio Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 20% 20%, rgba(58,134,255,0.06), transparent 70%),
              radial-gradient(ellipse 70% 70% at 85% 75%, rgba(255,0,110,0.04), transparent 70%),
              radial-gradient(ellipse 60% 60% at 50% 50%, rgba(6,214,160,0.03), transparent 70%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Professional DAW Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/8 bg-black/50 backdrop-blur-2xl shadow-xl">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #FF006E, #3A86FF)',
                boxShadow: '0 0 15px rgba(58, 134, 255, 0.4)',
              }}
            >
              <Radio size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Signal Flow Studio
                </h1>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  PRO AUDIO
                </span>
              </div>
              <p className="text-[8px] font-mono text-white/40 -mt-0.5">
                Gain Staging • Signal Routing • Level Standards
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 border border-white/5 shadow-inner">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl
                  text-xs font-mono font-bold transition-all duration-200
                  ${isActive
                    ? 'text-white shadow-lg'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(58,134,255,0.8), rgba(131,56,236,0.8))' : undefined,
                  boxShadow: isActive ? '0 0 20px rgba(58,134,255,0.4)' : undefined,
                }}
              >
                {tab.icon}
                <span>{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Studio Output Monitor */}
        <div className="hidden lg:flex items-center gap-3 bg-white/3 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-[9px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span className="text-white/40">CALIBRATION:</span>
            <span className="text-emerald-400 font-bold">-18 dBFS (0 VU)</span>
          </div>
          {state.tracks.length > 0 && (
            <>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">MIX SUM:</span>
                <span className="text-yellow-400 font-bold">{state.mixBusDb.toFixed(1)} dBFS</span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {activeTab === 'session' && <SessionBuilder />}
            {activeTab === 'mixer' && <MixerView />}
            {activeTab === 'levels' && <LevelReference />}
            {activeTab === 'guides' && <Guides />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
