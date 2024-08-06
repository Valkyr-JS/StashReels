import React, { useEffect, useState } from "react";
import "./Feed.scss";
import VideoScoller from "../../components/VideoScroller";
import { VideoItemProps } from "../../components/VideoItem";
import { fetchData } from "../../helpers";
import { ITEMS_TO_FETCH_PER_LOAD } from "../../constants";

interface FeedPageProps {}

const FeedPage: React.FC<FeedPageProps> = (props) => {
  const [allSceneData, setAllSceneData] = useState<IsceneData[]>([]);
  const [queuedItems, setQueuedItems] = useState<VideoItemProps[]>([]);

  /**
   * ? All scene data is fetched and from Stash on load. However, it is not
   * loaded into the scroller until the user reaches the appropriate point. This
   * reduces the amount of videos loaded at once.
   */
  useEffect(() => {
    let isMounted = true;
    fetchData(sceneQuery).then(
      (res: { data: { findScenes: FindScenesResultType } }) => {
        if (isMounted) {
          // Process fetched scene data, filtering out invalid scenes
          const processedData = res.data.findScenes.scenes
            .map(processSceneData)
            .filter((d) => !!d);

          // Update the full scene data
          setAllSceneData(processedData);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  /** Handles fetching video data */
  const handleQueuingUpData = (length: number) => {
    // Once all scene data has been fetched, queue up the first lot of videos.
    const startIndex = queuedItems.length;
    const endIndex = startIndex + length;
    const sceneData = [...allSceneData].slice(startIndex, endIndex);

    const processedData: VideoItemProps[] = sceneData.map((sc, i) => {
      return {
        index: queuedItems.length + i,
        loadMoreVideosHandler: handleQueuingUpData,
        scene: sc,
      };
    });
    setQueuedItems((prev) => [...prev, ...processedData]);
  };

  useEffect(() => {
    // Once scene data is loaded, process and queue it into the scroller.
    handleQueuingUpData(ITEMS_TO_FETCH_PER_LOAD);
  }, [allSceneData]);

  return (
    <main>
      <VideoScoller items={queuedItems} fetchVideos={handleQueuingUpData} />
    </main>
  );
};

export default FeedPage;

const sceneQuery = `{
  findScenes(
    filter: {per_page: -1}
    scene_filter: {orientation: {value: PORTRAIT}}
  ) {
    scenes {
      captions {
        caption_type
        language_code
      }
      id
      files {
        format
      }
      paths {
        caption
        stream
      }
      title
    }
  }
}`;

/** Process individual scene data from Stash to app format. */
const processSceneData = (sc: Scene): IsceneData | null => {
  if (!sc.paths.stream) return null;

  const processedData: IsceneData = {
    format: sc.files[0].format,
    id: sc.id,
    path: sc.paths.stream,
    title: sc.title || "Untitled",
  };

  return processedData;
};
