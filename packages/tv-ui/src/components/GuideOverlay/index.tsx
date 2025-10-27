import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import "./GuideOverlay.css";
import { Button } from "react-bootstrap";

type GuideOverlayProps = {
  onClose: () => void;
}

const GuideOverlay: React.FC<GuideOverlayProps> = (props) => {
  return (
    <dialog
      className="GuideOverlay"
      data-testid="GuideOverlay"
      open
    >
      <div className="header">
        <h1>Using Stash TV</h1>
      </div>
      <div className="spacer row-top col-left"></div>
      <div className="spacer row-top col-middle"></div>
      <div className="spacer row-top col-right"></div>
      <div className="body row-middle col-left">
        <FontAwesomeIcon icon={faClockRotateLeft} />
        <span>Tap the left side or press the <kbd>←</kbd> key to skip backwards by a little bit.</span>
      </div>
      <div className="body row-middle col-middle">
        <FontAwesomeIcon icon={faPlay} />
        <span>Tap the middle or press <kbd>space</kbd> to play/pause the video.</span>
      </div>
      <div className="body row-middle col-right">
        <FontAwesomeIcon icon={faClockRotateLeft} flip="horizontal" />
        <span>Tap the right side or press the <kbd>→</kbd> key to skip forwards by a little bit.</span>
      </div>
      <div className="spacer row-bottom col-left"></div>
      <div className="spacer row-bottom col-middle"></div>
      <div className="spacer row-bottom col-right"></div>
      <div className="footer">
        <span>Swipe up or down or press the <kbd>↑</kbd> or <kbd>↓</kbd> keys to scroll between videos. </span>
        <div className="actions">
          <span className="accessInstructions">You can view this guide again in the Settings.</span>
          <Button onClick={props.onClose}>Done</Button>
        </div>
      </div>
    </dialog>
  );
};

export default GuideOverlay;
