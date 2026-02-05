import React, { useRef } from "react";
import {
  faExpand,
  faRepeat,
  faStar,
  faVolumeHigh as faVolume,
  faEllipsisVertical,
  faCircleInfo,
  faClosedCaptioning as faSubtitles,
  faClosedCaptioning as faSubtitlesOff,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import VolumeMuteOutlineIcon from '../../../assets/volume-mute-outline.svg?react';
import ExpandOutlineIcon from '../../../assets/expand-outline.svg?react';
import ContainIcon from '../../../assets/contain.svg?react';
import CoverOutlineIcon from '../../../assets/cover-outline.svg?react';
import PortraitOutlineIcon from '../../../assets/portrait-rotation-outline.svg?react';
import LandscapeIcon from '../../../assets/landscape-rotation.svg?react';
import LoopOutlineIcon from '../../../assets/loop-outline.svg?react';
import InfoOutlineIcon from '../../../assets/info-outline.svg?react';
import StarOutlineIcon from '../../../assets/star-outline.svg?react';
import SplashIcon from '../../../assets/splash.svg?react';
import SplashOutlineIcon from '../../../assets/splash-outline.svg?react';
import VerticalEllipsisOutlineIcon from '../../../assets/vertical-ellipsis-outline.svg?react';
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
import { SettingsButton } from "tv-ui/src/components/slide/SettingsButton";

export type Props = {
  scene: GQL.TvSceneDataFragment;
  sceneInfoOpen: boolean;
  setSceneInfoOpen: (open: boolean) => void;
}


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
    set: setAppSetting,
  } = useAppStateStore();

  const { data: { subtitleLanguage } } = useStashTvConfig()

  const { configuration: config } = React.useContext(ConfigurationContext);
  const [updateScene] = useSceneUpdate();

  const sceneInfoDataAvailable =
    scene.performers.length > 0 ||
    !!scene.studio ||
    !!scene.title ||
    !!scene.date;

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

  const stackElmRef = useRef<HTMLDivElement>(null);
  const stackScrollClasses = useOverflowIndicators(stackElmRef);


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

  return (
    <div
      className={cx("ActionButtons", {'active': uiVisible, 'left-handed': leftHandedUi})}
      data-testid="MediaSlide--toggleableUi"
    >
      <div className={cx("stack hide-on-ui-hide", ...stackScrollClasses)} ref={stackElmRef}>
        <SettingsButton />

        {sceneInfoDataAvailable && <ActionButton
          className="show-scene-info"
          active={sceneInfoOpen}
          activeIcon={faCircleInfo}
          activeText="Close scene info"
          data-testid="MediaSlide--infoButton"
          inactiveIcon={InfoOutlineIcon}
          inactiveText="Show scene info"
          onClick={() => setSceneInfoOpen(!sceneInfoOpen)}
        />}

        <ActionButton
          className="rate-scene"
          active={typeof scene.rating100 === "number"}
          activeIcon={faStar}
          activeText="Rate scene"
          data-testid="MediaSlide--rateButton"
          inactiveIcon={StarOutlineIcon}
          inactiveText="Rate scene"
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

        <ActionButton
          className="o-counter"
          active={(scene.o_counter ?? 0) > 0}
          activeIcon={SplashIcon}
          activeText="Undo Orgasm Mark"
          data-testid="MediaSlide--oCounterButton"
          inactiveIcon={SplashOutlineIcon}
          inactiveText="Mark Orgasm"
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

        <ActionButton
          className="force-landscape"
          active={!forceLandscape}
          activeIcon={PortraitOutlineIcon}
          activeText="Landscape"
          data-testid="MediaSlide--forceLandscapeButton"
          inactiveIcon={LandscapeIcon}
          inactiveText="Portrait"
          onClick={() => setAppSetting("forceLandscape", (prev) => !prev)}
        />

        {'exitFullscreen' in document && <ActionButton
          className="fullscreen"
          active={fullscreen}
          activeIcon={faExpand}
          activeText="Close fullscreen"
          data-testid="MediaSlide--fullscreenButton"
          inactiveIcon={ExpandOutlineIcon}
          inactiveText="Open fullscreen"
          onClick={() => setAppSetting("fullscreen", (prev) => !prev)}
        />}

        <ActionButton
          className="mute"
          active={!audioMuted}
          activeIcon={faVolume}
          activeText="Mute"
          data-testid="MediaSlide--muteButton"
          inactiveIcon={VolumeMuteOutlineIcon}
          inactiveText="Unmute"
          onClick={() => setAppSetting("audioMuted", (prev) => !prev)}
        />

        <ActionButton
          className="letterboxing"
          active={!letterboxing}
          activeIcon={CoverOutlineIcon}
          activeText="Constrain to screen"
          data-testid="MediaSlide--letterboxButton"
          inactiveIcon={ContainIcon}
          inactiveText="Fill screen"
          onClick={() => setAppSetting("letterboxing", (prev) => !prev)}
        />

        <ActionButton
          className="loop"
          active={looping}
          activeIcon={faRepeat}
          activeText="Stop looping scene"
          data-testid="MediaSlide--loopButton"
          inactiveIcon={LoopOutlineIcon}
          inactiveText="Loop scene"
          onClick={() => setAppSetting("looping", (prev) => !prev)}
        />

        {captionSources && <ActionButton
          active={!!captionSources && showSubtitles}
          activeIcon={faSubtitles}
          activeText="Hide subtitles"
          data-testid="MediaSlide--subtitlesButton"
          inactiveIcon={faSubtitlesOff}
          inactiveText="Show subtitles"
          onClick={() => setAppSetting("showSubtitles", (prev) => !prev)}
        />}
      </div>
      <ActionButton
        active={uiVisible}
        activeIcon={faEllipsisVertical}
        activeText="Hide UI"
        className={cx("toggle-ui", "dim-on-ui-hide", {'active': uiVisible})}
        data-testid="MediaSlide--showActionButton"
        inactiveIcon={VerticalEllipsisOutlineIcon}
        inactiveText="Show UI"
        onClick={() => setAppSetting("uiVisible", (prev) => !prev)}
      />
    </div>
  )
}
