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
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "./VideoItem.scss";
import { sortPerformers } from "../../helpers";
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
import { MediaItem } from "../../hooks/useMediaItems";
import hashObject from 'object-hash';
import { createPortal } from "react-dom";
import { useGetterRef } from "../../hooks/useGetterRef";
import { useGesture } from "@use-gesture/react";
import videojs from "video.js";
import {styledBigPlayButton} from "./video-js-plugins/styled-big-play-button";
import "./video-js-plugins/styled-big-play-button.css";

videojs.registerPlugin('styledBigPlayButton', styledBigPlayButton);

export interface VideoItemProps {
  mediaItem: MediaItem;
  changeItemHandler: ((newIndex: number | ((currentIndex: number) => number)) => void);
  currentIndex: number;
  index: number;
  style?: React.CSSProperties | undefined;
  className?: string;
  currentlyScrolling?: boolean;
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
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
    scenePreviewOnly,
    debugMode,
    autoPlay: globalAutoPlay,
    showGuideOverlay,
    set: setAppSetting,
  } = useAppStateStore();
  
  const scene = props.mediaItem.entityType === "scene" ? props.mediaItem.entity : props.mediaItem.entity.scene;
  
  useEffect(() => {
    debugMode && console.log(`Mounted VideoItem index=${props.index} sceneId=${scene.id}`);
    return () => {
      debugMode && console.log(`Unmounted VideoItem index=${props.index} sceneId=${scene.id}`)
    };
  }, []);
  const { tv: { subtitleLanguage } } = useStashConfigStore();
  
  // Don't return player if it's disposed
  const videojsPlayerRef = useGetterRef<VideoJsPlayer | null>(
    (player) => player?.isDisposed() ? null : player,
    null,
    []
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [loadingDeferred, setLoadingDeferred] = useState(props.currentlyScrolling);
  useEffect(() => {
    if (loadingDeferred) {
      setLoadingDeferred(props.currentlyScrolling);
    }
  }, [loadingDeferred, props.currentlyScrolling]);

  const isCurrentVideo = props.index === props.currentIndex;
  
  // Currently hardcoded but could be made configurable later
  const autoplay = globalAutoPlay && isCurrentVideo && !showGuideOverlay;
  
  function handleVideojsPlayerReady(player: VideoJsPlayer) {
    videojsPlayerRef.current = player;
    player.on("volumechange", () => {
      debugMode && console.log(`Video.js player volumechange event - player ${player.muted() ? "" : "not"} muted`);
      setAppSetting("audioMuted", player.muted());
    });
    if (audioMuted !== player.muted()) {
      debugMode && console.log(`Video.js player loaded - player ${player.muted() ? "" : "not"} muted`);
      setAppSetting("audioMuted", player.muted());
    }
    // We resort to `any` here because the types for videojs are incomplete
    ;(player.getChild('ControlBar') as any)?.progressControl?.el().addEventListener('pointermove', (event: MouseEvent) => {
      // Stop event propagation so pointermove event doesn't make it to window and trigger a sidebar drag when we're
      // trying to seek
      event.stopPropagation();
    });
  }
  
  useEffect(() => {
    if (!debugMode || !isCurrentVideo || !videojsPlayerRef.current) return;

    // @ts-expect-error - This is for debugging purposes so we don't worry about typing it properly
    window.tvCurrentPlayer = videojsPlayerRef.current;
  }, [isCurrentVideo, debugMode])
  
  // If duration changes (such as when scenePreviewOnly is toggled) we manually update the player since the
  // progress bar doesn't seem to update otherwise
  const firstDurationChangeRef = useRef(true);
  useEffect(() => {
    if (!videojsPlayerRef.current) return;
    if (firstDurationChangeRef.current) {
      firstDurationChangeRef.current = false;
      return
    }
    videojsPlayerRef.current?.duration(scene.files?.[0]?.duration); // Force update of duration
  }, [scene.files?.[0]?.duration])
  
  useEffect(() => {
    if (!looping || props.mediaItem.entityType !== "marker" || !videojsPlayerRef.current) return;
    // videojs-offset doesn't seem to respect loop so we have to manually restart video after it's ended
    // when loop is true
    const handleEnded = () => {
      videojsPlayerRef.current?.one('loadstart', () => {
        videojsPlayerRef.current?.play();
      });
    }
    videojsPlayerRef.current?.on('ended', handleEnded);
    return () => { videojsPlayerRef.current?.off('ended', handleEnded) };
  }, [looping])

  /* ------------------------------- Play/pause ------------------------------- */

  useEffect(() => {
    // Play/pause the video based only on viewport
    if (!videojsPlayerRef.current) return;
    if (props.index === props.currentIndex) {
      if (!autoplay) return;
      videojsPlayerRef.current?.play();
    } else {
      videojsPlayerRef.current?.pause();
    }
  }, [props.index, props.currentIndex, autoplay]);
  
  // Handle clicks and gestures on the video element
  const handleClick = useCallback((event: MouseEvent) => {
    const {target: videoElm} = event;
    if (!videoElm || !(videoElm instanceof HTMLElement)) return;
    
    const videoElmWidth = videoElm.clientWidth
    if (event.clientX < (videoElmWidth / 3)) {
      seekBackwards()
    } else if (event.clientX < ((videoElmWidth / 3) * 2)) {
      if (videojsPlayerRef.current?.paused()) {
        videojsPlayerRef.current?.play()
      } else {
        videojsPlayerRef.current?.pause()
      }
    } else {
      seekForwards()
    }
  }, [])
    
  useEffect(() => {
    if (!isCurrentVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const seekBackwardsKey = forceLandscape ? "ArrowDown" : "ArrowLeft";
      const seekForwardsKey = forceLandscape ? "ArrowUp" : "ArrowRight";
      debugMode && (e.key === seekBackwardsKey || e.key === seekForwardsKey) &&
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
  }, [forceLandscape, isCurrentVideo]);
  
  useEffect(() => {
    if (!showGuideOverlay) return;
    videojsPlayerRef.current?.pause();
  }, [showGuideOverlay]);

  function getSkipTime() {
    const duration = scene.files?.[0].duration;
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
    if (!videojsPlayerRef.current) return null;
    const duration = videojsPlayerRef.current?.duration();
    if (duration === undefined) return;
    const skipAmount = getSkipTime()
    debugMode && console.log("Seeking forwards", {skipAmount, duration})
    if (skipAmount === null || typeof duration !== 'number') {
        return null
    }
    const nextSkipAheadTime = videojsPlayerRef.current?.currentTime() + skipAmount
    if (nextSkipAheadTime < duration) {
      videojsPlayerRef.current?.currentTime(nextSkipAheadTime)
      videojsPlayerRef.current?.play()
      return
    }
    props.changeItemHandler((currentIndex) => currentIndex + 1)
    return null
  }
    
  function seekBackwards() {
    if (!videojsPlayerRef.current) return null;
    const duration = videojsPlayerRef.current?.duration();
    const skipAmount = getSkipTime()
    debugMode && console.log("Seeking backwards", {skipAmount, duration})
    if (skipAmount === null || typeof duration !== 'number') {
      return null
    }
    const nextSkipBackTime = videojsPlayerRef.current?.currentTime() - skipAmount
    if (nextSkipBackTime >= 0) {
      videojsPlayerRef.current?.currentTime(nextSkipBackTime)
      videojsPlayerRef.current?.play()
      return
    }
    props.changeItemHandler((currentIndex) => Math.max(currentIndex - 1, 0));
  }

  /* ------------------------------ On end event ------------------------------ */

  const itemRef = useRef<HTMLDivElement>(null);

  /** Handle the event fired at the end of video playback. */
  const handleOnEnded = () => {
    // If not looping on end, scroll to the next item.
    if (!looping && isCurrentVideo) props.changeItemHandler((currentIndex) => currentIndex + 1);
  };

  /* ------------------------------- Scene info ------------------------------- */

  // ? Unlike most other UI states, scene info visibility does not persist
  // across scenes, and should be reset to false on scrolling to another like.

  const [sceneInfoOpen, setSceneInfoOpen] = useState(false);
  const sceneInfoPanelRef = useRef(null);

  const sceneInfoButtonClickHandler = () => {
    if (isCurrentVideo) setSceneInfoOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isCurrentVideo) setSceneInfoOpen(false);
  }, [isCurrentVideo]);

  // Only render the button if there is available data
  const sceneInfoDataAvailable =
    scene.performers.length > 0 ||
    !!scene.studio ||
    !!scene.title ||
    !!scene.date;

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

  const subtitlesButton = !!captionSources ? (
    <UiButton
      active={!!captionSources && showSubtitles}
      activeIcon={faSubtitles}
      activeText="Hide subtitles"
      data-testid="VideoItem--subtitlesButton"
      inactiveIcon={faSubtitlesOff}
      inactiveText="Show subtitles"
      onClick={() => setAppSetting("showSubtitles", (prev) => !prev)}
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
  
  const videoJsControlBarElm = videojsPlayerRef.current?.getChild('ControlBar')?.el();

  return (
    <div
      className={cx("VideoItem", {inViewport: isCurrentVideo, 'cover': !letterboxing}, props.className)}
      data-testid="VideoItem--container"
      data-index={props.index}
      data-scene-id={scene.id}
      ref={itemRef}
      style={props.style}
    >
      <CrtEffect enabled={crtEffect}>
        {debugMode && <div className="debugStats">
          {props.index} - {scene.id} {loadingDeferred ? "(Loading deferred)" : ""}
          {" "}{props.mediaItem.entityType === "marker" ? `(Marker: ${props.mediaItem.entity.primary_tag.name})` : ""}
        </div>}
        {debugMode && <div className="loadingDeferredDebugBackground" />}
        <img className="loadingDeferredPreview" src={scene.paths.screenshot || ""} />
        {!loadingDeferred && <ScenePlayer
          // Force remount when scene streams change to ensure videojs reloads the source
          key={JSON.stringify([scene.id, hashObject(scene.sceneStreams)])}
          scene={scene}
          hideScrubberOverride={true}
          muted={audioMuted}
          autoplay={autoplay}
          loop={looping}
          initialTimestamp={props.mediaItem.entityType === "marker" ? 0 : undefined}
          sendSetTimestamp={() => {}}
          onNext={() => {}}
          onPrevious={() => {}}
          refVideo={videoRef}
          onEnded={handleOnEnded}
          onClick={handleClick}
          onVideojsPlayerReady={handleVideojsPlayerReady}
          trackActivity={!scenePreviewOnly && props.mediaItem.entityType !== "marker"}
          scrubberThumbnail={!scenePreviewOnly}
          markers={!scenePreviewOnly}
          optionsToMerge={{
            plugins: {
              styledBigPlayButton: {},
              ...(props.mediaItem.entityType === "marker" && !scenePreviewOnly ? {
                offset: {
                  start: props.mediaItem.entity.seconds,
                  end: props.mediaItem.entity.seconds + props.mediaItem.entity.duration,
                  // This moves the play head to the start of the marker clip but does not resume play even if loop is
                  // true so we handle that ourselves in an onEnded handler
                  restart_beginning: true 
                }
              } : {})
            }
          }}
        />}
        {props.mediaItem.entityType === "marker" && videoJsControlBarElm && createPortal(
          <>
            <div className="vjs-control">{props.mediaItem.entity.title || props.mediaItem.entity.primary_tag.name}</div>
            <div className="vjs-custom-control-spacer vjs-spacer">&nbsp;</div>
          </>,
          videoJsControlBarElm
        )}
        <SceneInfoPanel
          {...scene}
          ref={sceneInfoPanelRef}
          scene={scene}
          className={cx({active: sceneInfoOpen})}
        />
        <div
          className="controls"
        >
          <div
            className={cx("toggleable-ui", {'active': uiVisible})}
            data-testid="VideoItem--toggleableUi"
          >
            <UiButton
              className="mute"
              active={!audioMuted}
              activeIcon={faVolume}
              activeText="Mute"
              data-testid="VideoItem--muteButton"
              inactiveIcon={VolumeMuteOutlineIcon}
              inactiveText="Unmute"
              onClick={() => setAppSetting("audioMuted", (prev) => !prev)}
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
              onClick={() => setAppSetting("fullscreen", (prev) => !prev)}
            />}

            <UiButton
              className="letterboxing"
              active={!letterboxing}
              activeIcon={CoverOutlineIcon}
              activeText="Constrain to screen"
              data-testid="VideoItem--letterboxButton"
              inactiveIcon={ContainIcon}
              inactiveText="Fill screen"
              onClick={() => setAppSetting("letterboxing", (prev) => !prev)}
            />

            <UiButton
              className="force-landscape"
              active={!forceLandscape}
              activeIcon={PortraitOutlineIcon}
              activeText="Landscape"
              data-testid="VideoItem--forceLandscapeButton"
              inactiveIcon={LandscapeIcon}
              inactiveText="Portrait"
              onClick={() => setAppSetting("forceLandscape", (prev) => !prev)}
            />

            <UiButton
              className="loop"
              active={looping}
              activeIcon={faRepeat}
              activeText="Stop looping scene"
              data-testid="VideoItem--loopButton"
              inactiveIcon={LoopOutlineIcon}
              inactiveText="Loop scene"
              onClick={() => setAppSetting("looping", (prev) => !prev)}
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
              onClick={() => setAppSetting("showSettings", (prev) => !prev)}
            />
          </div>
          <UiButton
            active={uiVisible}
            activeIcon={faEllipsisVertical}
            activeText="Hide UI"
            className={cx("toggleable-ui-button", {'active': uiVisible})}
            data-testid="VideoItem--showUiButton"
            inactiveIcon={VerticalEllipsisOutlineIcon}
            inactiveText="Show UI"
            onClick={() => setAppSetting("uiVisible", (prev) => !prev)}
          />
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
  style?: React.CSSProperties;
  scene: GQL.TvSceneDataFragment;
  className?: string;
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
        className={cx("scene-info", props.className)}
        data-testid="VideoItem--sceneInfo"
        style={props.style}
        ref={ref}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {studio}
        <a href={sceneUrl || ""} target="_blank">{title}</a>
        {performers}
        {date}
      </div>
    );
  }
);
