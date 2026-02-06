import React, { useEffect, useMemo, useRef, useState } from "react";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

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
import { queryFindTagsByIDForSelect, useSceneDecrementO, useSceneIncrementO, useSceneUpdate } from "stash-ui/dist/src/core/StashService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getActionButtonDetails } from "../../../helpers/getActionButtonDetails";

export type Props = {
  scene: GQL.TvSceneDataFragment;
  sceneInfoOpen: boolean;
  setSceneInfoOpen: (open: boolean) => void;
}

export type ActionButtonConfig =
{id: string; pinned: boolean} & (
  {type: "ui-visibility"}
    | {type: "settings"}
    | {type: "show-scene-info"}
    | {type: "rate-scene"}
    | {type: "o-counter"}
    | {type: "force-landscape"}
    | {type: "fullscreen"}
    | {type: "mute"}
    | {type: "letterboxing"}
    | {type: "loop"}
    | {type: "subtitles"}
    | {type: "quick-tag"; iconId: string; tagId: string }
  )


export function ActionButtons({scene, sceneInfoOpen, setSceneInfoOpen}: Props) {
  const {
    uiVisible,
    leftHandedUi,
    actionButtonsConfig,
  } = useAppStateStore();

  const stackElmRef = useRef<HTMLDivElement>(null);
  const stackScrollClasses = useOverflowIndicators(stackElmRef);

  function renderActionButton(buttonConfig: ActionButtonConfig) {
    const { type } = buttonConfig;
    switch (type) {
      case "settings":
        return <SettingsActionButton buttonConfig={buttonConfig} />
      case "show-scene-info":
        return <ShowSceneInfoActionButton scene={scene} sceneInfoOpen={sceneInfoOpen} setSceneInfoOpen={setSceneInfoOpen} buttonConfig={buttonConfig} />
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
        return <QuickTagActionButton scene={scene} buttonConfig={buttonConfig} />
      default:
        throw new Error(`Unknown action button type: ${type}`)
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

function SettingsActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { showSettings, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig)}
    className="settings hide-on-ui-hide"
    active={showSettings}
    data-testid="MediaSlide--settingsButton"
    onClick={() => setAppSetting("showSettings", (prev) => !prev)}
  />
}

function ShowSceneInfoActionButton({scene, sceneInfoOpen, setSceneInfoOpen, buttonConfig}: {scene: GQL.TvSceneDataFragment, sceneInfoOpen: boolean, setSceneInfoOpen: (open: boolean) => void, buttonConfig: ActionButtonConfig}) {
  if (
    scene.performers.length === 0 ||
    !scene.studio ||
    !scene.title ||
    !scene.date
  ) return null
  return <ActionButton
      {...getActionButtonDetails(buttonConfig)}
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
    {...getActionButtonDetails(buttonConfig)}
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
    {...getActionButtonDetails(buttonConfig)}
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
    {...getActionButtonDetails(buttonConfig)}
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
    {...getActionButtonDetails(buttonConfig)}
    className="fullscreen hide-on-ui-hide"
    active={fullscreen}
    data-testid="MediaSlide--fullscreenButton"
    onClick={() => setAppSetting("fullscreen", (prev) => !prev)}
  />
}

function MuteActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { audioMuted, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig)}
    className="mute hide-on-ui-hide"
    active={!audioMuted}
    data-testid="MediaSlide--muteButton"
    onClick={() => setAppSetting("audioMuted", (prev) => !prev)}
  />
}

function LetterboxingActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { letterboxing, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig)}
    className="letterboxing hide-on-ui-hide"
    active={letterboxing}
    data-testid="MediaSlide--letterboxButton"
    onClick={() => setAppSetting("letterboxing", (prev) => !prev)}
  />
}

function LoopActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { looping, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig)}
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
    {...getActionButtonDetails(buttonConfig)}
    className="subtitles hide-on-ui-hide"
    active={!!captionSources && showSubtitles}
    data-testid="MediaSlide--subtitlesButton"
    onClick={() => setAppSetting("showSubtitles", (prev) => !prev)}
  />
}

function UiVisibilityActionButton({buttonConfig}: {buttonConfig: ActionButtonConfig}) {
  const { uiVisible, set: setAppSetting } = useAppStateStore();
  return <ActionButton
    {...getActionButtonDetails(buttonConfig)}
    active={uiVisible}
    className={cx("toggle-ui", "dim-on-ui-hide", {'active': uiVisible})}
    data-testid="MediaSlide--showActionButton"
    onClick={() => setAppSetting("uiVisible", (prev) => !prev)}
  />
}

function QuickTagActionButton({buttonConfig, scene}: {buttonConfig: Extract<ActionButtonConfig, { type: "quick-tag" }>, scene: GQL.TvSceneDataFragment}) {
  const {tagId} = buttonConfig;
  const sceneHasTag = useMemo(() => scene.tags.some(t => t.id === tagId), [scene.tags, buttonConfig.tagId])
  const [updateScene] = useSceneUpdate();
  function addTag() {
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
  function removeTag() {
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
  const [tagName, setTagName] = useState<string>(`Tag ID: ${buttonConfig.tagId}`);
  useEffect(() => {
    queryFindTagsByIDForSelect([buttonConfig.tagId])
      .then(result => setTagName(result.data.findTags.tags[0]?.name || tagName))
  }, [buttonConfig.tagId])
  return <ActionButton
    {...getActionButtonDetails(buttonConfig, {tagName})}
    active={sceneHasTag}
    className={cx("quick-tag", "hide-on-ui-hide")}
    data-testid="MediaSlide--quickTagButton"
    onClick={() => sceneHasTag ? removeTag() : addTag()}
  />
}
