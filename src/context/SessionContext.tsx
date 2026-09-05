import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import {
  type Track, type Bus, type Genre, type SessionSize, type BusType,
  type TrackType, type PluginSlot,
  BUS_DEFS, createTrack, getBusTypeForTracks, calculateSummedDb,
  DEFAULT_PLATFORM, getPlatform, getSignalFlowStages, busTargetRange,
  analyzeDelivery, getGenreCrestDb,
  type PlatformId,
} from '../data';

export type SessionViewMode = 'flow' | 'mixer' | 'rack' | 'chain';

export interface SessionState {
  genre: Genre | null;
  size: SessionSize;
  /** Where the finished song gets uploaded: YouTube + Spotify by default. */
  platform: PlatformId;
  tracks: Track[];
  buses: Bus[];
  selectedTrackId: string | null;
  selectedBusId: string | null;
  deleteConfirmTrackId: string | null;
  editTrackId: string | null;
  addTrackModalOpen: boolean;
  viewMode: SessionViewMode;
  followMode: boolean;
  followStep: number;
  followPlaying: boolean;
  audioEnabled: boolean;
  mixBusDb: number;
  preMasterDb: number;
}

export type Action =
  | { type: 'SET_GENRE'; genre: Genre; tracks: TrackType[] }
  | { type: 'SET_SIZE'; size: SessionSize }
  | { type: 'SET_PLATFORM'; platform: PlatformId }
  | { type: 'ADD_TRACK'; trackType: TrackType }
  | { type: 'ADD_CUSTOM_TRACK'; track: Partial<Track> }
  | { type: 'REMOVE_TRACK'; trackId: string }
  | { type: 'SET_DELETE_CONFIRM'; trackId: string | null }
  | { type: 'SET_EDIT_TRACK'; trackId: string | null }
  | { type: 'SET_ADD_MODAL_OPEN'; open: boolean }
  | { type: 'UPDATE_TRACK'; trackId: string; updates: Partial<Track> }
  | { type: 'REORDER_TRACKS'; tracks: Track[] }
  | { type: 'MOVE_TRACK'; trackId: string; direction: 'up' | 'down' }
  | { type: 'DUPLICATE_TRACK'; trackId: string }
  | { type: 'UPDATE_LEVEL'; trackId: string; db: number }
  | { type: 'UPDATE_GAIN_TRIM'; trackId: string; trimDb: number }
  | { type: 'UPDATE_BUS_LEVEL'; busId: string; db: number }
  | { type: 'TOGGLE_MUTE'; trackId: string }
  | { type: 'TOGGLE_SOLO'; trackId: string }
  | { type: 'MUTE_ALL' }
  | { type: 'CLEAR_MUTES' }
  | { type: 'CLEAR_SOLOS' }
  | { type: 'SET_PAN'; trackId: string; pan: number }
  | { type: 'TOGGLE_TRACK_PLUGIN'; trackId: string; pluginIndex: number }
  | { type: 'TOGGLE_BUS_PLUGIN'; busId: string; pluginIndex: number }
  | { type: 'SELECT_TRACK'; trackId: string | null }
  | { type: 'SELECT_BUS'; busId: string | null }
  | { type: 'SET_VIEW_MODE'; viewMode: SessionViewMode }
  | { type: 'SET_AUDIO_ENABLED'; enabled: boolean }
  | { type: 'START_FOLLOW' }
  | { type: 'STOP_FOLLOW' }
  | { type: 'SET_FOLLOW_STEP'; step: number }
  | { type: 'TOGGLE_FOLLOW_PLAY' }
  | { type: 'RESET' };

function buildBuses(tracks: Track[], size: SessionSize, platform: PlatformId = DEFAULT_PLATFORM): Bus[] {
  const busTypes = getBusTypeForTracks(tracks, size);
  const buses: Bus[] = busTypes.map(bt => {
    const def = BUS_DEFS[bt];
    const busTracks = tracks.filter(t => t.bus === bt);
    const trackIds = busTracks.map(t => t.id);

    // Sum active (non-muted) tracks in this bus
    const activeTrackDbs = busTracks.filter(t => !t.muted).map(t => t.currentDb + t.gainTrimDb);
    const calculatedDb = activeTrackDbs.length > 0
      ? calculateSummedDb(activeTrackDbs) - 6 // Standard summing attenuation for headroom
      : -60;

    return {
      id: `bus-${bt}`,
      type: bt,
      name: def.name,
      color: def.color,
      icon: def.icon,
      dbRange: busTargetRange(def.dbRange, platform),
      currentDb: Math.max(-60, Math.min(3, calculatedDb)),
      trackIds,
      plugins: JSON.parse(JSON.stringify(def.suggestedPlugins)),
    };
  });
  return buses;
}

function calculateMasterLevels(
  buses: Bus[],
  tracks: Track[],
  platform: PlatformId = DEFAULT_PLATFORM,
  genre: Genre | null = null,
) {
  const anySolo = tracks.some(t => t.soloed);
  const activeTracks = tracks.filter(t => (anySolo ? t.soloed : !t.muted));
  const activeDbs = activeTracks.map(t => t.currentDb + t.gainTrimDb);

  // Summed peak across the stereo bus (uncorrelated power summation — the
  // worst case, and exactly why 20+ channels end up clipping the mix bus).
  const rawMixDb = activeDbs.length > 0 ? calculateSummedDb(activeDbs) : -60;
  const mixBusDb = Math.max(-60, Math.min(3, Math.round(rawMixDb * 10) / 10));

  // The pre-master true peak is whatever the platform's limiter ceiling allows.
  const preMasterDb =
    activeTracks.length === 0
      ? getPlatform(platform).masterCeiling
      : analyzeDelivery(mixBusDb, platform, getGenreCrestDb(genre)).truePeak;

  return { mixBusDb, preMasterDb };
}

const initialState: SessionState = {
  genre: null,
  size: 'medium',
  platform: DEFAULT_PLATFORM,
  tracks: [],
  buses: [],
  selectedTrackId: null,
  selectedBusId: null,
  deleteConfirmTrackId: null,
  editTrackId: null,
  addTrackModalOpen: false,
  viewMode: 'flow',
  followMode: false,
  followStep: 0,
  followPlaying: false,
  audioEnabled: false,
  mixBusDb: -3.5,
  preMasterDb: -1.0,
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'SET_GENRE': {
      const tracks = action.tracks.map(tt => createTrack(tt, state.platform));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, action.genre);
      return {
        ...state,
        genre: action.genre,
        tracks,
        buses,
        selectedTrackId: null,
        selectedBusId: null,
        deleteConfirmTrackId: null,
        editTrackId: null,
        mixBusDb,
        preMasterDb,
      };
    }

    /** Re-target the whole session for a different upload platform. */
    case 'SET_PLATFORM': {
      if (action.platform === state.platform) return state;
      const from = getPlatform(state.platform);
      const to = getPlatform(action.platform);
      const delta = to.trackTrimDb - from.trackTrimDb;

      const tracks = state.tracks.map(t => {
        if (delta === 0) return t;
        return {
          ...t,
          dbRange: [round1(t.dbRange[0] + delta), round1(t.dbRange[1] + delta)] as [number, number],
          currentDb: Math.max(-60, Math.min(0, round1(t.currentDb + delta))),
        };
      });

      const buses = buildBuses(tracks, state.size, action.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, action.platform, state.genre);

      return { ...state, platform: action.platform, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'SET_SIZE': {
      const buses = buildBuses(state.tracks, action.size);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, state.tracks);
      return { ...state, size: action.size, buses, mixBusDb, preMasterDb };
    }

    case 'ADD_TRACK': {
      const newTrack = createTrack(action.trackType, state.platform);
      const tracks = [...state.tracks, newTrack];
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return {
        ...state,
        tracks,
        buses,
        selectedTrackId: newTrack.id,
        addTrackModalOpen: false,
        mixBusDb,
        preMasterDb,
      };
    }

    case 'ADD_CUSTOM_TRACK': {
      const baseType = (action.track.type as TrackType) || 'synth';
      const template = createTrack(baseType, state.platform);
      const newTrack: Track = {
        ...template,
        ...action.track,
        id: `trk-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      } as Track;
      const tracks = [...state.tracks, newTrack];
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return {
        ...state,
        tracks,
        buses,
        selectedTrackId: newTrack.id,
        addTrackModalOpen: false,
        mixBusDb,
        preMasterDb,
      };
    }

    case 'REMOVE_TRACK': {
      const tracks = state.tracks.filter(t => t.id !== action.trackId);
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return {
        ...state,
        tracks,
        buses,
        selectedTrackId: state.selectedTrackId === action.trackId ? null : state.selectedTrackId,
        deleteConfirmTrackId: null,
        mixBusDb,
        preMasterDb,
      };
    }

    case 'SET_DELETE_CONFIRM':
      return { ...state, deleteConfirmTrackId: action.trackId };

    case 'SET_EDIT_TRACK':
      return { ...state, editTrackId: action.trackId };

    case 'SET_ADD_MODAL_OPEN':
      return { ...state, addTrackModalOpen: action.open };

    case 'UPDATE_TRACK': {
      const tracks = state.tracks.map(t => (t.id === action.trackId ? { ...t, ...action.updates } : t));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'REORDER_TRACKS': {
      return { ...state, tracks: action.tracks };
    }

    case 'MOVE_TRACK': {
      const index = state.tracks.findIndex(t => t.id === action.trackId);
      if (index === -1) return state;
      const targetIndex = action.direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.tracks.length) return state;

      const newTracks = [...state.tracks];
      const [moved] = newTracks.splice(index, 1);
      newTracks.splice(targetIndex, 0, moved);

      return { ...state, tracks: newTracks };
    }

    case 'DUPLICATE_TRACK': {
      const original = state.tracks.find(t => t.id === action.trackId);
      if (!original) return state;
      const index = state.tracks.findIndex(t => t.id === action.trackId);

      const duplicated: Track = {
        ...JSON.parse(JSON.stringify(original)),
        id: `trk-dup-${Date.now()}`,
        name: `${original.name} (Copy)`,
      };

      const newTracks = [...state.tracks];
      newTracks.splice(index + 1, 0, duplicated);
      const buses = buildBuses(newTracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, newTracks, state.platform, state.genre);

      return {
        ...state,
        tracks: newTracks,
        buses,
        selectedTrackId: duplicated.id,
        mixBusDb,
        preMasterDb,
      };
    }

    case 'UPDATE_LEVEL': {
      const tracks = state.tracks.map(t => (t.id === action.trackId ? { ...t, currentDb: action.db } : t));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'UPDATE_GAIN_TRIM': {
      const tracks = state.tracks.map(t => (t.id === action.trackId ? { ...t, gainTrimDb: action.trimDb } : t));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'UPDATE_BUS_LEVEL': {
      const buses = state.buses.map(b => (b.id === action.busId ? { ...b, currentDb: action.db } : b));
      return { ...state, buses };
    }

    case 'TOGGLE_MUTE': {
      const tracks = state.tracks.map(t => (t.id === action.trackId ? { ...t, muted: !t.muted } : t));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'TOGGLE_SOLO': {
      const tracks = state.tracks.map(t => (t.id === action.trackId ? { ...t, soloed: !t.soloed } : t));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'MUTE_ALL': {
      const allMuted = state.tracks.every(t => t.muted);
      const tracks = state.tracks.map(t => ({ ...t, muted: !allMuted }));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'CLEAR_MUTES': {
      const tracks = state.tracks.map(t => ({ ...t, muted: false }));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'CLEAR_SOLOS': {
      const tracks = state.tracks.map(t => ({ ...t, soloed: false }));
      const buses = buildBuses(tracks, state.size, state.platform);
      const { mixBusDb, preMasterDb } = calculateMasterLevels(buses, tracks, state.platform, state.genre);
      return { ...state, tracks, buses, mixBusDb, preMasterDb };
    }

    case 'SET_PAN': {
      const tracks = state.tracks.map(t => (t.id === action.trackId ? { ...t, pan: action.pan } : t));
      return { ...state, tracks };
    }

    case 'TOGGLE_TRACK_PLUGIN': {
      const tracks = state.tracks.map(t => {
        if (t.id !== action.trackId) return t;
        const plugins = t.plugins.map((p, idx) => (idx === action.pluginIndex ? { ...p, enabled: !p.enabled } : p));
        return { ...t, plugins };
      });
      return { ...state, tracks };
    }

    case 'TOGGLE_BUS_PLUGIN': {
      const buses = state.buses.map(b => {
        if (b.id !== action.busId) return b;
        const plugins = b.plugins.map((p, idx) => (idx === action.pluginIndex ? { ...p, enabled: !p.enabled } : p));
        return { ...b, plugins };
      });
      return { ...state, buses };
    }

    case 'SELECT_TRACK':
      return { ...state, selectedTrackId: action.trackId, selectedBusId: null };

    case 'SELECT_BUS':
      return { ...state, selectedBusId: action.busId, selectedTrackId: null };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.viewMode };

    case 'SET_AUDIO_ENABLED':
      return { ...state, audioEnabled: action.enabled };

    case 'START_FOLLOW':
      return { ...state, followMode: true, followStep: 0, followPlaying: true };

    case 'STOP_FOLLOW':
      return { ...state, followMode: false, followPlaying: false };

    case 'SET_FOLLOW_STEP':
      return { ...state, followStep: action.step };

    case 'TOGGLE_FOLLOW_PLAY':
      return { ...state, followPlaying: !state.followPlaying };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}

/** The delivery platform the session is targeted at (YouTube + Spotify by default). */
export function usePlatform() {
  const { state } = useSession();
  return useMemo(() => getPlatform(state.platform), [state.platform]);
}

/** Signal flow stages with dB targets resolved for the current platform. */
export function useSignalFlowStages() {
  const { state } = useSession();
  return useMemo(() => getSignalFlowStages(state.platform), [state.platform]);
}

/** Modelled loudness / true-peak / normalization result for the current session. */
export function useDeliveryAnalysis() {
  const { state } = useSession();
  return useMemo(
    () => analyzeDelivery(state.mixBusDb, state.platform, getGenreCrestDb(state.genre)),
    [state.mixBusDb, state.platform, state.genre],
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
