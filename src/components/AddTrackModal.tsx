import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Check, Music, Layers } from 'lucide-react';
import {
  TRACK_DEFS, TRACK_CATEGORIES, BUS_DEFS,
  type TrackType, type TrackCategory, type BusType,
} from '../data';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (type: TrackType) => void;
  onAddCustomTrack: (track: { name: string; type: TrackType; bus: BusType; color: string; currentDb: number }) => void;
}

export function AddTrackModal({ isOpen, onClose, onAddTrack, onAddCustomTrack }: AddTrackModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<TrackCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  // Custom track form state
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<TrackType>('synth');
  const [customBus, setCustomBus] = useState<BusType>('instruments');
  const [customColor, setCustomColor] = useState('#3A86FF');

  if (!isOpen) return null;

  // Category filtering honours the explicit type lists (Indian groups share
  // a category with their Western counterparts).
  const activeCategoryTypes =
    selectedCategory === 'all'
      ? null
      : (TRACK_CATEGORIES.find(c => c.id === selectedCategory)?.types ?? null);

  const filteredTrackTypes = Object.values(TRACK_DEFS).filter(def => {
    const matchesCat =
      selectedCategory === 'all' ||
      (activeCategoryTypes ? activeCategoryTypes.includes(def.type) : def.category === selectedCategory);
    const matchesSearch = def.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.shortLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomTrack({
      name: customName.trim(),
      type: customType,
      bus: customBus,
      color: customColor,
      currentDb: -16,
    });
    setCustomName('');
    onClose();
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
          className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #131929 0%, #0c101d 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(58, 134, 255, 0.1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white/95" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Add Track to Session
                </h3>
                <p className="text-xs text-white/40 font-mono">
                  Select instrument preset or create a custom channel
                </p>
              </div>
            </div>

            {/* Mode switcher */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setActiveTab('preset')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeTab === 'preset' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  activeTab === 'custom' ? 'bg-blue-600 text-white shadow-md' : 'text-white/40 hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {activeTab === 'preset' ? (
            <>
              {/* Filter bar */}
              <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search instruments..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-white/15 text-white font-bold'
                        : 'bg-white/3 text-white/40 hover:bg-white/8 hover:text-white/80'
                    }`}
                  >
                    All ({Object.keys(TRACK_DEFS).length})
                  </button>
                  {TRACK_CATEGORIES.map(cat => (
                    <button
                      key={`${cat.id}-${cat.label}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-white/15 text-white font-bold'
                          : 'bg-white/3 text-white/40 hover:bg-white/8 hover:text-white/80'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.short ?? cat.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Instruments */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredTrackTypes.map(def => {
                    const busDef = BUS_DEFS[def.bus];
                    return (
                      <motion.button
                        key={def.type}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onAddTrack(def.type);
                          onClose();
                        }}
                        className="flex items-start gap-3 p-3 rounded-xl border text-left transition-all group"
                        style={{
                          background: `${def.color}06`,
                          borderColor: `${def.color}20`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 group-hover:scale-110 transition-transform shadow-inner"
                          style={{
                            background: `${def.color}20`,
                            color: def.color,
                            boxShadow: `0 0 12px ${def.color}30`,
                          }}
                        >
                          {def.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-white/90 truncate group-hover:text-white">
                              {def.name}
                            </span>
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                              style={{ background: `${busDef.color}18`, color: busDef.color }}
                            >
                              → {busDef.name.replace(' Bus', '')}
                            </span>
                          </div>

                          <p className="text-[10px] text-white/40 line-clamp-1 mb-1.5 font-sans">
                            {def.description}
                          </p>

                          <div className="flex items-center gap-2 text-[9px] font-mono text-white/30">
                            <span className="text-emerald-400 font-semibold">{def.dbRange[0]} to {def.dbRange[1]} dBFS</span>
                            <span>•</span>
                            <span>{def.frequencyRange}</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {filteredTrackTypes.length === 0 && (
                  <div className="text-center py-12 text-white/30 font-mono text-xs">
                    No matching instruments found for "{searchQuery}"
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Custom track form */
            <form onSubmit={handleCreateCustom} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">Track Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Lead Guitar Solo / Vocal Chop / Synth Arp"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5">Instrument Preset</label>
                  <select
                    value={customType}
                    onChange={e => {
                      const newType = e.target.value as TrackType;
                      setCustomType(newType);
                      setCustomBus(TRACK_DEFS[newType].bus);
                      setCustomColor(TRACK_DEFS[newType].color);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {Object.values(TRACK_DEFS).map(def => (
                      <option key={def.type} value={def.type}>
                        {def.name} ({def.shortLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5">Routing Bus</label>
                  <select
                    value={customBus}
                    onChange={e => setCustomBus(e.target.value as BusType)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {Object.values(BUS_DEFS).filter(b => b.type !== 'mixBus' && b.type !== 'preMaster').map(b => (
                      <option key={b.type} value={b.type}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-2">Track Color Accent</label>
                <div className="flex gap-2 flex-wrap">
                  {['#FF006E', '#EF476F', '#FB5607', '#FF6B35', '#FFD166', '#06D6A0', '#00F5D4', '#3A86FF', '#8338EC', '#FFD700', '#F72585'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomColor(c)}
                      className={`w-7 h-7 rounded-lg transition-transform ${customColor === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Create Custom Track
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30">
            <span>✨ Pre-calibrated for -18 dBFS gain staging</span>
            <button onClick={onClose} className="hover:text-white/60">
              Close (Esc)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
