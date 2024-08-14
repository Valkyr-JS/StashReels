import { faCircleInfo } from "@fortawesome/pro-solid-svg-icons/faCircleInfo";
import { faExpand } from "@fortawesome/pro-solid-svg-icons/faExpand";
import { faRepeat } from "@fortawesome/pro-solid-svg-icons/faRepeat";
import { faSubtitles } from "@fortawesome/pro-solid-svg-icons/faSubtitles";
import { faVolume } from "@fortawesome/pro-solid-svg-icons/faVolume";
import { faBars } from "@fortawesome/pro-light-svg-icons/faBars";
import { faCircleInfo as faCircleInfoOff } from "@fortawesome/pro-light-svg-icons/faCircleInfo";
import { faExpand as faExpandOff } from "@fortawesome/pro-light-svg-icons/faExpand";
import { faGear as faGearOff } from "@fortawesome/pro-light-svg-icons/faGear";
import { faRepeat as faRepeatOff } from "@fortawesome/pro-light-svg-icons/faRepeat";
import { faSubtitles as faSubtitlesOff } from "@fortawesome/pro-light-svg-icons/faSubtitles";
import { faVolumeXmark as faVolumeOff } from "@fortawesome/pro-light-svg-icons/faVolumeXmark";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { default as cx } from "classnames";
import ISO6391 from "iso-639-1";
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import { Scrubber } from "react-scrubber";
import { Transition } from "react-transition-group";
import * as styles from "./VideoItem.module.scss";
import "./VideoItem.scss";
import { useIsInViewport } from "../../hooks";
import { secondsToTimestamp, sortPerformers } from "../../helpers";
import { faPause, faPlay } from "@fortawesome/pro-solid-svg-icons";

export interface VideoItemProps extends IitemData {
  /** Function for handling changing the current item. */
  changeItemHandler: (newIndex: number) => void;
  /** The index of the item currently displayed in the scroller. */
  currentIndex: number;
  /** The zero-based index of the scene in the video queue. */
  index: number;
  /** The fullscreen state set by the user. */
  isFullscreen: boolean;
  /** The audio state set by the user. */
  isMuted: boolean;
  /** Whether the video should loop on end. If false, the next video is scrolled
   * to automatically. */
  loopOnEnd: boolean;
  /** Whether the UI buttons are visible. */
  uiIsVisible: boolean;
  /** The default captions language to show. `undefined` means no default
   * captions. */
  captionsDefault?: string;
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Check if at least 80% of the video is in the viewport. */
  const isInViewport = useIsInViewport(videoRef, {
    threshold: 0.8,
  });

  /* ------------------------------- Play/pause ------------------------------- */

  useEffect(() => {
    // Play the video if it is currently in the viewport, otherwise pause it.
    if (isInViewport && videoRef.current) videoRef.current.play();
    else videoRef.current?.pause();

    // Update the current item data
    if (isInViewport) props.changeItemHandler(props.index);
  }, [isInViewport]);

  const [showTapIcon, setShowTapIcon] = useState(false);
  const tapIconRef = useRef(null);

  /** Handle toggling the video play state. */
  const togglePlayHandler = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
    // Display the tap icon, then hide it after some time.
    setShowTapIcon(true);
    setTimeout(() => {
      setShowTapIcon(false);
    }, 1200);
  };

  /* ----------------------------- Toggle buttons ----------------------------- */

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

  const toggleUiButtonClickHandler = () => {
    if (isInViewport) props.toggleUiHandler();
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

  /* ------------------------------- Fullscreen ------------------------------- */

  const fullscreenButtonClickHandler = () => {
    if (isInViewport) props.toggleFullscreenHandler();
  };

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

  /* ------------------------------- Scene info ------------------------------- */

  // ? Unlike most other UI states, scene info visibility does not persist
  // across scenes, and should be reset to false on scrolling to another like.

  const [sceneInfoOpen, setSceneInfoOpen] = useState(false);
  const sceneInfoPanelRef = useRef(null);

  const sceneInfoButtonClickHandler = () => {
    if (isInViewport) setSceneInfoOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isInViewport) setSceneInfoOpen(false);
  }, [isInViewport]);

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

  const timecode = secondsToTimestamp(videoRef.current?.currentTime ?? 0);
  const duration = !!videoRef.current?.duration
    ? secondsToTimestamp(videoRef.current.duration)
    : null;

  /* -------------------------------- Subtitles ------------------------------- */

  /** Only render captions track if available, and it matches the user's chosen
   * langueage. Fails accessibility if missing, but there's no point rendering
   * an empty track. */
  const captionSources =
    props.scene.captions && props.captionsDefault
      ? props.scene.captions
          .map((cap, i) => {
            if (cap.lang === props.captionsDefault) {
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
            }
          })
          .filter((c) => !!c)
      : null;

  const subtitlesButton = !!captionSources ? (
    <button
      data-testid="VideoItem--subtitlesButton"
      onClick={props.toggleSubtitlesHandler}
      type="button"
    >
      <FontAwesomeIcon
        icon={props.subtitlesOn ? faSubtitles : faSubtitlesOff}
      />
    </button>
  ) : null;

  // Update the subtitles track via the ref object
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks.length)
      videoRef.current.textTracks[0].mode = props.subtitlesOn
        ? "showing"
        : "disabled";
  }, [props.subtitlesOn]);

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
      <Transition
        in={showTapIcon}
        nodeRef={tapIconRef}
        timeout={150}
        unmountOnExit
      >
        {(state) => (
          <FontAwesomeIcon
            className={styles["tap-icon"]}
            icon={videoRef.current?.paused ? faPause : faPlay}
            ref={tapIconRef}
            style={{
              ...toggleableUiStyles,
              ...toggleableUiTransitionStyles[state],
            }}
          />
        )}
      </Transition>
      <Transition
        in={sceneInfoOpen}
        nodeRef={sceneInfoPanelRef}
        timeout={buttonsTransitionDuration}
        mountOnEnter
        unmountOnExit
      >
        {(state) => (
          <SceneInfoPanel
            {...props.scene}
            ref={sceneInfoPanelRef}
            style={{
              ...toggleableUiStyles,
              ...toggleableUiTransitionStyles[state],
            }}
          />
        )}
      </Transition>
      <div className={styles.controls}>
        <Transition
          in={props.uiIsVisible}
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
                  icon={props.isMuted ? faVolumeOff : faVolume}
                />
                <span className={styles["visually-hidden"]}>
                  {props.isMuted ? "Unmute" : "Mute"}
                </span>
              </button>
              <button
                data-testid="VideoItem--fullscreenButton"
                onClick={fullscreenButtonClickHandler}
                type="button"
              >
                <FontAwesomeIcon
                  icon={props.isFullscreen ? faExpand : faExpandOff}
                />
              </button>
              {subtitlesButton}
              <button
                data-testid="VideoItem--infoButton"
                onClick={sceneInfoButtonClickHandler}
                type="button"
              >
                <FontAwesomeIcon
                  icon={sceneInfoOpen ? faCircleInfo : faCircleInfoOff}
                />
              </button>
              <button
                data-testid="VideoItem--loopButton"
                onClick={loopButtonClickHandler}
                type="button"
              >
                <FontAwesomeIcon
                  icon={props.loopOnEnd ? faRepeat : faRepeatOff}
                />
              </button>
              <button
                data-testid="VideoItem--configButton"
                onClick={() => console.log("config settings")}
                type="button"
              >
                <FontAwesomeIcon icon={faGearOff} />
              </button>
            </div>
          )}
        </Transition>
        <Transition
          in={props.uiIsVisible}
          nodeRef={uiButtonRef}
          timeout={buttonsTransitionDuration}
        >
          {(state) => (
            <button
              className={styles["toggleable-ui-button"]}
              data-testid="VideoItem--showUiButton"
              onClick={toggleUiButtonClickHandler}
              ref={uiButtonRef}
              type="button"
              style={{
                ...toggleableUiStyles,
                ...toggleUiButtonTransitionStyles[state],
              }}
            >
              <FontAwesomeIcon icon={props.uiIsVisible ? faXmark : faBars} />
            </button>
          )}
        </Transition>
      </div>
      <Transition
        in={props.uiIsVisible}
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
            <div className={styles["scrubber--timecode"]}>
              <span>{timecode}</span>
              <span>{duration}</span>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default VideoItem;

/* -------------------------------------------------------------------------- */
/*                              Scene info panel                              */
/* -------------------------------------------------------------------------- */

interface SceneInfoPanelProps extends IsceneData {
  style: React.CSSProperties;
}

const SceneInfoPanel = forwardRef(
  (props: SceneInfoPanelProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    /* ---------------------------------- Date ---------------------------------- */

    const date = props.date ? (
      <span className={styles["scene-info__date"]}>{props.date}</span>
    ) : null;

    /* ------------------------------- Performers ------------------------------- */

    const sortedPerformers = sortPerformers(props.performers);
    const totalPerformers = sortedPerformers.length;

    const performersInner = sortedPerformers.map((pf, i) => {
      const isOneBeforeLast = i === totalPerformers - 2;
      const isAnyBeforeLast = i < totalPerformers - 1;
      let suffix = null;
      if (totalPerformers === 2 && isOneBeforeLast) suffix = " and ";
      else {
        if (isAnyBeforeLast) suffix = ", ";
        if (isOneBeforeLast) suffix += "and ";
      }
      return (
        <Fragment key={i}>
          <span>{pf.name}</span>
          {suffix}
        </Fragment>
      );
    });

    const performers = performersInner.length ? (
      <div className={styles["scene-info__performers"]}>{performersInner}</div>
    ) : null;

    /* --------------------------------- Studio --------------------------------- */

    const parentStudioText = props.parentStudio
      ? " | " + props.parentStudio
      : "";

    const studio = props.studio ? (
      <span className={styles["scene-info__studio"]}>
        {props.studio + parentStudioText}
      </span>
    ) : null;

    /* ---------------------------------- Title --------------------------------- */

    const title = props.title ? <h5>{props.title}</h5> : null;

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className={styles["scene-info"]}
        data-testid="VideoItem--sceneInfo"
        style={props.style}
        ref={ref}
      >
        {studio}
        {title}
        {performers}
        {date}
      </div>
    );
  }
);
