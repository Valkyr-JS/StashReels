import React from "react";

interface VideoItemProps {}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  console.log("Loading videoitem: ", props);
  return <div>Video Item</div>;
};

export default VideoItem;
