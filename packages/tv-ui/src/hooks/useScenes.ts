import { useAppStateStore } from '../store/appStateStore'
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

export const scenesPerPage = 20

export function useScenes() {
  const { sceneFilter } = useAppStateStore()

  const {
    data,
    fetchMore,
    error: scenesError,
    loading: scenesLoading,
  } = GQL.useFindScenesForTvQuery({
    variables: {
      filter: {
        ...sceneFilter?.generalFilter,
        // We manage pagination ourselves and so override whatever the saved filter had
        page: 1,
        per_page: scenesPerPage,
      },
      scene_filter: sceneFilter?.sceneFilter
    },
    skip: !sceneFilter,
  })
  
  return {
    scenes: data?.findScenes?.scenes ?? [],
    loadMoreScenes: () => {
      const nextPage = data?.findScenes?.scenes.length ? Math.ceil(data.findScenes.scenes.length / scenesPerPage) + 1 : 1
      import.meta.env.VITE_DEBUG && console.log("Fetch next scenes page:", nextPage)
      fetchMore({
        variables: {
          filter: {
            ...sceneFilter?.generalFilter,
            // We manage pagination ourselves and so override whatever the saved filter had
            page: nextPage,
            per_page: scenesPerPage,
          },
          scene_filter: sceneFilter?.sceneFilter
        } 
      })
    },
    scenesError,
    scenesLoading
  }
}
