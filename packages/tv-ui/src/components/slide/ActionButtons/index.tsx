import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import * as yup from "yup";
import { useAppStateStore } from "../../../store/appStateStore";
import ISO6391 from "iso-639-1";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import cx from "classnames";
import ActionButton from "../ActionButton";
import "./ActionButtons.css";
import useStashTvConfig from "../../../hooks/useStashTvConfig";
import useOverflowIndicators from "../../../hooks/useOverflowIndicators";
import { defaultRatingSystemOptions, RatingSystemType } from "stash-ui/dist/src/utils/rating";
import { ConfigurationContext } from "stash-ui/dist/src/hooks/Config";
import { RatingSystem } from "stash-ui/wrappers/components/shared/RatingSystem";
import { queryFindTagsByIDForSelect, useSceneDecrementO, useSceneIncrementO, useSceneMarkerCreate, useSceneUpdate } from "stash-ui/dist/src/core/StashService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getActionButtonDetails, ActionButtonIcons } from "../../../helpers/getActionButtonDetails";
import { SceneMarkerForm } from "stash-ui/wrappers/components/SceneMarkerForm";
import { VideoJsPlayer } from "video.js";
import { getLogger } from "@logtape/logtape";
import { EditTagSelectionForm } from "../../EditTagSelectionForm";
import { MediaItem } from "../../../hooks/useMediaItems";
import { useMediaItemTags } from "../../../hooks/useMediaItemTags";
import { DeleteScenesDialog } from "stash-ui/dist/src/components/Scenes/DeleteScenesDialog";
import { DeleteSceneMarkersDialog } from "stash-ui/dist/src/components/Scenes/DeleteSceneMarkersDialog";

const logger = getLogger(["stash-tv", "ActionButtons"]);

export type Props = {
  mediaItem: MediaItem;
  sceneInfoOpen: boolean;
  setSceneInfoOpen: (open: boolean) => void;
  playerRef: React.RefObject<VideoJsPlayer>;
}

const sharedActionButtonSchema = yup.object({
  id: yup.string().required(),
  pinned: yup.boolean().required(),
})

export const uiVisibilityActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["ui-visibility"]).required(),
})
export const settingsActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["settings"]).required(),
})
export const showSceneInfoActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["show-scene-info"]).required(),
})
export const rateSceneActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["rate-scene"]).required(),
})
export const oCounterActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["o-counter"]).required(),
})
export const forceLandscapeActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["force-landscape"]).required(),
})
export const fullscreenActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["fullscreen"]).required(),
})
export const muteActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["mute"]).required(),
})
export const letterboxingActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["letterboxing"]).required(),
})
export const loopActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["loop"]).required(),
})
export const subtitlesActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["subtitles"]).required(),
})
export const quickTagActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["quick-tag"]).required(),
  iconId: yup.string().required(),
  tagId: yup.string().required(),
})
export const editTagsActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["edit-tags"]).required(),
  pinnedTagIds: yup.array().of(yup.string().required()).required(),
})
export const createMarkerActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["create-marker"]).required(),
  iconId: yup.string().required(),
  markerDefaults: yup.object({
    title: yup.string(),
    primaryTagId: yup.string().required(),
    tagIds: yup.array().of(yup.string().required()).required(),
  }).nullable()
})
export const deleteMediaItemActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["delete-media-item"]).required(),
})
export const setOrganizedActionButtonSchema = sharedActionButtonSchema.shape({
  type: yup.string().oneOf(["set-organized"]).required(),
})

export type ActionButtonConfig =
  | yup.InferType<typeof uiVisibilityActionButtonSchema>
  | yup.InferType<typeof settingsActionButtonSchema>
  | yup.InferType<typeof showSceneInfoActionButtonSchema>
  | yup.InferType<typeof rateSceneActionButtonSchema>
  | yup.InferType<typeof oCounterActionButtonSchema>
  | yup.InferType<typeof forceLandscapeActionButtonSchema>
  | yup.InferType<typeof fullscreenActionButtonSchema>
  | yup.InferType<typeof muteActionButtonSchema>
  | yup.InferType<typeof letterboxingActionButtonSchema>
  | yup.InferType<typeof loopActionButtonSchema>
  | yup.InferType<typeof subtitlesActionButtonSchema>
  | yup.InferType<typeof quickTagActionButtonSchema>
  | yup.InferType<typeof editTagsActionButtonSchema>
  | yup.InferType<typeof createMarkerActionButtonSchema>
  | yup.InferType<typeof deleteMediaItemActionButtonSchema>
  | yup.InferType<typeof setOrganizedActionButtonSchema>

export const createNewActionButtonConfig = <ButtonType extends ActionButtonConfig["type"]>(
  type: ButtonType,
  options?: {includeMarkerDefaults?: boolean}
): Extract<ActionButtonConfig, { type: ButtonType }> => {
  const sharedDefaults = {
    id: `${Date.now()}-${Math.random().toString().slice(2)}` ,
    pinned: false
  }
  switch (type) {
    case "edit-tags":
      return {
        ...sharedDefaults,
        type,
        pinnedTagIds: [],
      } as unknown as Extract<ActionButtonConfig, { type: ButtonType }>
    case "quick-tag":
      return {
        ...sharedDefaults,
        type,
        iconId: "add-tag",
        tagId: "",
      } as unknown as Extract<ActionButtonConfig, { type: ButtonType }>
    case "create-marker":
      return {
        ...sharedDefaults,
        type,
        iconId: !options?.includeMarkerDefaults ? "add-marker" : "bookmark",
        markerDefaults: options?.includeMarkerDefaults ? {
          title: "",
          primaryTagId: "",
          tagIds: [],
        } : null
      } as unknown as Extract<ActionButtonConfig, { type: ButtonType }>
    default:
      return {
        ...sharedDefaults,
          type,
      } as unknown as Extract<ActionButtonConfig, { type: ButtonType }>
  }
}


export function ActionButtons({mediaItem, sceneInfoOpen, setSceneInfoOpen, playerRef}: Props) {
  const {
    uiVisible,
    leftHandedUi,
    actionButtonsConfig,
  } = useAppStateStore();

  const scene = mediaItem.entityType === "scene" ? mediaItem.entity : mediaItem.entity.scene;

  const stackElmRef = useRef<HTMLDivElement>(null);
  const stackScrollClasses = useOverflowIndicators(stackElmRef);

  function renderActionButton(buttonConfig: ActionButtonConfig) {
    const { type } = buttonConfig;
    switch (type) {
      case "settings":
        return <SettingsActionButton buttonConfig={buttonConfig} />
      case "show-scene-info":
        return <ShowSceneInfoActionButton sceneInfoOpen={sceneInfoOpen} setSceneInfoOpen={setSceneInfoOpen} buttonConfig={buttonConfig} />
      case "rate-scene":
        return <RateSceneActionButton scene={scene} buttonConfig={buttonConfig} />
      case "o-counter":
        return <OCounterActionButton scene={scene} buttonConfig={buttonConfig} />
      case "force-landscape":
        return <ForceLandscapeActionButton buttonConfig={buttonConfig} />
      case "fullscreen":
        return <FullscreenActionButton buttonConfig={buttonConfig} />
      case "mute":
        return <MuteActionButton buttonConfig={buttonConfig} />
      case "letterboxing":
        return <LetterboxingActionButton buttonConfig={buttonConfig} />
      case "loop":
        return <LoopActionButton buttonConfig={buttonConfig} />
      case "subtitles":
        return <SubtitlesActionButton scene={scene} buttonConfig={buttonConfig} />
      case "ui-visibility":
        return <UiVisibilityActionButton buttonConfig={buttonConfig} />
      case "quick-tag":
        return <QuickTagActionButton mediaItem={mediaItem} buttonConfig={buttonConfig} />
      case "edit-tags":
        return <EditTagsActionButton mediaItem={mediaItem} buttonConfig={buttonConfig} />
      case "create-marker":
        return <CreateMarkerActionButton mediaItem={mediaItem} buttonConfig={buttonConfig} playerRef={playerRef} />
      case "delete-media-item":
        return <DeleteMediaItemActionButton mediaItem={mediaItem} buttonConfig={buttonConfig} />
      case "set-organized":
        return <SetOrganizedActionButton mediaItem={mediaItem} buttonConfig={buttonConfig} />
      default:
        logger.error(`Unknown action button type: ${type}`)
        return <>?</>
    }
  }

  return (
    <div
      className={cx("ActionButtons", {'active': uiVisible, 'left-handed': leftHandedUi})}
      data-testid="MediaSlide--toggleableUi"
    >
      <div className={cx("stack", ...stackScrollClasses)} ref={stackElmRef}>
        {actionButtonsConfig
          .filter(config => !config.pinned)
          .map(config => <React.Fragment key={config.id}>
            {renderActionButton(config)}
          </React.Fragment>)
        }
      </div>
      <div className="pinned">
        {actionButtonsConfig
          .filter(config => config.pinned)
          .map(config => <React.Fragment key={config.id}>
            {renderActionButton(config)}
          </React.Fragment>)
        }
      </div>
    </div>
  )
}

export function SettingsActionButton({buttonConfig}: {buttonConfig?: ActionButtonConfig}) {
  const { showSettings, actionButtonsConfig, set: setAppSetting } = useAppStateStore();

  if (!buttonConfig) {
    buttonConfig = actionButtonsConfig.find(config => config.type === "settings")
    if (!buttonConfig) {
      throw new Error("No settings action button config found")
    }
  }
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="settings hide-on-ui-hide"
    active={showSettings}
    data-testid="MediaSlide--settingsButton"
    onClick={() => setAppSetting("showSettings", (prev) => !prev)}
  />
}

function ShowSceneInfoActionButton({sceneInfoOpen, setSceneInfoOpen, buttonConfig}: {sceneInfoOpen: boolean, setSceneInfoOpen: (open: boolean) => void, buttonConfig: ActionButtonConfig}) {
  return <ActionButton
      {...getActionButtonDetails(buttonConfig).props}
      className="show-scene-info hide-on-ui-hide"
      active={sceneInfoOpen}
      data-testid="MediaSlide--infoButton"
      onClick={() => setSceneInfoOpen(!sceneInfoOpen)}
    />
}

function RateSceneActionButton({scene, buttonConfig}: {scene: GQL.TvSceneDataFragment, buttonConfig: ActionButtonConfig}) {
  const { configuration: config } = React.useContext(ConfigurationContext);
  const { leftHandedUi } = useAppStateStore();
  const ratingSystemOptions =
    config?.ui.ratingSystemOptions ?? defaultRatingSystemOptions;

  let sceneRatingFormatted
  if (typeof scene.rating100 === "number") {
    if (ratingSystemOptions.type === RatingSystemType.Stars) {
      sceneRatingFormatted = (scene.rating100 / 20).toFixed(1).replace(/\.0$/, ""); // Convert 0-100 to 0-5
    } else {
      sceneRatingFormatted = (scene.rating100 / 10).toString();
    }
  }

  const [updateScene] = useSceneUpdate();
  function setRating(newRating: number | null) {
    updateScene({
      variables: {
        input: {
          id: scene.id,
          rating100: newRating,
        },
      },
    });
  }
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="rate-scene hide-on-ui-hide"
    active={typeof scene.rating100 === "number"}
    data-testid="MediaSlide--rateButton"
    sidePanel={
      <div className={cx("action-button-rating-stars", {'not-set': typeof scene.rating100 !== "number", 'left-handed': leftHandedUi}, ratingSystemOptions.type.toLowerCase())}>
        <span className="clear star-rating-number">Clear</span>
        <RatingSystem
          value={scene.rating100}
          onSetRating={setRating}
          clickToRate
          withoutContext
        />
      </div>
    }
    sideInfo={sceneRatingFormatted}
  />
}

function OCounterActionButton({scene, buttonConfig}: {scene: GQL.TvSceneDataFragment, buttonConfig: ActionButtonConfig}) {
  const [incrementOCount] = useSceneIncrementO(scene.id);
  const [removeOCountTime] = useSceneDecrementO(scene.id);
  const decrementOCount = () => {
    // o_history appears to already be sorted newest to oldest but we sort anyway to be sure that's always the case
    const latestOHistoryTime = scene.o_history?.toSorted().reverse()[0]
    if (latestOHistoryTime) {
      removeOCountTime({
        variables: {
          id: scene.id,
          times: [latestOHistoryTime],
        },
      })
    }
  }
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="o-counter hide-on-ui-hide"
    active={(scene.o_counter ?? 0) > 0}
    data-testid="MediaSlide--oCounterButton"
    sidePanel={
      <div className="action-button-o-counter">
        <button onClick={() => decrementOCount()} disabled={(scene.o_counter ?? 0) <= 0}>
          <FontAwesomeIcon icon={faMinus} />
        </button>
        {scene.o_counter ?? 0}
        <button onClick={() => incrementOCount()}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    }
    sideInfo={(scene.o_counter ?? 0) > 0 && scene.o_counter}
  />
}

function ForceLandscapeActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { forceLandscape, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="force-landscape hide-on-ui-hide"
    active={forceLandscape}
    data-testid="MediaSlide--forceLandscapeButton"
    onClick={() => setAppSetting("forceLandscape", (prev) => !prev)}
  />
}

function FullscreenActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { fullscreen, set: setAppSetting } = useAppStateStore();
  if (!('exitFullscreen' in document)) return null
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="fullscreen hide-on-ui-hide"
    active={fullscreen}
    data-testid="MediaSlide--fullscreenButton"
    onClick={() => setAppSetting("fullscreen", (prev) => !prev)}
  />
}

function MuteActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { audioMuted, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="mute hide-on-ui-hide"
    active={!audioMuted}
    data-testid="MediaSlide--muteButton"
    onClick={() => setAppSetting("audioMuted", (prev) => !prev)}
  />
}

function LetterboxingActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { letterboxing, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="letterboxing hide-on-ui-hide"
    active={letterboxing}
    data-testid="MediaSlide--letterboxButton"
    onClick={() => setAppSetting("letterboxing", (prev) => !prev)}
  />
}

function LoopActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { looping, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="loop hide-on-ui-hide"
    active={looping}
    data-testid="MediaSlide--loopButton"
    onClick={() => setAppSetting("looping", (prev) => !prev)}
  />
}

function SubtitlesActionButton({scene, buttonConfig}: {scene: GQL.TvSceneDataFragment, buttonConfig: ActionButtonConfig}) {
  const { showSubtitles, set: setAppSetting } = useAppStateStore();
  const { data: { subtitleLanguage } } = useStashTvConfig()
  /** Only render captions track if available, and it matches the user's chosen
  * language. Fails accessibility if missing, but there's no point rendering
  * an empty track. */
  const captionSources =
    scene.captions && subtitleLanguage
      ? scene.captions
          .map((cap, i) => {
            if (cap.language_code === subtitleLanguage) {
              const src = scene.paths.caption + `?lang=${cap.language_code}&type=${cap.caption_type}`;
              return (
                <track
                  default={subtitleLanguage === cap.language_code}
                  key={i}
                  kind="captions"
                  label={ISO6391.getName(cap.language_code) || "Unknown"}
                  src={src}
                  srcLang={cap.language_code}
                />
              );
            }
          })
          .find((c) => !!c)
      : null;
  if (!captionSources) return null
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className="subtitles hide-on-ui-hide"
    active={!!captionSources && showSubtitles}
    data-testid="MediaSlide--subtitlesButton"
    onClick={() => setAppSetting("showSubtitles", (prev) => !prev)}
  />
}

function UiVisibilityActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { uiVisible, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    active={uiVisible}
    className={cx("toggle-ui", "dim-on-ui-hide", {'active': uiVisible})}
    data-testid="MediaSlide--showActionButton"
    onClick={() => setAppSetting("uiVisible", (prev) => !prev)}
  />
}

function QuickTagActionButton({buttonConfig, mediaItem}: {buttonConfig: Extract<ActionButtonConfig, { type: "quick-tag" }>, mediaItem: MediaItem}) {
  const {tagId} = buttonConfig;
  const [tagName, setTagName] = useState<string>(`Tag ID: ${buttonConfig.tagId}`);
  let mediaItemHasTag: boolean
  let sidePanel: ReactNode = null
  const {addTag, removeTag} = useMediaItemTags(mediaItem);

  useEffect(() => {
    queryFindTagsByIDForSelect([buttonConfig.tagId])
      .then(result => setTagName(result.data.findTags.tags[0]?.name || tagName))
  }, [buttonConfig.tagId])

  if (mediaItem.entityType === "scene") {
    const scene = mediaItem.entity
    mediaItemHasTag = useMemo(() => scene.tags.some(t => t.id === tagId), [scene.tags, buttonConfig.tagId])
  } else if (mediaItem.entityType === "marker") {
    const marker = mediaItem.entity
    mediaItemHasTag = useMemo(
      () => marker.tags.some(t => t.id === tagId) || marker.primary_tag.id === tagId,
      [marker.tags, buttonConfig.tagId]
    )
    sidePanel = marker.primary_tag.id == tagId
      ? <>
        Marker's primary tag is "{tagName}" and a markers's primary tag cannot be removed.
      </>
      : null;
  } else {
    logger.error("QuickTagActionButton rendered for unsupported media item type", {mediaItem})
    return null
  }

  return <ActionButton
    {...getActionButtonDetails(buttonConfig, {tagName}).props}
    active={mediaItemHasTag}
    className={cx("quick-tag", "hide-on-ui-hide")}
    data-testid="MediaSlide--quickTagButton"
    onClick={mediaItemHasTag ? () => removeTag(tagId) : () => addTag(tagId)}
    sidePanel={sidePanel}
  />
}

function EditTagsActionButton(
  {buttonConfig, mediaItem}:
  {
    buttonConfig: Extract<ActionButtonConfig, { type: "edit-tags" }>,
    mediaItem: MediaItem
  }
) {
  const {tags, primaryTag, setTags} = useMediaItemTags(mediaItem)

  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className={cx("hide-on-ui-hide")}
    active={false}
    sidePanel={({close}) => <>
      <EditTagSelectionForm
        initialTags={tags}
        pinnedTagIds={buttonConfig.pinnedTagIds}
        save={setTags}
        cancel={close}
      />
      {primaryTag && <div className="primary-tag-note">
        Marker's primary tag is "{primaryTag.name}".
      </div>}
    </>}
    sidePanelClassName="action-button-side-panel-edit-tags"
    data-testid="MediaSlide--editTagsButton"
  />
}

function CreateMarkerActionButton(
  {buttonConfig, mediaItem, playerRef}:
  {
    buttonConfig: Extract<ActionButtonConfig, { type: "create-marker" }>,
    mediaItem: MediaItem,
    playerRef: React.RefObject<VideoJsPlayer>
  }
) {
  if (mediaItem.entityType !== "scene") return null
  const scene = mediaItem.entity
  const existingMarker = useMemo(
    () => buttonConfig.markerDefaults && mediaItem.entity.scene_markers
      .find(m => m.primary_tag.id === buttonConfig.markerDefaults?.primaryTagId && m.title === buttonConfig.markerDefaults?.title),
    [mediaItem.entity.scene_markers, buttonConfig.markerDefaults?.primaryTagId, buttonConfig.markerDefaults?.title]
  )

  const [sceneMarkerCreate] = useSceneMarkerCreate();
  const handleClick = () => {
    if (existingMarker || !buttonConfig.markerDefaults) return
    const currentTime = playerRef.current?.currentTime()
    if (currentTime === undefined) {
      logger.error("Player current time is undefined when creating quick marker", {sceneId: scene.id})
      return
    }
    sceneMarkerCreate({
      variables: {
        scene_id: scene.id,
        title: buttonConfig.markerDefaults.title ?? "",
        primary_tag_id: buttonConfig.markerDefaults.primaryTagId,
        tag_ids: buttonConfig.markerDefaults.tagIds,
        seconds: currentTime,
        end_seconds: null,
      },
    });
  }
  if (!buttonConfig.markerDefaults) {
    return <ActionButton
      {...getActionButtonDetails(buttonConfig).props}
      className={cx("hide-on-ui-hide")}
      active={false}
      sidePanel={({close}) => (
        <SceneMarkerForm
          className="action-button-create-marker"
          sceneID={mediaItem.entity.id}
          onClose={close}
          marker={undefined}
        />
      )}
      data-testid="MediaSlide--createMarkerButton"
    />
  }
  const renderSidePanel = existingMarker
    ? ({close}: {close: () => void}) => (
      <SceneMarkerForm
        className="action-button-create-marker"
        sceneID={mediaItem.entity.id}
        onClose={close}
        marker={existingMarker}
      />
    )
    : null
  return <ActionButton
    {...getActionButtonDetails(buttonConfig).props}
    className={cx("hide-on-ui-hide")}
    active={Boolean(existingMarker)}
    sidePanel={renderSidePanel}
    onClick={handleClick}
    data-testid="MediaSlide--quickCreateMarkerButton"
  />
}

function DeleteMediaItemActionButton(
  {buttonConfig, mediaItem}:
  {
    buttonConfig: Extract<ActionButtonConfig, { type: "delete-media-item" }>,
    mediaItem: MediaItem
  }
) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleClick = () => {
    setShowDeleteConfirmation(true);
  }
  let renderDialog
  if (mediaItem.entityType === "scene") {
    renderDialog = () => (
      <DeleteScenesDialog
        selected={[mediaItem.entity as unknown as GQL.SlimSceneDataFragment]}
        onClose={() => setShowDeleteConfirmation(false)}
      />
    )
  } else if (mediaItem.entityType === "marker") {
    renderDialog = () => (
      <DeleteSceneMarkersDialog
        selected={[mediaItem.entity as unknown as GQL.SceneMarkerDataFragment]}
        onClose={() => setShowDeleteConfirmation(false)}
      />
    )
  } else {
    logger.error("DeleteMediaItemActionButton rendered for unsupported media item type", {mediaItem})
    return null
  }
  return <>
    {showDeleteConfirmation && renderDialog()}
    <ActionButton
      {...getActionButtonDetails(buttonConfig).props}
      active={false}
      onClick={handleClick}
    />
  </>
}

function SetOrganizedActionButton(
  {buttonConfig, mediaItem}:
  {
    buttonConfig: Extract<ActionButtonConfig, { type: "set-organized" }>,
    mediaItem: MediaItem
  }
) {
  const [updateScene] = useSceneUpdate();
  function setOrganized(newOrganized: boolean) {
    updateScene({
      variables: {
        input: {
          id: scene.id,
          organized: newOrganized,
        },
      },
    });
  }
  if (mediaItem.entityType !== "scene") return null
  const scene = mediaItem.entity
  return (
    <ActionButton
      {...getActionButtonDetails(buttonConfig).props}
      active={scene.organized}
      onClick={() => setOrganized(!scene.organized)}
    />
  )
}
