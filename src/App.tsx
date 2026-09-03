import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionProvider, useSession } from './context/SessionContext';
import { SessionBuilder } from './pages/SessionBuilder';
import { MixerView } from './components/MixerView';
import { LevelReference } from './components/LevelReference';
import { Guides } from './components/Guides';
import { LayoutGrid, SlidersHorizontal, BarChart3, BookOpen, Radio } from 'lucide-react';

type Tab = 'session' | 'mixer' | 'levels' | 'guides';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('session');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { id: 'session', label: 'Session Builder', icon: <LayoutGrid size={16} />, shortLabel: 'Session' },
    { id: 'mixer', label: 'Mixer', icon: <SlidersHorizontal size={16} />, shortLabel: 'Mix' },
    { id: 'levels', label: 'Level Reference', icon: <BarChart3 size={16} />, shortLabel: 'Levels' },
    { id: 'guides', label: 'Visual Guides', icon: <BookOpen size={16} />, shortLabel: 'Guides' },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: '#0a0e1a' }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(58,134,255,0.04), transparent),
              radial-gradient(ellipse 60% 80% at 80% 70%, rgba(255,0,110,0.03), transparent),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(6,214,160,0.02), transparent)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FF006E20, #3A86FF20)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Radio size={14} className="text-white/70" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white/90" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Signal Flow Studio
              </h1>
              <p className="text-[8px] font-mono text-white/25 -mt-0.5">
                Audio Level & Mixing Guide
              </p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex items-center gap-0.5 bg-white/3 rounded-xl p-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                text-[10px] font-mono transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white/8 text-white/90 shadow-sm'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/3'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.shortLabel}</span>
            </button>
          ))}
        </nav>

        <div className="text-[8px] font-mono text-white/15">
          v2.0
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
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
