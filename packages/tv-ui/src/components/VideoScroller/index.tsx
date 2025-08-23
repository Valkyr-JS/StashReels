import React, { useEffect, useMemo, useRef, useState } from "react";
import "./VideoScroller.scss";
import VideoItem from "../VideoItem";
import { ITEM_BUFFER_EACH_SIDE } from "../../constants";
import cx from "classnames";
import { useAppStateStore } from "../../store/appStateStore";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

interface VideoScrollerProps {}

const VideoScroller: React.FC<VideoScrollerProps> = () => {
  const { forceLandscape: isForceLandscape } = useAppStateStore();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  /* ------------------------ Handle loading new videos ----------------------- */

  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { scenes } = useAppStateStore();

  // Cache items to avoid unnecessary re-renders
  const _scenesCache = useRef<GQL.TvSceneDataFragment[]>([]);
  const cachedScenes = useMemo(() => {
    if (!scenes) return [];
    const newValue = scenes.map(
      (newlyFetchedScene) => (
        _scenesCache.current.find(
          cachedScene => cachedScene.id === newlyFetchedScene.id
        ) || newlyFetchedScene
      )
    ).filter(scene => !!scene);
    _scenesCache.current = newValue
    return newValue;
  }, [scenes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = isForceLandscape ? "ArrowRight" : "ArrowDown";
      const previousKey = isForceLandscape ? "ArrowLeft" : "ArrowUp";
      if (e.key === previousKey) {
        // Go to the previous item
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === nextKey) {
        // Go to the next item
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isForceLandscape, setCurrentIndex]);

  /* -------------------------------- Component ------------------------------- */

  // ? Added tabIndex to container to atisfy accessible scroll region.
  return (
    <div
      className={cx("VideoScroller", { "force-landscape": isForceLandscape })}
      data-testid="VideoScroller--container"
      ref={scrollerRef}
      tabIndex={0}
    >
      {cachedScenes.map((scene, i) => {
        if (
          i >= currentIndex - ITEM_BUFFER_EACH_SIDE &&
          i <= currentIndex + ITEM_BUFFER_EACH_SIDE
        ) {
          return (
            <VideoItem
              changeItemHandler={setCurrentIndex}
              currentIndex={currentIndex}
              index={i}
              key={scene.id}
              scene={scene}
            />
          );
        } else return <div key={scene.id} className="dummy-video-item" />;
      })}
    </div>
  );
};

export default VideoScroller;
