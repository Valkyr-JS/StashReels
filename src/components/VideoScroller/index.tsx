import React, { useState } from "react";
import * as styles from "./VideoScroller.module.scss";
import VideoItem, { VideoItemProps } from "../VideoItem";
import {
  ITEMS_BEFORE_END_ON_FETCH,
  ITEMS_TO_FETCH_PER_LOAD,
} from "../../constants";

interface VideoScrollerProps {
  fetchVideos: (length: number) => void;
  /** The data for each item in the queue. */
  items: VideoItemProps[];
}

const VideoScoller: React.FC<VideoScrollerProps> = ({ items, ...props }) => {
  /* ------------------------ Handle loading new videos ----------------------- */

  const [loadNewVidsAtIndex, setloadNewVidsAtIndex] = useState(
    items.length - ITEMS_BEFORE_END_ON_FETCH - 1
  );

  /** Handle loading more videos when required. */
  const handleLoadingMoreVideos = (index: number) => {
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
            key={i}
            loadMoreVideosHandler={handleLoadingMoreVideos}
            scene={item.scene}
          />
        );
      })}
    </div>
  );
};

export default VideoScoller;
