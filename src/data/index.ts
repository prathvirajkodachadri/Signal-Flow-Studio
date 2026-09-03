export type Genre = 'pop' | 'rock' | 'hiphop' | 'electronic' | 'acoustic' | 'cinematic' | 'podcast' | 'custom';

export type TrackCategory = 'drums' | 'bass' | 'instruments' | 'vocals' | 'fx' | 'speech';

export type TrackType =
  | 'kick' | 'snare' | 'hihat' | 'overheads' | 'toms' | 'percussion'
  | 'bass' | 'subBass' | 'synthBass'
  | 'guitar' | 'acousticGuitar' | 'piano' | 'synth' | 'pad' | 'strings' | 'brass'
  | 'leadVocal' | 'bgVocal' | 'harmony' | 'adlibs'
  | 'fx' | 'aux' | 'reverbReturn' | 'delayReturn'
  | 'dialogue' | 'hostVocal' | 'guestVocal' | 'sfx' | 'ambient' | 'foley';

export type BusType = 'drums' | 'bass' | 'instruments' | 'vocals' | 'fx' | 'music' | 'dialogue' | 'sfx' | 'mixBus' | 'preMaster';

export type SessionSize = 'small' | 'medium' | 'large';

export type LevelHealth = 'healthy' | 'check' | 'hot' | 'low';

export interface PluginSlot {
  name: string;
  type: 'gain' | 'eq' | 'comp' | 'sat' | 'reverb' | 'delay' | 'limiter';
  enabled: boolean;
  param?: string;
}

export interface TrackDef {
  type: TrackType;
  name: string;
  category: TrackCategory;
  icon: string;
  color: string;
  bus: BusType;
  dbRange: [number, number];
  targetPeak: number;
  targetRms: number;
  shortLabel: string;
  frequencyRange: string;
  panDefault: number;
  description: string;
  suggestedPlugins: PluginSlot[];
}

export interface BusDef {
  type: BusType;
  name: string;
  color: string;
  icon: string;
  dbRange: [number, number];
  targetPeak: number;
  description: string;
  suggestedPlugins: PluginSlot[];
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
  gainTrimDb: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  isStereo: boolean;
  plugins: PluginSlot[];
  notes?: string;
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
  plugins: PluginSlot[];
}

export interface GenrePreset {
  genre: Genre;
  name: string;
  icon: string;
  color: string;
  description: string;
  bpm: number;
  key: string;
  tracks: TrackType[];
}

export const TRACK_DEFS: Record<TrackType, TrackDef> = {
  // DRUMS
  kick: {
    type: 'kick',
    name: 'Kick Drum',
    category: 'drums',
    icon: '⬤',
    color: '#FF6B35',
    bus: 'drums',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -18,
    shortLabel: 'KK',
    frequencyRange: '30 Hz – 4 kHz',
    panDefault: 0,
    description: 'Foundation low punch; keep peaks clean to preserve headroom.',
    suggestedPlugins: [
      { name: 'HPF 30Hz', type: 'eq', enabled: true, param: '30 Hz cut' },
      { name: 'Punch Comp', type: 'comp', enabled: true, param: '4:1 30ms atk' },
      { name: 'Sub Saturation', type: 'sat', enabled: false, param: 'Tape 2dB' },
    ],
  },
  snare: {
    type: 'snare',
    name: 'Snare Top',
    category: 'drums',
    icon: '⬤',
    color: '#FFD166',
    bus: 'drums',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -19,
    shortLabel: 'SN',
    frequencyRange: '120 Hz – 10 kHz',
    panDefault: 0,
    description: 'High dynamic transient; needs 12-18 dB headroom.',
    suggestedPlugins: [
      { name: 'Tone EQ', type: 'eq', enabled: true, param: '+2dB 4kHz' },
      { name: 'VCA Snap', type: 'comp', enabled: true, param: '3:1 med' },
    ],
  },
  hihat: {
    type: 'hihat',
    name: 'Hi-Hat',
    category: 'drums',
    icon: '◆',
    color: '#06D6A0',
    bus: 'drums',
    dbRange: [-22, -16],
    targetPeak: -16,
    targetRms: -24,
    shortLabel: 'HH',
    frequencyRange: '3 kHz – 16 kHz',
    panDefault: 0.25,
    description: 'High frequencies can easily overpower; keep moderate.',
    suggestedPlugins: [
      { name: 'HPF 300Hz', type: 'eq', enabled: true, param: 'Cut lows' },
      { name: 'Gentle Opto', type: 'comp', enabled: false, param: '2:1' },
    ],
  },
  overheads: {
    type: 'overheads',
    name: 'Drum Overheads',
    category: 'drums',
    icon: '◇',
    color: '#2EC4B6',
    bus: 'drums',
    dbRange: [-20, -14],
    targetPeak: -14,
    targetRms: -21,
    shortLabel: 'OH',
    frequencyRange: '80 Hz – 20 kHz',
    panDefault: 0,
    description: 'Stereo cymbal and room balance with wide dynamic range.',
    suggestedPlugins: [
      { name: 'Air EQ', type: 'eq', enabled: true, param: '+1.5dB 10k' },
      { name: 'FET Glue', type: 'comp', enabled: false, param: '2:1 slow' },
    ],
  },
  toms: {
    type: 'toms',
    name: 'Rack & Floor Toms',
    category: 'drums',
    icon: '⬤',
    color: '#E9C46A',
    bus: 'drums',
    dbRange: [-18, -12],
    targetPeak: -13,
    targetRms: -20,
    shortLabel: 'TM',
    frequencyRange: '80 Hz – 6 kHz',
    panDefault: -0.3,
    description: 'Dynamic resonant hits; gate or tame long rings.',
    suggestedPlugins: [
      { name: 'Gate / Expander', type: 'comp', enabled: true, param: '-30dB' },
      { name: 'Body EQ', type: 'eq', enabled: true, param: '+2dB 100Hz' },
    ],
  },
  percussion: {
    type: 'percussion',
    name: 'Percussion / Shaker',
    category: 'drums',
    icon: '◆',
    color: '#14B8A6',
    bus: 'drums',
    dbRange: [-22, -16],
    targetPeak: -16,
    targetRms: -23,
    shortLabel: 'PR',
    frequencyRange: '200 Hz – 15 kHz',
    panDefault: 0.4,
    description: 'Rhythmic movement; sit slightly behind lead elements.',
    suggestedPlugins: [
      { name: 'HPF 200Hz', type: 'eq', enabled: true, param: '200 Hz cut' },
    ],
  },

  // BASS
  bass: {
    type: 'bass',
    name: 'Electric Bass DI',
    category: 'bass',
    icon: '▬',
    color: '#118AB2',
    bus: 'bass',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -16,
    shortLabel: 'BS',
    frequencyRange: '40 Hz – 4 kHz',
    panDefault: 0,
    description: 'Core low-end anchor. Steady RMS level prevents mix pumping.',
    suggestedPlugins: [
      { name: 'Opto Leveler', type: 'comp', enabled: true, param: 'LA-2A 4dB GR' },
      { name: 'Low Lock EQ', type: 'eq', enabled: true, param: 'Dip 300Hz' },
      { name: 'Tube Warmth', type: 'sat', enabled: true, param: 'Sat 3dB' },
    ],
  },
  subBass: {
    type: 'subBass',
    name: '808 / Sub Bass',
    category: 'bass',
    icon: '▬',
    color: '#0EA5E9',
    bus: 'bass',
    dbRange: [-16, -10],
    targetPeak: -10,
    targetRms: -14,
    shortLabel: '808',
    frequencyRange: '25 Hz – 150 Hz',
    panDefault: 0,
    description: 'Heavy energy below 80 Hz. Strict mono routing is best.',
    suggestedPlugins: [
      { name: 'Mono Maker', type: 'eq', enabled: true, param: 'Mono < 100Hz' },
      { name: 'Soft Clipper', type: 'sat', enabled: true, param: 'Drive 2dB' },
    ],
  },
  synthBass: {
    type: 'synthBass',
    name: 'Synth Bass',
    category: 'bass',
    icon: '▬',
    color: '#06B6D4',
    bus: 'bass',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -16,
    shortLabel: 'SB',
    frequencyRange: '35 Hz – 6 kHz',
    panDefault: 0,
    description: 'Harmonic low-end with resonant filter movements.',
    suggestedPlugins: [
      { name: 'Sidechain Comp', type: 'comp', enabled: true, param: 'Ducked by KK' },
      { name: 'Drive Sat', type: 'sat', enabled: false, param: 'Overdrive' },
    ],
  },

  // INSTRUMENTS
  guitar: {
    type: 'guitar',
    name: 'Electric Guitar',
    category: 'instruments',
    icon: '♩',
    color: '#EF476F',
    bus: 'instruments',
    dbRange: [-18, -12],
    targetPeak: -14,
    targetRms: -19,
    shortLabel: 'GT',
    frequencyRange: '100 Hz – 8 kHz',
    panDefault: -0.6,
    description: 'Midrange driver; pan wide to make room for lead vocals.',
    suggestedPlugins: [
      { name: 'Mid Carve EQ', type: 'eq', enabled: true, param: 'Dip 1.5kHz' },
      { name: 'Cab Sim', type: 'sat', enabled: true, param: '4x12 Vintage' },
    ],
  },
  acousticGuitar: {
    type: 'acousticGuitar',
    name: 'Acoustic Guitar',
    category: 'instruments',
    icon: '♩',
    color: '#F97316',
    bus: 'instruments',
    dbRange: [-20, -14],
    targetPeak: -14,
    targetRms: -20,
    shortLabel: 'AG',
    frequencyRange: '80 Hz – 14 kHz',
    panDefault: 0.5,
    description: 'Bright percussive pick attack; high pass around 90 Hz.',
    suggestedPlugins: [
      { name: 'HPF 90Hz', type: 'eq', enabled: true, param: 'Clean low boom' },
      { name: 'Fast Comp', type: 'comp', enabled: true, param: '2:1 light' },
    ],
  },
  piano: {
    type: 'piano',
    name: 'Acoustic Piano',
    category: 'instruments',
    icon: '♫',
    color: '#8338EC',
    bus: 'instruments',
    dbRange: [-20, -14],
    targetPeak: -14,
    targetRms: -22,
    shortLabel: 'PN',
    frequencyRange: '40 Hz – 12 kHz',
    panDefault: 0,
    description: 'Huge dynamic range from gentle chords to fortissimo peaks.',
    suggestedPlugins: [
      { name: 'Surgical EQ', type: 'eq', enabled: true, param: 'Dip 250Hz low-mid' },
      { name: 'Vari-Mu Comp', type: 'comp', enabled: false, param: 'Smooth dynamic' },
    ],
  },
  synth: {
    type: 'synth',
    name: 'Poly Synth',
    category: 'instruments',
    icon: '∿',
    color: '#3A86FF',
    bus: 'instruments',
    dbRange: [-18, -12],
    targetPeak: -13,
    targetRms: -18,
    shortLabel: 'SY',
    frequencyRange: '60 Hz – 15 kHz',
    panDefault: 0.3,
    description: 'Harmonically rich; watch resonance peaks at filter sweeps.',
    suggestedPlugins: [
      { name: 'Stereo Chorus', type: 'reverb', enabled: true, param: 'Dimension D' },
      { name: 'Sidechain Duck', type: 'comp', enabled: false, param: 'Pump 2dB' },
    ],
  },
  pad: {
    type: 'pad',
    name: 'Atmospheric Pad',
    category: 'instruments',
    icon: '≈',
    color: '#4361EE',
    bus: 'instruments',
    dbRange: [-22, -16],
    targetPeak: -16,
    targetRms: -22,
    shortLabel: 'PD',
    frequencyRange: '100 Hz – 10 kHz',
    panDefault: 0,
    description: 'Sustained stereo glue; keep back in the mix.',
    suggestedPlugins: [
      { name: 'Lush Shimmer', type: 'reverb', enabled: true, param: '3.5s Space' },
      { name: 'HPF 150Hz', type: 'eq', enabled: true, param: 'Mud cut' },
    ],
  },
  strings: {
    type: 'strings',
    name: 'Orchestral Strings',
    category: 'instruments',
    icon: '♪',
    color: '#7209B7',
    bus: 'instruments',
    dbRange: [-20, -14],
    targetPeak: -14,
    targetRms: -22,
    shortLabel: 'ST',
    frequencyRange: '60 Hz – 16 kHz',
    panDefault: -0.4,
    description: 'Expressive swells; preserve natural acoustic dynamics.',
    suggestedPlugins: [
      { name: 'Warm Plate', type: 'reverb', enabled: true, param: '2.2s Plate' },
    ],
  },
  brass: {
    type: 'brass',
    name: 'Brass Section',
    category: 'instruments',
    icon: '♬',
    color: '#F72585',
    bus: 'instruments',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -18,
    shortLabel: 'BR',
    frequencyRange: '100 Hz – 12 kHz',
    panDefault: 0.4,
    description: 'Punchy brass stabs; control harsh 3-5 kHz spikes.',
    suggestedPlugins: [
      { name: 'De-Harsh EQ', type: 'eq', enabled: true, param: 'Dynamic dip 3.5k' },
      { name: 'FET 1176', type: 'comp', enabled: true, param: '4:1 fast peak' },
    ],
  },

  // VOCALS
  leadVocal: {
    type: 'leadVocal',
    name: 'Lead Vocal',
    category: 'vocals',
    icon: '🎤',
    color: '#FF006E',
    bus: 'vocals',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -16,
    shortLabel: 'LV',
    frequencyRange: '100 Hz – 18 kHz',
    panDefault: 0,
    description: 'Centerpiece element. Target -18 to -12 dBFS for clean 2-stage compression.',
    suggestedPlugins: [
      { name: 'HPF 85Hz + Air', type: 'eq', enabled: true, param: 'Cut 85Hz + 12k' },
      { name: 'De-Esser', type: 'comp', enabled: true, param: 'Tame 6.5k sibilance' },
      { name: 'Opto + FET Comp', type: 'comp', enabled: true, param: '2-Stage leveling' },
      { name: 'Analog Tape', type: 'sat', enabled: true, param: 'Warm sheen' },
    ],
  },
  bgVocal: {
    type: 'bgVocal',
    name: 'Backing Vocals',
    category: 'vocals',
    icon: '🎤',
    color: '#FB5607',
    bus: 'vocals',
    dbRange: [-20, -14],
    targetPeak: -15,
    targetRms: -21,
    shortLabel: 'BV',
    frequencyRange: '120 Hz – 15 kHz',
    panDefault: -0.6,
    description: 'Harmonies panned wide; tuck 3–6 dB beneath the lead vocal.',
    suggestedPlugins: [
      { name: 'Bandpass EQ', type: 'eq', enabled: true, param: 'Cut low/high' },
      { name: 'Vocal Glue Comp', type: 'comp', enabled: true, param: '4:1 smooth' },
    ],
  },
  harmony: {
    type: 'harmony',
    name: 'Vocal Harmonies',
    category: 'vocals',
    icon: '🎤',
    color: '#EA580C',
    bus: 'vocals',
    dbRange: [-22, -16],
    targetPeak: -16,
    targetRms: -22,
    shortLabel: 'HM',
    frequencyRange: '150 Hz – 14 kHz',
    panDefault: 0.6,
    description: 'Tightly doubled harmonies creating stereo spread.',
    suggestedPlugins: [
      { name: 'Stereo Widener', type: 'reverb', enabled: true, param: 'MicroPitch' },
    ],
  },
  adlibs: {
    type: 'adlibs',
    name: 'Ad-Libs / Chants',
    category: 'vocals',
    icon: '✨',
    color: '#F43F5E',
    bus: 'vocals',
    dbRange: [-22, -16],
    targetPeak: -16,
    targetRms: -23,
    shortLabel: 'AD',
    frequencyRange: '200 Hz – 12 kHz',
    panDefault: 0.3,
    description: 'Effected background remarks; heavier delay/reverb.',
    suggestedPlugins: [
      { name: 'Telephone EQ', type: 'eq', enabled: true, param: '300-3.5k Band' },
      { name: 'Echo Tape', type: 'delay', enabled: true, param: '1/8d Ping-pong' },
    ],
  },

  // FX & AUX
  fx: {
    type: 'fx',
    name: 'Impacts / FX',
    category: 'fx',
    icon: '✦',
    color: '#00F5D4',
    bus: 'fx',
    dbRange: [-24, -18],
    targetPeak: -16,
    targetRms: -24,
    shortLabel: 'FX',
    frequencyRange: '40 Hz – 20 kHz',
    panDefault: 0,
    description: 'Risers, downlifters, sweeps; keep controlled.',
    suggestedPlugins: [
      { name: 'Sidechain Duck', type: 'comp', enabled: true, param: 'Drop 4dB on hit' },
    ],
  },
  aux: {
    type: 'aux',
    name: 'Aux / Parallel',
    category: 'fx',
    icon: '✧',
    color: '#4CC9F0',
    bus: 'fx',
    dbRange: [-22, -16],
    targetPeak: -18,
    targetRms: -24,
    shortLabel: 'AX',
    frequencyRange: 'Full Band',
    panDefault: 0,
    description: 'Parallel processing bus return (crush, distortion, exciter).',
    suggestedPlugins: [
      { name: 'Devil-Loc Crush', type: 'sat', enabled: true, param: 'Heavy Smash' },
    ],
  },
  reverbReturn: {
    type: 'reverbReturn',
    name: 'Main Reverb Aux',
    category: 'fx',
    icon: '🌊',
    color: '#38BDF8',
    bus: 'fx',
    dbRange: [-24, -18],
    targetPeak: -18,
    targetRms: -25,
    shortLabel: 'RV',
    frequencyRange: '100 Hz – 12 kHz',
    panDefault: 0,
    description: '100% Wet hall / plate auxiliary send return.',
    suggestedPlugins: [
      { name: 'Abbey Road HP/LP', type: 'eq', enabled: true, param: 'Cut <600, >10k' },
      { name: 'Lexicon 480L Hall', type: 'reverb', enabled: true, param: '2.4s Hall' },
    ],
  },
  delayReturn: {
    type: 'delayReturn',
    name: 'Tempo Delay Aux',
    category: 'fx',
    icon: '⌛',
    color: '#818CF8',
    bus: 'fx',
    dbRange: [-24, -18],
    targetPeak: -18,
    targetRms: -26,
    shortLabel: 'DL',
    frequencyRange: '200 Hz – 8 kHz',
    panDefault: 0,
    description: '100% Wet sync delay with feedback filter.',
    suggestedPlugins: [
      { name: 'Tape Delay', type: 'delay', enabled: true, param: '1/4 Dot 35% FB' },
    ],
  },

  // SPEECH & POST
  dialogue: {
    type: 'dialogue',
    name: 'Dialogue Track',
    category: 'speech',
    icon: '💬',
    color: '#FF006E',
    bus: 'dialogue',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -18,
    shortLabel: 'DX',
    frequencyRange: '80 Hz – 14 kHz',
    panDefault: 0,
    description: 'Speech intelligibility is priority; consistent RMS level.',
    suggestedPlugins: [
      { name: 'Voice HPF 80Hz', type: 'eq', enabled: true, param: 'Plosive filter' },
      { name: 'Leveler Comp', type: 'comp', enabled: true, param: 'Speech AGC' },
      { name: 'De-Roomer', type: 'eq', enabled: false, param: 'Ambience tame' },
    ],
  },
  hostVocal: {
    type: 'hostVocal',
    name: 'Host Mic',
    category: 'speech',
    icon: '🎙️',
    color: '#EC4899',
    bus: 'dialogue',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -18,
    shortLabel: 'HST',
    frequencyRange: '80 Hz – 15 kHz',
    panDefault: 0,
    description: 'Primary podcast host voice.',
    suggestedPlugins: [
      { name: 'Broadcaster EQ', type: 'eq', enabled: true, param: 'Warm low body' },
      { name: 'Expander Gate', type: 'comp', enabled: true, param: 'Tame bleed' },
    ],
  },
  guestVocal: {
    type: 'guestVocal',
    name: 'Guest Mic',
    category: 'speech',
    icon: '🎙️',
    color: '#F43F5E',
    bus: 'dialogue',
    dbRange: [-18, -12],
    targetPeak: -12,
    targetRms: -18,
    shortLabel: 'GST',
    frequencyRange: '80 Hz – 15 kHz',
    panDefault: 0,
    description: 'Remote or co-host voice; match tone to host.',
    suggestedPlugins: [
      { name: 'Auto Leveler', type: 'comp', enabled: true, param: 'Smooth peaks' },
    ],
  },
  sfx: {
    type: 'sfx',
    name: 'Sound Effects',
    category: 'speech',
    icon: '💥',
    color: '#00F5D4',
    bus: 'sfx',
    dbRange: [-24, -18],
    targetPeak: -16,
    targetRms: -24,
    shortLabel: 'SX',
    frequencyRange: '50 Hz – 18 kHz',
    panDefault: 0,
    description: 'Spot effects, transitions, stingers.',
    suggestedPlugins: [
      { name: 'Peak Limiter', type: 'limiter', enabled: true, param: 'Ceiling -6dB' },
    ],
  },
  ambient: {
    type: 'ambient',
    name: 'Room Tone / Ambience',
    category: 'speech',
    icon: '🌊',
    color: '#2EC4B6',
    bus: 'sfx',
    dbRange: [-28, -22],
    targetPeak: -22,
    targetRms: -28,
    shortLabel: 'AM',
    frequencyRange: '40 Hz – 12 kHz',
    panDefault: 0,
    description: 'Subtle atmospheric bed; sits gently underneath dialogue.',
    suggestedPlugins: [
      { name: 'Smooth High Cut', type: 'eq', enabled: true, param: 'Roll off 8k' },
    ],
  },
  foley: {
    type: 'foley',
    name: 'Foley Actions',
    category: 'speech',
    icon: '👣',
    color: '#10B981',
    bus: 'sfx',
    dbRange: [-24, -18],
    targetPeak: -18,
    targetRms: -26,
    shortLabel: 'FL',
    frequencyRange: '100 Hz – 16 kHz',
    panDefault: 0.1,
    description: 'Footsteps, clothes, prop rustles.',
    suggestedPlugins: [
      { name: 'Dynamic Notch', type: 'eq', enabled: false, param: 'Tame clicks' },
    ],
  },
};

export const BUS_DEFS: Record<BusType, BusDef> = {
  drums: {
    type: 'drums',
    name: 'Drum Bus',
    color: '#FF9F1C',
    icon: '🥁',
    dbRange: [-6, -3],
    targetPeak: -4,
    description: 'Sums all kit channels. Add glue compression to unify transient punch.',
    suggestedPlugins: [
      { name: 'SSL G-Master Glue', type: 'comp', enabled: true, param: '4:1 30ms atk 0.1s rel (2dB GR)' },
      { name: 'Pultec Low-End', type: 'eq', enabled: true, param: '+2dB 60Hz Boost/Atten' },
    ],
  },
  bass: {
    type: 'bass',
    name: 'Bass Bus',
    color: '#07BEB8',
    icon: '🎸',
    dbRange: [-6, -3],
    targetPeak: -5,
    description: 'Solidifies low-end foundation. Keeps bass mono and locked with kick.',
    suggestedPlugins: [
      { name: 'Sidechain Dynamic EQ', type: 'eq', enabled: true, param: 'Dips 60Hz when Kick strikes' },
      { name: 'Tape Saturation', type: 'sat', enabled: true, param: 'Harmonic 2nd order' },
    ],
  },
  instruments: {
    type: 'instruments',
    name: 'Instrument Bus',
    color: '#7B2CBF',
    icon: '🎹',
    dbRange: [-6, -3],
    targetPeak: -4.5,
    description: 'Music bed containing synths, guitars, keys, and orchestral elements.',
    suggestedPlugins: [
      { name: 'Mid/Side EQ', type: 'eq', enabled: true, param: 'Carve Mid 1kHz for Vocals' },
      { name: 'Gentle Bus Comp', type: 'comp', enabled: true, param: '2:1 Auto Release' },
    ],
  },
  vocals: {
    type: 'vocals',
    name: 'Vocal Bus',
    color: '#E63946',
    icon: '🎤',
    dbRange: [-6, -3],
    targetPeak: -3.5,
    description: 'Sums lead, harmonies, and backing vocals. Glue into a single vocal entity.',
    suggestedPlugins: [
      { name: 'Vocal Bus Comp', type: 'comp', enabled: true, param: '2:1 Gentle Glue (1.5dB GR)' },
      { name: 'Air Shimmer EQ', type: 'eq', enabled: true, param: '+1.5dB 14kHz Silk' },
      { name: 'Analog Tape', type: 'sat', enabled: true, param: 'Subtle 15 IPS' },
    ],
  },
  fx: {
    type: 'fx',
    name: 'FX & Time Bus',
    color: '#2EC4B6',
    icon: '✦',
    dbRange: [-8, -4],
    targetPeak: -6,
    description: 'Receives auxiliary reverbs, tempo delays, and transition sweeps.',
    suggestedPlugins: [
      { name: 'Duck Reverb on Vocals', type: 'comp', enabled: true, param: 'Sidechain Duck 3dB' },
      { name: 'Stereo Widener', type: 'eq', enabled: true, param: '120% Width' },
    ],
  },
  music: {
    type: 'music',
    name: 'Music Bed Bus',
    color: '#6A4C93',
    icon: '🎵',
    dbRange: [-6, -3],
    targetPeak: -4,
    description: 'Master grouping of all non-speech musical elements.',
    suggestedPlugins: [
      { name: 'Auto-Duck on Speech', type: 'comp', enabled: true, param: 'Ducks 6dB on Voice' },
    ],
  },
  dialogue: {
    type: 'dialogue',
    name: 'Dialogue Bus',
    color: '#FF006E',
    icon: '💬',
    dbRange: [-6, -3],
    targetPeak: -4,
    description: 'Speech stem for podcast or video production.',
    suggestedPlugins: [
      { name: 'Broadcast Limiter', type: 'limiter', enabled: true, param: 'Ceiling -2dBFS' },
      { name: 'Speech De-Esser', type: 'comp', enabled: true, param: 'Wide 5-8k' },
    ],
  },
  sfx: {
    type: 'sfx',
    name: 'SFX Bus',
    color: '#00F5D4',
    icon: '💥',
    dbRange: [-8, -4],
    targetPeak: -6,
    description: 'Sound effects, foley, and atmospheric background layers.',
    suggestedPlugins: [
      { name: 'Dynamic Room Limiter', type: 'limiter', enabled: true, param: 'Ceiling -4dB' },
    ],
  },
  mixBus: {
    type: 'mixBus',
    name: 'Mix Bus (2-Bus)',
    color: '#FFD700',
    icon: 'Σ',
    dbRange: [-6, -3],
    targetPeak: -3,
    description: 'The master summing point for all buses. Target -6 to -3 dBFS peak to leave 3-6 dB clean headroom for mastering.',
    suggestedPlugins: [
      { name: 'Master Bus Compressor', type: 'comp', enabled: true, param: '2:1, 30ms atk, 0.1s rel (1-2dB GR)' },
      { name: 'Mix Finishing EQ', type: 'eq', enabled: true, param: 'Subtle Baxandall curve' },
      { name: 'Analog Saturation', type: 'sat', enabled: false, param: 'Transformer Drive' },
    ],
  },
  preMaster: {
    type: 'preMaster',
    name: 'Pre-Master & Output',
    color: '#FFFFFF',
    icon: '◉',
    dbRange: [-1, -0.3],
    targetPeak: -1.0,
    description: 'Final capture stage before DAC monitors or mastering export. Peak target -1.0 dBTP to avoid inter-sample clipping.',
    suggestedPlugins: [
      { name: 'True Peak Limiter', type: 'limiter', enabled: true, param: 'Ceiling -1.0 dBTP' },
      { name: 'EBU R128 / LUFS Meter', type: 'gain', enabled: true, param: '-14 LUFS Target' },
      { name: 'Dither 24-to-16', type: 'gain', enabled: false, param: 'TPDF Dither' },
    ],
  },
};

export const GENRE_PRESETS: GenrePreset[] = [
  {
    genre: 'pop',
    name: 'Pop Production',
    icon: '🎵',
    color: '#FF006E',
    description: 'Polished, punchy, vocal-forward mix with bright instruments',
    bpm: 124,
    key: 'C Major',
    tracks: ['kick', 'snare', 'hihat', 'bass', 'acousticGuitar', 'piano', 'synth', 'leadVocal', 'bgVocal', 'harmony', 'fx', 'reverbReturn'],
  },
  {
    genre: 'rock',
    name: 'Rock / Alt',
    icon: '🎸',
    color: '#EF476F',
    description: 'Heavy energetic drums, roaring guitars, driving bassline',
    bpm: 138,
    key: 'E Minor',
    tracks: ['kick', 'snare', 'hihat', 'overheads', 'toms', 'bass', 'guitar', 'guitar', 'leadVocal', 'bgVocal', 'reverbReturn'],
  },
  {
    genre: 'hiphop',
    name: 'Hip-Hop / Trap',
    icon: '🎤',
    color: '#FB5607',
    description: 'Earth-shaking 808s, rapid hi-hats, crisp front vocal',
    bpm: 140,
    key: 'F Minor',
    tracks: ['kick', 'snare', 'hihat', 'subBass', 'synth', 'synth', 'leadVocal', 'adlibs', 'fx'],
  },
  {
    genre: 'electronic',
    name: 'EDM / Electronic',
    icon: '🎛️',
    color: '#3A86FF',
    description: 'Dense synthesizers, sidechained pump, expansive space FX',
    bpm: 128,
    key: 'A Minor',
    tracks: ['kick', 'snare', 'hihat', 'synthBass', 'synth', 'synth', 'pad', 'leadVocal', 'fx', 'reverbReturn', 'delayReturn'],
  },
  {
    genre: 'acoustic',
    name: 'Acoustic / Indie',
    icon: '🎻',
    color: '#8338EC',
    description: 'Warm, dynamic, intimate acoustic instruments with open air',
    bpm: 96,
    key: 'G Major',
    tracks: ['kick', 'snare', 'overheads', 'bass', 'acousticGuitar', 'piano', 'strings', 'leadVocal', 'bgVocal'],
  },
  {
    genre: 'cinematic',
    name: 'Cinematic Score',
    icon: '🎬',
    color: '#FFD700',
    description: 'Epic orchestral strings, brass stabs, sub impact, rich ambience',
    bpm: 80,
    key: 'D Minor',
    tracks: ['kick', 'percussion', 'bass', 'strings', 'brass', 'piano', 'pad', 'fx', 'ambient'],
  },
  {
    genre: 'podcast',
    name: 'Podcast & Voiceover',
    icon: '🎙️',
    color: '#06D6A0',
    description: 'Crystal clear spoken dialogue with background bed & stingers',
    bpm: 0,
    key: 'Speech',
    tracks: ['hostVocal', 'guestVocal', 'sfx', 'ambient'],
  },
  {
    genre: 'custom',
    name: 'Custom Session',
    icon: '✨',
    color: '#4CC9F0',
    description: 'Blank modular canvas — build your custom signal chain',
    bpm: 120,
    key: 'Modular',
    tracks: [],
  },
];

export const AVAILABLE_TRACK_TYPES: TrackType[] = [
  'kick', 'snare', 'hihat', 'overheads', 'toms', 'percussion',
  'bass', 'subBass', 'synthBass',
  'guitar', 'acousticGuitar', 'piano', 'synth', 'pad', 'strings', 'brass',
  'leadVocal', 'bgVocal', 'harmony', 'adlibs',
  'fx', 'aux', 'reverbReturn', 'delayReturn',
  'dialogue', 'hostVocal', 'guestVocal', 'sfx', 'ambient', 'foley',
];

export const TRACK_CATEGORIES: { id: TrackCategory; label: string; icon: string; types: TrackType[] }[] = [
  { id: 'drums', label: 'Drums & Beats', icon: '🥁', types: ['kick', 'snare', 'hihat', 'overheads', 'toms', 'percussion'] },
  { id: 'bass', label: 'Bass & Sub', icon: '🎸', types: ['bass', 'subBass', 'synthBass'] },
  { id: 'instruments', label: 'Instruments & Synths', icon: '🎹', types: ['guitar', 'acousticGuitar', 'piano', 'synth', 'pad', 'strings', 'brass'] },
  { id: 'vocals', label: 'Vocals', icon: '🎤', types: ['leadVocal', 'bgVocal', 'harmony', 'adlibs'] },
  { id: 'fx', label: 'FX & Aux Sends', icon: '✦', types: ['fx', 'aux', 'reverbReturn', 'delayReturn'] },
  { id: 'speech', label: 'Dialogue & Post', icon: '🎙️', types: ['dialogue', 'hostVocal', 'guestVocal', 'sfx', 'ambient', 'foley'] },
];

export function getLevelHealth(db: number, range: [number, number]): LevelHealth {
  if (db > -0.5) return 'hot';
  if (db > range[1]) return 'check';
  if (db < -45) return 'low';
  if (db >= range[0] && db <= range[1]) return 'healthy';
  return 'healthy';
}

export function getHealthLabel(health: LevelHealth): string {
  switch (health) {
    case 'healthy': return 'TARGET SWEET SPOT';
    case 'check': return 'HOT / MONITOR';
    case 'hot': return 'CLIPPING RISK!';
    case 'low': return 'VERY LOW';
  }
}

export function getHealthColor(health: LevelHealth): string {
  switch (health) {
    case 'healthy': return '#06D6A0';
    case 'check': return '#FFD166';
    case 'hot': return '#EF476F';
    case 'low': return '#3A86FF';
  }
}

let idCounter = 0;
export function genId(): string {
  return `trk-${++idCounter}-${Math.random().toString(36).substr(2, 5)}`;
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
    gainTrimDb: 0,
    pan: def.panDefault,
    muted: false,
    soloed: false,
    isStereo: type === 'overheads' || type === 'piano' || type === 'synth' || type === 'pad' || type === 'strings' || type === 'reverbReturn' || type === 'delayReturn' || type === 'ambient',
    plugins: JSON.parse(JSON.stringify(def.suggestedPlugins)),
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
  if (busTypes.has('music')) result.push('music');

  return result;
}

/**
 * Calculates theoretical logarithmic power sum of multiple dBFS signals
 */
export function calculateSummedDb(dbLevels: number[]): number {
  if (dbLevels.length === 0) return -60;
  // Convert dBFS to linear power: 10^(db / 10)
  const linearSum = dbLevels.reduce((sum, db) => {
    if (db <= -60) return sum;
    return sum + Math.pow(10, db / 10);
  }, 0);

  if (linearSum <= 0) return -60;
  const summedDb = 10 * Math.log10(linearSum);
  // Cap at +6 dBFS
  return Math.min(6, Math.max(-60, Math.round(summedDb * 10) / 10));
}

export const SIGNAL_FLOW_STAGES = [
  {
    id: 'input',
    step: 1,
    name: 'Source & Preamp',
    shortName: 'Input',
    icon: '🎙️',
    color: '#06D6A0',
    targetDb: -18,
    targetText: 'Peaks at -18 to -12 dBFS',
    role: 'Gain staging: set analog preamp level cleanly. 0 VU = -18 dBFS.',
    details: 'Calibrate input trim so nominal levels hit around -18 dBFS with transients peaking under -12 dBFS. Leaves 12-18 dB headroom.',
  },
  {
    id: 'inserts',
    step: 2,
    name: 'Inserts & EQ / Comp',
    shortName: 'Inserts',
    icon: '⚡',
    color: '#3A86FF',
    targetDb: -16,
    targetText: 'Unity Gain in / out',
    role: 'Frequency shaping, tone sculpting, and dynamic peak taming.',
    details: 'Ensure plugins maintain unity gain (bypass comparison). High-pass rumble, surgical cuts, glue compression.',
  },
  {
    id: 'fader',
    step: 3,
    name: 'Fader & Pan Control',
    shortName: 'Fader/Pan',
    icon: '🎚️',
    color: '#8338EC',
    targetDb: -14,
    targetText: 'Track Balance',
    role: 'Level balance in the stereo soundstage (Left / Center / Right).',
    details: '100mm log fader with fine resolution around 0 dB nominal. Stereo panning places instruments across the 180° field.',
  },
  {
    id: 'sends',
    step: 4,
    name: 'Aux / FX Sends',
    shortName: 'Aux Sends',
    icon: '✦',
    color: '#00F5D4',
    targetDb: -18,
    targetText: '-24 to -18 dBFS send',
    role: 'Parallel space: sends audio tap to shared Reverb & Delay aux returns.',
    details: 'Shared reverberation creates cohesive 3D spatial depth for the entire session without loading multiple plugin instances.',
  },
  {
    id: 'buses',
    step: 5,
    name: 'Subgroup Busses',
    shortName: 'Group Buses',
    icon: '📦',
    color: '#FF9F1C',
    targetDb: -6,
    targetText: 'Peaks at -6 to -3 dBFS',
    role: 'Summing groups (Drums, Bass, Vocals) for unified bus compression.',
    details: 'Individual tracks combine here. Bus compressors (VCA/SSL) glue elements together into punchy stems.',
  },
  {
    id: 'mixBus',
    step: 6,
    name: 'Mix Bus (2-Bus)',
    shortName: 'Mix Bus',
    icon: 'Σ',
    color: '#FFD700',
    targetDb: -3,
    targetText: 'Peaks at -6 to -3 dBFS',
    role: 'Master stereo mixdown. Maintain 3 to 6 dB headroom for mastering.',
    details: 'All stems sum into the 2-Bus. Gentle mix bus compression (1-2 dB GR) and subtle EQ curves finalize the mix balance.',
  },
  {
    id: 'master',
    step: 7,
    name: 'Pre-Master & Output',
    shortName: 'Pre-Master',
    icon: '◉',
    color: '#FFFFFF',
    targetDb: -1,
    targetText: 'True Peak: -1.0 dBTP',
    role: 'True Peak limiting & loudness metering (-14 LUFS Spotify target).',
    details: 'Brickwall True Peak limiter prevents inter-sample clipping during MP3/AAC transcoding on streaming platforms.',
  },
];

export const FOLLOW_STEPS = [
  { id: 0, title: '1. Individual Track Gain Staging', description: 'Each instrument is calibrated cleanly at -18 to -12 dBFS peak', icon: '🎵' },
  { id: 1, title: '2. Channel Inserts & Faders', description: 'EQ, compression, and stereo pan position each sound in the space', icon: '🎚️' },
  { id: 2, title: '3. Grouped into Subgroup Buses', description: 'Drums, Bass, Instruments, and Vocals sum into cohesive stems', icon: '📦' },
  { id: 3, title: '4. Summed at the Mix Bus', description: 'All stems combine into the stereo Mix Bus with 3-6 dB headroom', icon: 'Σ' },
  { id: 4, title: '5. Pre-Mastering & Output Delivery', description: 'True Peak limiting and LUFS metering prepare the audio for release', icon: '✨' },
];
