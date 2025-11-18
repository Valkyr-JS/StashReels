
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
import { getLogger } from "@logtape/logtape";
import abLoopPlugin from "videojs-abloop";
import ClipTimestamp from "../ClipTimestamp";

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
      logger.debug(`Video.js player volumechange event - player ${player.muted() ? "" : "not"} muted`);
      setAppSetting("audioMuted", player.muted());
    });
    if (audioMuted !== player.muted()) {
      logger.debug(`Video.js player loaded - player ${player.muted() ? "" : "not"} muted`);
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
    if (!showDevOptions || !isCurrentVideo || !videojsPlayerRef.current) return;

    // @ts-expect-error - This is for debugging purposes so we don't worry about typing it properly
    window.tvCurrentPlayer = videojsPlayerRef.current;
    // @ts-expect-error
    window.tvCurrentMediaItem = props.mediaItem;
  }, [isCurrentVideo, showDevOptions])

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

  // Handle clicks and gestures on the video element
  const handlePointerUp = useCallback((event: PointerEvent) => {
    const {target: videoElm} = event;
    if (!(videoElm instanceof HTMLVideoElement)) return;

    const videoElmWidth = videoElm.clientWidth
    logger.debug(`Pointer up at X=${event.clientX} (video width: ${videoElmWidth}){*}`);
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
  }, [forceLandscape, isCurrentVideo]);

  useEffect(() => {
    if (!showGuideOverlay) return;
    videojsPlayerRef.current?.pause();
  }, [showGuideOverlay]);

  function getSkipTime(direction: 'forwards' | 'backwards') {
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
  }

  function seekForwards() {
    if (!videojsPlayerRef.current) return null;
    const duration = videojsPlayerRef.current?.duration();
    if (duration === undefined) return;
    const skipAmount = getSkipTime('forwards');
    if (skipAmount === null || typeof duration !== 'number') {
      return null
    }
    const currentTime = videojsPlayerRef.current?.currentTime();
    const nextSkipAheadTime = currentTime + skipAmount
    logger.debug("Seeking forwards{*}", {skipAmount, duration, nextSkipAheadTime})
    if (
      // Go to next item if the next jump goes to or past the end of the entire video
      (nextSkipAheadTime > duration)
      ||
      // Go to next item if we'd be jumping over the end timestamp
      (endTimestamp !== undefined && currentTime <= endTimestamp && nextSkipAheadTime >= endTimestamp)
    ){
      videojsPlayerRef.current?.trigger('ended');
      return
    }
    videojsPlayerRef.current?.currentTime(nextSkipAheadTime)
    setCurrentlyPlayingMarkers(findCurrentlyPlayingMarkers(nextSkipAheadTime))
    videojsPlayerRef.current?.play()
  }

  function seekBackwards() {
    if (!videojsPlayerRef.current) return null;
    const duration = videojsPlayerRef.current?.duration();
    const skipAmount = getSkipTime('backwards')
    if (skipAmount === null || typeof duration !== 'number') {
      return null
    }
    let nextSkipBackTime = videojsPlayerRef.current?.currentTime() - skipAmount
    logger.debug("Seeking backwards{*}", {skipAmount, duration, nextSkipBackTime})
    if (nextSkipBackTime <= 0) {
      if (props.index === 0) {
        // There's no previous video to go back to so just go to the very start of this one
        nextSkipBackTime = 0
      } else {
        goToItem('previous')
        return
      }
    }
    videojsPlayerRef.current?.currentTime(nextSkipBackTime)
    setCurrentlyPlayingMarkers(findCurrentlyPlayingMarkers(nextSkipBackTime))
    videojsPlayerRef.current?.play()
  }

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


  const initialTimestamp = useMemo(() => {
    if (props.mediaItem.entityType === "marker" || startPosition === 'beginning') {
      return undefined
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
    }
    return undefined;
  }, [endPosition, initialTimestamp, minPlayLength, maxPlayLength, playLength, getMediaItemDuration(), scenePreviewOnly]);

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
    if (endTimestamp !== undefined && currentTime >= endTimestamp && currentTime <= (endTimestamp + 3)) {
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
          onPointerUp={handlePointerUp}
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
        {initialTimestamp && videoJsProgressControlElm && createPortal(
          <ClipTimestamp type="start" progressPercentage={(initialTimestamp / (videojsPlayerRef.current?.duration() || 1)) * 100} />,
          videoJsProgressControlElm
        )}
        {endTimestamp !== undefined && endTimestamp < (videojsPlayerRef.current?.duration() || 1) && videoJsProgressControlElm && createPortal(
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
