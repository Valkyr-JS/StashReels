import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import "./GuideOverlay.css";

type GuideOverlayProps = {
  onClose: () => void;
}

const GuideOverlay: React.FC<GuideOverlayProps> = (props) => {
  return (
    <dialog className="GuideOverlay" data-testid="GuideOverlay" open>
      <div className="main row-top col-left"></div>
      <div className="main row-top col-middle"></div>
      <div className="main row-top col-right"></div>
      <div className="main row-middle col-left">
        <FontAwesomeIcon icon={faClockRotateLeft} />
        <span>Tap this area or press the <kbd>←</kbd> key to skip backwards by a little bit.</span>
      </div>
      <div className="main row-middle col-middle">
        <FontAwesomeIcon icon={faPlay} />
        <span>Tap this area play/pause the video.</span>
      </div>
      <div className="main row-middle col-right">
        <FontAwesomeIcon icon={faClockRotateLeft} flip="horizontal" />
        <span>Tap this area or press the <kbd>→</kbd> key to skip forwards by a little bit.</span>
      </div>
      <div className="main row-bottom col-left"></div>
      <div className="main row-bottom col-middle"></div>
      <div className="main row-bottom col-right"></div>
      <div className="footer">
        <span>Swipe up and down or press the <kbd>↑</kbd> or <kbd>↓</kbd> scroll between videos. </span>
        <div className="actions">
          You can show this guide again in Settings.
          <button onClick={props.onClose}>Done</button>
        </div>
      </div>
    </dialog>
  );
};

export default GuideOverlay;
