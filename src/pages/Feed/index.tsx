import React, { useEffect, useState } from "react";
import "./Feed.scss";
import VideoScoller from "../../components/VideoScroller";
import { VideoItemProps } from "../../components/VideoItem";
import { fetchData } from "../../helpers";
import { ITEMS_TO_FETCH_PER_LOAD } from "../../constants";

interface FeedPageProps {
  query: string;
  /** The default captions language to show. `undefined` means no default
   * captions. */
  captionsDefault: string | undefined;
}

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
    fetchData(props.query).then(
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
        isMuted,
        loadMoreVideosHandler: handleQueuingUpData,
        loopOnEnd,
        scene: sc,
        toggleAudioHandler: handleTogglingAudio,
        toggleLoopHandler: handleTogglingLooping,
      };
    });
    setQueuedItems((prev) => [...prev, ...processedData]);
  };

  /* ---------------------------------- Audio --------------------------------- */

  const [isMuted, setIsMuted] = useState(true);
  const handleTogglingAudio = () => setIsMuted((prev) => !prev);

  /* --------------------------------- Looping -------------------------------- */

  const [loopOnEnd, setLoopOnEnd] = useState(false);
  const handleTogglingLooping = () => setLoopOnEnd((prev) => !prev);

  useEffect(() => {
    // Once scene data is loaded, process and queue it into the scroller.
    handleQueuingUpData(ITEMS_TO_FETCH_PER_LOAD);
  }, [allSceneData]);

  return (
    <main>
      <VideoScoller
        captionsDefault={props.captionsDefault}
        isMuted={isMuted}
        items={queuedItems}
        fetchVideos={handleQueuingUpData}
        loopOnEnd={loopOnEnd}
      />
    </main>
  );
};

export default FeedPage;

/** Process individual scene data from Stash to app format. */
const processSceneData = (sc: Scene): IsceneData | null => {
  if (!sc.paths.stream) return null;

  const processedData: IsceneData = {
    format: sc.files[0].format,
    id: sc.id,
    path: sc.paths.stream,
    title: sc.title || "Untitled",
    captions: sc.captions
      ?.map((cap) => {
        if (typeof sc.paths.caption === "string") {
          return {
            format: cap.caption_type,
            lang: cap.language_code,
            source: sc.paths.caption,
          };
        }
      })
      .filter((c) => !!c),
  };

  return processedData;
};
