import React, { useEffect, useMemo, useRef, useState } from "react";
import "./VideoScroller.scss";
import VideoItem from "../VideoItem";
import { ITEM_BUFFER_EACH_SIDE } from "../../constants";
import cx from "classnames";

interface VideoScrollerProps {
  /** The fullscreen state set by the user. */
  isFullscreen: boolean;
  /** The letterboxing state set by the user. */
  isLetterboxed: boolean;
  /** Whether the video is forced to be displayed in landscape mode. */
  isForceLandscape: boolean;
  /** The audio state set by the user. */
  isMuted: boolean;
  /** The data for each item in the queue. */
  items: IitemData[];
  /** Whether the video should loop on end. If false, the next video is scrolled
   * to automatically. */
  loopOnEnd: boolean;
  /** Whether the settings tab is open. */
  settingsTabIsVisible: boolean;
  /** The subtitles state set by the user. */
  subtitlesOn: boolean;
  /** Whether the UI buttons are visible. */
  uiIsVisible: boolean;
  /** The default captions language to show. `undefined` means no default
   * captions. */
  captionsDefault?: string;
  /** Whether tap navigation is enabled. */
  isTapNavigation?: boolean;
}

const VideoScroller: React.FC<VideoScrollerProps> = ({ items, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------ Handle loading new videos ----------------------- */

  const [currentIndex, setCurrentIndex] = useState(0);

  // Cache items to avoid unnecessary re-renders
  const _itemsCache = useRef<IitemData[]>([]);
  const cachedItems = useMemo(() => {
    if (!items) return [];
    const newValue = items.map(
      (newlyFetchedScene) => (
        _itemsCache.current.find(
          cachedScene => cachedScene.scene.id === newlyFetchedScene.scene.id
        ) || newlyFetchedScene
      )
    ).filter(scene => !!scene);
    _itemsCache.current = newValue
    return newValue;
  }, [items]);
  
  useEffect(() => {
    if (!props.isTapNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = props.isForceLandscape ? "ArrowRight" : "ArrowDown";
      const previousKey = props.isForceLandscape ? "ArrowLeft" : "ArrowUp";
      if (e.key === previousKey) {
        // Go to the previous item
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === nextKey) {
        // Go to the next item
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [props.isTapNavigation, props.isForceLandscape]);

  /* -------------------------------- Component ------------------------------- */

  // ? Added tabIndex to container to atisfy accessible scroll region.
  return (
    <div
      className={cx("VideoScroller", { "force-landscape": props.isForceLandscape })}
      data-testid="VideoScroller--container"
      ref={scrollerRef}
      tabIndex={0}
    >
      {cachedItems.map((item, i) => {
        if (props.isTapNavigation && i !== currentIndex) return null
        if (
          i >= currentIndex - ITEM_BUFFER_EACH_SIDE &&
          i <= currentIndex + ITEM_BUFFER_EACH_SIDE
        ) {
          return (
            <VideoItem
              captionsDefault={props.captionsDefault}
              changeItemHandler={setCurrentIndex}
              currentIndex={currentIndex}
              index={i}
              isFullscreen={props.isFullscreen}
              isLetterboxed={props.isLetterboxed}
              isForceLandscape={props.isForceLandscape}
              isMuted={props.isMuted}
              key={item.scene.id}
              loopOnEnd={props.loopOnEnd}
              scene={item.scene}
              settingsTabIsVisible={props.settingsTabIsVisible}
              setSettingsTabHandler={item.setSettingsTabHandler}
              subtitlesOn={props.subtitlesOn}
              toggleAudioHandler={item.toggleAudioHandler}
              toggleFullscreenHandler={item.toggleFullscreenHandler}
              toggleLetterboxingHandler={item.toggleLetterboxingHandler}
              toggleForceLandscapeHandler={item.toggleForceLandscapeHandler}
              toggleLoopHandler={item.toggleLoopHandler}
              toggleSubtitlesHandler={item.toggleSubtitlesHandler}
              toggleUiHandler={item.toggleUiHandler}
              uiIsVisible={props.uiIsVisible}
              isTapNavigation={props.isTapNavigation}
            />
          );
        } else return <div key={item.scene.id} className="dummy-video-item" />;
      })}
    </div>
  );
};

export default VideoScroller;
