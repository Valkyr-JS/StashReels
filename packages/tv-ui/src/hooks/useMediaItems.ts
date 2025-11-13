import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useMediaItemFilters } from './useMediaItemFilters';
import { useEffect, useMemo, useState } from "react";
import { getSceneIdForVideoJsPlayer } from "../helpers";
import { useAppStateStore } from "../store/appStateStore";
import hashObject from 'object-hash';

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

export const defaultMarkerLength = 20;

export function useMediaItems() {
  const { lastLoadedCurrentMediaItemFilter } = useMediaItemFilters()
  const { debugMode, maxMedia, scenePreviewOnly: previewOnly} = useAppStateStore()

  const [ neverLoaded, setNeverLoaded ] = useState(true)

  let response
  let mediaItems: MediaItem[]
  if (!lastLoadedCurrentMediaItemFilter || lastLoadedCurrentMediaItemFilter.entityType === "scene") {
    const scenesResponse = GQL.useFindScenesForTvQuery({
      variables: {
        filter: {
          ...lastLoadedCurrentMediaItemFilter?.generalFilter,
          // We manage pagination ourselves and so override whatever the saved filter had
          page: 1,
          per_page: mediaItemsPerPage,
        },
        scene_filter: lastLoadedCurrentMediaItemFilter?.entityFilter
      },
      skip: !lastLoadedCurrentMediaItemFilter,
    })
    mediaItems = useMemo(
      () => scenesResponse.data?.findScenes.scenes.map(scene => ({
        id: `scene:${scene.id}`,
        entityType: "scene" as const,
        entity: scene,
      })) || [],
      [scenesResponse.data?.findScenes.scenes]
    )
    response = scenesResponse

  } else if (lastLoadedCurrentMediaItemFilter.entityType === "marker") {
    const markersResponse = GQL.useFindSceneMarkersForTvQuery({
      variables: {
        filter: {
          ...lastLoadedCurrentMediaItemFilter.generalFilter,
          // We manage pagination ourselves and so override whatever the saved filter had
          page: 1,
          per_page: mediaItemsPerPage,
        },
        scene_marker_filter: lastLoadedCurrentMediaItemFilter.entityFilter
      },
    })

    mediaItems = useMemo(
      () => markersResponse.data?.findSceneMarkers.scene_markers.map(marker => ({
        id: `marker:${marker.id}`,
        entityType: "marker" as const,
        entity: {
          ...marker,
          get duration() {
            const endTime = marker.end_seconds ?? Math.min(marker.seconds + defaultMarkerLength, marker.scene.files[0].duration);
            return endTime - marker.seconds;
          }
        }
      })) || [],
      [markersResponse.data?.findSceneMarkers.scene_markers]
    )
    response = markersResponse
  } else {
    console.info("lastLoadedCurrentMediaItemFilter:", lastLoadedCurrentMediaItemFilter)
    throw new Error("Unsupported media item filter entity type")
  }
  useEffect(() => {
    useAppStateStore.getState().debugMode && console.log("lastLoadedCurrentMediaItemFilter changed, resetting media items", lastLoadedCurrentMediaItemFilter)
  }, [lastLoadedCurrentMediaItemFilter])


  const {
    fetchMore,
    error: mediaItemsError,
    loading: mediaItemsLoading,
  } = response

  useEffect(() => {
    mediaItems.length && setNeverLoaded(false)
  }, [mediaItems.length])

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
  function makeMediaItemPreviewOnly(mediaItem: MediaItem): MediaItem {
    let previewUrl
    if (mediaItem.entityType === "scene") {
      previewUrl = mediaItem.entity.paths.preview
    } else if (mediaItem.entityType === "marker") {
      previewUrl = mediaItem.entity.stream
    } else {
      mediaItem satisfies never
      throw new Error("Unsupported media item entity type")
    }
    if (!previewUrl) {
      console.warn(`Media item ${mediaItem.id} has no preview`)
      return mediaItem
    }
    const scene = 'scene' in mediaItem.entity ? mediaItem.entity.scene : mediaItem.entity
    let duration
    if (mediaItem.entityType === "marker") {
      duration = mediaItem.entity.duration
    } else {
      duration = scene.id in previewLengths
        ? previewLengths[scene.id]
        // Estimate the video duration if we don't know it yet
        : Math.min(9.2, scene.files[0].duration)
    }
    const updatedScene = {
      ...scene,
      sceneStreams: [
        {
          "url": previewUrl,
          "mime_type": "video/mp4",
          "label": "Direct stream",
          "__typename": "SceneStreamEndpoint" as const
        }
      ],
      files: [
        {
          ...scene.files[0],
          duration,
        },
        ...scene.files.slice(1)
      ],
      resume_time: null,
      captions: null,
      scene_markers: [],
    }

    if (mediaItem.entityType === "scene") {
      return {
        ...mediaItem,
        entity: updatedScene
      }
    } else if (mediaItem.entityType === "marker") {
      return {
        ...mediaItem,
        entity: {
          ...mediaItem.entity,
          scene: updatedScene
        }
      }
    } else {
      mediaItem satisfies never
      return mediaItem
    }
  }


  mediaItems = useMemo(
    () => {
      let modifiedMediaItems = mediaItems
      if (typeof maxMedia === "number") {
        modifiedMediaItems = modifiedMediaItems.slice(0, maxMedia)
      }
      if (previewOnly) {
        modifiedMediaItems = modifiedMediaItems.map(makeMediaItemPreviewOnly)
      }
      return modifiedMediaItems
    },
    [mediaItems, previewOnly, maxMedia, hashObject(previewLengths)]
  )

  return {
    mediaItems,
    loadMoreMediaItems: () => {
      const nextPage = mediaItems.length ? Math.ceil(mediaItems.length / mediaItemsPerPage) + 1 : 1
      debugMode && console.log("Fetch next media page:", nextPage)
      let entityFilterKey: string
      if (lastLoadedCurrentMediaItemFilter?.entityType === "scene") {
        entityFilterKey = "scene_filter"
      } else if (lastLoadedCurrentMediaItemFilter?.entityType === "marker") {
        entityFilterKey = "scene_marker_filter"
      } else {
        throw new Error("Unsupported media filter entity type")
      }
      fetchMore({
        variables: {
          filter: {
            ...lastLoadedCurrentMediaItemFilter?.generalFilter,
            // We manage pagination ourselves and so override whatever the saved filter had
            page: nextPage,
            per_page: mediaItemsPerPage,
          },
          [entityFilterKey]: lastLoadedCurrentMediaItemFilter?.entityFilter
        }
      })
    },
    mediaItemsError,
    mediaItemsLoading,
    mediaItemsNeverLoaded: neverLoaded,
  }
}
