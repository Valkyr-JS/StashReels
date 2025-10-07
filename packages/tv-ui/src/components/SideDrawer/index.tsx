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
  const overlayRef = useRef<HTMLDivElement>(null);

  const { setShowSettings, showSettings, forceLandscape } = useAppStateStore();

  const [sidebarWidth, setSidebarWidth] = React.useState(window.innerWidth);
  useEffect(() => {
    const width = ref?.current?.clientWidth
    if (width) {
      setSidebarWidth(width)
    }
  }, [])

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
    api.start({
      x: 0,
      immediate: false,
      config: { ...config.stiff },
      onRest: () => setShowSettings(false)
    })
  }

  // Setup drag gesture for swiping
  useDrag((state) => {
    const {
      xy: [xCord, yCord],
      offset: [xOffset, yOffset],
      direction: [xDirection, yDirection],
      velocity: [xVelocity, yVelocity],
      dragging,
      cancel,
      last,
      canceled,
      first,
    } = state
    
    const xCordEffective = !forceLandscape ? xCord : window.innerHeight - yCord
    const xOffsetEffective = !forceLandscape ? xOffset : -yOffset
    const xVelocityEffective = !forceLandscape ? xVelocity : yVelocity
    const xDirectionEffective = !forceLandscape ? xDirection : -yDirection

    if (first) {
      // If we start dragging from a point further than 1 sidebar width away from the sidebar when the sidebar is closed
      // then ignore the drag
      if (x.get() === 0 && xCordEffective > (x.get() + sidebarWidth)) {
        return cancel()
      }
    }
    if (dragging) {
      // If we drag more than 2x the sidebar width, we cancel the drag and snap back
      if (xDirectionEffective > 0 && xCordEffective / sidebarWidth > 2) {
        cancel()
      } else {
        api.start({ x: xOffsetEffective, immediate: true });
      }
    } else if (last) {
      // Quick but maybe short swipe to the right
      if (xVelocityEffective > 0.5 && xDirectionEffective > 0) {
        open({ canceled })
        // Quick but maybe short swipe to the left
      } else if (xVelocityEffective > 0.5 && xDirectionEffective < 0) {
        close()
        // Swipe to the right past halfway point
      } else if (xOffsetEffective > (sidebarWidth * 0.5)) {
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
    from: () => !forceLandscape ? [x.get(), 0] : [0, -x.get()],
    target: window,
    preventScroll: !forceLandscape,
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
        <div className="body">
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
