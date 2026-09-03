import { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  type Track, type Bus, type Genre, type SessionSize, type BusType,
   TRACK_DEFS, BUS_DEFS, createTrack, getBusTypeForTracks,
  type TrackType,
} from '../data';

interface SessionState {
  genre: Genre | null;
  size: SessionSize;
  tracks: Track[];
  buses: Bus[];
  selectedTrackId: string | null;
  selectedBusId: string | null;
  followMode: boolean;
  followStep: number;
  followPlaying: boolean;
  showBuilder: boolean;
}

type Action =
  | { type: 'SET_GENRE'; genre: Genre; tracks: TrackType[] }
  | { type: 'SET_SIZE'; size: SessionSize }
  | { type: 'ADD_TRACK'; trackType: TrackType }
  | { type: 'REMOVE_TRACK'; trackId: string }
  | { type: 'UPDATE_LEVEL'; trackId: string; db: number }
  | { type: 'UPDATE_BUS_LEVEL'; busId: string; db: number }
  | { type: 'TOGGLE_MUTE'; trackId: string }
  | { type: 'TOGGLE_SOLO'; trackId: string }
  | { type: 'SET_PAN'; trackId: string; pan: number }
  | { type: 'SELECT_TRACK'; trackId: string | null }
  | { type: 'SELECT_BUS'; busId: string | null }
  | { type: 'START_FOLLOW' }
  | { type: 'STOP_FOLLOW' }
  | { type: 'SET_FOLLOW_STEP'; step: number }
  | { type: 'TOGGLE_FOLLOW_PLAY' }
  | { type: 'SHOW_BUILDER' }
  | { type: 'RESET' };

function buildBuses(tracks: Track[], size: SessionSize): Bus[] {
  const busTypes = getBusTypeForTracks(tracks, size);
  const buses: Bus[] = busTypes.map(bt => {
    const def = BUS_DEFS[bt];
    const trackIds = tracks.filter(t => t.bus === bt).map(t => t.id);
    const midDb = Math.round((def.dbRange[0] + def.dbRange[1]) / 2);
    return {
      id: `bus-${bt}`,
      type: bt,
      name: def.name,
      color: def.color,
      icon: def.icon,
      dbRange: def.dbRange,
      currentDb: midDb,
      trackIds,
    };
  });
  return buses;
}

const initialState: SessionState = {
  genre: null,
  size: 'medium',
  tracks: [],
  buses: [],
  selectedTrackId: null,
  selectedBusId: null,
  followMode: false,
  followStep: 0,
  followPlaying: false,
  showBuilder: false,
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'SET_GENRE': {
      const tracks = action.tracks.map(tt => createTrack(tt));
      const buses = buildBuses(tracks, state.size);
      return { ...state, genre: action.genre, tracks, buses, showBuilder: true };
    }
    case 'SET_SIZE': {
      const buses = buildBuses(state.tracks, action.size);
      return { ...state, size: action.size, buses };
    }
    case 'ADD_TRACK': {
      const newTrack = createTrack(action.trackType);
      const tracks = [...state.tracks, newTrack];
      const buses = buildBuses(tracks, state.size);
      return { ...state, tracks, buses };
    }
    case 'REMOVE_TRACK': {
      const tracks = state.tracks.filter(t => t.id !== action.trackId);
      const buses = buildBuses(tracks, state.size);
      return { ...state, tracks, buses, selectedTrackId: state.selectedTrackId === action.trackId ? null : state.selectedTrackId };
    }
    case 'UPDATE_LEVEL': {
      const tracks = state.tracks.map(t => t.id === action.trackId ? { ...t, currentDb: action.db } : t);
      return { ...state, tracks };
    }
    case 'UPDATE_BUS_LEVEL': {
      const buses = state.buses.map(b => b.id === action.busId ? { ...b, currentDb: action.db } : b);
      return { ...state, buses };
    }
    case 'TOGGLE_MUTE': {
      const tracks = state.tracks.map(t => t.id === action.trackId ? { ...t, muted: !t.muted } : t);
      return { ...state, tracks };
    }
    case 'TOGGLE_SOLO': {
      const tracks = state.tracks.map(t => t.id === action.trackId ? { ...t, soloed: !t.soloed } : t);
      return { ...state, tracks };
    }
    case 'SET_PAN': {
      const tracks = state.tracks.map(t => t.id === action.trackId ? { ...t, pan: action.pan } : t);
      return { ...state, tracks };
    }
    case 'SELECT_TRACK':
      return { ...state, selectedTrackId: action.trackId, selectedBusId: null };
    case 'SELECT_BUS':
      return { ...state, selectedBusId: action.busId, selectedTrackId: null };
    case 'START_FOLLOW':
      return { ...state, followMode: true, followStep: 0, followPlaying: true };
    case 'STOP_FOLLOW':
      return { ...state, followMode: false, followPlaying: false };
    case 'SET_FOLLOW_STEP':
      return { ...state, followStep: action.step };
    case 'TOGGLE_FOLLOW_PLAY':
      return { ...state, followPlaying: !state.followPlaying };
    case 'SHOW_BUILDER':
      return { ...state, showBuilder: true };
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

export type { SessionState };
