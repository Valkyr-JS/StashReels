import { create } from 'zustand';

import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { type ApolloClient, type NormalizedCacheObject } from "@apollo/client";

export type SceneFilter = {
  generalFilter: GQL.FindScenesForTvQueryVariables["filter"],
  sceneFilter: GQL.FindScenesForTvQueryVariables["scene_filter"],
}

type AppState = {
  selectedSavedFilterId: string | undefined,
  sceneFilter: SceneFilter | undefined,
  scenes: GQL.TvSceneDataFragment[],
  scenesLoading: boolean;
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
  setSelectedSavedFilterId: (id: string | undefined) => void;
  setSceneFilter: (apolloClient: ApolloClient<NormalizedCacheObject>, filter: SceneFilter) => Promise<void>;
  setShowSettings: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setAudioMuted: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setShowSubtitles: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setFullscreen: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setLetterboxing: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setForceLandscape: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setLooping: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setUiVisible: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setIsRandomised: (newValue: boolean | ((prev: boolean) => boolean)) => void;
  setCrtEffect: (newValue: boolean | ((prev: boolean) => boolean)) => void;
}

export const useAppStateStore = create<AppState>((set, get) => ({
  selectedSavedFilterId: undefined,
  sceneFilter: undefined,
  scenes: [],
  scenesLoading: true,
  showSettings: false,
  audioMuted: false,
  showSubtitles: false,
  fullscreen: false,
  letterboxing: false,
  forceLandscape: false,
  looping: false,
  uiVisible: true,
  isRandomised: false,
  crtEffect: false,
  setSelectedSavedFilterId: (id: string | undefined) => set({ selectedSavedFilterId: id }),
  setSceneFilter: async (apolloClient: ApolloClient<NormalizedCacheObject>, filter: SceneFilter) => {
    set({ scenesLoading: true });
    const scenes = await fetchScenesFromStash(apolloClient, filter)
    set({ sceneFilter: filter, scenes, scenesLoading: false })
  },
  setShowSettings: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    showSettings: typeof newValue === "boolean" ? newValue : newValue(state.showSettings)
  })),
  setAudioMuted: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    audioMuted: typeof newValue === "boolean" ? newValue : newValue(state.audioMuted)
  })),
  setShowSubtitles: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    showSubtitles: typeof newValue === "boolean" ? newValue : newValue(state.showSubtitles)
  })),
  setFullscreen: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    fullscreen: typeof newValue === "boolean" ? newValue : newValue(state.fullscreen)
  })),
  setLetterboxing: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    letterboxing: typeof newValue === "boolean" ? newValue : newValue(state.letterboxing)
  })),
  setForceLandscape: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    forceLandscape: typeof newValue === "boolean" ? newValue : newValue(state.forceLandscape)
  })),
  setLooping: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    looping: typeof newValue === "boolean" ? newValue : newValue(state.looping)
  })),
  toggleLooping: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    looping: typeof newValue === "boolean" ? newValue : newValue(state.looping)
  })),
  setUiVisible: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    uiVisible: typeof newValue === "boolean" ? newValue : newValue(state.uiVisible)
  })),
  setIsRandomised: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    isRandomised: typeof newValue === "boolean" ? newValue : newValue(state.isRandomised)
  })),
  setCrtEffect: (newValue: boolean | ((prev: boolean) => boolean)) => set((state) => ({
    crtEffect: typeof newValue === "boolean" ? newValue : newValue(state.crtEffect)
  })),
}));

async function fetchScenesFromStash(apolloClient: ApolloClient<NormalizedCacheObject>, filter: SceneFilter): Promise<GQL.TvSceneDataFragment[]> {
  const { data } = await apolloClient.query<GQL.FindScenesForTvQuery, GQL.FindScenesForTvQueryVariables>({
    query: GQL.FindScenesForTvDocument,
    variables: { 
      filter: filter.generalFilter,
      scene_filter: filter.sceneFilter
    },
  });

  return data.findScenes.scenes;
}