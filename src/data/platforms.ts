/**
 * DELIVERY PLATFORM TARGETS
 * ---------------------------------------------------------------------------
 * Signal Flow Studio is built around one question: "where is this song going
 * to be uploaded?" The default answer is the combination the user asked for —
 * **YouTube + Spotify** — because one master has to survive both pipelines.
 *
 * Every platform below defines its own loudness target, true-peak ceiling,
 * normalization behaviour and delivery chain. Those values drive:
 *   - the subgroup bus / mix bus / master dB windows (signal flow stage 5-8)
 *   - the per-channel target trim applied to the session
 *   - the delivery readiness analysis (LUFS, dBTP, PLR, normalization gain)
 */

export type PlatformId =
  | 'youtube-spotify'
  | 'youtube'
  | 'spotify'
  | 'apple'
  | 'soundcloud'
  | 'reels'
  | 'broadcast';

export type NormalizationMode = 'down-only' | 'up-and-down' | 'off';

export interface PlatformSpec {
  id: PlatformId;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  color: string;
  /** Services this preset delivers to (a combined preset covers 2+). */
  services: string[];
  recommended?: boolean;

  /* ---- Loudness ---- */
  /** Integrated LUFS the platform normalizes to. */
  targetLufs: number;
  /** Acceptable integrated LUFS window for a master aimed at this platform. */
  lufsRange: [number, number];
  /** True-peak ceiling in dBTP. */
  truePeakCeiling: number;
  /** Safer ceiling when the master is intentionally louder than targetLufs. */
  loudMasterCeiling: number;
  normalization: NormalizationMode;
  normalizationLabel: string;
  normalizationDetail: string;
  /** Target loudness range (LRA) in LU. */
  lraTarget: [number, number];
  /** Target peak-to-loudness ratio (true peak minus integrated LUFS). */
  plrTarget: [number, number];

  /* ---- Delivery chain ---- */
  codec: string;
  deliveryFormat: string;
  sampleRate: string;

  /* ---- Level plan (dB) ---- */
  /** Shift applied to every channel's target window. */
  trackTrimDb: number;
  /** Shift applied to subgroup bus windows. */
  busTrimDb: number;
  /** Peak window the mix bus should sit in before mastering. */
  mixBusPeak: [number, number];
  /** Headroom in dB left on the mix bus for the mastering stage. */
  headroomDb: number;
  /** Limiter ceiling used at the pre-master stage. */
  masterCeiling: number;

  /* ---- Editorial ---- */
  summary: string;
  doList: string[];
  avoidList: string[];
  uploadChecklist: string[];
}

export const DEFAULT_PLATFORM: PlatformId = 'youtube-spotify';

/**
 * Baseline peak window for subgroup stems (drums, bass, instruments, vocals)
 * before any platform trim is applied.
 */
export const SUBGROUP_BASE_DB: [number, number] = [-6, -3];

export const PLATFORM_PRESETS: PlatformSpec[] = [
  {
    id: 'youtube-spotify',
    name: 'YouTube + Spotify',
    shortName: 'YT + Spotify',
    tagline: 'One master, both pipelines — the single-release workflow',
    icon: '🚀',
    color: '#FF2D55',
    services: ['YouTube', 'Spotify'],
    recommended: true,

    targetLufs: -14,
    lufsRange: [-15, -13],
    truePeakCeiling: -1.0,
    loudMasterCeiling: -2.0,
    normalization: 'up-and-down',
    normalizationLabel: 'Spotify up/down • YouTube down-only',
    normalizationDetail:
      'Spotify moves playback gain in both directions. YouTube only turns loud uploads DOWN, so a master quieter than -14 LUFS plays quieter than everything else on YouTube. Aim at -14.0 to -13.5 LUFS: loud enough for YouTube, clean for Spotify.',
    lraTarget: [5, 11],
    plrTarget: [10, 13],

    codec: 'Spotify: Ogg Vorbis / AAC 256 · YouTube: AAC 256 + Opus',
    deliveryFormat: 'WAV or FLAC, 24-bit, 44.1 kHz (48 kHz if video-first)',
    sampleRate: '44.1 kHz music · 48 kHz video',

    trackTrimDb: 0,
    busTrimDb: 0,
    mixBusPeak: [-6, -3],
    headroomDb: 4,
    masterCeiling: -1.0,

    summary:
      'Deliver one master at -14 LUFS integrated with a -1.0 dBTP ceiling. It plays back untouched on Spotify and survives YouTube without being attenuated. Keep 3-6 dB of mix-bus headroom so the limiter never has to work harder than about 2-3 dB.',
    doList: [
      'Master the integrated loudness to -14.0 to -13.5 LUFS.',
      'Set a true-peak limiter ceiling of -1.0 dBTP.',
      'Keep the mix bus peaking between -6 and -3 dBFS.',
      'Aim for a peak-to-loudness ratio of 10-13 dB (punch preserved).',
      'Export 24-bit WAV/FLAC at the session sample rate.',
    ],
    avoidList: [
      'Never deliver quieter than -14 LUFS — YouTube will not turn it up.',
      'Never push past -1.0 dBTP — both platforms transcode to lossy codecs.',
      'Avoid more than ~4 dB of limiter gain reduction: transients flatten.',
    ],
    uploadChecklist: [
      'Integrated LUFS measured over the full song: -14 to -13.5',
      'True peak ≤ -1.0 dBTP (use -2.0 dBTP if the master is louder than -14 LUFS)',
      'Check the encoded AAC/Ogg render for inter-sample clipping',
      'Same file for YouTube (video/artwork track) and Spotify (via distributor)',
      'Mono-sum check: dhol/tabla/808 low end must not cancel',
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    shortName: 'YouTube',
    tagline: 'Loudness normalized DOWN only — quiet masters stay quiet',
    icon: '▶️',
    color: '#FF0033',
    services: ['YouTube'],

    targetLufs: -14,
    lufsRange: [-14, -13],
    truePeakCeiling: -1.0,
    loudMasterCeiling: -2.0,
    normalization: 'down-only',
    normalizationLabel: 'Down-only normalization',
    normalizationDetail:
      'YouTube targets about -14 LUFS integrated (ITU-R BS.1770-4) and only attenuates. Louder uploads get turned down; quieter uploads simply play quieter. There is no free loudness on YouTube — only lost dynamics.',
    lraTarget: [5, 12],
    plrTarget: [10, 13],

    codec: 'AAC-LC 256 kbps (music) · Opus for some streams',
    deliveryFormat: 'WAV/FLAC 24-bit, 48 kHz for video delivery',
    sampleRate: '48 kHz (video standard)',

    trackTrimDb: 0,
    busTrimDb: -0.5,
    mixBusPeak: [-6, -3.5],
    headroomDb: 4.5,
    masterCeiling: -1.0,

    summary:
      'Target -14 LUFS integrated, -1.0 dBTP. Because normalization is down-only, land exactly on target (never under) — and keep spoken-word dialogue near -16 LUFS if the upload is speech-led.',
    doList: [
      'Hit -14 LUFS integrated — do not undershoot, YouTube will not boost you.',
      'Leave the true-peak ceiling at -1.0 dBTP.',
      'Deliver 48 kHz / 24-bit when the master is going into a video.',
      'For speech-led videos, target -16 LUFS with dialogue 4-6 dB above the bed.',
    ],
    avoidList: [
      'Do not master to -16 LUFS "for safety" — your video will sound quiet.',
      'Do not rely on YouTube to fix a hot master; it only turns it down.',
    ],
    uploadChecklist: [
      'Integrated: -14 LUFS (measured full duration)',
      'True peak ≤ -1.0 dBTP',
      'Export 48 kHz if the audio is muxed into video',
      'Listen to the encoded AAC version, not just the WAV',
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    shortName: 'Spotify',
    tagline: 'Normalizes both ways, so dynamics are what you keep',
    icon: '🎧',
    color: '#1DB954',
    services: ['Spotify'],

    targetLufs: -14,
    lufsRange: [-14.5, -12],
    truePeakCeiling: -1.0,
    loudMasterCeiling: -2.0,
    normalization: 'up-and-down',
    normalizationLabel: 'Up & down normalization',
    normalizationDetail:
      'Spotify normalizes playback to about -14 LUFS. Louder masters are attenuated; quieter masters are boosted until they run out of headroom. Spotify recommends -14 LUFS integrated with true peak below -1 dBTP — and below -2 dBTP if the master is louder than -14 LUFS.',
    lraTarget: [5, 11],
    plrTarget: [10, 13],

    codec: 'Ogg Vorbis (web/free) · AAC 256 kbps (premium)',
    deliveryFormat: 'WAV or FLAC, 24-bit, 44.1 kHz+',
    sampleRate: '44.1 kHz or higher',

    trackTrimDb: 0,
    busTrimDb: 0,
    mixBusPeak: [-6, -3],
    headroomDb: 4,
    masterCeiling: -1.0,

    summary:
      'Target -14 LUFS integrated, -1.0 dBTP (-2.0 dBTP if you master hotter than -14 LUFS). Spotify turns loud masters down with a simple gain change — no compression, no limiting — so density survives, but clipped peaks do not.',
    doList: [
      'Target -14 LUFS integrated with a -1.0 dBTP ceiling.',
      'Drop the ceiling to -2.0 dBTP if you deliberately master louder than -14 LUFS.',
      'Deliver the highest-quality stereo master you have (WAV/FLAC, 24-bit).',
    ],
    avoidList: [
      'Do not chase -6 LUFS: Spotify will simply turn it down ~8 dB.',
      'Do not deliver an MP3 — always the lossless master through your distributor.',
    ],
    uploadChecklist: [
      'Integrated: -14 LUFS · True peak ≤ -1.0 dBTP (≤ -2.0 dBTP if louder)',
      'Lossless WAV/FLAC upload through distributor',
      'Loudness metadata baked in the file, not applied as extra processing',
    ],
  },
  {
    id: 'apple',
    name: 'Apple Music',
    shortName: 'Apple',
    tagline: 'Sound Check sits ~2 dB under Spotify',
    icon: '🍎',
    color: '#FA2D48',
    services: ['Apple Music'],

    targetLufs: -16,
    lufsRange: [-17, -15],
    truePeakCeiling: -1.0,
    loudMasterCeiling: -2.0,
    normalization: 'up-and-down',
    normalizationLabel: 'Sound Check (up & down)',
    normalizationDetail:
      'Apple Music Sound Check normalizes to roughly -16 LUFS integrated with a -1.0 dBTP ceiling. A -14 LUFS master is turned down about 2 dB; dynamics are preserved either way.',
    lraTarget: [5, 14],
    plrTarget: [11, 15],

    codec: 'AAC 256 kbps (Sound Check aware)',
    deliveryFormat: 'WAV/FLAC 24-bit, 44.1 kHz+',
    sampleRate: '44.1 kHz or higher',

    trackTrimDb: -1,
    busTrimDb: -1.5,
    mixBusPeak: [-8, -4],
    headroomDb: 6,
    masterCeiling: -1.0,

    summary:
      'Target -16 LUFS integrated, -1.0 dBTP. Need a touch more headroom than the YouTube/Spotify plan: subgroup buses sit 1.5 dB lower and channels 1 dB lower so the limiter stays gentle.',
    doList: [
      'Target -16 LUFS integrated with a -1.0 dBTP ceiling.',
      'Leave about 6 dB of headroom on the mix bus (peaks -8 to -4 dBFS).',
      'Master the whole album together — Sound Check can normalize per album.',
    ],
    avoidList: [
      'Do not send a -9 LUFS master: Sound Check will pull it down ~7 dB.',
    ],
    uploadChecklist: [
      'Integrated: -16 LUFS · True peak ≤ -1.0 dBTP',
      'Album-level loudness consistency checked',
    ],
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud / Bandcamp',
    shortName: 'SoundCloud',
    tagline: 'Normalization exists, but the loud master still lands better',
    icon: '☁️',
    color: '#FF5500',
    services: ['SoundCloud', 'Bandcamp'],

    targetLufs: -14,
    lufsRange: [-14, -10],
    truePeakCeiling: -1.0,
    loudMasterCeiling: -1.5,
    normalization: 'up-and-down',
    normalizationLabel: 'Normalization ~ -14 LUFS',
    normalizationDetail:
      'SoundCloud normalizes toward about -14 LUFS, but plenty of listeners still hear the un-normalized web player and DJs pull the MP3 straight into sets. A slightly denser master (-12 to -10 LUFS) is common here.',
    lraTarget: [4, 10],
    plrTarget: [8, 12],

    codec: 'MP3 320 kbps (plus 128 kbps stream preview)',
    deliveryFormat: 'WAV 24-bit master · MP3 320 for upload',
    sampleRate: '44.1 kHz',

    trackTrimDb: 0,
    busTrimDb: 0,
    mixBusPeak: [-6, -3],
    headroomDb: 3,
    masterCeiling: -1.0,

    summary:
      'Upload the -14 LUFS / -1.0 dBTP master. If this is a DJ/club-first release, keep a second -10 LUFS master with the ceiling at -1.5 dBTP.',
    doList: [
      'Use the same -14 LUFS master as YouTube/Spotify for consistency.',
      'Upload MP3 320 kbps rendered from the lossless master.',
    ],
    avoidList: ['Avoid 0 dBTP masters — the 128 kbps preview stream will crackle.'],
    uploadChecklist: ['MP3 320 from 24-bit WAV', 'True peak ≤ -1.0 dBTP'],
  },
  {
    id: 'reels',
    name: 'Reels / Shorts / TikTok',
    shortName: 'Reels & Shorts',
    tagline: 'Tiny speakers, heavy codecs, mobile-first playback',
    icon: '📱',
    color: '#C13584',
    services: ['Instagram Reels', 'YouTube Shorts', 'TikTok'],

    targetLufs: -14,
    lufsRange: [-15, -12],
    truePeakCeiling: -1.5,
    loudMasterCeiling: -2.0,
    normalization: 'down-only',
    normalizationLabel: 'Down-only on most short-form feeds',
    normalizationDetail:
      'Short-form feeds normalize down only and transcode hard to low-bitrate AAC. Extra true-peak headroom (-1.5 dBTP) keeps the encode clean, and the first 3 seconds must be instantly audible on a phone speaker.',
    lraTarget: [4, 9],
    plrTarget: [8, 12],

    codec: 'AAC 128-192 kbps, heavy transcode chain',
    deliveryFormat: 'WAV 24-bit / 48 kHz, rendered into the video',
    sampleRate: '48 kHz',

    trackTrimDb: 0,
    busTrimDb: -0.5,
    mixBusPeak: [-6, -3.5],
    headroomDb: 4,
    masterCeiling: -1.5,

    summary:
      'Target -14 LUFS with a -1.5 dBTP ceiling, keep the low end mono, and check the mix on a phone speaker. Short-form punishes harsh 3-5 kHz and wide stereo bass.',
    doList: [
      'Leave -1.5 dBTP of true-peak headroom for the aggressive encode.',
      'Mono the low end below 120 Hz — phone speakers are mono.',
      'Check the first 3 seconds: hooks must be instantly audible.',
    ],
    avoidList: ['Avoid wide stereo bass and overly bright 3-5 kHz vocal presence.'],
    uploadChecklist: ['48 kHz audio in the video export', 'Mono compatibility check', 'Phone speaker test'],
  },
  {
    id: 'broadcast',
    name: 'Broadcast / Film (EBU R128)',
    shortName: 'Broadcast',
    tagline: 'Fixed -23 LUFS standard — loudness is specified, not chosen',
    icon: '📺',
    color: '#5B8DEF',
    services: ['TV', 'Film', 'Radio'],

    targetLufs: -23,
    lufsRange: [-24, -22],
    truePeakCeiling: -1.0,
    loudMasterCeiling: -2.0,
    normalization: 'off',
    normalizationLabel: 'No normalization — delivery spec',
    normalizationDetail:
      'EBU R128 / ATSC A/85 delivery is a fixed specification: -23 LUFS integrated (-24 LKFS in the US) with a -1.0 dBTP ceiling and a maximum momentary/short-term allowance. Nothing normalizes it at playback.',
    lraTarget: [5, 18],
    plrTarget: [14, 22],

    codec: 'PCM / Dolby E · AC-3 for transmission',
    deliveryFormat: 'Broadcast WAV 24-bit, 48 kHz, with loudness metadata',
    sampleRate: '48 kHz',

    trackTrimDb: -3,
    busTrimDb: -6,
    mixBusPeak: [-12, -8],
    headroomDb: 12,
    masterCeiling: -1.0,

    summary:
      'Deliver -23 LUFS integrated, -1.0 dBTP, with a very wide dynamic range. Channel and bus targets drop 3 dB and 6 dB respectively so the mix retains real dynamics instead of being limited into shape.',
    doList: [
      'Deliver -23 LUFS integrated with -1.0 dBTP maximum true peak.',
      'Leave 8-12 dB of headroom — dialogue, music and effects stems are mixed dynamically.',
      'Include loudness metadata (integrated / short-term / LRA) in the BWAV.',
    ],
    avoidList: ['Never deliver a -14 LUFS master here: it will be rejected or turned down 9 dB.'],
    uploadChecklist: [
      'Integrated -23 LUFS ±0.5',
      'True peak ≤ -1.0 dBTP',
      'LRA within spec, loudness metadata embedded',
    ],
  },
];

const PLATFORM_MAP: Record<PlatformId, PlatformSpec> = PLATFORM_PRESETS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PlatformId, PlatformSpec>,
);

export function getPlatform(id: PlatformId): PlatformSpec {
  return PLATFORM_MAP[id] || PLATFORM_MAP[DEFAULT_PLATFORM];
}

export function getPlatformLabel(id: PlatformId): string {
  return getPlatform(id).name;
}

/* -------------------------------------------------------------------------- */
/* Signal flow stages                                                          */
/* -------------------------------------------------------------------------- */

export interface SignalFlowStage {
  id: string;
  step: number;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  /** Headline dB number shown on the stage card. */
  targetDb: number;
  targetText: string;
  role: string;
  details: string;
  /** True when the stage's dB target changes with the delivery platform. */
  scope: 'universal' | 'platform';
  /** Platform-specific guidance appended to the stage inspector. */
  platformNote: string;
}

/**
 * Stages 1-4 (gain staging, inserts, fader/pan, sends) are universal: they are
 * the same on every platform because they happen before the mix is summed.
 * Stages 5-8 move with the delivery target — that is where YouTube + Spotify
 * change the dB numbers.
 */
export function getSignalFlowStages(platformId: PlatformId = DEFAULT_PLATFORM): SignalFlowStage[] {
  const p = getPlatform(platformId);
  // Subgroup stems are measured against the standard -6/-3 dBFS stem window
  // and then shifted by the platform's bus trim.
  const busTop = round1(SUBGROUP_BASE_DB[1] + p.busTrimDb);
  const busBottom = round1(SUBGROUP_BASE_DB[0] + p.busTrimDb);

  return [
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
      details:
        'Calibrate input trim so nominal levels hit around -18 dBFS with transients peaking under -12 dBFS. Leaves 12-18 dB headroom.',
      scope: 'universal',
      platformNote:
        'Universal for every platform. Whether the master ends at -14 LUFS (YouTube/Spotify) or -23 LUFS (broadcast), a clean -18 dBFS front end is what makes the target reachable without noise.',
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
      details:
        'Ensure plugins maintain unity gain (bypass comparison). High-pass rumble, surgical cuts, glue compression.',
      scope: 'universal',
      platformNote:
        'Universal. Heavy compression here is what later forces the master limiter to work — protect transients now and every platform target becomes easier to hit.',
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
      details:
        '100mm log fader with fine resolution around 0 dB nominal. Stereo panning places instruments across the 180° field.',
      scope: 'universal',
      platformNote:
        'Universal. Balanced faders mean the master needs less limiter gain reduction, which is exactly what keeps a -14 LUFS YouTube + Spotify master punchy.',
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
      details:
        'Shared reverberation creates cohesive 3D spatial depth for the entire session without loading multiple plugin instances.',
      scope: 'universal',
      platformNote:
        'Universal. Long reverb tails raise integrated loudness without raising peaks — they quietly eat the headroom your target depends on.',
    },
    {
      id: 'buses',
      step: 5,
      name: 'Subgroup Busses',
      shortName: 'Group Buses',
      icon: '📦',
      color: '#FF9F1C',
      targetDb: busTop,
      targetText: `Peaks at ${busBottom} to ${busTop} dBFS`,
      role: 'Summing groups (Drums, Bass, Vocals) for unified bus compression.',
      details:
        'Individual tracks combine here. Bus compressors (VCA/SSL) glue elements together into punchy stems.',
      scope: 'platform',
      platformNote: `${p.name}: subgroup stems peak ${busBottom} to ${busTop} dBFS (${fmtTrim(p.busTrimDb)} vs the -6/-3 dBFS streaming baseline). ${p.summary}`,
    },
    {
      id: 'mixBus',
      step: 6,
      name: 'Mix Bus (2-Bus)',
      shortName: 'Mix Bus',
      icon: 'Σ',
      color: '#FFD700',
      targetDb: round1(p.mixBusPeak[1]),
      targetText: `Peaks at ${p.mixBusPeak[0]} to ${p.mixBusPeak[1]} dBFS`,
      role: `Master stereo mixdown. Maintain ${p.headroomDb - 2} to ${p.headroomDb + 2} dB headroom for mastering.`,
      details:
        'All stems sum into the 2-Bus. Gentle mix bus compression (1-2 dB GR) and subtle EQ curves finalize the mix balance.',
      scope: 'platform',
      platformNote: `${p.name}: leave peaks between ${p.mixBusPeak[0]} and ${p.mixBusPeak[1]} dBFS. That is roughly ${p.headroomDb} dB of headroom to the -1.0 dBFS ceiling — the working room the mastering limiter needs to reach ${p.targetLufs} LUFS without squashing transients.`,
    },
    {
      id: 'master',
      step: 7,
      name: 'Pre-Master & Output',
      shortName: 'Pre-Master',
      icon: '◉',
      color: '#FFFFFF',
      targetDb: p.masterCeiling,
      targetText: `True Peak: ${p.masterCeiling.toFixed(1)} dBTP`,
      role: `True Peak limiting & loudness metering (${p.targetLufs} LUFS target).`,
      details:
        'Brickwall True Peak limiter prevents inter-sample clipping during MP3/AAC transcoding on streaming platforms.',
      scope: 'platform',
      platformNote: `${p.name}: limiter ceiling ${p.masterCeiling.toFixed(1)} dBTP, integrated loudness ${p.targetLufs} LUFS. ${p.loudMasterCeiling < p.masterCeiling ? `If you master louder than ${p.targetLufs} LUFS, drop the ceiling to ${p.loudMasterCeiling.toFixed(1)} dBTP.` : ''} ${p.normalizationDetail}`,
    },
    {
      id: 'delivery',
      step: 8,
      name: `Delivery: ${p.shortName}`,
      shortName: 'Delivery',
      icon: '🚀',
      color: p.color,
      targetDb: p.targetLufs,
      targetText: `${p.targetLufs} LUFS · ${p.truePeakCeiling.toFixed(1)} dBTP`,
      role: `Platform encode & loudness normalization for ${p.services.join(' + ')}.`,
      details: `${p.codec}. Deliver ${p.deliveryFormat}. ${p.normalizationLabel}.`,
      scope: 'platform',
      platformNote: p.normalizationDetail,
    },
  ];
}

/** Default stage list (YouTube + Spotify) kept for backwards compatibility. */
export const SIGNAL_FLOW_STAGES: SignalFlowStage[] = getSignalFlowStages(DEFAULT_PLATFORM);

/* -------------------------------------------------------------------------- */
/* Level helpers                                                               */
/* -------------------------------------------------------------------------- */

export interface PlatformLevelPlan {
  trackTrimDb: number;
  busTrimDb: number;
  mixBusPeak: [number, number];
  headroomDb: number;
  masterCeiling: number;
  targetLufs: number;
  truePeakCeiling: number;
  lufsRange: [number, number];
}

export function getLevelPlan(platformId: PlatformId = DEFAULT_PLATFORM): PlatformLevelPlan {
  const p = getPlatform(platformId);
  return {
    trackTrimDb: p.trackTrimDb,
    busTrimDb: p.busTrimDb,
    mixBusPeak: p.mixBusPeak,
    headroomDb: p.headroomDb,
    masterCeiling: p.masterCeiling,
    targetLufs: p.targetLufs,
    truePeakCeiling: p.truePeakCeiling,
    lufsRange: p.lufsRange,
  };
}

/**
 * Makeup gain a mastering limiter can add before it starts audibly squashing
 * the mix. This is why the mix-bus window is -6 to -3 dBFS: the limiter then
 * only needs about 2-5 dB of makeup gain to reach a -1 dBTP ceiling.
 */
export const MAX_MAKEUP_DB = 6;

/** Shift a bus/track dB window by the platform trim, keeping the width. */
export function applyPlatformTrim(range: [number, number], platformId: PlatformId, kind: 'track' | 'bus'): [number, number] {
  const p = getPlatform(platformId);
  const trim = kind === 'track' ? p.trackTrimDb : p.busTrimDb;
  return [round1(range[0] + trim), round1(range[1] + trim)];
}

export function busTargetRange(base: [number, number], platformId: PlatformId): [number, number] {
  return applyPlatformTrim(base, platformId, 'bus');
}

export function trackTargetRange(base: [number, number], platformId: PlatformId): [number, number] {
  return applyPlatformTrim(base, platformId, 'track');
}

/* -------------------------------------------------------------------------- */
/* Delivery analysis                                                           */
/* -------------------------------------------------------------------------- */

export type DeliveryStatus = 'empty' | 'clip' | 'loud' | 'pass' | 'quiet';

export interface PlatformResult {
  id: PlatformId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  targetLufs: number;
  /** platform target minus delivered loudness (negative = platform turns down) */
  deltaDb: number;
  status: DeliveryStatus;
  action: string;
  active: boolean;
}

export interface DeliveryCheck {
  label: string;
  pass: boolean;
  detail: string;
}

export interface DeliveryAnalysis {
  platform: PlatformId;
  platformName: string;
  /** summed mix-bus peak in dBFS */
  mixPeakDb: number;
  /** makeup gain the master limiter has to apply to reach the ceiling */
  masterGainDb: number;
  /** gain reduction the limiter ends up doing */
  gainReductionDb: number;
  /** true peak after limiting, in dBTP */
  truePeak: number;
  /** modelled integrated loudness, in LUFS */
  estimatedLufs: number;
  /** peak-to-loudness ratio */
  plr: number;
  /** effective crest factor after limiting */
  crestDb: number;
  status: DeliveryStatus;
  headline: string;
  /** dB to add to every channel fader to bring the mix into the headroom window. */
  suggestedTrackTrimDb: number;
  /** platform target minus delivered loudness */
  normalizationDb: number;
  normalizationAction: string;
  platformResults: PlatformResult[];
  checks: DeliveryCheck[];
  fixes: string[];
}

/**
 * Models what happens to the mix once it is mastered for the delivery target.
 *
 * The model is deliberately simple and it is the same chain an engineer runs
 * mentally: makeup gain to reach the limiter ceiling, gain reduction on the
 * peaks that overshoot, and the resulting loss of crest factor (which is what
 * turns into LUFS).
 */
export function analyzeDelivery(
  mixPeakDb: number,
  platformId: PlatformId = DEFAULT_PLATFORM,
  baseCrestDb = 12,
): DeliveryAnalysis {
  const p = getPlatform(platformId);

  if (mixPeakDb <= -59) {
    return {
      platform: platformId,
      platformName: p.name,
      mixPeakDb: -60,
      masterGainDb: 0,
      gainReductionDb: 0,
      truePeak: -60,
      estimatedLufs: -60,
      plr: 0,
      crestDb: baseCrestDb,
      status: 'empty',
      headline: 'No active tracks — add channels to model the delivery master.',
      suggestedTrackTrimDb: 0,
      normalizationDb: 0,
      normalizationAction: '—',
      platformResults: [],
      checks: [],
      fixes: ['Add tracks or load a genre preset to see the delivery analysis.'],
    };
  }

  /* ---------------------------------------------------------------------- *
   * The model                                                                *
   * 1. Makeup gain: how much the mastering limiter must add for the mix to   *
   *    reach the platform's true-peak ceiling. Only MAX_MAKEUP_DB is free —  *
   *    beyond that the limiter starts squashing the mix.                     *
   * 2. Crest factor: peaks shaved off a mix that arrives too hot reduce the  *
   *    crest factor, which is what turns peak level into loudness.           *
   * 3. Integrated loudness = true peak - effective crest.                    *
   * ---------------------------------------------------------------------- */
  const clipped = mixPeakDb > -0.5;
  const neededDb = p.masterCeiling - mixPeakDb;
  const masterGainDb = round1(Math.max(-12, Math.min(MAX_MAKEUP_DB, neededDb)));
  const overworkDb = round1(Math.max(0, neededDb - MAX_MAKEUP_DB));
  const truePeak = round1(Math.max(-60, Math.min(p.masterCeiling, mixPeakDb + masterGainDb)));

  // Peaks above the top of the platform's headroom window get shaved, so the
  // crest factor (and therefore the punch) collapses.
  const hotDb = Math.max(0, mixPeakDb - p.mixBusPeak[1]);
  const crestDb = round1(Math.max(5, baseCrestDb - hotDb * 0.85));
  const estimatedLufs = round1(Math.max(-40, Math.min(0, truePeak - crestDb)));
  const plr = round1(truePeak - estimatedLufs);
  const normalizationDb = round1(p.targetLufs - estimatedLufs);
  const gainReductionDb = round1(overworkDb + hotDb);

  let status: DeliveryStatus = 'pass';
  if (clipped) status = 'clip';
  else if (normalizationDb < -2) status = 'loud';
  else if (normalizationDb > 2) status = 'quiet';
  else if (mixPeakDb > p.mixBusPeak[1]) status = 'loud';
  else if (mixPeakDb < p.mixBusPeak[0]) status = 'quiet';

  const headline =
    status === 'clip'
      ? 'Mix bus is at or over 0 dBFS — the master is already clipped before it reaches the platform.'
      : status === 'loud'
        ? `Master lands ${Math.abs(normalizationDb).toFixed(1)} dB above the ${p.targetLufs} LUFS target — the platform will turn it down.`
        : status === 'quiet'
          ? `Master lands ${normalizationDb.toFixed(1)} dB under the ${p.targetLufs} LUFS target${
              p.normalization === 'down-only' ? ' and this platform only turns loud uploads down' : ''
            }.`
          : `On target for ${p.name}: ${estimatedLufs} LUFS at ${truePeak} dBTP.`;

  const downAmount = Math.max(0, -normalizationDb);
  const upAmount = Math.max(0, normalizationDb);
  const normalizationAction =
    Math.abs(normalizationDb) < 0.3
      ? 'Plays back untouched — no normalization applied.'
      : normalizationDb < 0
        ? `${p.normalization === 'down-only' ? 'Turned down' : 'Attenuated'} ${downAmount.toFixed(1)} dB at playback.`
        : p.normalization === 'down-only'
          ? `Plays ${upAmount.toFixed(1)} dB quieter — ${p.shortName} will NOT turn it up.`
          : p.normalization === 'off'
            ? `${upAmount.toFixed(1)} dB under the ${p.targetLufs} LUFS delivery spec.`
            : `Boosted ${upAmount.toFixed(1)} dB at playback.`;

  const checks: DeliveryCheck[] = [
    {
      label: 'No mix-bus clipping',
      pass: !clipped,
      detail: clipped
        ? `${mixPeakDb.toFixed(1)} dBFS is at/over the digital ceiling — drop channel levels.`
        : `Peak ${mixPeakDb.toFixed(1)} dBFS leaves ${round1(-0.5 - mixPeakDb)} dB before 0 dBFS.`,
    },
    {
      label: 'Mix-bus headroom in window',
      pass: mixPeakDb <= p.mixBusPeak[1] + 0.5 && mixPeakDb >= p.mixBusPeak[0] - 0.5,
      detail: `Target ${p.mixBusPeak[0]} to ${p.mixBusPeak[1]} dBFS for ${p.name}. Currently ${mixPeakDb.toFixed(1)} dBFS.`,
    },
    {
      label: 'Limiter inside its budget',
      pass: overworkDb <= 0.05,
      detail:
        overworkDb <= 0.05
          ? `Needs ${masterGainDb.toFixed(1)} dB of makeup gain to reach ${p.masterCeiling.toFixed(1)} dBTP.`
          : `Needs ${neededDb.toFixed(1)} dB of makeup — ${overworkDb.toFixed(1)} dB beyond the transparent ${MAX_MAKEUP_DB} dB budget.`,
    },
    {
      label: 'True peak under ceiling',
      pass: truePeak <= p.truePeakCeiling + 0.05,
      detail: `${truePeak.toFixed(1)} dBTP vs ${p.truePeakCeiling.toFixed(1)} dBTP ceiling.`,
    },
    {
      label: 'Loudness on target',
      pass: Math.abs(normalizationDb) <= 2,
      detail: `${estimatedLufs.toFixed(1)} LUFS vs ${p.targetLufs} LUFS target (${p.lufsRange[0]} to ${p.lufsRange[1]}).`,
    },
    {
      label: 'Dynamics preserved',
      pass: plr >= p.plrTarget[0] - 1 && hotDb <= 0.05,
      detail:
        hotDb > 0.05
          ? `Mix is ${hotDb.toFixed(1)} dB over the headroom window — peaks are being shaved (PLR ${plr.toFixed(1)} dB).`
          : `Peak-to-loudness ratio ${plr.toFixed(1)} dB (target ${p.plrTarget[0]}-${p.plrTarget[1]} dB).`,
    },
    {
      label: 'Codec safe',
      pass: truePeak <= -1.0,
      detail:
        truePeak <= -1.0
          ? 'At least 1 dB of true-peak headroom for AAC/Ogg transcoding.'
          : 'Raise the true-peak headroom — lossy encoding can add inter-sample peaks.',
    },
  ];

  const fixes: string[] = [];
  if (clipped) {
    fixes.push(`Pull every channel fader down ${Math.ceil(mixPeakDb + 6)} dB — the mix bus is already clipping.`);
  } else if (overworkDb > 0.05) {
    fixes.push(
      `The limiter would need ${neededDb.toFixed(1)} dB of makeup gain — ${overworkDb.toFixed(1)} dB beyond the transparent ${MAX_MAKEUP_DB} dB budget. Raise the mix, not the limiter.`,
    );
  } else if (mixPeakDb > p.mixBusPeak[1] + 0.5) {
    fixes.push(
      `Pull the channel faders down ${round1(mixPeakDb - p.mixBusPeak[1])} dB — peaks are being shaved off (PLR down to ${plr.toFixed(1)} dB).`,
    );
  } else if (mixPeakDb < p.mixBusPeak[0] - 0.5) {
    fixes.push(
      `Raise the channel faders about ${round1(p.mixBusPeak[0] - mixPeakDb)} dB — do not fix it with the limiter.`,
    );
  } else if (normalizationDb < -2) {
    fixes.push(
      `Master is ${downAmount.toFixed(1)} dB over target — back off the limiter or accept less density; the platform gains it down anyway.`,
    );
  } else if (normalizationDb > 2) {
    fixes.push(
      p.normalization === 'down-only'
        ? 'Quieter than -14 LUFS: this platform only turns loud uploads down. Add gentle limiting/clipping or keep the dynamics and accept a quieter playback.'
        : `About ${upAmount.toFixed(1)} dB under target — the platform will boost it, which also lifts the noise floor.`,
    );
  } else if (plr < p.plrTarget[0]) {
    fixes.push('Crest factor is collapsing — ease the bus compression to bring transients back.');
  }
  if (fixes.length === 0) fixes.push(`Ready to upload: ${p.services.join(' + ')} will play this as-is.`);

  // Bring the mix into the platform's headroom window by moving every fader
  // by the same amount — summing is linear, so the mix follows the faders.
  const windowTarget = Math.max(p.mixBusPeak[0], Math.min(p.mixBusPeak[1], mixPeakDb));
  const suggestedTrackTrimDb = round1(windowTarget - mixPeakDb);

  const platformResults: PlatformResult[] = PLATFORM_PRESETS.map(pp => {
    const delta = round1(pp.targetLufs - estimatedLufs);
    const st: DeliveryStatus =
      clipped ? 'clip' : Math.abs(delta) <= 2 ? 'pass' : delta < 0 ? 'loud' : 'quiet';
    const action =
      st === 'pass'
        ? 'Plays as delivered'
        : st === 'loud'
          ? `Turned down ${Math.abs(delta).toFixed(1)} dB`
          : pp.normalization === 'down-only'
            ? `Plays ${delta.toFixed(1)} dB quieter (no boost)`
            : pp.normalization === 'off'
              ? `${delta.toFixed(1)} dB under delivery spec`
              : `Boosted ${delta.toFixed(1)} dB`;
    return {
      id: pp.id,
      name: pp.name,
      shortName: pp.shortName,
      icon: pp.icon,
      color: pp.color,
      targetLufs: pp.targetLufs,
      deltaDb: delta,
      status: st,
      action,
      active:
        pp.id === platformId ||
        (platformId === 'youtube-spotify' && (pp.id === 'youtube' || pp.id === 'spotify')),
    };
  });

  return {
    platform: platformId,
    platformName: p.name,
    mixPeakDb: round1(mixPeakDb),
    masterGainDb,
    gainReductionDb,
    truePeak,
    estimatedLufs,
    plr,
    crestDb,
    status,
    headline,
    suggestedTrackTrimDb,
    normalizationDb,
    normalizationAction,
    platformResults,
    checks,
    fixes,
  };
}

export function getDeliveryStatusColor(status: DeliveryStatus): string {
  switch (status) {
    case 'pass': return '#06D6A0';
    case 'loud': return '#FFD166';
    case 'clip': return '#EF476F';
    case 'quiet': return '#3A86FF';
    default: return '#6B7280';
  }
}

export function getDeliveryStatusLabel(status: DeliveryStatus): string {
  switch (status) {
    case 'pass': return 'READY TO UPLOAD';
    case 'loud': return 'OVER TARGET';
    case 'clip': return 'CLIPPING';
    case 'quiet': return 'UNDER TARGET';
    default: return 'NO SIGNAL';
  }
}

/* -------------------------------------------------------------------------- */

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function fmtTrim(trim: number): string {
  if (trim === 0) return 'no change';
  return `${trim > 0 ? '+' : ''}${trim} dB`;
}
