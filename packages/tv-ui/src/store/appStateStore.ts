import { LogLevel } from '@logtape/logtape';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware'
import { defaultLogLevel } from '../helpers/logging';
import type { ActionButtonConfig } from '../components/slide/ActionButtons';
import { stashConfigStorage } from '../helpers/stash-config-storage';
export type DebuggingInfo = "render-debugging" | "onscreen-info";

export const appStateStorageKey = 'app-state';

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
  leftHandedUi?: boolean;
  actionButtonsConfig: ActionButtonConfig[];
  currentFilterId?: string;
  // Non-persistent state
  showSettings: boolean;
  fullscreen: boolean;
  storeLoaded: boolean;
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
  setToDefault: <PropName extends keyof typeof defaults>(propName: PropName) => void;
  getDefault: <PropName extends keyof typeof defaults>(propName: PropName) => typeof defaults[PropName];
}

const defaults = {
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
  storeLoaded: false,
  actionButtonsConfig: [
    {id: "1", type: "ui-visibility", pinned: true},
    {id: "2", type: "settings", pinned: false},
    {id: "3", type: "show-scene-info", pinned: false},
    {id: "4", type: "rate-scene", pinned: false},
    {id: "5", type: "o-counter", pinned: false},
    {id: "6", type: "force-landscape", pinned: false},
    {id: "7", type: "fullscreen", pinned: false},
    {id: "8", type: "mute", pinned: false},
    {id: "9", type: "letterboxing", pinned: false},
    {id: "10", type: "loop", pinned: false},
    {id: "11", type: "subtitles", pinned: false},
  ],
} satisfies AppState;

const nonPersistentKeys: (keyof AppState)[] = [
  'storeLoaded',
  'showSettings',
  'fullscreen',
  'showDebuggingInfo'
]

export const useAppStateStore = create<AppState & AppAction>()(
  persist(
    (set, get) => ({
      ...defaults,
      set: <PropName extends keyof AppState>(propName: PropName, value: AppState[PropName] | ((prev: AppState[PropName]) => AppState[PropName])) => {
        set((state) => {
          const resolvedValue = typeof value === "function" ? value(state[propName]) : value
          // For enableRenderDebugging we also save the enableRenderDebugging option separately in localStorage
          // so so that it can be read by renderDebugger.ts at the very start of the app before we've received the store
          // state from stash.
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
              }, 300);
            }
          }
          return {
            [propName]: resolvedValue,
          };
        });
      },
      setToDefault: <PropName extends keyof typeof defaults>(propName: PropName) => {
        set((state) => {
          return {
            [propName]: defaults[propName],
          };
        });
      },
      getDefault: <PropName extends keyof typeof defaults>(propName: PropName) => {
        return defaults[propName];
      },
    }),
    {
      name: appStateStorageKey,
      storage: createJSONStorage(() => stashConfigStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !(nonPersistentKeys as string[]).includes(key)),
        ),
      onRehydrateStorage: (state) => {
        return () => state.set("storeLoaded", true)
      }
    }
  )
);
