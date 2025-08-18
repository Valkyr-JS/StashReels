import React, { useEffect, useLayoutEffect, useState, useMemo } from "react";

/** Returns whether the reference element is currently in the viewport. */
export function useIsInViewport(
  ref: React.MutableRefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => setIsIntersecting(entry.isIntersecting),
        options
      ),
    []
  );

  useEffect(() => {
    if (!ref.current) {
      console.warn("‼️ useIsInViewport: ref is null or undefined");
      return;
    }
    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}

/** Returns the current size of the browser window. */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const handleSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useLayoutEffect(() => {
    handleSize();

    window.addEventListener("resize", handleSize);

    return () => window.removeEventListener("resize", handleSize);
  }, []);

  return windowSize;
};
