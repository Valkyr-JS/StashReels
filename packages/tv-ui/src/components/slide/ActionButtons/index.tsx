import React from "react";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faVolumeHigh as faVolume } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import VolumeMuteOutlineIcon from '../../../assets/volume-mute-outline.svg?react';
import ExpandOutlineIcon from '../../../assets/expand-outline.svg?react';
import ContainIcon from '../../../assets/contain.svg?react';
import CoverOutlineIcon from '../../../assets/cover-outline.svg?react';
import PortraitOutlineIcon from '../../../assets/portrait-rotation-outline.svg?react';
import LandscapeIcon from '../../../assets/landscape-rotation.svg?react';
import LoopOutlineIcon from '../../../assets/loop-outline.svg?react';
import CogOutlineIcon from '../../../assets/cog-outline.svg?react';
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import InfoOutlineIcon from '../../../assets/info-outline.svg?react';
import VerticalEllipsisOutlineIcon from '../../../assets/vertical-ellipsis-outline.svg?react';
import { faClosedCaptioning as faSubtitles } from "@fortawesome/free-solid-svg-icons";
import { faClosedCaptioning as faSubtitlesOff } from "@fortawesome/free-solid-svg-icons";
import { useAppStateStore } from "../../../store/appStateStore";
import ISO6391 from "iso-639-1";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import cx from "classnames";
import ActionButton from "../ActionButton";
import "./ActionButtons.css";
import useStashTvConfig from "../../../hooks/useStashTvConfig";

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
    set: setAppSetting,
  } = useAppStateStore();

  const { data: { subtitleLanguage } } = useStashTvConfig()

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

  return (
    <div
      className="ActionButtons"
    >
      <div
        className={cx("toggleable-ui", {'active': uiVisible})}
        data-testid="MediaSlide--toggleableUi"
      >
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

        {captionSources && <ActionButton
          active={!!captionSources && showSubtitles}
          activeIcon={faSubtitles}
          activeText="Hide subtitles"
          data-testid="MediaSlide--subtitlesButton"
          inactiveIcon={faSubtitlesOff}
          inactiveText="Show subtitles"
          onClick={() => setAppSetting("showSubtitles", (prev) => !prev)}
        />}

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
          className="force-landscape"
          active={!forceLandscape}
          activeIcon={PortraitOutlineIcon}
          activeText="Landscape"
          data-testid="MediaSlide--forceLandscapeButton"
          inactiveIcon={LandscapeIcon}
          inactiveText="Portrait"
          onClick={() => setAppSetting("forceLandscape", (prev) => !prev)}
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
          className="settings"
          active={showSettings}
          activeIcon={faGear}
          activeText="Close settings"
          data-testid="MediaSlide--settingsButton"
          inactiveIcon={CogOutlineIcon}
          inactiveText="Show settings"
          onClick={() => setAppSetting("showSettings", (prev) => !prev)}
        />
      </div>
      <ActionButton
        active={uiVisible}
        activeIcon={faEllipsisVertical}
        activeText="Hide UI"
        className={cx("toggleable-ui-button", {'active': uiVisible})}
        data-testid="MediaSlide--showActionButton"
        inactiveIcon={VerticalEllipsisOutlineIcon}
        inactiveText="Show UI"
        onClick={() => setAppSetting("uiVisible", (prev) => !prev)}
      />
    </div>
  )
}
