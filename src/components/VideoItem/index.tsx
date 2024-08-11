import {
  faBars,
  faCircleInfo,
  faGear,
  faHeart,
  faRepeat,
  faStar,
  faSubtitles,
  faVolume,
  faVolumeSlash,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { default as cx } from "classnames";
import ISO6391 from "iso-639-1";
import React, { useEffect, useRef, useState } from "react";
import { Scrubber } from "react-scrubber";
import { Transition } from "react-transition-group";
import * as styles from "./VideoItem.module.scss";
import "./VideoItem.scss";
import { FaSolidRepeatSlash } from "../Icons";
import { useIsInViewport } from "../../hooks";

export interface VideoItemProps extends IitemData {
  /** The audio state set by the user. */
  isMuted: boolean;
  /** Function for handling loading more videos data. */
  loadMoreVideosHandler: (index: number) => void;
  /** Whether the video should loop on end. If false, the next video is scrolled
   * to automatically. */
  loopOnEnd: boolean;
  /** Function for handling toggling video audio on and off. */
  toggleAudioHandler: () => void;
  /** Function for handling toggling video looping on and off. */
  toggleLoopHandler: () => void;
  /** The default captions language to show. `undefined` means no default captions. */
  captionsDefault?: string;
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Check if at least 80% of the video is in the viewport. */
  const isInViewport = useIsInViewport(videoRef, {
    threshold: 0.8,
  });

  useEffect(() => {
    // Play the video if it is currently in the viewport, otherwise pause it.
    if (isInViewport && videoRef.current) videoRef.current.play();
    else videoRef.current?.pause();

    // Fetch more videos if required
    if (isInViewport) props.loadMoreVideosHandler(props.index);
  }, [isInViewport]);

  /** Handle toggling the video play state. */
  const togglePlayHandler = () =>
    videoRef.current?.paused
      ? videoRef.current.play()
      : videoRef.current?.pause();

  /** Only render captions track if available. Fails accessibility if missing,
   * but there's no point rendering an empty track. */
  const captionSources = props.scene.captions
    ? props.scene.captions.map((cap, i) => {
        const src = cap.source + `?lang=${cap.lang}&type=${cap.format}`;
        return (
          <track
            default={props.captionsDefault === cap.lang}
            key={i}
            kind="captions"
            label={ISO6391.getName(cap.lang) || "Unknown"}
            src={src}
            srcLang={cap.lang}
          />
        );
      })
    : null;

  /* ----------------------------- Toggle buttons ----------------------------- */

  const [showUI, setShowUI] = useState(true);
  const uiButtonDrawerRef = useRef(null);
  const uiButtonRef = useRef(null);
  const buttonsTransitionDuration = 150;
  const toggleableUiStyles: React.CSSProperties = {
    transitionDuration: buttonsTransitionDuration / 1000 + "s",
  };

  const toggleableUiTransitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },
    unmounted: {},
  };

  const toggleUiButtonTransitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0.35 },
    exited: { opacity: 0.35 },
    unmounted: {},
  };

  const handleTogglingUI = () => {
    setShowUI((prev) => !prev);
  };

  /* ----------------------------- Audio handling ----------------------------- */

  /** Handle clicking the mute button */
  const muteButtonClickHandler = () => {
    if (isInViewport) props.toggleAudioHandler();
  };

  // Update the mute property via the ref object
  useEffect(() => {
    if (isInViewport && videoRef.current)
      videoRef.current.muted = props.isMuted;
  }, [props.isMuted]);

  /* ------------------------------ On end event ------------------------------ */

  const itemRef = useRef<HTMLDivElement>(null);

  /** Handle the event fired at the end of video playback. */
  const handleOnEnded = () => {
    // If not looping on end, scroll to the next item.
    if (!props.loopOnEnd && !!itemRef.current)
      itemRef.current.nextElementSibling?.scrollIntoView();
  };

  /** Handle clicking the loop button. */
  const loopButtonClickHandler = () => {
    if (isInViewport) props.toggleLoopHandler();
  };

  // Update the loop property via the ref object
  useEffect(() => {
    if (videoRef.current) videoRef.current.loop = props.loopOnEnd;
  }, [props.loopOnEnd]);

  /* -------------------------------- Scrubber -------------------------------- */

  const [sceneProgress, setSceneProgress] = useState(0);
  const scrubberRef = useRef(null);

  /** Handle updating the scrubber position when the scene is playing */
  const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (e) => {
    const target = e.target as HTMLVideoElement;
    const { currentTime, duration } = target;
    const newTimePercentage = (currentTime / duration) * 100;
    setSceneProgress(newTimePercentage);
  };

  /** Handle updating the current position of the scene when moving the
   * scrubber. */
  const handleScrubChange = (value: number) => {
    setSceneProgress(value);
    if (videoRef.current) {
      videoRef.current.currentTime = (videoRef.current.duration / 100) * value;
    }
  };

  /* -------------------------------- Component ------------------------------- */

  return (
    <div
      className={styles.container}
      data-testid="VideoItem--container"
      ref={itemRef}
    >
      <video
        crossOrigin="anonymous"
        data-testid="VideoItem--video"
        id={props.scene.id}
        muted={props.isMuted || !isInViewport}
        onClick={togglePlayHandler}
        onEnded={handleOnEnded}
        onTimeUpdate={handleTimeUpdate}
        ref={videoRef}
      >
        <source src={props.scene.path} type={`video/${props.scene.format}`} />
        {captionSources}
      </video>
      <div className={styles.controls}>
        <Transition
          in={showUI}
          nodeRef={uiButtonDrawerRef}
          timeout={buttonsTransitionDuration}
          unmountOnExit
        >
          {(state) => (
            <div
              className={styles["toggleable-ui"]}
              data-testid="VideoItem--toggleableUi"
              ref={uiButtonDrawerRef}
              style={{
                ...toggleableUiStyles,
                ...toggleableUiTransitionStyles[state],
              }}
            >
              <button
                data-testid="VideoItem--muteButton"
                onClick={muteButtonClickHandler}
                type="button"
              >
                <FontAwesomeIcon
                  icon={props.isMuted ? faVolumeSlash : faVolume}
                />
                <span className={styles["visually-hidden"]}>
                  {props.isMuted ? "Unmute" : "Mute"}
                </span>
              </button>
              <button
                data-testid="VideoItem--subtitlesButton"
                onClick={() => console.log("subtitles button")}
                type="button"
              >
                <FontAwesomeIcon icon={faSubtitles} />
              </button>
              <button
                data-testid="VideoItem--infoButton"
                onClick={() => console.log("scene info")}
                type="button"
              >
                <FontAwesomeIcon icon={faCircleInfo} />
              </button>
              <button
                data-testid="VideoItem--faveButton"
                onClick={() => console.log("favourite")}
                type="button"
              >
                <FontAwesomeIcon icon={faHeart} />
              </button>
              <button
                data-testid="VideoItem--rateButton"
                onClick={() => console.log("rating")}
                type="button"
              >
                <FontAwesomeIcon icon={faStar} />
              </button>
              <button
                data-testid="VideoItem--loopButton"
                onClick={loopButtonClickHandler}
                type="button"
              >
                {props.loopOnEnd ? (
                  <FontAwesomeIcon icon={faRepeat} />
                ) : (
                  <FaSolidRepeatSlash />
                )}
              </button>
              <button
                data-testid="VideoItem--configButton"
                onClick={() => console.log("config settings")}
                type="button"
              >
                <FontAwesomeIcon icon={faGear} />
              </button>
            </div>
          )}
        </Transition>
        <Transition
          in={showUI}
          nodeRef={uiButtonRef}
          timeout={buttonsTransitionDuration}
        >
          {(state) => (
            <button
              className={styles["toggleable-ui-button"]}
              data-testid="VideoItem--showUiButton"
              onClick={handleTogglingUI}
              ref={uiButtonRef}
              type="button"
              style={{
                ...toggleableUiStyles,
                ...toggleUiButtonTransitionStyles[state],
              }}
            >
              <FontAwesomeIcon icon={showUI ? faXmark : faBars} />
            </button>
          )}
        </Transition>
      </div>
      <Transition
        in={showUI}
        nodeRef={scrubberRef}
        timeout={buttonsTransitionDuration}
      >
        {(state) => (
          <div
            className={cx("scrubber-container", styles["scrubber"], state)}
            ref={scrubberRef}
            style={toggleableUiStyles}
          >
            <Scrubber
              min={0}
              max={100}
              value={sceneProgress}
              onScrubChange={handleScrubChange}
              onScrubEnd={handleScrubChange}
              onScrubStart={handleScrubChange}
            />
          </div>
        )}
      </Transition>
    </div>
  );
};

export default VideoItem;
