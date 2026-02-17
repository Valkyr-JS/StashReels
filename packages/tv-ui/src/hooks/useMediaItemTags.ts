import { getLogger } from "@logtape/logtape";
import { MediaItem } from "./useMediaItems";
import { useSceneMarkerUpdate, useSceneUpdate } from "stash-ui/dist/src/core/StashService";
import { SlimTag } from "../components/EditTagSelectionForm";


const logger = getLogger(["stash-tv", "useMediaItemTags"]);

export function useMediaItemTags(mediaItem: MediaItem) {
  let tags: SlimTag[]
  let primaryTag: SlimTag | null = null
  let addTag: (tagOrTagId: SlimTag | string) => void
  let removeTag: (tagOrTagId: SlimTag | string) => void
  let setTags: (tagsOrTagIds: SlimTag[] | string[]) => void
  if (mediaItem.entityType === "scene") {
    const scene = mediaItem.entity
    tags = scene.tags
    const [updateScene] = useSceneUpdate();
    addTag = (tagOrTagId: SlimTag | string) => {
      const tagId = typeof tagOrTagId === "string" ? tagOrTagId : tagOrTagId.id;
      if (scene.tags.some(t => t.id === tagId)) return;
      updateScene({
        variables: {
          input: {
            id: scene.id,
            tag_ids: [...scene.tags.map(tag => tag.id), tagId]
          },
        },
      });
    }
    removeTag = (tagOrTagId: SlimTag | string) => {
      const tagId = typeof tagOrTagId === "string" ? tagOrTagId : tagOrTagId.id;
      if (!scene.tags.some(t => t.id === tagId)) return;
      updateScene({
        variables: {
          input: {
            id: scene.id,
            tag_ids: scene.tags.filter(tag => tag.id !== tagId).map(tag => tag.id)
          },
        },
      });
    }
    setTags = (tagsOrTagIds: SlimTag[] | string[]) => {
      const tagIds = tagsOrTagIds.map(tagOrTagId => typeof tagOrTagId === "string" ? tagOrTagId : tagOrTagId.id);
      updateScene({
        variables: {
          input: {
            id: scene.id,
            tag_ids: tagIds
          },
        },
      });
    }
  } else if (mediaItem.entityType === "marker") {
    const marker = mediaItem.entity
    tags = marker.tags
    primaryTag = marker.primary_tag
    const [updateMarker] = useSceneMarkerUpdate();
    const updateMarkerTags = (newTagIds: string[]) => {
      updateMarker({
        variables: {
          id: marker.id,
          title: marker.title,
          seconds: marker.seconds,
          end_seconds: marker.end_seconds,
          scene_id: marker.scene.id,
          primary_tag_id: marker.primary_tag.id,
          tag_ids: newTagIds
        },
      });
    }
    addTag = (tagOrTagId: SlimTag | string) => {
      const tagId = typeof tagOrTagId === "string" ? tagOrTagId : tagOrTagId.id;
      if (marker.primary_tag.id == tagId || marker.tags.some(t => t.id === tagId)) return;
      updateMarkerTags([...marker.tags.map(tag => tag.id), tagId]);
    }
    removeTag = (tagOrTagId: SlimTag | string) => {
      const tagId = typeof tagOrTagId === "string" ? tagOrTagId : tagOrTagId.id;
      if (marker.primary_tag.id == tagId || !marker.tags.some(t => t.id === tagId)) return;
      updateMarkerTags(marker.tags.filter(tag => tag.id !== tagId).map(tag => tag.id));
    }
    setTags = (tagsOrTagIds: SlimTag[] | string[]) => {
      const tagIds = tagsOrTagIds.map(tagOrTagId => typeof tagOrTagId === "string" ? tagOrTagId : tagOrTagId.id);
      updateMarkerTags(tagIds);
    }
  } else {
    logger.error("useMediaItemTags rendered for unsupported media item type", {mediaItem})
    tags = []
    addTag = () => {}
    removeTag = () => {}
    setTags = () => {}
  }

  return {
    tags,
    primaryTag,
    addTag,
    removeTag,
    setTags,
  }
}
