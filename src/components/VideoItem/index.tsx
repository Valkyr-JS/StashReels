import ISO6391 from "iso-639-1";
import React, { useEffect, useRef } from "react";
import * as styles from "./VideoItem.module.scss";
import { useIsInViewport } from "../../hooks";

export interface VideoItemProps extends IitemData {
  /** The audio state set by the user. */
  isMuted: boolean;
  /** Function for handling loading more videos data. */
  loadMoreVideosHandler: (index: number) => void;
  /** Function for handling toggling video audio on and off. */
  toggleAudioHandler: () => void;
}

const VideoItem: React.FC<VideoItemProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  /** Check if at least 80% of the video is in the viewport. */
  const isInViewport = useIsInViewport(videoRef, {
    threshold: 0.8,
  });

  useEffect(() => {
    // Play the video if it is currently in the viewport, otherwise pause it.
    if (isInViewport && videoRef.current) videoRef.current.play();
    else videoRef.current?.pause();

    // Fetch more videos if required
    if (isInViewport) props.loadMoreVideosHandler(props.index);
  }, [isInViewport]);

  /** Handle toggling the video play state. */
  const togglePlayHandler = () =>
    videoRef.current?.paused
      ? videoRef.current.play()
      : videoRef.current?.pause();

  /** Only render captions track if available. Fails accessibility if missing,
   * but there's no point rendering an empty track. */
  const captionSources = props.scene.captions
    ? props.scene.captions.map((cap, i) => {
        const src = cap.source + `?lang=${cap.lang}&type=${cap.format}`;
        return (
          <track
            key={i}
            kind="captions"
            label={ISO6391.getName(cap.lang) || "Unknown"}
            src={src}
            srcLang={cap.lang}
          />
        );
      })
    : null;

  /* ----------------------------- Audio handling ----------------------------- */

  /** Handle clicking the mute button */
  const muteButtonClickHandler = () => {
    if (isInViewport) props.toggleAudioHandler();
  };

  // Update the mute property via the ref object
  useEffect(() => {
    if (isInViewport && videoRef.current)
      videoRef.current.muted = props.isMuted;
  }, [props.isMuted]);

  /* -------------------------------- Component ------------------------------- */

  return (
    <div className={styles.container} data-testid="VideoItem--container">
      <video
        data-testid="VideoItem--video"
        id={props.scene.id}
        muted={props.isMuted || !isInViewport}
        onClick={togglePlayHandler}
        ref={videoRef}
      >
        <source src={props.scene.path} type={`video/${props.scene.format}`} />
        {captionSources}
      </video>
      <button
        data-testid="VideoItem--muteButton"
        onClick={muteButtonClickHandler}
        style={{ position: "absolute" }}
      >
        Mute
      </button>
    </div>
  );
};

export default VideoItem;
