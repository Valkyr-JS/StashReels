import { create } from "zustand";
import { PLUGIN_NAMESPACE } from "../constants";
import { type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

/** Config saved in Stash but managed and only use by Stash TV */
export type StashTvConfigState = {
  /** The ID of the default filter to be loaded on startup. */
  defaultFilterId?: string,
  /** Hide the main navigation link to Stash TV. */
  hideNavButton?: boolean,
  /** The subtitle language code to be used when available. */
  subtitleLanguage?: string;
}

/** Config saved in Stash that is not not managed by Stash TV */
type StashGeneralConfigState = {
  stashDefaultScenesFilter: GQL.SavedFilterDataFragment | undefined,
  availableSavedSceneFilters: GQL.GetStashConfigForTvQuery["availableSavedSceneFilters"],
  availableSavedMarkerFilters: GQL.GetStashConfigForTvQuery["availableSavedMarkerFilters"],
}

type StashConfig = {
  general: StashGeneralConfigState,
  tv: StashTvConfigState,
  loading: boolean,
  loadStashConfig: (apolloClient: ApolloClient<NormalizedCacheObject>) => Promise<void>,
  updateStashTvConfig: (apolloClient: ApolloClient<NormalizedCacheObject>, config: StashTvConfigState) => void,
}

export const useStashConfigStore = create<StashConfig>((set, get) => ({
  general: {
    stashDefaultScenesFilter: undefined,
    availableSavedSceneFilters: [],
    availableSavedMarkerFilters: [],
  },
  tv: {
    defaultFilterId: undefined,
    hideNavButton: false,
    subtitleLanguage: undefined,
  },
  loading: true,
  loadStashConfig: async (apolloClient: ApolloClient<NormalizedCacheObject>) => {
    const { general, tv } = get();
    const config = await fetchStashConfigFromStash(apolloClient)
    set({
      general: {
        ...general,
        stashDefaultScenesFilter: config.configuration.ui.defaultFilters?.scenes,
        availableSavedSceneFilters: config.availableSavedSceneFilters,
        availableSavedMarkerFilters: config.availableSavedMarkerFilters,
      },
      tv: {
          ...tv,
          ...config.configuration.plugins?.[PLUGIN_NAMESPACE] || {},
      },
      loading: false,
    })
  },
  /** 
   * Updates the Stash TV config stored in Stash.
   * 
   * Providing a function will allow you to specify how the new config is merged with the existing config.
   * Otherwise if an object is provided all top-level properties will be merged.
   */
  updateStashTvConfig: async (
    apolloClient: ApolloClient<NormalizedCacheObject>,
    config: StashTvConfigState | ((currentConfig: StashTvConfigState) => StashTvConfigState)
  ) => {
    if (!apolloClient) {
        throw new Error("Apollo Client is not initialized");
    }
    const currentConfig = get().tv;
    if (typeof config === "function") {
      config = config(currentConfig);
    } else {
      config = {
        ...currentConfig,
        ...config,
      };
    }
    set({ tv: config });
    await updateStashTvConfigInStash(apolloClient, config);
  },
}))

async function fetchStashConfigFromStash(apolloClient: ApolloClient<NormalizedCacheObject>): Promise<GQL.GetStashConfigForTvQuery> {
  const { data } = await apolloClient.query<GQL.GetStashConfigForTvQuery>({
    query: GQL.GetStashConfigForTvDocument,
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