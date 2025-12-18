import React, { memo } from "react";
import { create } from "zustand";
import "./FeedbackOverlay.css";
import cx from "classnames";
import { usePrevious } from "react-use";
import { getLogger } from "@logtape/logtape";
import { useAppStateStore } from "../../store/appStateStore";

const displayDuration = 1000; // milliseconds

const logger = getLogger(["stash-tv", "FeedbackOverlay"]);

export const useFeedback = create<{
  contents: React.ReactNode,
  icon: React.ReactNode,
  displayCountdown?: NodeJS.Timeout,
  fade: boolean,
  setFeedback: (
    contents: React.ReactNode,
    options?: {
      hold?: boolean,
      fade?: boolean,
      icon?: React.ReactNode,
    }
  ) => void,
}>((set, get) => ({
  contents: null,
  fade: true,
  icon: null,
  setFeedback: (contents: React.ReactNode, {hold, fade = true, icon} = {}) => {
    if (get().displayCountdown) {
      clearTimeout(get().displayCountdown as NodeJS.Timeout)
    }
    const displayCountdown = hold || !contents
      ? undefined
      : setTimeout(() => {
        logger.debug("Clearing feedback")
        set({contents: null, displayCountdown: undefined, icon: icon ?? null})
      }, displayDuration)
    if (get().contents !== contents || get().displayCountdown !== displayCountdown || get().fade !== fade) {
      logger.debug("Setting feedback{*}", {contents, hold, fade})
      set({ contents, displayCountdown, fade, icon: icon ?? null })
    }
  },
}))

const FeedbackOverlay = memo(() => {
  const { uiVisible } = useAppStateStore()
  const { contents, icon, fade } = useFeedback()
  const previousContents = usePrevious(contents)
  const previousIcon = usePrevious(icon)

  const displayedContents = !contents ? previousContents : contents
  const displayedIcon = !contents ? previousIcon : icon
  if (!displayedContents || (!contents && !fade)) return null
  return <div className={cx("FeedbackOverlay", { "fade-out": !contents && fade, "muted": !uiVisible })}>
    <div className="contents-container">
      {displayedIcon}
      {displayedContents}
    </div>
  </div>
})

export default FeedbackOverlay
