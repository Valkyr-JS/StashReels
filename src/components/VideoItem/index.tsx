import React, { useEffect, useRef } from "react";
import * as styles from "./VideoItem.module.scss";
import { useIsInViewport } from "../../hooks";

interface VideoItemProps {
  id: Scene["id"];
  index: number;
  lastVideoIndex: number;
  scene: {
    format: VideoFile["format"];
    path: Scene["paths"]["stream"];
  };
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const isInViewport = useIsInViewport(videoRef, {
    threshold: 0.9,
  });

  useEffect(() => {
    console.log(isInViewport, videoRef);
    if (isInViewport && videoRef.current) {
      console.log("play");
      videoRef.current.play();
    } else {
      console.log("pause");
      videoRef.current?.pause();
    }
  }, [isInViewport]);

  useEffect(() => {
    if (!isInViewport) {
      console.log("pause");
      videoRef.current?.pause();
    }
  }, [isInViewport]);

  /** Handle toggling the video play state. */
  const togglePlayHandler = () =>
    videoRef.current?.paused
      ? videoRef.current.play()
      : videoRef.current?.pause();

  if (props.scene.path)
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

  return null;
};

export default VideoItem;
