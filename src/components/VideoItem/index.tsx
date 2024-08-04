import React, { useEffect, useState } from "react";
import * as styles from "./VideoItem.module.scss";
import { fetchData } from "../../helpers";

interface VideoItemProps {}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const [sceneData, setSceneData] = useState<{
    data: { findScenes: FindScenesResultType };
  } | null>(null);

  // Fetch scene data
  useEffect(() => {
    fetchData(`{
      findScenes(
        filter: { per_page: 5, sort: "random" }
        scene_filter: { orientation: { value: PORTRAIT } }
      ) {
        scenes {
          id
          files { format }
          paths { stream }
          title
          }
        }
      }`).then((res) => setSceneData(res));
  }, []);

  return (
    <div className={styles.base}>
      {sceneData?.data.findScenes.scenes[0].title || "Loading"}
    </div>
  );
};

export default VideoItem;
