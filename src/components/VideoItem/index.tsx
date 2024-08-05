import React, { useRef } from "react";
import * as styles from "./VideoItem.module.scss";

interface VideoItemProps {
  // getVideos: (length: number) => void;
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
          // onDoubleClick={toggleMuteHandler}
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
