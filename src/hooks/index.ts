import React, { useEffect, useState, useMemo } from "react";

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
    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}
