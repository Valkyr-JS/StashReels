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

