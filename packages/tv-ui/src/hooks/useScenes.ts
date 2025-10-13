import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useSceneFilters } from './useSceneFilters';

export const scenesPerPage = 20

export function useScenes() {
  const { currentSceneFilter } = useSceneFilters()

  const {
    data,
    fetchMore,
    error: scenesError,
    loading: scenesLoading,
  } = GQL.useFindScenesForTvQuery({
    variables: {
      filter: {
        ...currentSceneFilter?.generalFilter,
        // We manage pagination ourselves and so override whatever the saved filter had
        page: 1,
        per_page: scenesPerPage,
      },
      scene_filter: currentSceneFilter?.sceneFilter
    },
    skip: !currentSceneFilter,
  })
  
  return {
    scenes: data?.findScenes?.scenes ?? [],
    loadMoreScenes: () => {
      const nextPage = data?.findScenes?.scenes.length ? Math.ceil(data.findScenes.scenes.length / scenesPerPage) + 1 : 1
      import.meta.env.VITE_DEBUG && console.log("Fetch next scenes page:", nextPage)
      fetchMore({
        variables: {
          filter: {
            ...currentSceneFilter?.generalFilter,
            // We manage pagination ourselves and so override whatever the saved filter had
            page: nextPage,
            per_page: scenesPerPage,
          },
          scene_filter: currentSceneFilter?.sceneFilter
        } 
      })
    },
    scenesError,
    scenesLoading
  }
}
