import React from "react";
import * as styles from "./VideoItem.module.scss";

interface VideoItemProps {}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  console.log("Loading videoitem: ", props);
  return <div className={styles.base}>Video Item</div>;
};

export default VideoItem;
