import { create } from 'zustand';
import { persist } from 'zustand/middleware'

type AppState = {
  audioMuted: boolean;
  showSubtitles: boolean;
  letterboxing: boolean;
  forceLandscape: boolean;
  looping: boolean;
  uiVisible: boolean;
  isRandomised: boolean;
  crtEffect: boolean;
  scenePreviewOnly: boolean;
  markerPreviewOnly: boolean;
  onlyShowMatchingOrientation: boolean;
  maxMedia: undefined | number;
  autoPlay: boolean;
  startPosition: 'resume' | 'beginning' | 'random';
  endPosition: 'video-end' | 'fixed-length' | 'random-length';
  playLength?: number;
  minPlayLength?: number;
  maxPlayLength?: number;
  showGuideOverlay?: boolean;
  // Non-persistent state
  showSettings: boolean;
  fullscreen: boolean;
  // Developer options
  showDevOptions: boolean;
  debugMode: boolean;
  enableRenderDebugging: boolean;
  videoJsEventsToLog: readonly string[];
}

type AppAction = {
  set: <PropName extends keyof AppState>(propName: PropName, value: AppState[PropName] | ((prev: AppState[PropName]) => AppState[PropName])) => void;
}

export const useAppStateStore = create<AppState & AppAction>()(
  persist(
    (set, get) => ({
      selectedSavedFilterId: undefined,
      sceneFilter: undefined,
      sceneFilterLoading: true,
      showSettings: false,
      audioMuted: true,
      showSubtitles: false,
      fullscreen: false,
      letterboxing: false,
      forceLandscape: false,
      looping: false,
      uiVisible: true,
      isRandomised: false,
      crtEffect: false,
      scenePreviewOnly: false,
      markerPreviewOnly: false,
      onlyShowMatchingOrientation: false,
      maxMedia: undefined,
      autoPlay: true,
      startPosition: 'resume',
      endPosition: 'video-end',
      showGuideOverlay: true,
      showDevOptions: false,
      debugMode: false,
      enableRenderDebugging: JSON.parse(localStorage.getItem("enableRenderDebugging") || "false"),
      videoJsEventsToLog: [],
      set: <PropName extends keyof AppState>(propName: PropName, value: AppState[PropName] | ((prev: AppState[PropName]) => AppState[PropName])) => {
        set((state) => ({
          [propName]: typeof value === "function" ? value(state[propName]) : value
        }));
      },
    }),
    {
      name: 'app-state',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ![
            'showSettings',
            'fullscreen',
            'enableRenderDebugging'
          ].includes(key)),
        ),
    }
  )
);
