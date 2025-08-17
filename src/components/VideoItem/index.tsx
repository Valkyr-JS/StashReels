import { faDownLeftAndUpRightToCenter as faRectanglePortrait } from "@fortawesome/free-solid-svg-icons";
import { faUpRightAndDownLeftFromCenter as faDistributeSpacingHorizontal } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { faClosedCaptioning as faSubtitles } from "@fortawesome/free-solid-svg-icons";
import { faVolumeHigh as faVolume } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical as faEllipsisStrokeVertical } from "@fortawesome/free-solid-svg-icons";
import { faCircleInfo as faCircleInfoOff } from "@fortawesome/free-solid-svg-icons";
import { faExpand as faExpandOff } from "@fortawesome/free-solid-svg-icons";
import { faGear as faGearOff } from "@fortawesome/free-solid-svg-icons";
import { faRepeat as faRepeatOff } from "@fortawesome/free-solid-svg-icons";
import { faClosedCaptioning as faSubtitlesOff } from "@fortawesome/free-solid-svg-icons";
import { faVolumeXmark as faVolumeOff } from "@fortawesome/free-solid-svg-icons";
import { faPause } from "@fortawesome/free-solid-svg-icons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { faMobile, faDesktop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { default as cx } from "classnames";
import ISO6391 from "iso-639-1";
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Scrubber } from "react-scrubber";
import { Transition } from "react-transition-group";
import "./VideoItem.scss";
import { useIsInViewport } from "../../hooks";
import { secondsToTimestamp, sortPerformers } from "../../helpers";
import { TRANSITION_DURATION } from "../../constants";
import ScenePlayer from "../ScenePlayer";

export interface VideoItemProps extends IitemData {
  /** Function for handling changing the current item. */
  changeItemHandler: (newIndex: number) => void;
  /** The index of the item currently displayed in the scroller. */
  currentIndex: number;
  /** The zero-based index of the scene in the video queue. */
  index: number;
  /** The fullscreen state set by the user. */
  isFullscreen: boolean;
  /** The letterboxing state set by the user. */
  isLetterboxed: boolean;
  /** Whether the video is forced to be displayed in landscape mode. */
  isForceLandscape: boolean;
  /** The audio state set by the user. */
  isMuted: boolean;
  /** Whether the video should loop on end. If false, the next video is scrolled
   * to automatically. */
  loopOnEnd: boolean;
  /** Whether the settings tab is open. */
  settingsTabIsVisible: boolean;
  /** Whether the UI buttons are visible. */
  uiIsVisible: boolean;
  /** The default captions language to show. `undefined` means no default
   * captions. */
  captionsDefault?: string;
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const [paused, setPaused] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const setVideoRef = useMemo(() => {
    return (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (!el) return;
      if (el.paused !== paused) {
        setPaused(el.paused);
      }
      el.addEventListener("playing", () => setPaused(false));
      el.addEventListener("pause", () => setPaused(true));
    }
  }, []);

  /** Check if at least 80% of the video is in the viewport. */
  const isInViewport = useIsInViewport(videoRef, {
    threshold: 0.8,
  });

  /* ------------------------------- Play/pause ------------------------------- */

  useEffect(() => {
    // Pause the video if the settings tab is open
    if (props.settingsTabIsVisible) {
      videoRef.current?.pause();
    }
    // Play the video if it is currently in the viewport.
    else if (isInViewport && videoRef.current) {
      setPaused(false);
      videoRef.current.play().catch((err) => setPaused(true));
    } else {
      videoRef.current?.pause();
    }

    // Update the current item data
    if (isInViewport) props.changeItemHandler(props.index);
  }, [isInViewport, props.settingsTabIsVisible]);

  const [showTapIcon, setShowTapIcon] = useState(false);
  const tapIconRef = useRef(null);

  /** Handle toggling the video play state. */
  const togglePlayHandler = useMemo(() => { // useMemo to avoid causing unnecessary re-renders
    return () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        setPaused(false);
        console.log("attempting to play video");
        videoRef.current.play().catch((err) => setPaused(true));
      } else {
        console.log("attempting to pause video");
        videoRef.current.pause();
      }
      // Display the tap icon, then hide it after some time.
      setShowTapIcon(true);
      setTimeout(() => {
        setShowTapIcon(false);
      }, 1200);
    };
  }, []);

  /* ----------------------------- Toggle buttons ----------------------------- */

  const uiButtonDrawerRef = useRef(null);
  const uiButtonRef = useRef(null);
  const toggleableUiStyles: React.CSSProperties = {
    transitionDuration: TRANSITION_DURATION / 1000 + "s",
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

  /* ------------------------------ Letterboxing ------------------------------ */

  const letterboxingButtonClickHandler = () => {
    if (isInViewport) props.toggleLetterboxingHandler();
  };

  /* ------------------------------ Rotation ------------------------------ */

  const forceLandscapeButtonClickHandler = () => {
    if (isInViewport) props.toggleForceLandscapeHandler();
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

  // Only render the button if there is available data
  const sceneInfoDataAvailable =
    props.scene.performers.length > 0 ||
    !!props.scene.studio ||
    !!props.scene.title ||
    !!props.scene.date;

  const sceneInfoButton = sceneInfoDataAvailable ? (
    <UiButton
      active={sceneInfoOpen}
      activeIcon={faCircleInfo}
      activeText="Close scene info"
      data-testid="VideoItem--infoButton"
      inactiveIcon={faCircleInfoOff}
      inactiveText="Show scene info"
      onClick={sceneInfoButtonClickHandler}
    />
  ) : null;

  /* -------------------------------- Scrubber -------------------------------- */

  const [sceneProgress, setSceneProgress] = useState(0);
  const scrubberRef = useRef(null);

  /** Handle updating the scrubber position when the scene is playing */
  const handleTimeUpdate = (e: Event) => {
    if (!(e.target instanceof HTMLVideoElement)) {
      console.warn("Time update event target is not a video element", e);
      return;
    }
    const target = e.target;
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
          .find((c) => !!c)
      : null;

  const subtitlesButton = !!captionSources ? (
    <UiButton
      active={!!captionSources && props.subtitlesOn}
      activeIcon={faSubtitles}
      activeText="Hide subtitles"
      data-testid="VideoItem--subtitlesButton"
      inactiveIcon={faSubtitlesOff}
      inactiveText="Show subtitles"
      onClick={props.toggleSubtitlesHandler}
    />
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
      className="VideoItem"
      data-testid="VideoItem--container"
      data-index={props.index}
      data-scene-id={props.scene.id}
      ref={itemRef}
    >
      <ScenePlayer
        className={cx({ 'cover': !props.isLetterboxed })}
        scene={props.scene.rawScene}
        hideScrubberOverride={true}
        autoplay={false}
        permitLoop={true}
        initialTimestamp={0}
        sendSetTimestamp={() => {}}
        onTimeUpdate={handleTimeUpdate}
        onComplete={() => {}}
        onNext={() => {}}
        onPrevious={() => {}}
        ref={setVideoRef}
        hideControls={true}
        hideProgressBar={true}
        muted={props.isMuted || !isInViewport}
        onClick={togglePlayHandler}
        onEnded={handleOnEnded}
      />
      <Transition
        in={paused || showTapIcon}
        nodeRef={tapIconRef}
        timeout={TRANSITION_DURATION}
        unmountOnExit
      >
        {(state) => (
          <FontAwesomeIcon
            className={cx("tap-icon", {'transparent': !paused})}
            icon={paused ? faPlay : faPause}
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
        timeout={TRANSITION_DURATION}
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
      <div
        className={cx('controls', {'active': props.uiIsVisible})}
      >
        <Transition
          in={props.uiIsVisible}
          nodeRef={uiButtonDrawerRef}
          timeout={TRANSITION_DURATION}
          unmountOnExit
        >
          {(state) => (
            <div
              className="toggleable-ui"
              data-testid="VideoItem--toggleableUi"
              ref={uiButtonDrawerRef}
              style={{
                ...toggleableUiStyles,
                ...toggleableUiTransitionStyles[state],
              }}
            >
              <UiButton
                active={props.isMuted}
                activeIcon={faVolumeOff}
                activeText="Unmute"
                data-testid="VideoItem--muteButton"
                inactiveIcon={faVolume}
                inactiveText="Mute"
                onClick={muteButtonClickHandler}
              />

              {subtitlesButton}

              <UiButton
                active={props.isFullscreen}
                activeIcon={faExpand}
                activeText="Close fullscreen"
                data-testid="VideoItem--fullscreenButton"
                inactiveIcon={faExpandOff}
                inactiveText="Open fullscreen"
                onClick={fullscreenButtonClickHandler}
              />

              <UiButton
                active={!props.isLetterboxed}
                activeIcon={faRectanglePortrait}
                activeText="Constrain to screen"
                data-testid="VideoItem--letterboxButton"
                inactiveIcon={faDistributeSpacingHorizontal}
                inactiveText="Fill screen"
                onClick={letterboxingButtonClickHandler}
              />

              <UiButton
                active={!props.isForceLandscape}
                activeIcon={faMobile}
                activeText="Landscape"
                data-testid="VideoItem--forceLandscapeButton"
                inactiveIcon={faDesktop}
                inactiveText="Portrait"
                onClick={forceLandscapeButtonClickHandler}
              />

              <UiButton
                active={props.loopOnEnd}
                activeIcon={faRepeat}
                activeText="Stop looping scene"
                data-testid="VideoItem--loopButton"
                inactiveIcon={faRepeatOff}
                inactiveText="Loop scene"
                onClick={loopButtonClickHandler}
              />

              {sceneInfoButton}

              <UiButton
                active={false}
                activeIcon={faGearOff}
                activeText="Close settings"
                data-testid="VideoItem--settingsButton"
                inactiveIcon={faGearOff}
                inactiveText="Show settings"
                onClick={() => props.setSettingsTabHandler(true)}
              />
            </div>
          )}
        </Transition>
        <Transition
          in={props.uiIsVisible}
          nodeRef={uiButtonRef}
          timeout={TRANSITION_DURATION}
        >
          {(state) => (
            <UiButton
              active={props.uiIsVisible}
              activeIcon={faEllipsisVertical}
              activeText="Hide UI"
              className="toggleable-ui-button"
              data-testid="VideoItem--showUiButton"
              inactiveIcon={faEllipsisStrokeVertical}
              inactiveText="Show UI"
              onClick={toggleUiButtonClickHandler}
              ref={uiButtonRef}
              style={{
                ...toggleableUiStyles,
                ...toggleUiButtonTransitionStyles[state],
              }}
            />
          )}
        </Transition>
      </div>
      <Transition
        in={props.uiIsVisible}
        nodeRef={scrubberRef}
        timeout={TRANSITION_DURATION}
      >
        {(state) => (
          <div
            className={cx("scrubber-container", "scrubber", state)}
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
            <div className="timecode">
              <span>{timecode}</span>
              <span>{duration}</span>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default React.memo(VideoItem);

/* -------------------------------------------------------------------------- */
/*                                  UI Button                                 */
/* -------------------------------------------------------------------------- */

interface UiButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  /** Indicates if the buttons associated action is active. */
  active: boolean;
  activeIcon: IconDefinition;
  activeText: string;
  inactiveIcon: IconDefinition;
  inactiveText: string;
}

const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(
  (
    { active, activeIcon, activeText, inactiveIcon, inactiveText, ...props },
    ref
  ) => {
    return (
      <button {...props} onClick={props.onClick} type="button" ref={ref}>
        <FontAwesomeIcon icon={active ? activeIcon : inactiveIcon} />
        <span className="sr-only">
          {active ? activeText : inactiveText}
        </span>
      </button>
    );
  }
);

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
      <span className="date">{props.date}</span>
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
      <div className="performers">{performersInner}</div>
    ) : null;

    /* --------------------------------- Studio --------------------------------- */

    const parentStudioText = props.parentStudio
      ? " | " + props.parentStudio
      : "";

    const studio = props.studio ? (
      <span className="studio">
        {props.studio + parentStudioText}
      </span>
    ) : null;

    /* ---------------------------------- Title --------------------------------- */

    const title = props.title ? <h5>{props.title}</h5> : null;

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className="scene-info"
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
