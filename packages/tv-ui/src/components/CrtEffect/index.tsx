// Based off: https://codepen.io/GLITCHXploitR/pen/OxGKrq

import "./CrtEffect.scss";
import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";

type Props = {
  enabled?: boolean;
  children?: React.ReactNode;
};

export default function CrtEffect(props: Props) {
  const enabled = props.enabled ?? true;
  const [tvState, setTvState] = useState<"off" | "on" | "turning-off">("off")
  useEffect(() => {
    if (enabled) {
      if (tvState !== "on") {
        const timeoutId = setTimeout(() => setTvState("on"), 1000)
        return () => clearTimeout(timeoutId)
      }
    } else {
      if (tvState === "on") {
        setTvState("turning-off")
        const timeoutId = setTimeout(() => setTvState("off"), 750)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [props.enabled])

  const rootElmRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const rootElm = rootElmRef.current
    const canvasElm = rootElm?.querySelector('canvas')
    if (!canvasElm) return
    const windowWidth = window.innerWidth;
    let frame: number;

    // Set canvas size
    canvasElm.width = windowWidth / 3;
    canvasElm.height = (windowWidth * 0.5625) / 3;

    // Generate CRT noise
    function snow(canvasElm: HTMLCanvasElement) {
      const canvasContext = canvasElm.getContext('2d')
      if (!canvasContext) return

      var w = canvasContext.canvas.width,
        h = canvasContext.canvas.height,
        d = canvasContext.createImageData(w, h),
        b = new Uint32Array(d.data.buffer),
        len = b.length;

      for (var i = 0; i < len; i++) {
        b[i] = ((255 * Math.random()) | 0) << 24;
      }

      canvasContext.globalAlpha = 0.4;
      canvasContext.putImageData(d, 0, 0);
    }

    function animate() {
      if (!canvasElm) return;
      snow(canvasElm);
      frame = requestAnimationFrame(animate);
    }

    const timeoutId = setTimeout(animate, 1000);
    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(frame);
    };
  }, []);


  return (
    <div className={cx("CrtEffect", `tv-${tvState}`, { "disabled": !enabled && tvState !== "turning-off" })} ref={rootElmRef}>
      <canvas id="canvas" className="picture"></canvas>
      <div className="text">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i}>AV-1</span>
        ))}
      </div>
      <div className="content">
        {props.children}
      </div>
      <div className="background"></div>
    </div>
  );
}
