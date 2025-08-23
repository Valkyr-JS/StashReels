import React, { useEffect, useRef } from "react";
import FeedPage from "../pages/Feed";
import {
  setCssVH,
} from "../helpers";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { ListFilterModel } from "stash-ui/dist/src/models/list-filter/filter";
import { StashTvConfig, useStashConfigStore } from "../store/stashConfigStore";
import { useApolloClient, ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { SceneFilter, useAppStateStore } from "../store/appStateStore";

const App = () => {
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  setCssVH();

  const { loadStashConfig, getSavedFilter, stashTvConfig, loading: stashConfigLoading,  } = useStashConfigStore();
  const { setSceneFilter, sceneFilter, scenesLoading, selectedSavedFilterId, setSelectedSavedFilterId, ...otherAppState  } = useAppStateStore()
  

  /* ------------------------------ Initial load ------------------------------ */
  useEffect(() => {
    if (!apolloClient) return;
    loadStashConfig(apolloClient).catch((error) => {
      console.error("Error loading stash config:", error);
    });
  }, [apolloClient]);
  
  useEffect(() => {
    setSelectedSavedFilterId(stashTvConfig.stashTvDefaultFilterID)
  }, [stashTvConfig.stashTvDefaultFilterID])

  const selectedSavedFilterIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (stashConfigLoading) return;
    selectedSavedFilterIdRef.current = selectedSavedFilterId;
    getSavedFilter(selectedSavedFilterId).then(savedFilter => {
      if (selectedSavedFilterIdRef.current !== selectedSavedFilterId) return;
      if (savedFilter) {
        setSceneFilter(
          apolloClient,
          {
            generalFilter: processSavedFilterToGeneralFilter(
              savedFilter,
              stashTvConfig,
              otherAppState
            ),
            sceneFilter: processSavedFilterToSceneFilter(savedFilter)
          }
        );
      } else {
        // TODO: set our own default filter if no saved filter or default filter in stash is found
      }
    });
  }, [stashConfigLoading, selectedSavedFilterId, otherAppState.isRandomised]);

  return (
    <FeedPage />
  );
};

export default App;

const processSavedFilterToGeneralFilter = (
  savedFilter: GQL.SavedFilterDataFragment,
  stashTvConfig: StashTvConfig,
  otherAppState: {isRandomised: boolean}
): SceneFilter["generalFilter"] => {
  const filter = new ListFilterModel(GQL.FilterMode.Scenes)
  filter.configureFromSavedFilter(savedFilter);
  const updatedFilter = { ...filter.makeFindFilter() };

  if (updatedFilter.sort?.match(/^random_\d*$/) || otherAppState.isRandomised) {
    let seed = Math.round(Math.random() * 1000000)
    updatedFilter.sort = `random_${seed}`
  }

  // Always get the set number of scenes, irrelevant of what the original filter
  // states.
  updatedFilter.per_page = stashTvConfig.maximumScenes;

  return updatedFilter;
};

/** Process the raw `object_filter` data from Stash into GQL. */
const processSavedFilterToSceneFilter = (savedFilter: GQL.SavedFilterDataFragment): SceneFilter["sceneFilter"] => {
  const filter = new ListFilterModel(GQL.FilterMode.Scenes)
  filter.configureFromSavedFilter(savedFilter);

  return filter.makeFilter();
};
