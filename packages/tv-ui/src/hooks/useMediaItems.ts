import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useMediaItemFilters } from './useMediaItemFilters';
import { useEffect, useState } from "react";
import { getSceneIdForVideoJsPlayer } from "../helpers";
import { useAppStateStore } from "../store/appStateStore";

export const mediaItemsPerPage = 20

export type MediaItem = {
  id: string;
} & (
  {
    entityType: "scene";
    entity: GQL.FindScenesForTvQuery["findScenes"]["scenes"][number];
  } |
  {
    entityType: "marker";
    entity: GQL.FindSceneMarkersForTvQuery["findSceneMarkers"]["scene_markers"][number] & {
      duration: number;
    }
  }
)

type Scene = GQL.FindScenesForTvQuery["findScenes"]["scenes"][number]

export function useMediaItems({previewOnly}: {previewOnly?: boolean} = {}) {
  const { currentMediaItemFilter } = useMediaItemFilters()
  const { debugMode } = useAppStateStore()

  let response
  let mediaItems: MediaItem[]
  if (!currentMediaItemFilter || currentMediaItemFilter.entityType === "scene") {
    response = GQL.useFindScenesForTvQuery({
      variables: {
        filter: {
          ...currentMediaItemFilter?.generalFilter,
          // We manage pagination ourselves and so override whatever the saved filter had
          page: 1,
          per_page: mediaItemsPerPage,
        },
        scene_filter: currentMediaItemFilter?.entityFilter
      },
      skip: !currentMediaItemFilter,
    })
    mediaItems = response.data?.findScenes.scenes.map(scene => ({
      id: `scene:${scene.id}`,
      entityType: "scene" as const,
      entity: scene,
    })) || []
  } else if (currentMediaItemFilter.entityType === "marker") {
    response = GQL.useFindSceneMarkersForTvQuery({
      variables: {
        filter: {
          ...currentMediaItemFilter.generalFilter,
          // We manage pagination ourselves and so override whatever the saved filter had
          page: 1,
          per_page: mediaItemsPerPage,
        },
        scene_marker_filter: currentMediaItemFilter.entityFilter
      },
    })
    mediaItems = response.data?.findSceneMarkers.scene_markers.map(marker => ({
      id: `marker:${marker.id}`,
      entityType: "marker" as const,
      entity: {
        ...marker,
        get duration() {
          const defaultMarkerLength = 20;
          const endTime = marker.end_seconds ?? Math.min(marker.seconds + defaultMarkerLength, marker.scene.files[0].duration);
          return endTime - marker.seconds;
        }
      }
    })) || []
  } else {
    console.info("currentMediaItemFilter:", currentMediaItemFilter)
    throw new Error("Unsupported media item filter entity type")
  }
  
  const {
    fetchMore,
    error: mediaItemsError,
    loading: mediaItemsLoading,
  } = response
  
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

  return {
    mediaItems: mediaItems
      .map(
        mediaItem => previewOnly && mediaItem.entityType === "scene" 
          ? {...mediaItem, entity: makeScenePreviewOnly(mediaItem.entity)} 
          : mediaItem
      ),
    loadMoreMediaItems: () => {
      const nextPage = mediaItems.length ? Math.ceil(mediaItems.length / mediaItemsPerPage) + 1 : 1
      debugMode && console.log("Fetch next media page:", nextPage)
      let entityFilterKey: string
      if (currentMediaItemFilter?.entityType === "scene") {
        entityFilterKey = "scene_filter"
      } else if (currentMediaItemFilter?.entityType === "marker") {
        entityFilterKey = "scene_marker_filter"
      } else {
        throw new Error("Unsupported media filter entity type")
      }
      fetchMore({
        variables: {
          filter: {
            ...currentMediaItemFilter?.generalFilter,
            // We manage pagination ourselves and so override whatever the saved filter had
            page: nextPage,
            per_page: mediaItemsPerPage,
          },
          [entityFilterKey]: currentMediaItemFilter?.entityFilter
        } 
      })
    },
    mediaItemsError,
    mediaItemsLoading
  }
}
