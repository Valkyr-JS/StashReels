
import { useApolloClient, type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import { useEffect, useMemo } from "react";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useStashConfigStore } from "../store/stashConfigStore";
import { ListFilterModel } from "stash-ui/dist/src/models/list-filter/filter";
import { useAppStateStore } from "../store/appStateStore";
import { useWindowSize } from "./useWindowSize";
import { create } from "zustand";

/** In Stash a filter has a different format when it's saved vs when it's used in a search. The stash codebase doesn't
 * seem to do a great job of naming these different formats to make that clear. When a filter is saved it usually just
 * referred to as a saved filter but when it's used in a search it's referred to as a by the type of entity being
 * searched, like a scene filter.
 * 
 * To make this clearer we use "saved filter" to refer to a filter in its saved format (or "saved scene filter" for 
 * specifically a scene filter) and "searchable filter" to refer to a filter in its searchable format (or "searchable 
 * scene filter" for specifically a scene filter).
 * 
 * The rest of the Stash TV codebase pretty much only deals with the searchable format so we just hide this distinction
 * and only present the searchable format outside of this file which we simply refer to as a "filter" (or "scene filter"
 * for specifically a scene filter).
 */

type SavedSceneFilter = GQL.SavedFilter

export type SearchableSceneFilter = {
  savedFilter?: SavedSceneFilter,
  generalFilter: GQL.FindScenesForTvQueryVariables["filter"],
  sceneFilter: GQL.FindScenesForTvQueryVariables["scene_filter"],
  isStashTvDefaultFilter: boolean,
}

const useGlobalFilterState = create<{
  currentSavedFilter: SavedSceneFilter | undefined,
  setCurrentSavedFilter: (filter: SavedSceneFilter | undefined) => void,
  loading: boolean,
  setLoading: (loading: boolean) => void,
  error: unknown,
  setError: (error: unknown) => void,
}>((set, get) => ({
  currentSavedFilter: undefined,
  setCurrentSavedFilter: (filter: SavedSceneFilter | undefined) => set({ currentSavedFilter: filter }),
  loading: true,
  setLoading: (loading: boolean) => set({ loading }),
  error: undefined,
  setError: (error: unknown) => set({ error }),
}))

export function useSceneFilters() {
  const {
    currentSavedFilter,
    setCurrentSavedFilter,
    loading: sceneFiltersLoading,
    setLoading: setSceneFiltersLoading,
    error: sceneFiltersError,
    setError: setSceneFiltersError,
  } = useGlobalFilterState()
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  const {
    general: { stashDefaultScenesFilter, availableSavedSceneFilters },
    tv: { defaultFilterId: stashTvDefaultFilterId },
    loading: stashConfigLoading,
  } = useStashConfigStore();
  const { isRandomised, onlyShowMatchingOrientation } = useAppStateStore();
  const { orientation } = useWindowSize()
  
  let limitOrientation: "landscape" | "portrait" | undefined = undefined
  if (onlyShowMatchingOrientation && orientation !== "square") {
    limitOrientation = orientation
  }
  
  const currentSearchableFilter = useMemo(
    () => currentSavedFilter && convertSavedToSearchableFilter(currentSavedFilter),
    [currentSavedFilter, isRandomised, onlyShowMatchingOrientation && orientation]
  );
  
  
  
  // Load default filter on initial load.
  useEffect(() => {
    if (stashConfigLoading || currentSavedFilter) return;
    // Place most of the logic into a separate function so we can use async/await
    async function setCurrentSceneFilterOnInitialLoad() {
      try {
        if (stashTvDefaultFilterId) {
          await setCurrentSceneFilterById(stashTvDefaultFilterId)
        } else if (stashDefaultScenesFilter)  {
          // No default filter ID set for Stash TV specifically so we use the default Stash filter
          setCurrentSavedFilter({
            ...stashDefaultScenesFilter,
            filter: '', // The filter prop is deprecated in favour of find_filter and object_filter, and it's not 
              // provided when getting a default saved filter so we can safely set an empty string here.
          })
        } else {
          // No Stash default filter so we should use an empty filter
          setCurrentSavedFilter({
            id: "",
            mode: GQL.FilterMode.Scenes,
            name: "",
            filter: "", // See the comment above about the `filter` prop
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
    
    setCurrentSavedFilter({
      ...sceneFiltersStashResponse,
      filter: '', // See the comment above about the `filter` prop
    });
  }

  async function fetchSavedFilterFromStash(apolloClient: ApolloClient<NormalizedCacheObject>, filterId: string): Promise<GQL.SavedFilterDataFragment | null> {
    const { data } = await apolloClient.query<GQL.FindSavedFilterQuery, GQL.FindSavedFilterQueryVariables>({
      query: GQL.FindSavedFilterDocument,
      variables: { id: filterId },
    });

    return data?.findSavedFilter ?? null;
  }
  
  function convertSavedToSearchableFilter(
    savedFilter: SavedSceneFilter
  ): SearchableSceneFilter {
    function getGeneralFilter() {
      const filter = new ListFilterModel(GQL.FilterMode.Scenes)
      filter.configureFromSavedFilter(savedFilter);
      const updatedFilter = { ...filter.makeFindFilter() };

      if (updatedFilter.sort?.match(/^random_\d*$/) || isRandomised) {
        let seed = Math.round(Math.random() * 1000000)
        updatedFilter.sort = `random_${seed}`
      }

      return updatedFilter;
    }
    
    function getSceneFilter() {
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
    }
    
    return {
      savedFilter,
      generalFilter: getGeneralFilter(),
      sceneFilter: getSceneFilter(),
      get isStashTvDefaultFilter() {
        return savedFilter.id === useStashConfigStore.getState().tv.defaultFilterId;
      }
    }
  }
  
  const availableSavedSceneFiltersWithDefault = useMemo(
    () => availableSavedSceneFilters.map(filter => ({
      ...filter,
      isStashTvDefaultFilter: filter.id === stashTvDefaultFilterId,
    })),
    [availableSavedSceneFilters, stashTvDefaultFilterId]
  );
  
  return {
    sceneFiltersLoading,
    sceneFiltersError,
    currentSceneFilter: currentSearchableFilter,
    setCurrentSceneFilterById,
    availableSavedSceneFilters: availableSavedSceneFiltersWithDefault,
  }
}