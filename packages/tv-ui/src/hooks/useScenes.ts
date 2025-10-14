import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useSceneFilters } from './useSceneFilters';
import { useEffect, useState } from "react";
import { getSceneIdForVideoJsPlayer } from "../helpers";

export const scenesPerPage = 20

type Scene = GQL.FindScenesForTvQuery["findScenes"]["scenes"][number]

export function useScenes({previewOnly}: {previewOnly?: boolean} = {}) {
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
  
  // Stash doesn't provide the lengths of preview videos so we track that ourselves by saving the video's duration as 
  // soon as its metadata loads
  const [previewLengths, setPreviewLengths] = useState<{[sceneId: string]: number}>({})
  useEffect(() => {
    if (!previewOnly) return;
    const saveDurationOnceMetadataLoaded = (event: Event) => {
      if (!(event?.target instanceof HTMLVideoElement)) return;
      const videoElm = event.target
      try {
        const sceneId = getSceneIdForVideoJsPlayer(videoElm);
        setPreviewLengths(
          prev => ({
            ...prev,
            [sceneId]: videoElm.duration
          })
        )
      } catch (error) {
        console.warn("Failed to get scene ID for video element", error)
      }
    }
    window.addEventListener('loadedmetadata', saveDurationOnceMetadataLoaded, {capture: true});
    return () => {
      window.removeEventListener('loadedmetadata', saveDurationOnceMetadataLoaded, {capture: true});
    }
  }, [previewOnly])

  // Modifying the ScenePlayer to handle playing only a scene's preview would be a lot of work and 
  // would involve a lot of complexity to maintain since it would break many existing assumptions.
  // Instead we take the sightly hacky but much simpler approach of modifying the scene data itself
  // so that ScenePlayer thinks it's just a normal scene but the only available stream is the preview.
  function makeScenePreviewOnly(scene: Scene): Scene {
    if (!scene.paths.preview) {
      console.warn(`Scene ${scene.id} has no preview`)
      return scene
    }
    return {
      ...scene,
      sceneStreams: [
        {
          "url": scene.paths.preview,
          "mime_type": "video/mp4",
          "label": "Direct stream",
          "__typename": "SceneStreamEndpoint"
        }
      ],
      files: [
        {
          ...scene.files[0],
          duration: scene.id in previewLengths
            ? previewLengths[scene.id] 
            // Estimate the video duration if we don't know it yet
            : Math.min(9.2, scene.files[0].duration),
        },
        ...scene.files.slice(1)
      ],
      resume_time: null,
      captions: null,
      scene_markers: [],
    }
  }
  
  const scenes = data?.findScenes?.scenes
    .map(
      previewOnly ? makeScenePreviewOnly : (s) => s
    )
    ?? []
  
  return {
    scenes,
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
