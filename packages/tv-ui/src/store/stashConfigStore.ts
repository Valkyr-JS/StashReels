import { create } from "zustand";
import { PLUGIN_NAMESPACE } from "../constants";
import { type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

export type StashTvConfig = {
  /** The ID of the default filter to be loaded on startup. */
  stashTvDefaultFilterID?: string,
  /** Hide the main navigation link to Stash TV. */
  hideNavButton?: boolean,
  /** The subtitle language code to be used when available. */
  subtitleLanguage?: string;
}

type StashConfigState = {
  stashDefaultScenesFilter: GQL.SavedFilterDataFragment | undefined,
  savedSceneFilters: GQL.SavedFilterDataFragment[],
  stashTvConfig: StashTvConfig,
  loading: boolean,
  apolloClient: ApolloClient<NormalizedCacheObject> | undefined
}

type StashConfigAction = {
  loadStashConfig: (apolloClient: ApolloClient<NormalizedCacheObject>) => Promise<void>,
  updateStashTvConfig: (config: StashConfigState["stashTvConfig"]) => void,
  getSavedFilter: (id?: string) => Promise<GQL.SavedFilterDataFragment | undefined>,
}

export const useStashConfigStore = create<StashConfigState & StashConfigAction>((set, get) => ({
  stashDefaultScenesFilter: undefined,
  savedSceneFilters: [],
  stashTvConfig: {
    defaultFilterID: undefined,
  },
  apolloClient: undefined,
  loading: true,
  loadStashConfig: async (apolloClient: ApolloClient<NormalizedCacheObject>) => {
    const { stashTvConfig } = get();
    const config = await fetchStashConfigFromStash(apolloClient)
    set({
        stashDefaultScenesFilter: config.configuration.ui.defaultFilters?.scenes,
        savedSceneFilters: config.findSavedFilters.map(filter => ({...filter, mode: GQL.FilterMode.Scenes})),
        stashTvConfig: {
            ...stashTvConfig,
            ...config.configuration.plugins?.[PLUGIN_NAMESPACE] || {},
        },
        loading: false,
        apolloClient,
    })
  },
  updateStashTvConfig: async (config: StashConfigState["stashTvConfig"]) => {
    const {apolloClient} = get();
    if (!apolloClient) {
        throw new Error("Apollo Client is not initialized");
    }
    set((state) => ({
      stashTvConfig: {
        ...state.stashTvConfig,
        ...config,
      },
    }))
    await updateStashTvConfigInStash(apolloClient, config);
  },
  getSavedFilter: async (id?: string) => {
    const {apolloClient, savedSceneFilters, stashDefaultScenesFilter} = get();
    if (!apolloClient) {
        throw new Error("Apollo Client is not initialized");
    }
    if (!id) {
      return stashDefaultScenesFilter;
    }
    let sceneFilter = savedSceneFilters.find((filter) => filter.id === id);
    if (sceneFilter?.find_filter) {
      return sceneFilter;
    }
    sceneFilter = await fetchSavedFilterFromStash(apolloClient, id).then((data) => data.findSavedFilter) || undefined;
    if (!sceneFilter) {
      return undefined;
    }
    set((state) => ({
      ...state,
      savedSceneFilters: [...state.savedSceneFilters.filter(s => s.id !== sceneFilter?.id), sceneFilter],
    }))
    return sceneFilter;
  },
}))

async function fetchStashConfigFromStash(apolloClient: ApolloClient<NormalizedCacheObject>): Promise<GQL.GetStashConfigForTvQuery> {
  const { data } = await apolloClient.query<GQL.GetStashConfigForTvQuery>({
    query: GQL.GetStashConfigForTvDocument,
  });

  return data;
}

async function fetchSavedFilterFromStash(apolloClient: ApolloClient<NormalizedCacheObject>, filterId: string): Promise<GQL.FindSavedFilterQuery> {
  const { data } = await apolloClient.query<GQL.FindSavedFilterQuery, GQL.FindSavedFilterQueryVariables>({
    query: GQL.FindSavedFilterDocument,
    variables: { id: filterId },
  });

  return data;
}

async function updateStashTvConfigInStash(apolloClient: ApolloClient<NormalizedCacheObject>, config: GQL.ConfigurePluginMutationVariables["input"]): Promise<void> {
  await apolloClient.mutate<GQL.ConfigurePluginMutation, GQL.ConfigurePluginMutationVariables>({
    mutation: GQL.ConfigurePluginDocument,
    variables: {
        plugin_id: PLUGIN_NAMESPACE,
        input: config
    },
  });
}