import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import "./VideoScroller.scss";
import VideoItem from "../VideoItem";
import cx from "classnames";
import { useAppStateStore } from "../../store/appStateStore";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useVirtualizer, useWindowVirtualizer, windowScroll, elementScroll } from "@tanstack/react-virtual";
import throttle from 'throttleit';
import { clamp } from "../../helpers";

interface VideoScrollerProps {}

const videoItemHeight = "calc(var(--y-unit-large) * 100)"

/** The number of items to fetch data for. */
export const itemBufferEitherSide = 1 as const;

const VideoScroller: React.FC<VideoScrollerProps> = () => {
  const { forceLandscape: isForceLandscape, setCrtEffect } = useAppStateStore();
  const rootElmRef = useRef<HTMLDivElement | null>(null);

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


  const sharedOptions = {
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

      const itemHeight = estimateSizeTesterElement.current.offsetHeight;
      import.meta.env.VITE_DEBUG && console.log("Estimated item height:", itemHeight)

      return itemHeight;
    },
    overscan: itemBufferEitherSide,
  }
  const windowRowVirtualizer = useWindowVirtualizer({
    ...sharedOptions,
    enabled: !isForceLandscape,
    scrollToFn: (...args) => {
      import.meta.env.VITE_DEBUG && console.log("Window virtualizer scrolling to height:", args[0])
      return windowScroll(...args);
    }
  });
  const elementRowVirtualizer = useVirtualizer({
    ...sharedOptions,
    enabled: isForceLandscape,
    getScrollElement: () => document.querySelector('body'),
    scrollToFn: (...args) => {
      import.meta.env.VITE_DEBUG && console.log("Element virtualizer scrolling to height:", args[0])
      return elementScroll(...args);
    }
  });
  
  const rowVirtualizer = isForceLandscape ? elementRowVirtualizer : windowRowVirtualizer;

  const [currentIndex, _setCurrentIndex] = useReducer(
    (currentState: number, newState: React.SetStateAction<number>) => {
      newState = typeof newState === 'function' ? newState(currentState) : newState;
      return clamp(0, newState, cachedScenes.length - 1);
    }, 0
  );
  
  /**
   * The currentIndex value in ref form for when it needs to be accessed in
   * async functions without being a dependency that causes re-renders.
   *
   * It's state may sometimes differ from currentIndex as the updating of currentIndex
   * is throttled to avoid excessive re-renders. However currentIndex should eventually
   * catch up to this value.
   * */
  const currentIndexRef = useRef(currentIndex);

  const setCurrentIndex = useMemo(
    () => {
      const throttledSetCurrentIndex = throttle((newIndex: number) => {
        import.meta.env.VITE_DEBUG && console.log("setCurrentIndex received:", newIndex)
        _setCurrentIndex(newIndex)
      }, 100)
      return ((newIndex: React.SetStateAction<number>) => {
        currentIndexRef.current = typeof newIndex === 'function' ? newIndex(currentIndexRef.current) : newIndex;

        return throttledSetCurrentIndex(currentIndexRef.current);
      })
    },
    [rowVirtualizer]
  );

  const scrollSnappingReenableTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const scrollSnappingEnabled = () => !scrollSnappingReenableTimeoutRef.current
  const scrollSnappingReenableTimeoutMs = 100;
  const getScrollSnappingReenableHandler = () => () => {
    clearTimeout(scrollSnappingReenableTimeoutRef.current);
    scrollSnappingReenableTimeoutRef.current = undefined
    rootElmRef.current?.classList.add('scrollSnappingEnabled');
  }

  // Temporarily disable scroll snapping to help with bugs that occur when trying to programmatically scroll
  // when scroll snapping is on. Also if scroll snapping is enabled when page is loaded then iOS restores the scroll
  // position so we disable it for a short while at load to avoid this.
  function temporarilyDisableScrollSnapping() {
    if (scrollSnappingReenableTimeoutRef.current) {
      clearTimeout(scrollSnappingReenableTimeoutRef.current);
    }
    scrollSnappingReenableTimeoutRef.current = setTimeout(
      getScrollSnappingReenableHandler(),
      scrollSnappingReenableTimeoutMs
    );
    import.meta.env.VITE_DEBUG && console.log('Temporarily disabling scroll snapping');
    rootElmRef.current?.classList.remove('scrollSnappingEnabled');
  }

  // Delay reenabling scroll snapping if a scroll occurs within the timeout period
  useEffect(() => {
    const scrollHandler = () => {
      if (!scrollSnappingEnabled()) {
        clearTimeout(scrollSnappingReenableTimeoutRef.current);
        scrollSnappingReenableTimeoutRef.current = setTimeout(
          getScrollSnappingReenableHandler(),
          scrollSnappingReenableTimeoutMs
        );
      }
    }
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);
  const scrollToIndex = useMemo(
    () => (index: React.SetStateAction<number>, options?: { behavior?: ScrollBehavior }) => {
      index = typeof index === 'function' ? index(currentIndexRef.current) : index;
      // We don't use TanStack Virtual's `scrollToIndex()` here since it won't scroll to the position for an item that 
      // isn't rendered yet + it seems to be a bit buggy around smooth scrolling since it scrolls then immediately
      // checks to see if it's finished scrolling and will try again if not (causing jumpiness).
      const container = rowVirtualizer.scrollElement
      if (!container) return;
      const itemHeight = rowVirtualizer.getVirtualItems()[0].size
      const newScrollTop = index * itemHeight
      temporarilyDisableScrollSnapping();
      import.meta.env.VITE_DEBUG && console.log(`Scrolling to index ${index} at height ${newScrollTop}`);
      console.log({ top: newScrollTop, behavior: "smooth", ...options }, options)
      rowVirtualizer.scrollElement?.scrollTo({ top: newScrollTop, behavior: "smooth", ...options });
    },
    [rowVirtualizer]
  );
  
  useEffect(() => {
    import.meta.env.VITE_DEBUG && console.log("currentIndex changed to", currentIndex);
  }, [currentIndex]); 

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKey = isForceLandscape ? "ArrowRight" : "ArrowDown";
      const previousKey = isForceLandscape ? "ArrowLeft" : "ArrowUp";
      if (e.key === previousKey) {
        // Go to the previous item
        import.meta.env.VITE_DEBUG && console.log("Previous key pressed");
        const newIndex = (prevIndex: number) => prevIndex - 1
        scrollToIndex(newIndex, { behavior: "instant" });
        setCurrentIndex(newIndex);
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === nextKey) {
        // Go to the next item
        import.meta.env.VITE_DEBUG && console.log("Next key pressed");
        const newIndex = (prevIndex: number) => prevIndex + 1
        scrollToIndex(newIndex, { behavior: "instant" });
        import.meta.env.VITE_DEBUG && console.log("setCurrentIndex sent");
        setCurrentIndex(newIndex);
        e.preventDefault();
        e.stopPropagation();
      }
    }
    // We use capture so we can stop it propagating to the video player which treats arrow keys as seek commands
    window.addEventListener("keydown", handleKeyDown, {capture: true});
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
    const restoreScrollPosition = () => {
      if (rowVirtualizer) {
        const oldSize = rowVirtualizer.getVirtualItems()[0].size
        rowVirtualizer.measure();
        const newSize = rowVirtualizer.getVirtualItems()[0].size
        if (oldSize === newSize) return;
        
        scrollToIndex(currentIndex => currentIndex, { behavior: "instant" });
      }
    };
    
    window.addEventListener('resize', restoreScrollPosition);
    return () => {
      window.removeEventListener('resize', restoreScrollPosition);
    };
  }, [scrollToIndex, rowVirtualizer]);
  
  useEffect(() => {
    // Restore scroll position after items have been resized for landscape/portrait mode
    scrollToIndex(currentIndex => currentIndex, { behavior: "instant" });
  }, [isForceLandscape]);  

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
      className={cx("VideoScroller", {scrollSnappingEnabled: scrollSnappingEnabled() })}
      data-testid="VideoScroller--container"
      tabIndex={0}
      ref={rootElmRef}
      style={{ height: rowVirtualizer.getTotalSize() }}
    >
      {import.meta.env.VITE_DEBUG && <div className="debugStats">
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
              changeItemHandler={(newIndex) => {
                scrollToIndex(newIndex);
                setCurrentIndex(newIndex);
              }}
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
