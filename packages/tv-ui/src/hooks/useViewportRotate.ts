import { useEffect } from "react";
import { updateReadOnlyProps } from "../helpers";
import { useFirstMountState } from "react-use";
import cx from "classnames";
import "./useViewportRotate.css";


export function useViewportRotate(rotationEnabled: boolean) {
  const isFirstMount = useFirstMountState();

  // <html /> is outside of React's control so we have to set the class manually
  document.documentElement.className = cx({ "force-landscape": rotationEnabled });

  // Remap mouse events
  useEffect(() => {
    if (!rotationEnabled) return;

    function remapMouseEventForLandscapeMode(event: MouseEvent) {
      const effectiveClientX = window.innerHeight - event.clientY
      const effectiveClientY = event.clientX
      const effectiveMovementX = -event.movementY
      const effectiveMovementY = event.movementX

      updateReadOnlyProps(event, {
        clientX: effectiveClientX,
        clientY: effectiveClientY,
        movementX: effectiveMovementX,
        movementY: effectiveMovementY,
        x: effectiveClientX,
        y: effectiveClientY,
        pageX: effectiveClientX,
        pageY: effectiveClientY,
      });
    }

    window.addEventListener("pointerdown", remapMouseEventForLandscapeMode, { capture: true });
    window.addEventListener("pointermove", remapMouseEventForLandscapeMode, { capture: true });
    window.addEventListener("pointerup", remapMouseEventForLandscapeMode, { capture: true });
    window.addEventListener("mousedown", remapMouseEventForLandscapeMode, { capture: true });
    window.addEventListener("mousemove", remapMouseEventForLandscapeMode, { capture: true });
    window.addEventListener("mouseup", remapMouseEventForLandscapeMode, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("pointermove", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("pointerup", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("mousedown", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("mousemove", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("mouseup", remapMouseEventForLandscapeMode, { capture: true });
    }
  }, [rotationEnabled])

  // Remap touch events
  useEffect(() => {
    if (!rotationEnabled) return;

    function remapTouchEventForLandscapeMode(event: TouchEvent) {
      function remapTouch(touch: Touch) {
        const effectiveClientX = window.innerHeight - touch.clientY
        const effectiveClientY = touch.clientX
        return new Touch({
          ...('altitudeAngle' in touch && typeof touch.altitudeAngle === 'number' ? { altitudeAngle: touch.altitudeAngle } : {}),
          ...('azimuthAngle' in touch && typeof touch.azimuthAngle === 'number' ? { azimuthAngle: touch.azimuthAngle } : {}),
          clientX: effectiveClientX,
          clientY: effectiveClientY,
          force: touch.force,
          identifier: touch.identifier,
          pageX: effectiveClientX,
          pageY: effectiveClientY,
          radiusX: touch.radiusX,
          radiusY: touch.radiusY,
          rotationAngle: touch.rotationAngle,
          screenX: effectiveClientX,
          screenY: effectiveClientY,
          target: touch.target,
          ...('touchType' in touch ? { touchType: touch.touchType as TouchType } : {}),
        })
      }

      if ('pageX' in event && typeof event.pageX === 'number' && 'pageY' in event && typeof event.pageY === 'number') {
        const effectivePageX = window.innerHeight - event.pageY
        const effectivePageY = event.pageX

        updateReadOnlyProps(event, {
          pageX: effectivePageX,
          pageY: effectivePageY,
        })
      }

      // We don't want to create a new touch event since doing so would loose it's trusted status. But there doesn't
      // appear we have to create new Touch objects for our changes to stick and we can't update or directly create a
      // new TouchList. We can however create a TouchList indirectly by creating a new TouchEvent and copying
      // out it's TouchList properties.
      const newTouchEvent = new TouchEvent("touchstart", {
        touches: Array.from(event.touches).map(remapTouch),
        targetTouches: Array.from(event.targetTouches).map(remapTouch),
        changedTouches: Array.from(event.changedTouches).map(remapTouch),
      });

      updateReadOnlyProps(event, {
        touches: newTouchEvent.touches,
        changedTouches: newTouchEvent.changedTouches,
        targetTouches: newTouchEvent.targetTouches,
      })
    }

    window.addEventListener("touchstart", remapTouchEventForLandscapeMode, { capture: true });
    window.addEventListener("touchmove", remapTouchEventForLandscapeMode, { capture: true });
    window.addEventListener("touchend", remapTouchEventForLandscapeMode, { capture: true });
    return () => {
      window.removeEventListener("touchstart", remapTouchEventForLandscapeMode, { capture: true });
      window.removeEventListener("touchmove", remapTouchEventForLandscapeMode, { capture: true });
      window.removeEventListener("touchend", remapTouchEventForLandscapeMode, { capture: true });
    }
  }, [rotationEnabled])
}
