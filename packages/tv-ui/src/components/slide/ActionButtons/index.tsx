import React, { useRef } from "react";
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
import { useSceneDecrementO, useSceneIncrementO, useSceneUpdate } from "stash-ui/dist/src/core/StashService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getActionButtonDetails } from "../../../helpers/getActionButtonDetails";

export type Props = {
  scene: GQL.TvSceneDataFragment;
  sceneInfoOpen: boolean;
  setSceneInfoOpen: (open: boolean) => void;
}

export type ActionButtonConfig =
{id: string; pinned?: boolean} & (
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
  )


export function ActionButtons({scene, sceneInfoOpen, setSceneInfoOpen}: Props) {
  const {
    showSettings,
    fullscreen,
    letterboxing,
    forceLandscape,
    audioMuted,
    looping,
    showSubtitles,
    uiVisible,
    leftHandedUi,
    actionButtonsConfig,
    set: setAppSetting,
  } = useAppStateStore();

  const { data: { subtitleLanguage } } = useStashTvConfig()

  const { configuration: config } = React.useContext(ConfigurationContext);
  const [updateScene] = useSceneUpdate();

  const stackElmRef = useRef<HTMLDivElement>(null);
  const stackScrollClasses = useOverflowIndicators(stackElmRef);

  function renderActionButton(buttonConfig: ActionButtonConfig) {
    const { type } = buttonConfig;
    switch (type) {
      case "settings":
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          className="settings hide-on-ui-hide"
          active={showSettings}
          data-testid="MediaSlide--settingsButton"
          onClick={() => setAppSetting("showSettings", (prev) => !prev)}
        />
      case "show-scene-info":
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
      case "rate-scene":
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
      case "o-counter":
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
      case "force-landscape":
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          className="force-landscape hide-on-ui-hide"
          active={forceLandscape}
          data-testid="MediaSlide--forceLandscapeButton"
          onClick={() => setAppSetting("forceLandscape", (prev) => !prev)}
        />
      case "fullscreen":
        if (!('exitFullscreen' in document)) return null
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          className="fullscreen hide-on-ui-hide"
          active={fullscreen}
          data-testid="MediaSlide--fullscreenButton"
          onClick={() => setAppSetting("fullscreen", (prev) => !prev)}
        />
      case "mute":
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          className="mute hide-on-ui-hide"
          active={!audioMuted}
          data-testid="MediaSlide--muteButton"
          onClick={() => setAppSetting("audioMuted", (prev) => !prev)}
        />
      case "letterboxing":
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          className="letterboxing hide-on-ui-hide"
          active={letterboxing}
          data-testid="MediaSlide--letterboxButton"
          onClick={() => setAppSetting("letterboxing", (prev) => !prev)}
        />
      case "loop":
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          className="loop hide-on-ui-hide"
          active={looping}
          data-testid="MediaSlide--loopButton"
          onClick={() => setAppSetting("looping", (prev) => !prev)}
        />
      case "subtitles":
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
      case "ui-visibility":
        return <ActionButton
          {...getActionButtonDetails(buttonConfig)}
          active={uiVisible}
          className={cx("toggle-ui", "dim-on-ui-hide", {'active': uiVisible})}
          data-testid="MediaSlide--showActionButton"
          onClick={() => setAppSetting("uiVisible", (prev) => !prev)}
        />
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
          .map(config => <React.Fragment key={config.type}>
            {renderActionButton(config)}
          </React.Fragment>)
        }
      </div>
      <div className="pinned">
        {actionButtonsConfig
          .filter(config => config.pinned)
          .map(config => <React.Fragment key={config.type}>
            {renderActionButton(config)}
          </React.Fragment>)
        }
      </div>
    </div>
  )
}
