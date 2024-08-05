import React from "react";
import * as styles from "./VideoScroller.module.scss";
import VideoItem from "../VideoItem";

interface VideoScrollerProps {
  items: IitemData[];
}

const VideoScoller: React.FC<VideoScrollerProps> = (props) => {
  return (
    <div className={styles.container}>
      {props.items.map((item, i) => {
        return <VideoItem index={i} key={i} scene={item.scene} />;
      })}
    </div>
  );
};

export default VideoScoller;
