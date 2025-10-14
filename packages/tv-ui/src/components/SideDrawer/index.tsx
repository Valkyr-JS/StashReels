import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { default as cx } from "classnames";
import React, { useEffect, useRef } from "react";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated, config } from "@react-spring/web";
import "./SideDrawer.scss";
import { useAppStateStore } from "../../store/appStateStore";

type Props = {
  children?: React.ReactNode,
  title?: string,
  closeDisabled?: boolean,
  className?: string
}

export default function SideDrawer({children, title, closeDisabled, className}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { setShowSettings, showSettings, forceLandscape } = useAppStateStore();

  const [sidebarWidth, setSidebarWidth] = React.useState(window.innerWidth);
  useEffect(() => {
    const width = ref?.current?.clientWidth
    if (width) {
      setSidebarWidth(width)
    }
    const handleResize = () => {
      if (ref?.current?.clientWidth) {
        setSidebarWidth(ref.current.clientWidth)
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [])
  useEffect(() => {
    if (x.get() / sidebarWidth > 0.5) {
      open({immediate: true});
    } else {
      close();
    }
  }, [sidebarWidth]);
  
  // Kinda hacky way to prevent scrolling of the body when the sidebar is open on mobile without preventing the
  // scrolling of the sidebar content if it overflows
  useEffect(() => {
    if (!showSettings || !ref.current) return;

    let initialClientY: number | undefined
    const handleTouchStart = (event: TouchEvent) => {
      initialClientY = event.touches[0].clientY
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (initialClientY === undefined) return;
      if (!bodyRef.current) return;

      const atTop = bodyRef.current.scrollTop === 0;
      const atBottom = bodyRef.current.scrollHeight - bodyRef.current.scrollTop === bodyRef.current.clientHeight;

      const deltaY = event.touches[0].clientY - initialClientY;

      const isScrollingDown = deltaY < 0;
      const isScrollingUp = deltaY > 0;

      // If element can scroll no further in the direction of scroll direction then prevent default to stop the body scrolling
      if ((atTop && isScrollingUp) || (atBottom && isScrollingDown)) {
        event.preventDefault();
      }
    }
    const handleTouchEnd = () => {
      initialClientY = undefined
    }

    ref.current?.addEventListener("touchstart", handleTouchStart);
    ref.current?.addEventListener("touchmove", handleTouchMove);
    ref.current?.addEventListener("touchend", handleTouchEnd);
    return () => {
      ref.current?.removeEventListener("touchstart", handleTouchStart);
      ref.current?.removeEventListener("touchmove", handleTouchMove);
      ref.current?.removeEventListener("touchend", handleTouchEnd);
    };
  }, [showSettings, forceLandscape]);

  const [{ x }, api] = useSpring(() => ({
    from: {
      x: 0, // Ideally this would be `showSettings ? sidebarWidth : 0` but we don't have a precise value for 
        // sidebarWidth on first render so we start closed and then open immediately if needed when sidebarWidth is set
        // with a precise value
    },
    config: {
      mass: 0.3,
      tension: 600,
      friction: 26
    }
  }));
  
  const showSettingsFirstTimeRef = useRef(true);
  useEffect(() => {
    if (showSettings) {
      open({immediate: showSettingsFirstTimeRef.current})
    } else {
      close();
    }
    showSettingsFirstTimeRef.current = false;
  }, [showSettings]);

  const open = ({ canceled, immediate }: { canceled?: boolean, immediate?: boolean } = { canceled: false, immediate: false }) => {
    api.start({
      x: sidebarWidth,
      immediate,
      // when cancel is true, it means that the user passed the drag right threshold
      // so we change the spring config to create a nice wobbly effect
      config: canceled ? {
        mass: 0.9,
        tension: 400,
        friction: 20
      } : undefined,
      onRest: () => setShowSettings(true)
    })
  }

  const close = () => {
    if (closeDisabled) {
      open();
      return;
    }
    api.start({
      x: 0,
      immediate: false,
      config: { ...config.stiff },
      onRest: () => setShowSettings(false)
    })
  }

  const didDragRef = useRef(false);
  // Setup drag gesture for swiping
  useDrag((state) => {
    const {
      xy: [xCord],
      offset: [xOffset],
      direction: [xDirection],
      velocity: [xVelocity],
      dragging,
      cancel,
      last,
      canceled,
      first,
    } = state

    if (first) {
      // If we start dragging from a point further than 1 sidebar width away from the sidebar when the sidebar is closed
      // then ignore the drag
      if (x.get() === 0 && xCord > (x.get() + sidebarWidth)) {
        return cancel()
      }
    }
    if (dragging) {
      didDragRef.current = true;
      // If we drag more than 2x the sidebar width, we cancel the drag and snap back
      if (xDirection > 0 && xCord / sidebarWidth > 2) {
        cancel()
      } else {
        api.start({ x: xOffset, immediate: true });
      }
    } else if (last) {
      if (didDragRef.current) {
        // On desktop a click event fires after a drag which we don't want to 
        window.addEventListener(
          "click",
          (event) =>  didDragRef.current && event.stopPropagation(),
          { once: true, capture: true }
        )
        setTimeout(() => didDragRef.current = false, 50);
      }
      // Quick but maybe short swipe to the right
      if (xVelocity > 0.5 && xDirection > 0) {
        open({ canceled })
        // Quick but maybe short swipe to the left
      } else if (xVelocity > 0.5 && xDirection < 0) {
        close()
        // Swipe to the right past halfway point
      } else if (xOffset > (sidebarWidth * 0.5)) {
        open({ canceled })
        // Swipe to the left past halfway point
      } else {
        close()
      }
    }
  }, {
    filterTaps: true,
    bounds: () => ({ left: 0, right: sidebarWidth }),
    rubberband: true,
    from: () => [x.get(), 0],
    target: window,
    preventScroll: true,
  });
  
  // A workaround for https://github.com/pmndrs/use-gesture/issues/593
  useEffect(() => {
    window.addEventListener("click", (event) => {
      Object.defineProperty(event, 'detail', { value: 0, writable: true });
    }, { capture: true });
  }, [])

  const overlayOpacity = x.to((px) => Math.min(sidebarWidth, (px / sidebarWidth)))
  const overlayDisplay = x.to((px) => px > 0 ? 'block' : 'none')
  
  // Ugly hack to workaround the issue that in iOS Safari the "fixed" position is buggy for elements inside a
  // `rotate()`ed element. We get around this by positioning it with js instead.
  const getLandscapeModePositionStyleHack = () => forceLandscape ? {
    position: "absolute",
    top: `${document.body.scrollTop}px`,
  } as const : {}
  const landscapeModePositionStyleHack = getLandscapeModePositionStyleHack()
  useEffect(() => {
    const handleScroll = () => {
      const rootElement = ref.current;
      const overlayElement = overlayRef.current;
      rootElement && Object.assign(rootElement.style, getLandscapeModePositionStyleHack())
      overlayElement && Object.assign(overlayElement.style, getLandscapeModePositionStyleHack())
    }
    const scrollElement = forceLandscape ? document.body : document.scrollingElement
    if (!scrollElement) return;
    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [forceLandscape])
  
  const closeButton =
    closeDisabled ? null : (
      <button
        data-testid="SideDrawer--closeButton"
        onClick={() => setShowSettings(false)}
        type="button"
      >
        <FontAwesomeIcon icon={faXmark} />
        <span className="sr-only">Close settings</span>
      </button>
    );

  /* -------------------------------- Component ------------------------------- */

  return <>
    <animated.div
      className="settings-overlay"
      style={{ display: overlayDisplay, opacity: overlayOpacity, ...landscapeModePositionStyleHack }}
      onClick={() => close()}
      ref={overlayRef}
    />
    <animated.div
      className={cx("SideDrawer", className)}
      data-testid="SideDrawer"
      ref={ref}
      style={{ right: x.to(px => `calc(100% - ${px}px)`), ...landscapeModePositionStyleHack }}
    >
      <div className="content">
        <div className="body" ref={bodyRef}>
          {children}
        </div>

        <div className="footer">
          <h2>{title}</h2>
          {closeButton}
        </div>
      </div>
    </animated.div>
  </>;
};
