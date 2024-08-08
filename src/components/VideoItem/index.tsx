import ISO6391 from "iso-639-1";
import React, { useEffect, useRef, useState } from "react";
import { Scrubber } from "react-scrubber";
import * as styles from "./VideoItem.module.scss";
import { useIsInViewport } from "../../hooks";
import "./VideoItem.scss";
import { default as cx } from "classnames";

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

  /* -------------------------------- Scrubber -------------------------------- */

  const [sceneProgress, setSceneProgress] = useState(0);

  /** Handle updating the scrubber position when the scene is playing */
  const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = (e) => {
    const target = e.target as HTMLVideoElement;
    const { currentTime, duration } = target;
    const newTimePercentage = (currentTime / duration) * 100;
    setSceneProgress(newTimePercentage);
  };

  /** Handle updating the current position of the scene when moving the
   * scrubber. */
  const handleScrubChange = (value: number) => {
    setSceneProgress(value);
    if (videoRef.current) {
      videoRef.current.currentTime = (videoRef.current.duration / 100) * value;
    }
  };

  /* -------------------------------- Component ------------------------------- */

  return (
    <div className={styles.container} data-testid="VideoItem--container">
      <video
        data-testid="VideoItem--video"
        id={props.scene.id}
        muted={props.isMuted || !isInViewport}
        onClick={togglePlayHandler}
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={props.scene.path} type={`video/${props.scene.format}`} />
        {captionSources}
      </video>
      <div className={styles.controls}>
        <button
          data-testid="VideoItem--muteButton"
          onClick={muteButtonClickHandler}
          type="button"
        >
          Mute
        </button>
        <button
          data-testid="VideoItem--subtitlesButton"
          onClick={() => console.log("subtitles button")}
          type="button"
        >
          Subs
        </button>
        <button
          data-testid="VideoItem--infoButton"
          onClick={() => console.log("scene info")}
          type="button"
        >
          Info
        </button>
        <button
          data-testid="VideoItem--faveButton"
          onClick={() => console.log("favourite")}
          type="button"
        >
          Fave
        </button>
        <button
          data-testid="VideoItem--rateButton"
          onClick={() => console.log("rating")}
          type="button"
        >
          Rate
        </button>
        <button
          data-testid="VideoItem--loopButton"
          onClick={() => console.log("loop scene")}
          type="button"
        >
          Loop
        </button>
        <button
          data-testid="VideoItem--configButton"
          onClick={() => console.log("config settings")}
          type="button"
        >
          Conf
        </button>
        <button
          data-testid="VideoItem--showUiButton"
          onClick={() => console.log("show/hide UI")}
          type="button"
        >
          UI
        </button>
      </div>
      <div className={cx("scrubber-container", styles.scrubber)}>
        <Scrubber
          min={0}
          max={100}
          value={sceneProgress}
          onScrubChange={handleScrubChange}
          onScrubEnd={handleScrubChange}
          onScrubStart={handleScrubChange}
        />
      </div>
    </div>
  );
};

export default VideoItem;
