export type Genre = 'pop' | 'rock' | 'hiphop' | 'electronic' | 'acoustic' | 'cinematic' | 'podcast' | 'custom';

export type TrackType =
  | 'kick' | 'snare' | 'hihat' | 'overheads' | 'toms'
  | 'bass' | 'guitar' | 'piano' | 'synth' | 'pad' | 'strings' | 'brass'
  | 'leadVocal' | 'bgVocal' | 'fx' | 'aux'
  | 'dialogue' | 'sfx' | 'ambient';

export type BusType = 'drums' | 'bass' | 'instruments' | 'vocals' | 'fx' | 'music' | 'dialogue' | 'sfx' | 'mixBus' | 'preMaster';

export type SessionSize = 'small' | 'medium' | 'large';

export type LevelHealth = 'healthy' | 'check' | 'hot';

export interface TrackDef {
  type: TrackType;
  name: string;
  icon: string;
  color: string;
  bus: BusType;
  dbRange: [number, number];
  shortLabel: string;
}

export interface BusDef {
  type: BusType;
  name: string;
  color: string;
  icon: string;
  dbRange: [number, number];
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  color: string;
  icon: string;
  bus: BusType;
  dbRange: [number, number];
  currentDb: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
}

export interface Bus {
  id: string;
  type: BusType;
  name: string;
  color: string;
  icon: string;
  dbRange: [number, number];
  currentDb: number;
  trackIds: string[];
}

export interface GenrePreset {
  genre: Genre;
  name: string;
  icon: string;
  color: string;
  description: string;
  tracks: TrackType[];
}

export const TRACK_DEFS: Record<TrackType, TrackDef> = {
  kick:       { type: 'kick',       name: 'Kick',        icon: '⬤', color: '#FF6B35', bus: 'drums',       dbRange: [-18, -12], shortLabel: 'KK' },
  snare:      { type: 'snare',      name: 'Snare',       icon: '⬤', color: '#FFD166', bus: 'drums',       dbRange: [-18, -12], shortLabel: 'SN' },
  hihat:      { type: 'hihat',      name: 'Hi-Hat',      icon: '◆', color: '#06D6A0', bus: 'drums',       dbRange: [-22, -16], shortLabel: 'HH' },
  overheads:  { type: 'overheads',  name: 'Overheads',   icon: '◇', color: '#2EC4B6', bus: 'drums',       dbRange: [-20, -14], shortLabel: 'OH' },
  toms:       { type: 'toms',       name: 'Toms',        icon: '⬤', color: '#E9C46A', bus: 'drums',       dbRange: [-18, -12], shortLabel: 'TM' },
  bass:       { type: 'bass',       name: 'Bass',        icon: '▬', color: '#118AB2', bus: 'bass',        dbRange: [-18, -12], shortLabel: 'BS' },
  guitar:     { type: 'guitar',     name: 'Guitar',      icon: '♩', color: '#EF476F', bus: 'instruments', dbRange: [-18, -12], shortLabel: 'GT' },
  piano:      { type: 'piano',      name: 'Piano',       icon: '♫', color: '#8338EC', bus: 'instruments', dbRange: [-20, -14], shortLabel: 'PN' },
  synth:      { type: 'synth',      name: 'Synth',       icon: '∿', color: '#3A86FF', bus: 'instruments', dbRange: [-18, -12], shortLabel: 'SY' },
  pad:        { type: 'pad',        name: 'Pad',         icon: '≈', color: '#4361EE', bus: 'instruments', dbRange: [-22, -16], shortLabel: 'PD' },
  strings:    { type: 'strings',    name: 'Strings',     icon: '♪', color: '#7209B7', bus: 'instruments', dbRange: [-20, -14], shortLabel: 'ST' },
  brass:      { type: 'brass',      name: 'Brass',       icon: '♬', color: '#F72585', bus: 'instruments', dbRange: [-18, -12], shortLabel: 'BR' },
  leadVocal:  { type: 'leadVocal',  name: 'Lead Vocal',  icon: '🎤', color: '#FF006E', bus: 'vocals',      dbRange: [-18, -12], shortLabel: 'LV' },
  bgVocal:    { type: 'bgVocal',    name: 'BG Vocal',    icon: '🎤', color: '#FB5607', bus: 'vocals',      dbRange: [-20, -14], shortLabel: 'BV' },
  fx:         { type: 'fx',         name: 'FX',          icon: '✦', color: '#00F5D4', bus: 'fx',          dbRange: [-24, -18], shortLabel: 'FX' },
  aux:        { type: 'aux',        name: 'Aux/FX',      icon: '✧', color: '#4CC9F0', bus: 'fx',          dbRange: [-22, -16], shortLabel: 'AX' },
  dialogue:   { type: 'dialogue',   name: 'Dialogue',    icon: '💬', color: '#FF006E', bus: 'dialogue',    dbRange: [-18, -12], shortLabel: 'DX' },
  sfx:        { type: 'sfx',        name: 'SFX',         icon: '💥', color: '#00F5D4', bus: 'sfx',         dbRange: [-24, -18], shortLabel: 'SX' },
  ambient:    { type: 'ambient',    name: 'Ambient',     icon: '🌊', color: '#2EC4B6', bus: 'sfx',         dbRange: [-26, -20], shortLabel: 'AM' },
};

export const BUS_DEFS: Record<BusType, BusDef> = {
  drums:       { type: 'drums',       name: 'Drum Bus',       color: '#FF9F1C', icon: '🥁', dbRange: [-6, -3] },
  bass:        { type: 'bass',        name: 'Bass Bus',       color: '#07BEB8', icon: '🎸', dbRange: [-6, -3] },
  instruments: { type: 'instruments', name: 'Instrument Bus', color: '#7B2CBF', icon: '🎹', dbRange: [-6, -3] },
  vocals:      { type: 'vocals',      name: 'Vocal Bus',      color: '#E63946', icon: '🎤', dbRange: [-6, -3] },
  fx:          { type: 'fx',          name: 'FX Bus',         color: '#2EC4B6', icon: '✦',  dbRange: [-8, -4] },
  music:       { type: 'music',       name: 'Music Bus',      color: '#6A4C93', icon: '🎵', dbRange: [-6, -3] },
  dialogue:    { type: 'dialogue',    name: 'Dialogue Bus',   color: '#FF006E', icon: '💬', dbRange: [-6, -3] },
  sfx:         { type: 'sfx',         name: 'SFX Bus',        color: '#00F5D4', icon: '💥', dbRange: [-8, -4] },
  mixBus:      { type: 'mixBus',      name: 'Mix Bus',        color: '#FFD700', icon: 'Σ',  dbRange: [-3, -1] },
  preMaster:   { type: 'preMaster',   name: 'Pre-Master',     color: '#FFFFFF', icon: '◉',  dbRange: [-1, -0.3] },
};

export const GENRE_PRESETS: GenrePreset[] = [
  {
    genre: 'pop',
    name: 'Pop',
    icon: '🎵',
    color: '#FF006E',
    description: 'Clean, polished sound',
    tracks: ['kick', 'snare', 'hihat', 'bass', 'guitar', 'piano', 'synth', 'leadVocal', 'bgVocal', 'bgVocal', 'fx'],
  },
  {
    genre: 'rock',
    name: 'Rock',
    icon: '🎸',
    color: '#EF476F',
    description: 'Big, powerful energy',
    tracks: ['kick', 'snare', 'hihat', 'overheads', 'toms', 'bass', 'guitar', 'guitar', 'leadVocal', 'bgVocal', 'fx'],
  },
  {
    genre: 'hiphop',
    name: 'Hip-Hop',
    icon: '🎤',
    color: '#FB5607',
    description: 'Heavy low-end, tight drums',
    tracks: ['kick', 'snare', 'hihat', 'hihat', 'bass', 'synth', 'synth', 'leadVocal', 'leadVocal', 'bgVocal', 'fx'],
  },
  {
    genre: 'electronic',
    name: 'Electronic',
    icon: '🎛️',
    color: '#3A86FF',
    description: 'Synths, beats, and space',
    tracks: ['kick', 'snare', 'hihat', 'hihat', 'bass', 'synth', 'synth', 'synth', 'pad', 'fx', 'fx', 'aux'],
  },
  {
    genre: 'acoustic',
    name: 'Acoustic',
    icon: '🎻',
    color: '#8338EC',
    description: 'Natural, intimate feel',
    tracks: ['kick', 'snare', 'overheads', 'bass', 'guitar', 'guitar', 'piano', 'leadVocal', 'bgVocal'],
  },
  {
    genre: 'cinematic',
    name: 'Cinematic',
    icon: '🎬',
    color: '#FFD700',
    description: 'Epic, immersive soundscapes',
    tracks: ['kick', 'snare', 'hihat', 'overheads', 'bass', 'strings', 'strings', 'brass', 'synth', 'pad', 'pad', 'fx', 'fx', 'ambient'],
  },
  {
    genre: 'podcast',
    name: 'Podcast',
    icon: '🎙️',
    color: '#06D6A0',
    description: 'Clear speech, minimal music',
    tracks: ['dialogue', 'dialogue', 'sfx', 'ambient'],
  },
  {
    genre: 'custom',
    name: 'Custom',
    icon: '✨',
    color: '#4CC9F0',
    description: 'Build your own session',
    tracks: [],
  },
];

export const AVAILABLE_TRACK_TYPES: TrackType[] = [
  'kick', 'snare', 'hihat', 'overheads', 'toms',
  'bass', 'guitar', 'piano', 'synth', 'pad', 'strings', 'brass',
  'leadVocal', 'bgVocal', 'fx', 'aux',
  'dialogue', 'sfx', 'ambient',
];

export function getLevelHealth(db: number, range: [number, number]): LevelHealth {
  if (db > -3) return 'hot';
  if (db >= range[0] && db <= range[1]) return 'healthy';
  if (db > range[1] && db <= -3) return 'check';
  if (db < range[0] - 6) return 'check';
  return 'healthy';
}

export function getHealthLabel(health: LevelHealth): string {
  switch (health) {
    case 'healthy': return 'GOOD HEADROOM';
    case 'check': return 'CHECK';
    case 'hot': return 'TOO HOT!';
  }
}

export function getHealthColor(health: LevelHealth): string {
  switch (health) {
    case 'healthy': return '#06D6A0';
    case 'check': return '#FFD166';
    case 'hot': return '#EF476F';
  }
}

let idCounter = 0;
export function genId(): string {
  return `track-${++idCounter}-${Date.now()}`;
}

export function createTrack(type: TrackType): Track {
  const def = TRACK_DEFS[type];
  const midDb = Math.round((def.dbRange[0] + def.dbRange[1]) / 2);
  return {
    id: genId(),
    type: def.type,
    name: def.name,
    color: def.color,
    icon: def.icon,
    bus: def.bus,
    dbRange: def.dbRange,
    currentDb: midDb,
    pan: 0,
    muted: false,
    soloed: false,
  };
}

export function getBusTypeForTracks(tracks: Track[], size: SessionSize): BusType[] {
  const busTypes = new Set(tracks.map(t => t.bus));
  const result: BusType[] = [];
  
  if (busTypes.has('drums')) result.push('drums');
  if (busTypes.has('bass')) result.push('bass');
  if (busTypes.has('instruments')) result.push('instruments');
  if (busTypes.has('vocals')) result.push('vocals');
  if (busTypes.has('fx')) result.push('fx');
  if (busTypes.has('dialogue')) result.push('dialogue');
  if (busTypes.has('sfx')) result.push('sfx');
  
  // For large sessions, add a music bus that wraps instruments + drums
  if (size === 'large' && result.includes('drums') && result.includes('instruments')) {
    // Keep separate but could add music bus as wrapper
  }
  
  return result;
}

export const FOLLOW_STEPS = [
  { id: 0, title: 'Individual Tracks', description: 'Each sound is recorded on its own track', icon: '🎵' },
  { id: 1, title: 'Grouped Together', description: 'Similar tracks are combined into groups', icon: '📦' },
  { id: 2, title: 'Balanced in the Mix', description: 'All groups flow into the Mix Bus', icon: '⚖️' },
  { id: 3, title: 'Ready for Mastering', description: 'The final mix goes to Pre-Master', icon: '✨' },
];
