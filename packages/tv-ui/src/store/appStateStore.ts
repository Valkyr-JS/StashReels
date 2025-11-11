import { create } from 'zustand';
import { persist } from 'zustand/middleware'

type AppState = {
  showSettings: boolean;
  audioMuted: boolean;
  showSubtitles: boolean;
  fullscreen: boolean;
  letterboxing: boolean;
  forceLandscape: boolean;
  looping: boolean;
  uiVisible: boolean;
  isRandomised: boolean;
  crtEffect: boolean;
  scenePreviewOnly: boolean;
  onlyShowMatchingOrientation: boolean;
  showDevOptions: boolean;
  debugMode: boolean;
  maxMedia: undefined | number;
  autoPlay: boolean;
  startPosition: 'resume' | 'beginning' | 'random';
  showGuideOverlay?: boolean;
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
      onlyShowMatchingOrientation: false,
      showDevOptions: false,
      debugMode: false,
      maxMedia: undefined,
      autoPlay: true,
      startPosition: 'resume',
      showGuideOverlay: true,
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
            'fullscreen'
          ].includes(key)),
        ),
    }
  )
);
