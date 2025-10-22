
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
 * searched, like a media item filter.
 * 
 * To make this clearer we use "saved filter" to refer to a filter in its saved format (or "saved media item filter" for 
 * specifically a media item filter) and "searchable filter" to refer to a filter in its searchable format (or "searchable 
 * media item filter" for specifically a media item filter).
 * 
 * The rest of the Stash TV codebase pretty much only deals with the searchable format so we just hide this distinction
 * and only present the searchable format outside of this file which we simply refer to as a "filter" (or "media item filter"
 * for specifically a media item filter).
 */

type SavedMediaItemFilter = GQL.SavedFilter

export type SearchableMediaItemFilter = {
  savedFilter?: SavedMediaItemFilter,
  generalFilter: GQL.FindScenesForTvQueryVariables["filter"],
  isStashTvDefaultFilter: boolean,
} & (
  {
    entityFilter: GQL.FindScenesForTvQueryVariables["scene_filter"]
    entityType: "scene"
  } |
  {
    entityFilter: GQL.FindSceneMarkersForTvQueryVariables["scene_marker_filter"]
    entityType: "marker"
  }
)

type EntityType = SearchableMediaItemFilter["entityType"]

const useGlobalFilterState = create<{
  currentSavedFilter: SavedMediaItemFilter | undefined,
  setCurrentSavedFilter: (filter: SavedMediaItemFilter | undefined) => void,
  loading: boolean,
  setLoading: (loading: boolean) => void,
  error: unknown,
  setError: (error: unknown) => void,
}>((set, get) => ({
  currentSavedFilter: undefined,
  setCurrentSavedFilter: (filter: SavedMediaItemFilter | undefined) => set({ currentSavedFilter: filter }),
  loading: true,
  setLoading: (loading: boolean) => set({ loading }),
  error: undefined,
  setError: (error: unknown) => set({ error }),
}))

export function useMediaItemFilters() {
  const {
    currentSavedFilter,
    setCurrentSavedFilter,
    loading: mediaItemFiltersLoading,
    setLoading: setMediaItemFiltersLoading,
    error: mediaItemFiltersError,
    setError: setMediaItemFiltersError,
  } = useGlobalFilterState()
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  const {
    general: { stashDefaultScenesFilter, availableSavedSceneFilters, availableSavedMarkerFilters },
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
    async function setCurrentMediaItemFilterOnInitialLoad() {
      try {
        if (stashTvDefaultFilterId) {
          await setCurrentMediaItemFilterById(stashTvDefaultFilterId)
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
        setMediaItemFiltersError(error);
      }
      setMediaItemFiltersLoading(false);
    }
    setCurrentMediaItemFilterOnInitialLoad()
  }, [stashConfigLoading, stashTvDefaultFilterId, stashDefaultScenesFilter]);

  async function setCurrentMediaItemFilterById(id: string) {
    const mediaItemFiltersStashResponse = await fetchSavedFilterFromStash(apolloClient, id);

    if (!mediaItemFiltersStashResponse) {
      // Stash has no record of a filter with this ID
      return undefined;
    }
    
    setCurrentSavedFilter({
      ...mediaItemFiltersStashResponse,
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
    savedFilter: SavedMediaItemFilter
  ): SearchableMediaItemFilter {
    function getGeneralFilter() {
      const filter = new ListFilterModel(savedFilter.mode)
      filter.configureFromSavedFilter(savedFilter);
      const updatedFilter = { ...filter.makeFindFilter() };

      if (updatedFilter.sort?.match(/^random_\d*$/) || isRandomised) {
        let seed = Math.round(Math.random() * 1000000)
        updatedFilter.sort = `random_${seed}`
      }

      return updatedFilter;
    }
    
    function getSceneFilter() {
      const filter = new ListFilterModel(savedFilter.mode)
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
    
    function getMarkerFilter() {
      const filter = new ListFilterModel(savedFilter.mode)
      filter.configureFromSavedFilter(savedFilter);

      return filter.makeFilter();
    }
    
    const sharedProps = {
      savedFilter,
      generalFilter: getGeneralFilter(),
      get isStashTvDefaultFilter() {
        return savedFilter.id === useStashConfigStore.getState().tv.defaultFilterId;
      }
    }
    
    if (savedFilter.mode === GQL.FilterMode.Scenes) {
      return {
        ...sharedProps,
        entityFilter: getSceneFilter(),
        entityType: "scene",
      }
    } else if (savedFilter.mode === GQL.FilterMode.SceneMarkers) {
      return {
        ...sharedProps,
        entityFilter: getMarkerFilter(),
        entityType: "marker",
      }
    } else {
      throw new Error(`Unsupported saved filter mode: ${savedFilter.mode}`);
    }
  }

  const availableSavedFilters = useMemo(
    () => {
      const savedFilters = []
      const savedFiltersByType: [EntityType, {id: string, name: string}[]][] = [
        ["scene", availableSavedSceneFilters],
        ["marker", availableSavedMarkerFilters],
      ]
      for (const [entityType, savedFiltersOfType] of savedFiltersByType) {
        for (const savedFilter of savedFiltersOfType) {
          savedFilters.push({
            ...savedFilter,
            isStashTvDefaultFilter: savedFilter.id === stashTvDefaultFilterId,
            entityType
          })
        }
      }
      return savedFilters;
    },
    [availableSavedSceneFilters, stashTvDefaultFilterId]
  );
  
  return {
    mediaItemFiltersLoading,
    mediaItemFiltersError,
    currentMediaItemFilter: currentSearchableFilter,
    clearCurrentMediaItemFilter: () => setCurrentSavedFilter(undefined),
    setCurrentMediaItemFilterById,
    availableSavedFilters
  }
}