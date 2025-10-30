
import { useApolloClient, type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
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
  currentSearchableFilter: SearchableMediaItemFilter | undefined,
  loading: boolean,
  setLoading: (loading: boolean) => void,
  neverLoaded: boolean,
  setNeverLoaded: (neverLoaded: boolean) => void,
  loadingResponsibilityClaimed: boolean,
  error: unknown,
  setError: (error: unknown) => void,
}>((set, get) => ({
  currentSavedFilter: undefined,
  setCurrentSavedFilter: (filter: SavedMediaItemFilter | undefined) => set({ currentSavedFilter: filter }),
  currentSearchableFilter: undefined,
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  neverLoaded: true,
  setNeverLoaded: (neverLoaded: boolean) => set({ neverLoaded }),
  loadingResponsibilityClaimed: false,
  error: undefined,
  setError: (error: unknown) => set({ error }),
}))

export function useMediaItemFilters() {
  const {
    currentSavedFilter,
    setCurrentSavedFilter,
    loading: mediaItemFiltersLoading,
    setLoading: setMediaItemFiltersLoading,
    neverLoaded: mediaItemFiltersNeverLoaded,
    setNeverLoaded: setMediaItemFiltersNeverLoaded,
    error: mediaItemFiltersError,
    setError: setMediaItemFiltersError,
  } = useGlobalFilterState()
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  
  const [isResponsibleForLoading] = useState(!useGlobalFilterState.getState().loadingResponsibilityClaimed)
  if (isResponsibleForLoading && !useGlobalFilterState.getState().loadingResponsibilityClaimed) {
    useGlobalFilterState.setState({loadingResponsibilityClaimed: true})
  }

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
  
  useEffect(() => {
    if (!isResponsibleForLoading) return;
    useGlobalFilterState.setState({
      currentSearchableFilter: currentSavedFilter ? convertSavedToSearchableFilter(currentSavedFilter) : undefined,
    })
  }, [currentSavedFilter, isRandomised, onlyShowMatchingOrientation && orientation])
  
  // Load default filter on initial load.
  useEffect(() => {
    if (stashConfigLoading || currentSavedFilter || !isResponsibleForLoading) return;
    // Place most of the logic into a separate function so we can use async/await
    async function setCurrentMediaItemFilterOnInitialLoad() {
      setMediaItemFiltersLoading(true);
      setMediaItemFiltersNeverLoaded(false);
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
    setMediaItemFiltersLoading(true);
    const {name, entityType} = availableSavedFilters.find(f => f.id === id) || {}
    if (name && entityType) {
      // Optimistically set the filter so change is immediately reflected in the UI
      setCurrentSavedFilter({
        id,
        mode: entityType === "scene" ? GQL.FilterMode.Scenes : GQL.FilterMode.SceneMarkers,
        name: name,
        filter: '', // See the comment above about the `filter` prop
      });
    }
    const mediaItemFiltersStashResponse = await fetchSavedFilterFromStash(apolloClient, id);

    if (!mediaItemFiltersStashResponse) {
      // Stash has no record of a filter with this ID
      return undefined;
    }
    
    setCurrentSavedFilter({
      ...mediaItemFiltersStashResponse,
      filter: '', // See the comment above about the `filter` prop
    });
    setMediaItemFiltersLoading(false);
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
    
    function addSceneFiltersMods(sceneFilter: GQL.FindScenesForTvQueryVariables["scene_filter"]) {
      if (limitOrientation) {
        sceneFilter = sceneFilter || {};
        sceneFilter.orientation = {
          "value": [
            limitOrientation.toUpperCase() as GQL.OrientationEnum,
            "SQUARE" as GQL.OrientationEnum
          ]
        };
      }
      return sceneFilter;
    }
    
    function getSceneFilter() {
      const filter = new ListFilterModel(savedFilter.mode)
      filter.configureFromSavedFilter(savedFilter);

      return addSceneFiltersMods(
        filter.makeFilter()
      )
    }
    
    function getMarkerFilter() {
      const filter = new ListFilterModel(savedFilter.mode)
      filter.configureFromSavedFilter(savedFilter);

      const markerFilter: GQL.FindSceneMarkersForTvQueryVariables["scene_marker_filter"] = filter.makeFilter();
      markerFilter.scene_filter = addSceneFiltersMods(markerFilter.scene_filter);
      
      return markerFilter;
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
  const [lastLoadedCurrentMediaItemFilter, setLastLoadedCurrentMediaItemFilter] = useState<SearchableMediaItemFilter | undefined>(useGlobalFilterState.getState().currentSearchableFilter)
  useEffect(() => {
    if (mediaItemFiltersLoading) return;
    setLastLoadedCurrentMediaItemFilter(useGlobalFilterState.getState().currentSearchableFilter)
  }, [useGlobalFilterState.getState().currentSearchableFilter, mediaItemFiltersLoading])
  
  return {
    mediaItemFiltersLoading: mediaItemFiltersLoading || mediaItemFiltersNeverLoaded,
    mediaItemFiltersError,
    currentMediaItemFilter: useGlobalFilterState.getState().currentSearchableFilter,
    lastLoadedCurrentMediaItemFilter,
    clearCurrentMediaItemFilter: () => setCurrentSavedFilter(undefined),
    setCurrentMediaItemFilterById,
    availableSavedFilters
  }
}