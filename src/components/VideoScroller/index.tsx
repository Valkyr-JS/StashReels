import React, { useEffect, useRef, useState } from "react";
import * as styles from "./VideoScroller.module.scss";
import VideoItem from "../VideoItem";
import * as videoItemStyles from "../VideoItem/VideoItem.module.scss";
import { ITEM_BUFFER_EACH_SIDE } from "../../constants";

interface VideoScrollerProps {
  /** The fullscreen state set by the user. */
  isFullscreen: boolean;
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
}

const VideoScroller: React.FC<VideoScrollerProps> = ({ items, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------ Handle loading new videos ----------------------- */

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleChangeItem = (newItemIndex: number) =>
    setCurrentIndex(newItemIndex);

  // When a new set of items are loaded, e.g. a change in filter, scroll back to
  // the top of the list.
  useEffect(() => {
    setCurrentIndex(0);
    // ? Timeout required to use scroll :(
    setTimeout(() => {
      if (scrollerRef.current) {
        scrollerRef.current.scroll({ top: 0, behavior: "instant" });
      }
    }, 100);
  }, [items]);

  /* -------------------------------- Component ------------------------------- */

  // ? Added tabIndex to container to atisfy accessible scroll region.
  return (
    <div
      className={styles.container}
      data-testid="VideoScroller--container"
      ref={scrollerRef}
      tabIndex={0}
    >
      {items.map((item, i) => {
        if (
          i >= currentIndex - ITEM_BUFFER_EACH_SIDE &&
          i <= currentIndex + ITEM_BUFFER_EACH_SIDE
        ) {
          return (
            <VideoItem
              captionsDefault={props.captionsDefault}
              changeItemHandler={handleChangeItem}
              currentIndex={currentIndex}
              index={i}
              isFullscreen={props.isFullscreen}
              isMuted={props.isMuted}
              key={i}
              loopOnEnd={props.loopOnEnd}
              scene={item.scene}
              settingsTabIsVisible={props.settingsTabIsVisible}
              setSettingsTabHandler={item.setSettingsTabHandler}
              subtitlesOn={props.subtitlesOn}
              toggleAudioHandler={item.toggleAudioHandler}
              toggleFullscreenHandler={item.toggleFullscreenHandler}
              toggleLoopHandler={item.toggleLoopHandler}
              toggleSubtitlesHandler={item.toggleSubtitlesHandler}
              toggleUiHandler={item.toggleUiHandler}
              uiIsVisible={props.uiIsVisible}
            />
          );
        } else return <div key={i} className={videoItemStyles.container} />;
      })}
    </div>
  );
};

export default VideoScroller;
