import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { default as cx } from "classnames";
import React, { useEffect, useRef } from "react";
import { useSpring, animated, config } from "@react-spring/web";
import "./SideDrawer.scss";
import { useAppStateStore } from "../../../store/appStateStore";

type Props = {
  children?: React.ReactNode,
  title?: string | React.ReactNode,
  closeDisabled?: boolean | "because loading",
  className?: string
}

export default function SideDrawer({children, title, closeDisabled, className}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { showSettings, forceLandscape, showGuideOverlay, set: setAppSetting } = useAppStateStore();

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
      close({immediate: showGuideOverlay});
    }
    showSettingsFirstTimeRef.current = false;
  }, [showSettings, showGuideOverlay]);

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
      onRest: () => setAppSetting("showSettings", true)
    })
  }

  const close = ({ immediate }: { immediate?: boolean } = { immediate: false }) => {
    if (closeDisabled) {
      open();
      return;
    }
    api.start({
      x: 0,
      immediate,
      config: { ...config.stiff },
      onRest: () => setAppSetting("showSettings", false)
    })
  }


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
  
  let closeButton = null;
  if (closeDisabled === "because loading") {
    closeButton = (
      <FontAwesomeIcon className="action" icon={faSpinner} pulse />
    );
  } else if (!closeDisabled) {
    closeButton = (
      <button
        className="action"
        data-testid="SideDrawer--closeButton"
        onClick={() => setAppSetting("showSettings", false)}
        type="button"
      >
        <FontAwesomeIcon icon={faXmark} />
        <span className="sr-only">Close settings</span>
      </button>
    );
  }

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
