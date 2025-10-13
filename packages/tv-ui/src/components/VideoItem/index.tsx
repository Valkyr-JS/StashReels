import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faClosedCaptioning as faSubtitles } from "@fortawesome/free-solid-svg-icons";
import { faVolumeHigh as faVolume } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { faClosedCaptioning as faSubtitlesOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import ISO6391 from "iso-639-1";
import React, {
  forwardRef,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Transition } from "react-transition-group";
import "./VideoItem.scss";
import { sortPerformers } from "../../helpers";
import { TRANSITION_DURATION } from "../../constants";
import ScenePlayer from "../ScenePlayer";
import { type VideoJsPlayer } from "video.js";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useAppStateStore } from "../../store/appStateStore";
import { useStashConfigStore } from "../../store/stashConfigStore";
import CrtEffect from "../CrtEffect";
import VolumeMuteOutlineIcon from '../../assets/volume-mute-outline.svg?react';
import ExpandOutlineIcon from '../../assets/expand-outline.svg?react';
import ContainIcon from '../../assets/contain.svg?react';
import CoverOutlineIcon from '../../assets/cover-outline.svg?react';
import PortraitOutlineIcon from '../../assets/portrait-rotation-outline.svg?react';
import LandscapeIcon from '../../assets/landscape-rotation.svg?react';
import LoopOutlineIcon from '../../assets/loop-outline.svg?react';
import InfoOutlineIcon from '../../assets/info-outline.svg?react';
import CogOutlineIcon from '../../assets/cog-outline.svg?react';
import VerticalEllipsisOutlineIcon from '../../assets/vertical-ellipsis-outline.svg?react';

export interface VideoItemProps {
  scene: GQL.TvSceneDataFragment;
  changeItemHandler: ((newIndex: number | ((currentIndex: number) => number)) => void);
  currentIndex: number;
  index: number;
  style?: React.CSSProperties | undefined;
  className?: string;
  currentlyScrolling?: boolean;
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  useEffect(() => {
    import.meta.env.VITE_DEBUG && console.log(`Mounted VideoItem index=${props.index} sceneId=${props.scene.id}`);
    return () => import.meta.env.VITE_DEBUG && console.log(`Unmounted VideoItem index=${props.index} sceneId=${props.scene.id}`);
  },[]);
  const {
    showSettings,
    fullscreen,
    letterboxing,
    forceLandscape,
    audioMuted,
    looping,
    showSubtitles,
    uiVisible,
    crtEffect,
    setShowSettings,
    setAudioMuted,
    setFullscreen,
    setLetterboxing,
    setShowSubtitles,
    setForceLandscape,
    setLooping,
    setUiVisible,
  } = useAppStateStore();
  const { stashTvConfig } = useStashConfigStore();
  const videojsPlayerRef = useRef<VideoJsPlayer | null>(null);
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
  
  const [loadingDeferred, setLoadingDeferred] = useState(props.currentlyScrolling);
  useEffect(() => {
    if (loadingDeferred) {
      setLoadingDeferred(props.currentlyScrolling);
    }
  }, [loadingDeferred, props.currentlyScrolling]);

  const isInViewport = props.index === props.currentIndex;
  
  // Currently hardcoded but could be made configurable later
  const autoplay = false;
  
  function handleVideojsPlayerReady(player: VideoJsPlayer) {
    videojsPlayerRef.current = player;
    player.on("volumechange", () => {
      import.meta.env.VITE_DEBUG && console.log(`Video.js player volumechange event - player ${player.muted() ? "" : "not"} muted`);
      setAudioMuted(player.muted());
    });
    if (audioMuted !== player.muted()) {
      import.meta.env.VITE_DEBUG && console.log(`Video.js player loaded - player ${player.muted() ? "" : "not"} muted`);
      setAudioMuted(player.muted());
    }
    // We resort to `any` here because the types for videojs are incomplete
    ;(player.getChild('ControlBar') as any)?.progressControl?.el().addEventListener('pointermove', (event: MouseEvent) => {
      // Stop event propagation so pointermove event doesn't make it to window and trigger a sidebar drag when we're
      // trying to seek
      event.stopPropagation();
    });
  }

  /* ------------------------------- Play/pause ------------------------------- */

  useEffect(() => {
    // Play/pause the video based only on viewport
    const videojsPlayer = videojsPlayerRef.current;
    if (!videojsPlayer) return;
    // In theory we shouldn't need the conditional on props of videojsPlayer but it seems like sometimes we do
    if (props.index === props.currentIndex) {
      if (!autoplay) return;
      setPaused(false);
      videojsPlayer?.play()?.catch(() => setPaused(true));
    } else {
      videojsPlayer?.pause();
    }
  }, [props.index, props.currentIndex]);
    
  useEffect(() => {
    if (!isInViewport) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const seekBackwardsKey = forceLandscape ? "ArrowDown" : "ArrowLeft";
      const seekForwardsKey = forceLandscape ? "ArrowUp" : "ArrowRight";
      import.meta.env.VITE_DEBUG && (e.key === seekBackwardsKey || e.key === seekForwardsKey) && 
        console.log(`VideoItem ${props.index} Keydown`, e.key, {seekBackwardsKey, seekForwardsKey});
      if (e.key === seekBackwardsKey) {
        seekBackwards()
        e.preventDefault()
      } else if (e.key === seekForwardsKey) {
        seekForwards()
        e.preventDefault()
      }
    }
    // We use capture so we can stop it propagating to the video player which treats arrow keys as seek commands
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [forceLandscape, isInViewport]);

  function getSkipTime() {
    const duration = props.scene.files?.[0].duration;
    if (!duration) {
        return null
    }

    let skipPercent
    if (duration > 1 * 60 * 60) {
        skipPercent = 0.05
    } else if (duration > 10 * 60) {
        skipPercent = 0.10
    } else if (duration > 1 * 60) {
        skipPercent = 0.20
    } else {
        skipPercent = 0.50
    }
    return duration * skipPercent
  }
  
  function seekForwards() {
    const videojsPlayer = videojsPlayerRef.current;
    if (!videojsPlayer || videojsPlayer.isDisposed()) return null;
    const duration = videojsPlayer.duration();
    const skipAmount = getSkipTime()
    import.meta.env.VITE_DEBUG && console.log("Seeking forwards", {skipAmount, duration, isDisposed: videojsPlayer.isDisposed()})
    if (skipAmount === null || typeof duration !== 'number') {
        return null
    }
    const nextSkipAheadTime = videojsPlayer.currentTime() + skipAmount
    if (nextSkipAheadTime < duration) {
      videojsPlayer.currentTime(nextSkipAheadTime)
      videojsPlayer.play()
      return
    }
    props.changeItemHandler((currentIndex) => currentIndex + 1)
    return null
  }
    
  function seekBackwards() {
    const videojsPlayer = videojsPlayerRef.current;
    if (!videojsPlayer || videojsPlayer.isDisposed()) return null;
    const duration = videojsPlayer.duration();
    const skipAmount = getSkipTime()
    import.meta.env.VITE_DEBUG && console.log("Seeking backwards", {skipAmount, duration, isDisposed: videojsPlayer.isDisposed()})
    if (skipAmount === null || typeof duration !== 'number') {
      return null
    }
    const nextSkipBackTime = videojsPlayer.currentTime() - skipAmount
    if (nextSkipBackTime >= 0) {
      videojsPlayer.currentTime(nextSkipBackTime)
      videojsPlayer.play()
      return
    }
    props.changeItemHandler((currentIndex) => Math.max(currentIndex - 1, 0));
  }

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

  /* ------------------------------ On end event ------------------------------ */

  const itemRef = useRef<HTMLDivElement>(null);

  /** Handle the event fired at the end of video playback. */
  const handleOnEnded = () => {
    // If not looping on end, scroll to the next item.
    if (!looping) props.changeItemHandler((currentIndex) => currentIndex + 1);
  };

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
      className="show-scene-info"
      active={sceneInfoOpen}
      activeIcon={faCircleInfo}
      activeText="Close scene info"
      data-testid="VideoItem--infoButton"
      inactiveIcon={InfoOutlineIcon}
      inactiveText="Show scene info"
      onClick={sceneInfoButtonClickHandler}
    />
  ) : null;


  /* -------------------------------- Subtitles ------------------------------- */

  /** Only render captions track if available, and it matches the user's chosen
   * language. Fails accessibility if missing, but there's no point rendering
   * an empty track. */
  const captionSources =
    props.scene.captions && stashTvConfig.subtitleLanguage
      ? props.scene.captions
          .map((cap, i) => {
            if (cap.language_code === stashTvConfig.subtitleLanguage) {
              const src = props.scene.paths.caption + `?lang=${cap.language_code}&type=${cap.caption_type}`;
              return (
                <track
                  default={stashTvConfig.subtitleLanguage === cap.language_code}
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

  const subtitlesButton = !!captionSources ? (
    <UiButton
      active={!!captionSources && showSubtitles}
      activeIcon={faSubtitles}
      activeText="Hide subtitles"
      data-testid="VideoItem--subtitlesButton"
      inactiveIcon={faSubtitlesOff}
      inactiveText="Show subtitles"
      onClick={() => setShowSubtitles((prev) => !prev)}
    />
  ) : null;

  // Update the subtitles track via the ref object
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks.length)
      videoRef.current.textTracks[0].mode = showSubtitles
        ? "showing"
        : "disabled";
  }, [showSubtitles]);

  /* -------------------------------- Component ------------------------------- */

  return (
    <div
      className={cx("VideoItem", {inViewport: isInViewport, 'cover': !letterboxing}, props.className)}
      data-testid="VideoItem--container"
      data-index={props.index}
      data-scene-id={props.scene.id}
      ref={itemRef}
      style={props.style}
    >
      <CrtEffect enabled={crtEffect}>
        {import.meta.env.VITE_DEBUG && <div className="debugStats">
          {props.index} - {props.scene.id} {paused ? "Paused" : "Playing"} {loadingDeferred ? "(Loading deferred)" : ""}
        </div>}
        {import.meta.env.VITE_DEBUG && <div className="loadingDeferredDebugBackground" />}
        <img className="loadingDeferredPreview" src={props.scene.paths.screenshot || ""} />
        {!loadingDeferred && <ScenePlayer
          scene={props.scene}
          hideScrubberOverride={true}
          muted={audioMuted}
          autoplay={autoplay}
          loop={looping}
          initialTimestamp={0}
          sendSetTimestamp={() => {}}
          onComplete={() => {}}
          onNext={() => {}}
          onPrevious={() => {}}
          ref={setVideoRef}
          onEnded={handleOnEnded}
          onVideojsPlayerReady={handleVideojsPlayerReady}
          optionsToMerge={{
            plugins: {
              touchOverlay: {
                seekLeft: {
                  handleClick: seekBackwards
                },
                seekRight: {
                  handleClick: seekForwards
                }
              }
            }
          }}
        />}
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
              scene={props.scene}
              style={{
                ...toggleableUiStyles,
                ...toggleableUiTransitionStyles[state],
              }}
            />
          )}
        </Transition>
        <div
          className={cx('controls', {'active': uiVisible})}
        >
          <Transition
            in={uiVisible}
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
                  className="mute"
                  active={!audioMuted}
                  activeIcon={faVolume}
                  activeText="Mute"
                  data-testid="VideoItem--muteButton"
                  inactiveIcon={VolumeMuteOutlineIcon}
                  inactiveText="Unmute"
                  onClick={() => setAudioMuted((prev) => !prev)}
                />

                {subtitlesButton}

                {'exitFullscreen' in document && <UiButton
                  className="fullscreen"
                  active={fullscreen}
                  activeIcon={faExpand}
                  activeText="Close fullscreen"
                  data-testid="VideoItem--fullscreenButton"
                  inactiveIcon={ExpandOutlineIcon}
                  inactiveText="Open fullscreen"
                  onClick={() => setFullscreen((prev) => !prev)}
                />}

                <UiButton
                  className="letterboxing"
                  active={!letterboxing}
                  activeIcon={CoverOutlineIcon}
                  activeText="Constrain to screen"
                  data-testid="VideoItem--letterboxButton"
                  inactiveIcon={ContainIcon}
                  inactiveText="Fill screen"
                  onClick={() => setLetterboxing((prev) => !prev)}
                />

                <UiButton
                  className="force-landscape"
                  active={!forceLandscape}
                  activeIcon={PortraitOutlineIcon}
                  activeText="Landscape"
                  data-testid="VideoItem--forceLandscapeButton"
                  inactiveIcon={LandscapeIcon}
                  inactiveText="Portrait"
                  onClick={() => setForceLandscape((prev) => !prev)}
                />

                <UiButton
                  className="loop"
                  active={looping}
                  activeIcon={faRepeat}
                  activeText="Stop looping scene"
                  data-testid="VideoItem--loopButton"
                  inactiveIcon={LoopOutlineIcon}
                  inactiveText="Loop scene"
                  onClick={() => setLooping((prev) => !prev)}
                />

                {sceneInfoButton}

                <UiButton
                  className="settings"
                  active={showSettings}
                  activeIcon={faGear}
                  activeText="Close settings"
                  data-testid="VideoItem--settingsButton"
                  inactiveIcon={CogOutlineIcon}
                  inactiveText="Show settings"
                  onClick={() => setShowSettings(showSettings => !showSettings)}
                />
              </div>
            )}
          </Transition>
          <Transition
            in={uiVisible}
            nodeRef={uiButtonRef}
            timeout={TRANSITION_DURATION}
          >
            {(state) => (
              <UiButton
                active={uiVisible}
                activeIcon={faEllipsisVertical}
                activeText="Hide UI"
                className="toggleable-ui-button"
                data-testid="VideoItem--showUiButton"
                inactiveIcon={VerticalEllipsisOutlineIcon}
                inactiveText="Show UI"
                onClick={() => setUiVisible((prev) => !prev)}
                ref={uiButtonRef}
                style={{
                  ...toggleableUiStyles,
                  ...toggleUiButtonTransitionStyles[state],
                }}
              />
            )}
          </Transition>
        </div>
      </CrtEffect>
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
  activeIcon: IconDefinition | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  activeText: string;
  inactiveIcon: IconDefinition | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  inactiveText: string;
}

const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(
  (
    { active, activeIcon, activeText, inactiveIcon, inactiveText, className, ...props },
    ref
  ) => {
    const fullClassName = cx(className, { active });
    const Icon = active ? activeIcon : inactiveIcon;
    return (
      <button className={fullClassName} {...props} onClick={props.onClick} type="button" ref={ref}>
        {'icon' in Icon ? (
          <FontAwesomeIcon icon={Icon} />
        ) : (
          <Icon className="icon" />
        )}
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

interface SceneInfoPanelProps extends GQL.TvSceneDataFragment {
  style: React.CSSProperties;
  scene: GQL.TvSceneDataFragment;
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

    const parentStudioText = props.studio?.parent_studio
      ? " | " + props.studio.parent_studio.name
      : "";

    const studio = props.studio ? (
      <span className="studio">
        {props.studio.name + parentStudioText}
      </span>
    ) : null;

    /* ---------------------------------- Title --------------------------------- */

    const title = props.title ? <h5>{props.title}</h5> : null;
    const sceneUrl = props.paths.stream?.split("/stream")[0]?.replace("/scene", "/scenes")

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className="scene-info"
        data-testid="VideoItem--sceneInfo"
        style={props.style}
        ref={ref}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {studio}
        <a href={sceneUrl || ""}>{title}</a>
        {performers}
        {date}
      </div>
    );
  }
);
