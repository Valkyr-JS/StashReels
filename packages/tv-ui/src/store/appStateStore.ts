import { LogLevel } from '@logtape/logtape';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'
import { defaultLogLevel } from '../helpers/logging';
import type { ActionButtonConfig } from '../components/slide/ActionButtons';

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
  leftHandedUi?: boolean;
  actionButtonsConfig: ActionButtonConfig[];
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
  setDefault: <PropName extends keyof AppState>(propName: PropName) => void;
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
  actionButtonsConfig: [
    {id: "1", type: "ui-visibility", pinned: true},
    {id: "2", type: "settings"},
    {id: "3", type: "show-scene-info"},
    {id: "4", type: "rate-scene"},
    {id: "5", type: "o-counter"},
    {id: "6", type: "force-landscape"},
    {id: "7", type: "fullscreen"},
    {id: "8", type: "mute"},
    {id: "9", type: "letterboxing"},
    {id: "10", type: "loop"},
    {id: "11", type: "subtitles"},
  ],
} satisfies AppState;

export const useAppStateStore = create<AppState & AppAction>()(
  persist(
    (set, get) => ({
      ...defaults,
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
      setDefault: <PropName extends keyof typeof defaults>(propName: PropName) => {
        set((state) => {
          return {
            [propName]: defaults[propName],
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
