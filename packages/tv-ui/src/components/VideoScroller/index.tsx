import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import "./VideoScroller.scss";
import VideoItem from "../VideoItem";
import { ITEM_BUFFER_EACH_SIDE } from "../../constants";
import cx from "classnames";
import { useAppStateStore } from "../../store/appStateStore";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { debounce } from 'perfect-debounce';

interface VideoScrollerProps {}

const videoItemHeight = "calc(var(--y-unit-large) * 100)"

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

  const estimateSizeTesterElement = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    return () => {
      if (estimateSizeTesterElement.current) {
        estimateSizeTesterElement.current.remove();
        estimateSizeTesterElement.current = null;
      }
    }
  }, []);


  const rowVirtualizer = useWindowVirtualizer({
    count: cachedScenes.length,
    estimateSize: () => {
      if (!estimateSizeTesterElement.current) {
        const el = document.createElement('div');
        el.style.height = videoItemHeight;
        el.style.position = 'absolute';
        el.className = "VideoScroller--size-tester";
        el.style.visibility = 'hidden';
        document.body.appendChild(el);
        estimateSizeTesterElement.current = el;
      }

      return estimateSizeTesterElement.current.offsetHeight;
    },
    overscan: 1,
    horizontal: isForceLandscape,
  });

  const [currentIndex, _setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  const setCurrentIndex = useMemo(
    () => debounce((newIndex: React.SetStateAction<number>, {scrollTo = false}: {scrollTo: boolean} = {scrollTo: false}) => {
      currentIndexRef.current = typeof newIndex === 'function' ? newIndex(currentIndexRef.current) : newIndex;
      _setCurrentIndex(newIndex)
      if (scrollTo) {
        rowVirtualizer.scrollToIndex(currentIndexRef.current, { align: 'center', behavior: "auto" });
      }
    }, 100, {leading: true}),
    [rowVirtualizer]
  );

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
  
  // Store scroll position when window is resized
  useEffect(() => {
    const container = document.scrollingElement;
    const originalScrollSnapType = container ? getComputedStyle(container).scrollSnapType : 'none';
    
    let timeoutId: NodeJS.Timeout;
    
    const restoreScrollPosition = () => {
      if (rowVirtualizer) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        const oldSize = rowVirtualizer.getVirtualItems()[0].size
        rowVirtualizer.measure();
        const newSize = rowVirtualizer.getVirtualItems()[0].size
        if (oldSize === newSize) return;
          
        // Disable scroll snapping temporarily to stop it from interfering
        document.documentElement.style.scrollSnapType = 'none';

        rowVirtualizer.scrollToIndex(currentIndex, { align: 'start', behavior: "auto" });

        // Re-enable scroll snapping after a small delay
        timeoutId = setTimeout(() => {
          document.documentElement.style.scrollSnapType = originalScrollSnapType;
        }, 50);
      }
    };
    
    window.addEventListener('resize', restoreScrollPosition);
    return () => {
      window.removeEventListener('resize', restoreScrollPosition);
    };
  }, [currentIndex, rowVirtualizer]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const observedElementsRef = useRef<Map<Element, number>>(new Map());
  
  // Update the currentIndex when scrolling
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        let maxVisibility = 0;
        let mostVisibleIndex = currentIndexRef.current;
        
        entries.forEach((entry) => {
          const index = observedElementsRef.current.get(entry.target);
          if (index === undefined) return;
          
          // Calculate how visible the element is (ratio of intersection)
          const visibilityRatio = entry.intersectionRatio;
          
          if (visibilityRatio > maxVisibility) {
            maxVisibility = visibilityRatio;
            mostVisibleIndex = index;
          }
        });
        
        if (mostVisibleIndex === currentIndexRef.current) return;
        
        // Only update if we found a valid entry with enough visibility
        if (maxVisibility > 0.3) {
          setCurrentIndex(mostVisibleIndex);
        }
      },
      { 
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "0px"
      }
    );
    
    // Set up a function to refresh which elements are being observed
    const updateObservedElements = () => {
      const observer = observerRef.current;
      if (!observer) return;
      
      // Clear previous observations
      observedElementsRef.current.forEach((_, element) => {
        observer.unobserve(element);
      });
      observedElementsRef.current.clear();
      
      // Find all rendered items and observe them
      document.querySelectorAll('[data-index]').forEach((element) => {
        const indexAttr = element.getAttribute('data-index');
        if (indexAttr !== null) {
          const index = parseInt(indexAttr, 10);
          if (!isNaN(index)) {
            observedElementsRef.current.set(element, index);
            observer.observe(element);
          }
        }
      });
    };

    // Initial setup of observed elements
    setTimeout(updateObservedElements, 100); // Short delay to ensure DOM elements are rendered
    
    // Set up a mutation observer to detect when the DOM changes
    mutationObserverRef.current = new MutationObserver(updateObservedElements);
    
    // Start observing the container for DOM changes
    const container = document.querySelector('.VideoScroller');
    if (container) {
      mutationObserverRef.current.observe(container, {
        childList: true,
        subtree: false,
        attributes: false,
      });
    }

    const observer = observerRef.current;
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, []);

  /* -------------------------------- Component ------------------------------- */

  // ? Added tabIndex to container to satisfy accessible scroll region.
  return (
    <div
      className={cx("VideoScroller")}
      data-testid="VideoScroller--container"
      tabIndex={0}
      style={{ height: rowVirtualizer.getTotalSize() }}
    >
      {import.meta.env.VITE_DEBUG && <div className="stats">
        {rowVirtualizer.isScrolling ? "Scrolling" : "Not Scrolling"}
      </div>}
      {cachedScenes.map((scene, i) => {
        const style = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(var(--y-unit-large) * 100)',
          transform: `translate3d(0, calc(var(--y-unit-large) * 100 * ${i}), 0)`,
          ...(import.meta.env.VITE_DEBUG ? {
            "backgroundColor": `hsl(${i * 37  % 360}, 70%, 50%)`,
            border: `10px ${i === currentIndex ? 'black' : 'transparent'} dashed`,
          } : {})
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
