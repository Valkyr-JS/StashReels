import { LogLevel } from '@logtape/logtape';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import { defaultLogLevel } from '../helpers/logging';

export type DebuggingInfo = "render-debugging" | "onscreen-info";

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
  logLevel: LogLevel;
  loggersToShow: (readonly string[])[];
  loggersToHide: (readonly string[])[];
  showDebuggingInfo: (DebuggingInfo)[];
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
      logLevel: defaultLogLevel,
      loggersToShow: [],
      loggersToHide: [],
      showDebuggingInfo: [],
      videoJsEventsToLog: [],
      set: <PropName extends keyof AppState>(propName: PropName, value: AppState[PropName] | ((prev: AppState[PropName]) => AppState[PropName])) => {
        set((state) => {
          const resolvedValue = typeof value === "function" ? value(state[propName]) : value
          // For enableRenderDebugging we also save the enableRenderDebugging option separately in localStorage
          // so so that it can be read by renderDebugger.ts at the very start of the app even if we end up moving
          // to storing settings in stash and need to do an api request to fetch.
          if (propName === 'showDebuggingInfo') {
            const enableRenderDebugging = (resolvedValue as AppState['showDebuggingInfo'])
              .includes("render-debugging");
            const previousEnableRenderDebugging = localStorage.getItem("enableRenderDebugging") === "true";
            // We reload since renderDebugger.ts must be initialised at app start
            if (previousEnableRenderDebugging !== enableRenderDebugging) {
              // Allow time for zustand to save new state
              setTimeout(() => {
                localStorage.setItem("enableRenderDebugging", JSON.stringify(enableRenderDebugging));
                window.location.reload()
              }, 30);
            }
          }
          return {
            [propName]: resolvedValue,
          };
        });
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
