import React, { useState } from "react";
import * as styles from "./VideoScroller.module.scss";
import VideoItem, { VideoItemProps } from "../VideoItem";
import { ITEMS_TO_FETCH_PER_LOAD } from "../../constants";

interface VideoScrollerProps {
  /** Handler to fetch more video data from the queue. */
  fetchVideos: (length: number) => void;
  /** The audio state set by the user. */
  isMuted: boolean;
  /** The data for each item in the queue. */
  items: VideoItemProps[];
  /** Whether the video should loop on end. If false, the next video is scrolled
   * to automatically. */
  loopOnEnd: boolean;
}

const VideoScoller: React.FC<VideoScrollerProps> = ({ items, ...props }) => {
  /* ------------------------ Handle loading new videos ----------------------- */

  const [loadNewVidsAtIndex, setloadNewVidsAtIndex] = useState(3);

  /** Handle loading more videos when required. */
  const handleLoadingMoreVideos = (index: number) => {
    console.log(index, loadNewVidsAtIndex);

    // Only execute fetch if the video index matches the point at which new
    // videos need to be requested.
    if (index === loadNewVidsAtIndex) {
      props.fetchVideos(ITEMS_TO_FETCH_PER_LOAD);
      setloadNewVidsAtIndex((prev) => prev + ITEMS_TO_FETCH_PER_LOAD);
    }
  };

  /* -------------------------------- Component ------------------------------- */

  // ? Added tabIndex to container to atisfy accessible scroll region.
  return (
    <div
      className={styles.container}
      data-testid={"VideoScroller--container"}
      tabIndex={0}
    >
      {items.map((item, i) => {
        return (
          <VideoItem
            index={i}
            isMuted={props.isMuted}
            key={i}
            loopOnEnd={props.loopOnEnd}
            loadMoreVideosHandler={handleLoadingMoreVideos}
            scene={item.scene}
            toggleAudioHandler={item.toggleAudioHandler}
            toggleLoopHandler={item.toggleLoopHandler}
          />
        );
      })}
    </div>
  );
};

export default VideoScoller;
