import React, { useEffect, useRef } from "react";
import * as styles from "./VideoItem.module.scss";
import { useIsInViewport } from "../../hooks";

interface VideoItemProps {
  /** The ID of the scene in Stash. */
  id: Scene["id"];
  /** The zero-based index of the scene in the video queue. */
  index: number;
  /** The scene data. */
  scene: {
    /** The format of the video, e.g. "mp4". */
    format: string;
    /** The absolute path of the video stream. */
    path: string;
  };
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Check if at least 80% of the video is in the viewport. */
  const isInViewport = useIsInViewport(videoRef, {
    threshold: 0.8,
  });

  // Play the video if it is currently in the viewport, otherwise pause it.
  useEffect(() => {
    if (isInViewport && videoRef.current) videoRef.current.play();
    else videoRef.current?.pause();
  }, [isInViewport]);

  /** Handle toggling the video play state. */
  const togglePlayHandler = () =>
    videoRef.current?.paused
      ? videoRef.current.play()
      : videoRef.current?.pause();

  return (
    <div className={styles.container}>
      <video
        id={props.id}
        muted
        onClick={togglePlayHandler}
        ref={videoRef}
        data-testid="VideoItem--video"
      >
        <source src={props.scene.path} type={`video/${props.scene.format}`} />
      </video>
    </div>
  );
};

export default VideoItem;
