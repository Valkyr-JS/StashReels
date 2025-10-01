import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import "./VideoScroller.scss";
import VideoItem from "../VideoItem";
import { ITEM_BUFFER_EACH_SIDE } from "../../constants";
import cx from "classnames";
import { useAppStateStore } from "../../store/appStateStore";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useWindowVirtualizer, Virtualizer } from "@tanstack/react-virtual";

interface VideoScrollerProps {}

const VideoScroller: React.FC<VideoScrollerProps> = () => {
  const { forceLandscape: isForceLandscape, setCrtEffect } = useAppStateStore();

  /* ------------------------ Handle loading new videos ----------------------- */

  
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
  
  const getItemHeight = () => isForceLandscape ? window.innerWidth : window.innerHeight

  const rowVirtualizer = useWindowVirtualizer({
    count: cachedScenes.length,
    estimateSize: getItemHeight,
    overscan: 2,
  });
  
  
  useEffect(() => { 
    // Force re-measure when orientation changes
    rowVirtualizer.measure();
  }, [isForceLandscape, rowVirtualizer]);

  const [currentIndex, _setCurrentIndex] = useState(0);
  const setCurrentIndex = (newIndex: React.SetStateAction<number>, {scrollTo = false}: {scrollTo: boolean} = {scrollTo: false}) => {
    console.trace({ newIndex, scrollTo });
    if (scrollTo) {
      let newIndexValue;
      if (typeof newIndex === 'function') {
        newIndexValue = newIndex(currentIndex);
      } else {
        newIndexValue = newIndex;
      }
      rowVirtualizer.scrollToIndex(newIndexValue, { align: 'center', behavior: "auto" });
    }
    return _setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = isForceLandscape ? "ArrowRight" : "ArrowDown";
      const previousKey = isForceLandscape ? "ArrowLeft" : "ArrowUp";
      if (e.key === previousKey) {
        // Go to the previous item
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0), {scrollTo: true});
        e.preventDefault();
      } else if (e.key === nextKey) {
        // Go to the next item
        setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, cachedScenes.length - 1), {scrollTo: true});
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isForceLandscape, setCurrentIndex, cachedScenes.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c") {
        setCrtEffect((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* -------------------------------- Component ------------------------------- */

  // ? Added tabIndex to container to satisfy accessible scroll region.
  return (
    <div
      className={cx("VideoScroller")}
      data-testid="VideoScroller--container"
      tabIndex={0}
      style={{height: `calc(var(--y-unit) * 100 * ${cachedScenes.length})`}}
    >
      {cachedScenes.map((scene, i) => {
        const style = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(var(--y-unit) * 100)',
          transform: `translate3d(0, calc(var(--y-unit) * 100 * ${i}), 0)`,
        } as const
        if (
          rowVirtualizer.getVirtualItems().some(v => v.index === i)
        ) {
          return (
            <VideoItem
              changeItemHandler={setCurrentIndex}
              currentIndex={currentIndex}
              index={i}
              key={scene.id}
              scene={scene}
              style={style}
              currentlyScrolling={rowVirtualizer.isScrolling}
            />
          );
        } else return <div key={scene.id} className="dummy-video-item" style={style} />;
      })}
    </div>
  );
};

export default VideoScroller;
