import { useEffect } from "react";
import { updateReadOnlyProps } from "../helpers";
import { useFirstMountState } from "react-use";
import cx from "classnames";
import "./useViewportRotate.css";

// Exactly like useEffect but the first run happens synchronously on first render
function useEffectKeen(effect: () => void | (() => void), deps: React.DependencyList) {
  const isFirstMount = useFirstMountState();
  const firstRunResult = isFirstMount ? effect() : undefined;
  useEffect(() => {
    if (isFirstMount) {
      return firstRunResult;
    } else {
      return effect();
    }
  }, deps);
}

export function useViewportRotate(rotationEnabled: boolean) {
  const isFirstMount = useFirstMountState();

  // <html /> is outside of React's control so we have to set the class manually
  document.documentElement.className = cx({ "force-landscape": rotationEnabled });

  // Remap innerWidth/innerHeight
  useEffectKeen(() => {
    if (!rotationEnabled) return;

    const originalDescriptorInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight');
    const originalDescriptorInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');

    Object.defineProperty(window, 'innerHeight', {
      get() {
        return originalDescriptorInnerWidth?.get?.call(window)
      },
      configurable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      get() {
        return originalDescriptorInnerHeight?.get?.call(window)
      },
      configurable: true
    });

    return () => {
      if (originalDescriptorInnerHeight)
        Object.defineProperty(window, 'innerHeight', originalDescriptorInnerHeight);
      if (originalDescriptorInnerWidth)
        Object.defineProperty(window, 'innerWidth', originalDescriptorInnerWidth);
    }
  }, [rotationEnabled])

  // Remap mouse events
  useEffectKeen(() => {
    if (!rotationEnabled) return;

    function remapMouseEventForLandscapeMode(event: MouseEvent) {
      const effectiveClientX = window.innerWidth - event.clientY
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
    window.addEventListener("click", remapMouseEventForLandscapeMode, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("pointermove", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("pointerup", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("mousedown", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("mousemove", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("mouseup", remapMouseEventForLandscapeMode, { capture: true });
      window.removeEventListener("click", remapMouseEventForLandscapeMode, { capture: true });
    }
  }, [rotationEnabled])

  // Remap touch events
  useEffectKeen(() => {
    if (!rotationEnabled) return;

    function remapTouchEventForLandscapeMode(event: TouchEvent) {
      function remapTouch(touch: Touch) {
        const effectiveClientX = window.innerWidth - touch.clientY
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
        const effectivePageX = window.innerWidth - event.pageY
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

  // Remap getBoundingClientRect()
  useEffectKeen(() => {
    if (!rotationEnabled) return;

    const originalGetBoundingClientRectFunc = Element.prototype.getBoundingClientRect;

    Element.prototype.getBoundingClientRect = function(...args) {
      // It seems like getBoundingClientRect knows an element has been rotated and so will measure the dimensions of the
      // rotated element. That means width becomes height and vice versa. The x and y coordinates are now measured from
      // the same viewport edges but to the new closest edges on the element.
      const viewportRect = originalGetBoundingClientRectFunc.apply(document.documentElement, args);
      const elementRect = originalGetBoundingClientRectFunc.apply(this, args);

      return new DOMRect(
        (viewportRect.height + viewportRect.y) - (elementRect.y + elementRect.height),
        elementRect.x,
        elementRect.height,
        elementRect.width
      );
    };

    return () => {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRectFunc;
    }
  }, [rotationEnabled])

  // Trigger a resize event when rotationEnabled changes to force re-layout. Deliberately run after all the other
  // effects above have run.
  useEffect(() => {
    if (isFirstMount) return;
    window.dispatchEvent(new Event("resize"));
  }, [rotationEnabled])
}
