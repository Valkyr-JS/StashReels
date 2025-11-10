import { useEffect, useMemo, useState } from "react";
import "./useOverflowIndicators.css";

type ScrollClasses = "top-overflowing" | "bottom-overflowing" | "indicators-on-overflow";

export default function useOverflowIndicators(stackElmRef: React.MutableRefObject<HTMLElement | null>) {
  const [isOverflowingTop, setIsOverflowingTop] = useState<boolean>(false);
  const [isOverflowingBottom, setIsOverflowingBottom] = useState<boolean>(false);
  const stackScrollClasses = useMemo<ScrollClasses[]>(() => {
    const classes: ScrollClasses[] = ["indicators-on-overflow"];
    if (isOverflowingTop) classes.push("top-overflowing");
    if (isOverflowingBottom) classes.push("bottom-overflowing");
    return classes;
  }, [isOverflowingTop, isOverflowingBottom]);

  function handleStackScroll(event: Event) {
    const target = event.currentTarget;
    if (!target || !(target instanceof HTMLElement)) return;
    updateStackScrollClasses(target);
  }

  useEffect(() => {
    if (!stackElmRef.current) return;
    updateStackScrollClasses(stackElmRef.current);
    stackElmRef.current.addEventListener("scroll", handleStackScroll);

    const observer = new ResizeObserver(() => {
      if (!stackElmRef.current) return;
      updateStackScrollClasses(stackElmRef.current);
    });
    observer.observe(stackElmRef.current);

    return () => {
      observer.disconnect();
      stackElmRef.current?.removeEventListener("scroll", handleStackScroll);
    };
  }, [stackElmRef.current]);

  function updateStackScrollClasses(element: HTMLElement) {
    const isScrollable = element.scrollHeight > element.offsetHeight;
    const scrollPercent = Math.abs(element.scrollTop) / (element.scrollHeight - element.offsetHeight);
    console.log({isScrollable, scrollPercent});
    setIsOverflowingTop(isScrollable && scrollPercent < 1);
    setIsOverflowingBottom(isScrollable && scrollPercent > 0);
  }

  return stackScrollClasses
}
