
import { useApolloClient, type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import { useEffect, useMemo } from "react";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useStashConfigStore } from "../store/stashConfigStore";
import { ListFilterModel } from "stash-ui/dist/src/models/list-filter/filter";
import { useAppStateStore } from "../store/appStateStore";
import { createGlobalState } from "react-use";
import { useWindowSize } from "./useWindowSize";

export type SceneFilter = {
  generalFilter: GQL.FindScenesForTvQueryVariables["filter"],
  sceneFilter: GQL.FindScenesForTvQueryVariables["scene_filter"],
}

const useCurrentStashFilter = createGlobalState<GQL.SavedFilterDataFragment | undefined>();
const useSceneFiltersLoading = createGlobalState(true);
const useSceneFiltersError = createGlobalState<unknown>();

export function useSceneFilters() {
  const [sceneFiltersLoading, setSceneFiltersLoading] = useSceneFiltersLoading();
  const [sceneFiltersError, setSceneFiltersError] = useSceneFiltersError();
  const [currentStashFilter, setCurrentStashFilter] = useCurrentStashFilter();
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  const {
    general: { stashDefaultScenesFilter, savedSceneFiltersNameAndIds },
    tv: { defaultFilterId: stashTvDefaultFilterId },
    loading: stashConfigLoading,
  } = useStashConfigStore();
  const { isRandomised, onlyShowMatchingOrientation } = useAppStateStore();
  const { orientation } = useWindowSize()
  
  let limitOrientation: "landscape" | "portrait" | undefined = undefined
  if (onlyShowMatchingOrientation && orientation !== "square") {
    limitOrientation = orientation
  }
  
  const currentSceneFilter = useMemo(
    () => currentStashFilter && convertSavedFilterInStashFormatToUsableFormat(currentStashFilter),
    [currentStashFilter, isRandomised, onlyShowMatchingOrientation && orientation]
  );
  const currentSceneFilterId = useMemo(
    () => currentStashFilter?.id,
    [currentStashFilter]
  );
  
  
  
  // Load default filter on initial load.
  useEffect(() => {
    if (stashConfigLoading || currentSceneFilter) return;
    // Place most of the logic into a separate function so we can use async/await
    async function setCurrentSceneFilterOnInitialLoad() {
      try {
        if (stashTvDefaultFilterId) {
          await setCurrentSceneFilterById(stashTvDefaultFilterId)
        } else if (stashDefaultScenesFilter)  {
          // No default filter ID set for Stash TV specifically so we use the default Stash filter
          setCurrentStashFilter(stashDefaultScenesFilter)
        } else {
          // No Stash default filter so we should use an empty filter
          setCurrentStashFilter({
            id: "",
            mode: GQL.FilterMode.Scenes,
            name: "",
          })
        }
      } catch (error) {
        setSceneFiltersError(error);
      }
      setSceneFiltersLoading(false);
    }
    setCurrentSceneFilterOnInitialLoad()
  }, [stashConfigLoading, stashTvDefaultFilterId, stashDefaultScenesFilter]);

  async function setCurrentSceneFilterById(id: string) {
    const sceneFiltersStashResponse = await fetchSavedFilterFromStash(apolloClient, id);

    if (!sceneFiltersStashResponse) {
      // Stash has no record of a filter with this ID
      return undefined;
    }
    
    setCurrentStashFilter(sceneFiltersStashResponse);
  }

  async function fetchSavedFilterFromStash(apolloClient: ApolloClient<NormalizedCacheObject>, filterId: string): Promise<GQL.SavedFilterDataFragment | null> {
    const { data } = await apolloClient.query<GQL.FindSavedFilterQuery, GQL.FindSavedFilterQueryVariables>({
      query: GQL.FindSavedFilterDocument,
      variables: { id: filterId },
    });

    return data?.findSavedFilter ?? null;
  }
  
  function convertSavedFilterInStashFormatToUsableFormat(
    stashFormatFilter: GQL.SavedFilterDataFragment
  ): SceneFilter {
    return {
      generalFilter: processSavedFilterToGeneralFilter(
        stashFormatFilter,
        { forceRandomise: isRandomised }
      ),
      sceneFilter: processSavedFilterToSceneFilter(
        stashFormatFilter,
        { limitOrientation }
      )
    }
  }
  
  return {
    sceneFiltersLoading,
    sceneFiltersError,
    currentSceneFilter,
    currentSceneFilterId,
    setCurrentSceneFilterById,
    sceneFiltersNameAndIds: savedSceneFiltersNameAndIds,
    defaultStashTvFilterId: stashTvDefaultFilterId,
    currentStashFilter,
  }
}

const processSavedFilterToGeneralFilter = (
  savedFilter: GQL.SavedFilterDataFragment,
  { forceRandomise }: { forceRandomise?: boolean } = {}
): SceneFilter["generalFilter"] => {
  const filter = new ListFilterModel(GQL.FilterMode.Scenes)
  filter.configureFromSavedFilter(savedFilter);
  const updatedFilter = { ...filter.makeFindFilter() };

  if (updatedFilter.sort?.match(/^random_\d*$/) || forceRandomise) {
    let seed = Math.round(Math.random() * 1000000)
    updatedFilter.sort = `random_${seed}`
  }

  return updatedFilter;
};

/** Process the raw `object_filter` data from Stash into GQL. */
const processSavedFilterToSceneFilter = (
  savedFilter: GQL.SavedFilterDataFragment,
   { limitOrientation }: { limitOrientation?: "landscape" | "portrait" } = {}
): SceneFilter["sceneFilter"] => {
  const filter = new ListFilterModel(GQL.FilterMode.Scenes)
  filter.configureFromSavedFilter(savedFilter);

  const sceneFilter = filter.makeFilter();
  if (limitOrientation) {
    sceneFilter.orientation = {
      "value": [
        limitOrientation.toUpperCase(),
        "SQUARE"
      ]
    };
	}
  
  return sceneFilter;
};
