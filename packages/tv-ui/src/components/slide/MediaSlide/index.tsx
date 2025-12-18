
import cx from "classnames";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./MediaSlide.scss";
import ScenePlayer from "../../ScenePlayer";
import { type VideoJsPlayer } from "video.js";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useAppStateStore } from "../../../store/appStateStore";
import CrtEffect from "../../CrtEffect";
import { defaultMarkerLength, MediaItem } from "../../../hooks/useMediaItems";
import hashObject from 'object-hash';
import { createPortal } from "react-dom";
import { useGetterRef } from "../../../hooks/useGetterRef";
import videojs from "video.js";
import {styledBigPlayButton} from "./video-js-plugins/styled-big-play-button";
import "./video-js-plugins/styled-big-play-button.css";
import { type ScrollToIndexOptions } from "../../VideoScroller";
import { ActionButtons } from "../ActionButtons";
import SceneInfo from "../SceneInfo";
import { getLogger, type Logger } from "@logtape/logtape";
import abLoopPlugin from "videojs-abloop";
import ClipTimestamp from "../ClipTimestamp";
import { SharedGestureState, useGesture } from "@use-gesture/react";
import { useFeedback } from "../../FeedbackOverlay";
import { clamp, roundTo, roundToNearest } from "../../../helpers";
import UAParser from "ua-parser-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay, faForward, faBackward } from "@fortawesome/free-solid-svg-icons";

videojs.registerPlugin('styledBigPlayButton', styledBigPlayButton);

// Max length of video for which we disable scroll animation when seeking to next/previous video
const noAnimateDurationThreshold = 30;

export interface MediaSlideProps {
  mediaItem: MediaItem;
  changeItemHandler: ((newIndex: number | ((currentIndex: number) => number), scrollOptions?: ScrollToIndexOptions) => void);
  isCurrentVideo: boolean;
  index: number;
  style?: React.CSSProperties | undefined;
  className?: string;
  currentlyScrolling?: boolean;
}

const mountCount = new Map<string, number>();

const MediaSlide: React.FC<MediaSlideProps> = (props) => {
  const { isCurrentVideo } = props;
  const {
    letterboxing,
    forceLandscape,
    audioMuted,
    looping,
    showSubtitles,
    crtEffect,
    scenePreviewOnly,
    markerPreviewOnly,
    showDevOptions,
    showDebuggingInfo,
    autoPlay: globalAutoPlay,
    startPosition,
    endPosition,
    playLength,
    minPlayLength,
    maxPlayLength,
    showGuideOverlay,
    uiVisible,
    set: setAppSetting,
  } = useAppStateStore();

  const logger = getLogger(["stash-tv", "MediaSlide", props.mediaItem.id]);

  useMemo(() => {
    if (!showDebuggingInfo.includes("render-debugging")) return
    const timesMounted = mountCount.get(props.mediaItem.id) || 0;
    console.log(`🔜 MediaSlide (media id ${props.mediaItem.id}) mounting${timesMounted ? ` (count: ${timesMounted})` : ""}`)
    mountCount.set(props.mediaItem.id, timesMounted + 1);
  }, [])
  useEffect(() => () => { showDebuggingInfo.includes("render-debugging") && console.log(`🔚 MediaSlide (media id ${props.mediaItem.id}) unmounting`) }, [])

  const scene = props.mediaItem.entityType === "scene" ? props.mediaItem.entity : props.mediaItem.entity.scene;

  const getMediaItemDuration = () => props.mediaItem.entityType === "marker" ? props.mediaItem.entity.duration : props.mediaItem.entity.files[0]?.duration;

  // Don't return player if it's disposed
  const videojsPlayerRef = useGetterRef<VideoJsPlayer | null>(
    (player) => player?.isDisposed() ? null : player,
    null,
    []
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Even if we don't use metadataLoaded state setting it means we can make sure a render occurs right after the player has
  // a duration which is important for certain elements that use the duration when rendering like the end timestamp
  // indicator
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const [loadingDeferred, setLoadingDeferred] = useState(props.currentlyScrolling);
  useEffect(() => {
    if (loadingDeferred) {
      setLoadingDeferred(props.currentlyScrolling);
    }
  }, [loadingDeferred, props.currentlyScrolling]);

  // Currently hardcoded but could be made configurable later
  const autoplay = globalAutoPlay && isCurrentVideo && !showGuideOverlay;

  function handleVideojsPlayerReady(player: VideoJsPlayer) {
    videojsPlayerRef.current = player;
    player.on("volumechange", () => {
      logger.info(`Video.js player volumechange event - player ${player.muted() ? "" : "not"} muted`);
      setAppSetting("audioMuted", player.muted());
    });
    if (audioMuted !== player.muted()) {
      logger.info(`Video.js player loaded - volume player ${player.muted() ? "" : "not"} muted`);
      setAppSetting("audioMuted", player.muted());
    }
    // We resort to `any` here because the types for videojs are incomplete
    ;(player.getChild('ControlBar') as any)?.progressControl?.el().addEventListener('pointermove', (event: MouseEvent) => {
      // Stop event propagation so pointermove event doesn't make it to window and trigger a sidebar drag when we're
      // trying to seek
      event.stopPropagation();
    });

    updatePlayableClass()
    player.one('loadedmetadata', () => {
      setMetadataLoaded(true);
    });
    setPlayerReady(true);
  }

  // To avoid accidentally calling next several times we track if there's already a pending change
  const currentMediaItemPendingChangeRef = useRef<"next" | "previous">();
  useEffect(() => {
    currentMediaItemPendingChangeRef.current = undefined;
  }, [isCurrentVideo]);

  const goToItem = useCallback((direction: 'next' | 'previous') => {
    if (!isCurrentVideo || currentMediaItemPendingChangeRef.current === direction) return;
    currentMediaItemPendingChangeRef.current = direction;
    const played = videojsPlayerRef.current?.played()
    let totalPlayedLength = 0;
    if (played) {
      for (let i = 0; i < (played.length || 0); i++) {
        totalPlayedLength += played.end(i) - played.start(i);
      }
    }

    logger.debug(`Going to ${direction} item from index ${props.index} {*}`, {totalPlayedLength, noAnimateDurationThreshold, isCurrentVideo});

    const shouldSkipAnimation = totalPlayedLength < noAnimateDurationThreshold
    props.changeItemHandler(
      (currentIndex) => Math.max(currentIndex + (direction === 'next' ? 1 : -1), 0),
      { ...(shouldSkipAnimation ? { behavior: 'instant' } : {}) }
    );
  }, [noAnimateDurationThreshold, props.changeItemHandler, props.index, isCurrentVideo]);

  useEffect(() => {
    if (!isCurrentVideo || !videojsPlayerRef.current) return;
    window.tvCurrentPlayer = showDevOptions ? videojsPlayerRef.current : undefined;
    window.tvCurrentMediaItem = showDevOptions ? props.mediaItem : undefined;
  }, [isCurrentVideo, showDevOptions, playerReady])

  // If duration changes (such as when scenePreviewOnly is toggled) we manually update the player since the
  // progress bar doesn't seem to update otherwise
  const firstDurationChangeRef = useRef(true);
  useEffect(() => {
    if (!videojsPlayerRef.current) return;
    if (firstDurationChangeRef.current) {
      firstDurationChangeRef.current = false;
      return
    }
    videojsPlayerRef.current?.duration(getMediaItemDuration()); // Force update of duration
  }, [getMediaItemDuration()])

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
    if (isCurrentVideo) {
      if (!autoplay) return;
      videojsPlayerRef.current?.play();
    } else {
      videojsPlayerRef.current?.pause();
    }
  }, [isCurrentVideo, autoplay]);

  const initialTimestamp = useMemo(() => {
    if (props.mediaItem.entityType === "marker" || startPosition === 'beginning') {
      return 0
    } else if (startPosition === 'random') {
      return getRandomPointInScene(scene)
    }
    return props.mediaItem.entity.resume_time ?? undefined;
  }, [props.mediaItem.entityType === "marker" || startPosition, getMediaItemDuration()]);

  const endTimestamp = useMemo(() => {
    if (props.mediaItem.entityType === "marker" || (props.mediaItem.entityType === "scene" && scenePreviewOnly)) return undefined;
    const duration = props.mediaItem.entity.files[0]?.duration;
    const lengthRemaining = duration - (initialTimestamp ?? 0);
    if (endPosition === 'fixed-length') {
      return Math.min(
        (initialTimestamp || 0) + (playLength ?? Infinity),
        duration
      )
    } else if (endPosition === 'random-length') {
      const effectiveMinPlayLength = Math.min(
        minPlayLength ?? 1,
        lengthRemaining
      );
      const effectiveMaxPlayLength = Math.max(
        effectiveMinPlayLength,
        Math.min(
          maxPlayLength ?? Infinity,
          lengthRemaining
        )
      );

      return (initialTimestamp || 0) + Math.floor(Math.random() * (effectiveMaxPlayLength - effectiveMinPlayLength + 1)) + effectiveMinPlayLength
    } else if (endPosition === 'video-end') {
      return looping ? duration : undefined;
    } else {
      endPosition satisfies never
      return undefined;
    }
  }, [endPosition, initialTimestamp, minPlayLength, maxPlayLength, playLength, getMediaItemDuration(), scenePreviewOnly, looping]);

  useEffect(() => {
    if (!showGuideOverlay) return;
    videojsPlayerRef.current?.pause();
  }, [showGuideOverlay]);

  const getSkipTime = useCallback((direction: 'forwards' | 'backwards') => {
    const duration = videojsPlayerRef.current?.duration();
    const currentTime = videojsPlayerRef.current?.currentTime();
    if (!duration || currentTime === undefined) {
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
        skipPercent = 0.33
    }

    let skipTimeAmount = duration * skipPercent
    const newCurrentTime = currentTime + (direction === 'forwards' ? skipTimeAmount : -skipTimeAmount)
    // We make the range to look for the next marker a bit larger than the skip amount to avoid
    // skipping to a point just a moment before the marker because the marker was very slightly outside the
    // search range.
    //
    // We also add a small buffer when searching backwards to avoid the case where we've played a tiny bit so we don't
    // just jump back to the the same marker again.
    const markerSearchStartTime = direction === 'forwards' ? currentTime : newCurrentTime - (skipTimeAmount * 0.5)
    const markerSearchEndTime = direction === 'forwards' ? newCurrentTime + (skipTimeAmount * 0.5) : currentTime - 2
    // Check for markers in the skip range
    const markersToSearch = direction === 'forwards' ? scene.scene_markers : scene.scene_markers.slice().reverse()
    const marker = markersToSearch.find(marker =>
      marker.seconds >= markerSearchStartTime &&
      marker.seconds <= markerSearchEndTime
    );
    if (marker) {
      logger.debug(`Skipping to marker ${marker.title ?? marker.primary_tag.name} at ${marker.seconds}s{*}`, {marker, markersToSearch});
      skipTimeAmount = Math.abs(marker.seconds - currentTime)
    }
    return skipTimeAmount
  }, [scene.scene_markers]);

  const seekForwards = useCallback(() => {
    if (!videojsPlayerRef.current) return null;
    const duration = videojsPlayerRef.current?.duration();
    if (duration === undefined) return;
    const skipAmount = getSkipTime('forwards');
    if (skipAmount === null || typeof duration !== 'number') {
      return null
    }
    const currentTime = videojsPlayerRef.current?.currentTime();
    let nextSkipAheadTime = currentTime + skipAmount
    logger.info("Seeking forwards{*}", {skipAmount, duration, nextSkipAheadTime})
    if (
      // Go to next item if the next jump goes to or past the end of the entire video
      (nextSkipAheadTime >= duration)
      ||
      // Go to next item if we'd be jumping over the end timestamp
      (endTimestamp !== undefined && currentTime <= endTimestamp && nextSkipAheadTime >= endTimestamp)
    ){
      if (looping) {
        // If looping then just go back to the initial timestamp or start since going to the end would do that anyway
        nextSkipAheadTime = initialTimestamp || 0
      } else {
        videojsPlayerRef.current?.trigger('ended');
        return
      }
    }
    videojsPlayerRef.current?.currentTime(nextSkipAheadTime)
    setCurrentlyPlayingMarkers(findCurrentlyPlayingMarkers(nextSkipAheadTime))
    videojsPlayerRef.current?.play()
  }, [getSkipTime, initialTimestamp, endTimestamp, looping]);

  const seekBackwards = useCallback(() => {
    if (!videojsPlayerRef.current) return null;
    const duration = videojsPlayerRef.current?.duration();
    const skipAmount = getSkipTime('backwards')
    if (skipAmount === null || typeof duration !== 'number') {
      return null
    }
    const currentTime = videojsPlayerRef.current?.currentTime();
    let nextSkipBackTime = currentTime - skipAmount
    logger.info("Seeking backwards{*}", {skipAmount, duration, nextSkipBackTime})
    // If looping and we'd be going before the initial timestamp go to the initial timestamp
    if (looping && initialTimestamp !== undefined && currentTime >= initialTimestamp && nextSkipBackTime < initialTimestamp) {
      nextSkipBackTime = initialTimestamp || 0
    // Go to previous item if the next jump goes to or past the start of the video
    } else if (nextSkipBackTime < 0) {
      // If looping or not already at the start (with 2 second grace period to avoid play immediately moving beyond the
      // start and thus preventing us from ever going back further) then go to the start
      if (looping || currentTime > 2) {
        nextSkipBackTime = 0
      } else if (props.index === 0) {
        // If there's no previous video to go back to just go to the start of this one
        nextSkipBackTime = 0
      } else {
        goToItem('previous')
        return
      }
    }
    videojsPlayerRef.current?.currentTime(nextSkipBackTime)
    setCurrentlyPlayingMarkers(findCurrentlyPlayingMarkers(nextSkipBackTime))
    videojsPlayerRef.current?.play()
  }, [getSkipTime, props.index, goToItem, looping]);

  const {textSelectionWorkaroundElm} = useGestureControls({
    videoRef,
    videojsPlayerRef,
    seekForwards,
    seekBackwards,
    logger,
    looping,
    initialTimestamp,
    endTimestamp,
  })

  useEffect(() => {
    if (!isCurrentVideo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const seekBackwardsKey = forceLandscape ? "ArrowDown" : "ArrowLeft";
      const seekForwardsKey = forceLandscape ? "ArrowUp" : "ArrowRight";
      (e.key === seekBackwardsKey || e.key === seekForwardsKey) &&
        logger.debug(`MediaSlide ${props.index} Keydown; key=${e.key}; backKey=${seekBackwardsKey}; forwardKey=${seekForwardsKey}`);
      if (e.key === seekBackwardsKey) {
        seekBackwards()
        e.preventDefault()
        e.stopPropagation() // Stops video.js handling the event
      } else if (e.key === seekForwardsKey) {
        seekForwards()
        e.preventDefault()
        e.stopPropagation() // Stops video.js handling the event
      }
    }
    // We use capture so we can stop it propagating to the video player which treats arrow keys as seek commands
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [forceLandscape, isCurrentVideo, seekBackwards, seekForwards, props.index]);

  // These classes allow us to better control when the big play button shows to avoid showing it if we're likely to
  // immediately hide it again such as when auto-playing
  const updatePlayableClass = useCallback(() => {
    const className = "playable"
    let timeoutId: NodeJS.Timeout;
    if (globalAutoPlay) {
      // We slightly delay this to give the player a moment to start playing so we don't flash the play button
      // unnecessarily
      timeoutId = setTimeout(() => {
        if (isCurrentVideo) {
          videojsPlayerRef.current?.addClass(className);
        } else {
          videojsPlayerRef.current?.removeClass(className);
        }
      }, 100);
    } else {
      videojsPlayerRef.current?.addClass(className)
    }
    // Cleanup function for useEffect usage
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [isCurrentVideo, globalAutoPlay]);
  useEffect(updatePlayableClass, [updatePlayableClass]);

  /* ------------------------------ On end event ------------------------------ */

  const itemRef = useRef<HTMLDivElement>(null);

  /** Handle the event fired at the end of video playback. */
  const handleOnEnded = () => {
    // If not looping on end, scroll to the next item.
    if (looping) return
    videojsPlayerRef.current?.pause()
    if (isCurrentVideo) {
      videojsPlayerRef.current?.currentTime(initialTimestamp || 0);
      goToItem('next');
    }
  };

  /* ------------------------------- Scene info ------------------------------- */

  // ? Unlike most other UI states, scene info visibility does not persist
  // across scenes, and should be reset to false on scrolling to another like.

  const [sceneInfoOpen, setSceneInfoOpen] = useState(false);
  const sceneInfoPanelRef = useRef(null);

  useEffect(() => {
    if (!isCurrentVideo) setSceneInfoOpen(false);
  }, [isCurrentVideo]);

  /* -------------------------------- Subtitles ------------------------------- */
  // Update the subtitles track via the ref object
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks.length)
      videoRef.current.textTracks[0].mode = showSubtitles
        ? "showing"
        : "disabled";
  }, [showSubtitles]);

  function getRandomPointInScene(scene: GQL.TvSceneDataFragment) {
    if (scene.scene_markers.length) {
      // Pick a random marker
      const randomMarker = scene.scene_markers[Math.floor(Math.random() * scene.scene_markers.length)];
      return randomMarker.seconds;
    }
    const duration = scene.files?.[0]?.duration || 0
    // Avoid start and end 5% of scene
    const min = duration * 0.05
    const max = duration * 0.95
    const randomPoint = Math.random() * (max - min) + min
    return Math.floor(randomPoint)
  }


  useEffect(() => {
    if (!playerReady) return;
    let options: abLoopPlugin.Options = {
      loopIfBeforeStart: true,
      loopIfAfterEnd: true,
      pauseAfterLooping: false,
      pauseBeforeLooping: false,
      ...videojsPlayerRef.current?.abLoopPlugin.getOptions(),
      enabled: looping,
      start: initialTimestamp ?? false,
      end: endTimestamp ?? false,
    }
    logger.debug(`Setting AB loop plugin options{*}`, {options});
    videojsPlayerRef.current?.abLoopPlugin.setOptions(options);
  }, [looping, playerReady, initialTimestamp, endTimestamp])

  // Track what marker (if any) is currently playing
  const findCurrentlyPlayingMarkers = (currentTime: number) => {
    if (props.mediaItem.entityType === "marker") {
      return [props.mediaItem.entity];
    } else if (props.mediaItem.entityType === "scene") {
      const scene = props.mediaItem.entity;
      const markers = scene.scene_markers.filter(marker => {
        const markerStartSearchTime = marker.seconds;
        const nextMarker = scene.scene_markers.find(m => m.seconds > markerStartSearchTime);
        const makerEndTime = marker.end_seconds ?? marker.seconds + defaultMarkerLength;
        const makerEndSearchTime = Math.min(makerEndTime, nextMarker?.seconds ?? Infinity);
        return markerStartSearchTime <= currentTime && makerEndSearchTime > currentTime
      });
      return markers
    } else {
      props.mediaItem satisfies never
      throw new Error(`Unknown media item type: ${props.mediaItem}`);
    }
  }
  const [currentlyPlayingMarkers, setCurrentlyPlayingMarkers] = useState<GQL.FindScenesForTvQuery["findScenes"]["scenes"][number]["scene_markers"][number][]>(findCurrentlyPlayingMarkers(0));
  const currentlyPlayingMarkersDisplayName = useMemo(
    () => {
      if (!currentlyPlayingMarkers) return null;

      const markerNames: { name: string, type: "tag" | "title" }[] = []
      for (const marker of currentlyPlayingMarkers) {
        const tags = [marker.primary_tag, ...marker.tags]
        if (marker.title) {
          markerNames.push(
            { name: marker.title, type: "title" }
          );
          continue;
        }
        markerNames.push(
          ...tags.map(tag => ({ name: tag.name, type: "tag" } as const))
        )
      }
      return markerNames.map(({name, type}, index) => {
        let joiner
        if (index === markerNames.length - 2) {
          joiner = " & "
        } else if (index < markerNames.length - 2) {
          joiner = ", "
        }
        return <React.Fragment key={name + index}>
          <span className={type}>{name}</span>
          {joiner && <span className="joiner">{joiner}</span>}
        </React.Fragment>
      })
    },
    [currentlyPlayingMarkers]
  );
  const handleOnTimeUpdate = useCallback(() => {
    const currentTime = videojsPlayerRef.current?.currentTime();
    if (currentTime === undefined) return;
    if (endTimestamp !== undefined && currentTime >= endTimestamp && currentTime <= (endTimestamp + 3) && !videojsPlayerRef.current?.scrubbing()) {
      logger.debug(`End timestamp reached at ${currentTime}s (end: ${endTimestamp}s)`);
      videojsPlayerRef.current?.trigger('ended');
    }
    const markers = findCurrentlyPlayingMarkers(currentTime);
    if (markers.length === currentlyPlayingMarkers.length && markers.every(marker => currentlyPlayingMarkers.includes(marker))) return
    logger.debug(`Marker playback update{*}`, {currentTime, markers});
    setCurrentlyPlayingMarkers(markers)
  }, [endTimestamp, currentlyPlayingMarkers, goToItem]);

  /* -------------------------------- Component ------------------------------- */

  const videoJsControlBarElm = videojsPlayerRef.current?.getChild('ControlBar')?.el();
  const videoJsProgressControlElm = videojsPlayerRef.current?.getChild('ControlBar')?.getChild('ProgressControl')?.el();

  return (
    <div
      className={cx("MediaSlide", {inViewport: isCurrentVideo, 'cover': !letterboxing, 'hide-controls': !uiVisible}, props.className)}
      data-testid="MediaSlide--container"
      data-index={props.index}
      data-scene-id={scene.id}
      ref={itemRef}
      style={props.style}
    >
      <CrtEffect enabled={crtEffect}>
        {showDebuggingInfo.includes("onscreen-info") && <>
          <div className="debugStats">
            {props.index} - {scene.id} {loadingDeferred ? "(Loading deferred)" : ""}
            {" "}{props.mediaItem.entityType === "marker" ? `(Marker: ${props.mediaItem.entity.primary_tag.name})` : ""}
          </div>
          <div className="loadingDeferredDebugBackground" />
        </>}
        {loadingDeferred && scene.paths.screenshot && <img className="loadingDeferredPreview" src={scene.paths.screenshot} />}
        {!loadingDeferred && <ScenePlayer
          id={`scene-player-${props.mediaItem.id}`}
          // Force remount when scene streams change to ensure videojs reloads the source
          key={JSON.stringify([scene.id, hashObject(scene.sceneStreams)])}
          onTimeUpdate={handleOnTimeUpdate}
          scene={{
            ...scene,
            paths: {
              ...scene.paths,
              // We avoid showing the poster if we are auto-playing to prevent a flash of the poster before playback starts
              ...(globalAutoPlay ? { screenshot: null } : {})
            },
          }}
          hideScrubberOverride={true}
          muted={audioMuted}
          autoplay={autoplay}
          loop={looping}
          initialTimestamp={initialTimestamp}
          sendSetTimestamp={() => {}}
          onNext={() => {}}
          onPrevious={() => {}}
          refVideo={videoRef}
          onEnded={handleOnEnded}
          onVideojsPlayerReady={handleVideojsPlayerReady}
          trackActivity={!scenePreviewOnly && props.mediaItem.entityType !== "marker"}
          scrubberThumbnail={!scenePreviewOnly && props.mediaItem.entityType !== "marker"}
          markers={!scenePreviewOnly}
          optionsToMerge={{
            plugins: {
              styledBigPlayButton: {},
              ...(props.mediaItem.entityType === "marker" && !markerPreviewOnly ? {
                offset: {
                  start: props.mediaItem.entity.seconds,
                  end: props.mediaItem.entity.seconds + props.mediaItem.entity.duration,
                  // This moves the play head to the start of the marker clip but does not resume play even if loop is
                  // true so we handle that ourselves in an onEnded handler
                  restart_beginning: true
                }
              } : {}),
              abLoopPlugin: {
                createButtons: false,
              },
            }
          }}
        />}
        {currentlyPlayingMarkers.length > 0 && videoJsControlBarElm && createPortal(
          <>
            <div className="vjs-control currently-playing-marker">{currentlyPlayingMarkersDisplayName}</div>
            <div className="vjs-custom-control-spacer vjs-spacer">&nbsp;</div>
          </>,
          videoJsControlBarElm
        )}
        {videojsPlayerRef.current?.el() && createPortal(
          textSelectionWorkaroundElm,
          videojsPlayerRef.current?.el()
        )}
        {looping && initialTimestamp !== undefined && videoJsProgressControlElm && createPortal(
          <ClipTimestamp type="start" progressPercentage={(initialTimestamp / (videojsPlayerRef.current?.duration() || 1)) * 100} />,
          videoJsProgressControlElm
        )}
        {endTimestamp !== undefined && videoJsProgressControlElm && createPortal(
          <ClipTimestamp type="end" progressPercentage={(endTimestamp / (videojsPlayerRef.current?.duration() || 1)) * 100} />,
          videoJsProgressControlElm
        )}
        <SceneInfo
          ref={sceneInfoPanelRef}
          scene={scene}
          className={cx({active: sceneInfoOpen})}
        />
        <ActionButtons scene={scene} sceneInfoOpen={sceneInfoOpen} setSceneInfoOpen={setSceneInfoOpen} />
      </CrtEffect>
    </div>
  );
};

export default React.memo(MediaSlide);

function useGestureControls(
  { videoRef, videojsPlayerRef, seekForwards, seekBackwards, logger, looping, initialTimestamp, endTimestamp }: {
    videoRef: React.RefObject<HTMLVideoElement | null>,
    videojsPlayerRef: React.RefObject<VideoJsPlayer | null>,
    seekForwards: () => void,
    seekBackwards: () => void,
    logger: Logger,
    looping: boolean,
    initialTimestamp: number | undefined,
    endTimestamp: number | undefined,
  }
) {
  logger = logger.getChild("useGestureControls");

  const { setFeedback } = useFeedback();

  const waitForClickTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const gestureStateRef = useRef<{
    clickArea: "left" | "middle" | "right",
    elementWidth: number,
    ffOrRewind: {
      type: "playback-rate",
      discretePlaybackRate: number,
    } | {
      type: "time-skip",
      discretePlaybackRate: number,
      seekTimeout: NodeJS.Timeout | null,
      desiredTimeDelta: number,
    } | null
    initialMuteState: boolean,
    initialPausedState: boolean,
    thumbnailTimeUpdateHandler: (() => void) | null,
  } | null>(null);

  function showThumbnail() {
    const vttThumbnails = videojsPlayerRef.current?.vttThumbnails()
    if (!vttThumbnails) return;
    videojsPlayerRef.current?.userActive(true)
    // @ts-expect-error -- This is a private function but we have no other way to show the thumbnail
    vttThumbnails.showThumbnailHolder();
    const duration = videojsPlayerRef.current?.duration();
    const currentTime = videojsPlayerRef.current?.currentTime();
    const progressBarWidth = videojsPlayerRef.current?.getChild('ControlBar')?.getChild('ProgressControl')?.el().clientWidth
    if (!videojsPlayerRef.current || !duration || currentTime === undefined || !progressBarWidth) return;
    // @ts-expect-error -- This is a private function but we have no other way to update the thumbnail position
    vttThumbnails.updateThumbnailStyle(
      currentTime / duration,
      progressBarWidth
    );
  }

  function hideThumbnail() {
    const vttThumbnails = videojsPlayerRef.current?.vttThumbnails()
    if (!vttThumbnails) return;
    // @ts-expect-error -- This is a private function but we have no other way to hide the thumbnail
    vttThumbnails.hideThumbnailHolder();
  }

  function setupThumbnailUpdate() {
    if (!gestureStateRef.current) return;
    gestureStateRef.current.thumbnailTimeUpdateHandler = showThumbnail
    videojsPlayerRef.current?.on('timeupdate', showThumbnail);
    videojsPlayerRef.current?.on('seeking', showThumbnail);
    videojsPlayerRef.current?.on('progress', showThumbnail);
    videojsPlayerRef.current?.on('durationchange', showThumbnail);
  }

  function teardownThumbnailUpdate() {
    if (!gestureStateRef.current) return;
    if (!gestureStateRef.current.thumbnailTimeUpdateHandler) return;
    videojsPlayerRef.current?.off('timeupdate', gestureStateRef.current.thumbnailTimeUpdateHandler);
    videojsPlayerRef.current?.off('seeking', gestureStateRef.current.thumbnailTimeUpdateHandler);
    videojsPlayerRef.current?.off('progress', gestureStateRef.current.thumbnailTimeUpdateHandler);
    videojsPlayerRef.current?.off('durationchange', gestureStateRef.current.thumbnailTimeUpdateHandler);
    gestureStateRef.current.thumbnailTimeUpdateHandler = null;
    hideThumbnail();
  }

  // iOS has an annoying behaviour where text selection can't seem to be disabled on a video.js video element using
  // "user-select: none". We can disable it on a standard div however so as a workaround we create one in front of the
  // video and use that for gesture detection instead.
  let textSelectionWorkaroundElmRef: React.RefObject<HTMLDivElement> | null = null;
  let textSelectionWorkaroundElm: React.ReactNode = null
  if (UAParser().os.name?.includes("iOS")) {
    textSelectionWorkaroundElmRef = useRef<HTMLDivElement>(null);
    textSelectionWorkaroundElm = (
      <div
        ref={textSelectionWorkaroundElmRef}
        className="text-selection-on-gesture-workaround"
      />
    )
  }

  const gestureElmRef = textSelectionWorkaroundElmRef ?? videoRef;

  const blockOutsideMuteChangeFunction = useRef<((event: Event) => void) | null>(null);
  const lockedMuteState = useRef<boolean | null>(null);

  // We only want to temporarily mute at some points during the drag so we suppress any related events or attempt to
  // change it back so that the user's mute setting doesn't get changed.
  function mute(mute: boolean, {hold}: {hold?: boolean} = {}) {
    const muteLogger = logger.getChild("mute");
    if (!videoRef.current) return;
    if (hold) {
      lockedMuteState.current = mute
    }
    if (hold && !blockOutsideMuteChangeFunction.current) {
      muteLogger.debug("Adding mute change block")
      const handler = (event: Event) => {
        if (videoRef.current && videoRef.current.muted !== lockedMuteState.current) {
          muteLogger.debug("Mute change blocked")
        }
        event.stopPropagation();
      }
      videoRef.current?.addEventListener("volumechange", handler, { capture: true });
      blockOutsideMuteChangeFunction.current = handler
    }
    if (videoRef.current.muted !== mute) {
      muteLogger.debug(`${mute ? "Muting" : "Unmuting"} media`)
      videoRef.current.muted = mute
    }
    if (!hold && blockOutsideMuteChangeFunction.current) {
      muteLogger.debug("Removing mute change block")
      videoRef.current?.removeEventListener("volumechange", blockOutsideMuteChangeFunction.current, { capture: true });
      blockOutsideMuteChangeFunction.current = null
    }
  }

  const blockOutsidePausedChange = useRef<((event: Event) => void) | null>(null);
  const lockedPausedState = useRef<boolean | null>(null);

  // Similar to mute above we want to temporarily pause during drag without affecting the user's desired play/pause state
  function pause(pause: boolean, {hold}: {hold?: boolean} = {}) {
    const pauseLogger = logger.getChild("pause");
    if (!videoRef.current) return;
    if (hold) {
      lockedPausedState.current = pause
    }
    if (hold && !blockOutsidePausedChange.current) {
      const handler = (event: Event) => {
        if (videoRef.current && videoRef.current.paused !== lockedPausedState.current) {
          pauseLogger.debug("Pause change blocked")
          if (lockedPausedState.current) {
            videoRef.current.pause()
          } else {
            videoRef.current.play()
          }
        }
        event.stopPropagation();
      }
      videoRef.current?.addEventListener("pause", handler, { capture: true });
      blockOutsidePausedChange.current = handler
    }
    if (videoRef.current.paused !== pause) {
      if (pause) {
        pauseLogger.debug(`Pausing media`)
        videoRef.current.pause()
      } else {
        pauseLogger.debug(`Playing media`)
        videoRef.current.play()
      }
    }
    if (!hold && blockOutsidePausedChange.current) {
      pauseLogger.debug("Removing pause block")
      videoRef.current?.removeEventListener("pause", blockOutsidePausedChange.current, { capture: true });
      blockOutsidePausedChange.current = null
      // Ensure videojs restore's the play/pause state correctly
      if (pause) {
        // @ts-expect-error -- Private function but can't think of a better way to do this
        videojsPlayerRef.current?.handleTechPause_()
      } else {
        // @ts-expect-error -- Private function but can't think of a better way to do this
        videojsPlayerRef.current?.handleTechPlay_()
      }
    }
  }

  function getClickArea(event: PointerEvent | MouseEvent | TouchEvent): {area: "left" | "middle" | "right", elementWidth: number} {
    if (!(event.target instanceof HTMLElement)) {
      throw new Error("No event target");
    }
    let x
    if (event instanceof PointerEvent || event instanceof MouseEvent) {
      x = event.offsetX;
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      const rect = event.target.getBoundingClientRect();
      x = touch.pageX - (rect.left + window.scrollX);
    } else {
      event satisfies never
      throw new Error("Unknown event type");
    }
    const elementWidth = event.target.clientWidth;
    if ((x / elementWidth) < (1 / 3)) {
      return {area: "left", elementWidth};
    } else if ((x / elementWidth) > (2 / 3)) {
      return {area: "right", elementWidth};
    } else {
      return {area: "middle", elementWidth};
    }
  }

  function handleDrag({offsetX}: {offsetX: number}) {
    if (!gestureElmRef.current) {
      logger.warn("No gesture element ref");
      return;
    }
    if (!gestureStateRef.current) {
      logger.warn("Not setup correctly");
      return;
    }

    if (!videojsPlayerRef.current?.scrubbing()) {
      videojsPlayerRef.current?.scrubbing(true);
    }

    const {clickArea, elementWidth} = gestureStateRef.current;
    let initialRate
    switch (clickArea) {
      case "left":
        // Rewind if clicking on the left third
        initialRate = -1.5
        break;
      case "right":
        // Fast-forward if clicking on the right third
        initialRate = 1.5
        break;
      case "middle":
        // No initial rate if dragging from the middle
        initialRate = 0;
    }
    // Limit to max of 1 third of the videos length
    const playbackRateDragAdjustment = clamp(
      (videojsPlayerRef.current?.duration() ?? 0) / -3,
      ((offsetX / elementWidth) * 10) ** 6 * (offsetX > 0 ? 1 : -1),
      (videojsPlayerRef.current?.duration() ?? 0) / 3
    )
    const playbackRate = initialRate + playbackRateDragAdjustment
    let discretePlaybackRate
    if (Math.abs(playbackRate) > 120) {
      discretePlaybackRate = roundToNearest(playbackRate, 60)
    } else if (Math.abs(playbackRate) > 60) {
      discretePlaybackRate = roundToNearest(playbackRate, 30)
    } else if (Math.abs(playbackRate) > 15) {
      discretePlaybackRate = roundToNearest(playbackRate, 15)
    } else if (Math.abs(playbackRate) > 5) {
      discretePlaybackRate = roundToNearest(playbackRate, 5)
    } else if (playbackRate > 2 || playbackRate < -1) {
      discretePlaybackRate = roundTo(playbackRate, 0)
    } else if (playbackRate > 0 && playbackRate <= 0.1) {
      discretePlaybackRate = 0
    } else {
      discretePlaybackRate = roundTo(playbackRate, 1)
    }
    if (gestureStateRef.current.ffOrRewind?.discretePlaybackRate === discretePlaybackRate) {
      // No change
      return;
    }
    const shouldShowThumbnail = discretePlaybackRate > 5 || discretePlaybackRate < -2;
    if (shouldShowThumbnail && !gestureStateRef.current.thumbnailTimeUpdateHandler) {
      setupThumbnailUpdate()
    } else if (!shouldShowThumbnail && gestureStateRef.current.thumbnailTimeUpdateHandler) {
      teardownThumbnailUpdate()
    }
    const maxRate = 5
    if (gestureStateRef.current.ffOrRewind) {
      gestureStateRef.current.ffOrRewind.discretePlaybackRate = discretePlaybackRate
    }
    if (discretePlaybackRate >= 0.1 && discretePlaybackRate < maxRate) {
      const { ffOrRewind } = gestureStateRef.current;
      if (ffOrRewind?.type !== "playback-rate") {
        if (ffOrRewind) {
          logger.info(`Switching to playback rate-based approach`)
        }

        gestureStateRef.current.ffOrRewind = {
          type: "playback-rate",
          discretePlaybackRate: discretePlaybackRate,
        }
      }
      if (discretePlaybackRate) {
        setFeedback(
          `${discretePlaybackRate}x`,
          {hold: true, icon: <FontAwesomeIcon icon={faPlay} />}
        );
      } else {
        setFeedback(null);
      }
      if (discretePlaybackRate) {
        videojsPlayerRef.current?.playbackRate(discretePlaybackRate);
        pause(false, {hold: true});
      } else {
        pause(true, {hold: true});
      }
    } else {
      let ffOrRewind
      if (gestureStateRef.current.ffOrRewind?.type !== "time-skip") {
        if (ffOrRewind) {
          logger.info(`Switching to seek-based approach`)
        }
        ffOrRewind = {
          type: "time-skip" as const,
          discretePlaybackRate: discretePlaybackRate,
          seekTimeout: null,
          desiredTimeDelta: 0,
        }
        gestureStateRef.current.ffOrRewind = ffOrRewind
      } else {
        ffOrRewind = gestureStateRef.current.ffOrRewind
      }

      pause(true, {hold: true});
      if (videojsPlayerRef.current && videojsPlayerRef.current.playbackRate() !== 1) {
        videojsPlayerRef.current?.playbackRate(1);
      }

      const currentTime = videojsPlayerRef.current?.currentTime()
      if (currentTime !== undefined) {
        const hitTimeBounds = (discretePlaybackRate < 0 && (currentTime <= (initialTimestamp || 0)))
        || (discretePlaybackRate > 0 && (currentTime >= (endTimestamp ?? Infinity)))
        // If we are looping and have hit the bounds then we set the feedback in the tick function instead
        if (!looping || !hitTimeBounds ) {
          if (discretePlaybackRate) {
            const minutes = Math.floor(Math.abs(discretePlaybackRate) / 60);
            const seconds = Math.abs(discretePlaybackRate) % 60;
            setFeedback(
              [minutes && `${minutes}m`, seconds && `${seconds}s`].filter(Boolean).join(" "),
              {
                hold: true,
                icon: <FontAwesomeIcon icon={discretePlaybackRate > 0 ? faForward : faBackward} />
              }
            );
          } else {
            setFeedback(<></>, {hold: true, icon: <FontAwesomeIcon icon={faPause} />});
          }
        }
      }

      const updateFrequency = 100 // In ms
      if (!ffOrRewind.seekTimeout) {
        const tick = () => {
          if (!gestureStateRef.current) {
            return
          }
          const { ffOrRewind } = gestureStateRef.current;
          if (!ffOrRewind || ffOrRewind.type !== "time-skip") {
            return
          }
          let desiredTimeDelta = ffOrRewind.desiredTimeDelta
          // If the video hasn't managed to update the current time yet we accumulate the changes to currentTime until either the
          // video is ready and we can apply them until we reach a max threshold so as to avoid us surprising the user
          // by jumping too far ahead after having frozen for a bit.
          const maxAccumulatedTimeDelta = Math.abs(ffOrRewind.discretePlaybackRate) * 2;
          if (Math.abs(desiredTimeDelta) < maxAccumulatedTimeDelta) {
            desiredTimeDelta += ffOrRewind.discretePlaybackRate * (updateFrequency / 1000);
          }
          const currentTime = videojsPlayerRef.current?.currentTime()
          if (currentTime !== undefined) {
            const newTime = currentTime + desiredTimeDelta
            if (looping && newTime < currentTime && (newTime <= (initialTimestamp || 0))) {
              setFeedback(
                "Start of loop reached",
                {hold: true}
              );
              videojsPlayerRef.current?.currentTime(initialTimestamp || 0)
            } else if (looping && newTime > currentTime && (newTime >= (endTimestamp ?? Infinity))) {
              setFeedback(
                "End of loop reached",
                {hold: true}
              );
              videojsPlayerRef.current?.currentTime(endTimestamp ?? Infinity)

            } else if (desiredTimeDelta) {
              videojsPlayerRef.current?.currentTime(newTime)
              ffOrRewind.desiredTimeDelta = 0;
            } else {
              ffOrRewind.desiredTimeDelta = desiredTimeDelta;
            }
          }
          ffOrRewind.seekTimeout = setTimeout(tick, updateFrequency);
        }
        ffOrRewind.seekTimeout = setTimeout(tick, updateFrequency);
      }
    }
  };
  useGesture({
    onPointerDown: (state) => {
      logger.debug("⬇️ Pointer down")

      const {area, elementWidth} = getClickArea(state.event)
      const initialMuteState = videojsPlayerRef.current?.muted()
      const initialPausedState = videojsPlayerRef.current?.paused()
      logger.debug(`Initial mute state: ${initialMuteState}, initial paused state: ${initialPausedState}`)
      if (initialMuteState === undefined || initialPausedState === undefined) {
        logger.warn("Failed to get video state");
        return;
      }
      if (gestureStateRef.current !== null) {
        logger.warn("Gesture state not cleaned up properly before new gesture");
      }
      gestureStateRef.current = {
        clickArea: area,
        elementWidth,
        ffOrRewind: null,
        initialMuteState,
        initialPausedState,
        thumbnailTimeUpdateHandler: () => {},
      };

      waitForClickTimeoutRef.current = setTimeout(() => {
        logger.debug("Holding down{*}", state)
        handleDrag({offsetX: 0})
        waitForClickTimeoutRef.current = undefined
      }, 250);
    },
    // Video.js disables click events from firing on touch devices so we listen to pointerup to detect a click instead
    onPointerUp: useCallback((state: SharedGestureState & { event: PointerEvent }) => {
      logger.debug("⬆️ Pointer up")
      // Ignore clicks if it's been long enough that we're treating it as a drag
      if (!waitForClickTimeoutRef.current) return;

      clearTimeout(waitForClickTimeoutRef.current);
      waitForClickTimeoutRef.current = undefined;
      logger.debug("Pointer up - treating as click")

      if (!gestureStateRef.current) {
        logger.warn("Not setup correctly");
        return
      }

      const { clickArea } = gestureStateRef.current

      switch (clickArea) {
        case "left":
          seekBackwards()
          break;
        case "middle":
          if (videojsPlayerRef.current?.paused()) {
            videojsPlayerRef.current?.play()
          } else {
            videojsPlayerRef.current?.pause()
          }
          break;
        case "right":
          seekForwards()
          break;
      }
      gestureStateRef.current = null
    }, [seekBackwards, seekForwards]),
    onDrag: (state) => {
      // Ignore drags if we're not sure if it's a click yet
      if (waitForClickTimeoutRef.current) return;

      if (!gestureStateRef.current) {
        logger.warn("Not setup correctly");
        return
      }

      // Not sure why by a few values including last don't seem to be set if the first call is also the last call
      const last = state.last ?? true;
      const first = state.first ?? true;

      if (first) logger.debug("Drag started")

      const {offset: [offsetX]} = state;
      if (!last) {
        handleDrag({offsetX})
      } else {
        handleDragEnd()
      }
    },
    onPointerOut: (state: SharedGestureState & { event: PointerEvent }) => {
      if (state.event.target !== gestureElmRef.current) return;
      logger.debug("↗️ Pointer out")
      handleDragEnd();
    }
  }, {
    target: gestureElmRef,
    drag: {
      from: [0, 0], // Reset offset to 0 on each gesture start
      filterTaps: true,
      preventScroll: true,
      pointer: {
        keys: false // The drag event can be trigger by a keyboard but that doesn't make sense for our use case
        // since we care about the area of the video that user clicks on.
      }
    }
  })
  // A workaround for https://github.com/pmndrs/use-gesture/issues/593
  useEffect(() => {
    window.addEventListener("click", (event) => {
      Object.defineProperty(event, 'detail', { value: 0, writable: true });
    }, { capture: true });
  }, [])

  useEffect(() => {
    const handler = () => {
      // Cancel any gesture if we're scrolling
      clearTimeout(waitForClickTimeoutRef.current);
      waitForClickTimeoutRef.current = undefined;
    }
    window.addEventListener("scroll", handler, { capture: true });
    return () => {
      window.removeEventListener("scroll", handler, { capture: true });
    };
  }, []);

  function handleDragEnd() {
    if (!gestureStateRef.current) {
      return
    }
    logger.info("Drag ended, cleaning up")
    videojsPlayerRef.current?.playbackRate(1);
    videojsPlayerRef.current?.scrubbing(false);
    setFeedback(null, {fade: false});

    teardownThumbnailUpdate()

    const { initialMuteState, initialPausedState } = gestureStateRef.current
    mute(initialMuteState);
    pause(initialPausedState);
    logger.debug(`Reset mute state to ${initialMuteState} and restored paused state to ${initialPausedState}`)
    gestureStateRef.current = null
  }

  return {
    textSelectionWorkaroundElm
  }
}

declare global {
  interface Window {
    tvCurrentPlayer?: VideoJsPlayer,
    tvCurrentMediaItem?: MediaItem,
  }
}
