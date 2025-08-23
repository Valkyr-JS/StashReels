import React, { useEffect, useRef } from "react";
import "./Feed.scss";
import VideoScroller from "../../components/VideoScroller";
import { useAppStateStore } from "../../store/appStateStore";
import SettingsTab from "../../components/SettingsTab";
import { Transition } from "react-transition-group";
import { TRANSITION_DURATION } from "../../constants";
import Loading from "../../components/Loading";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";

export type ScenesQueryOptions = Parameters<typeof GQL.useFindScenesForTvQuery>[0]

interface FeedPageProps {}

const FeedPage: React.FC<FeedPageProps> = () => {
  const { scenesLoading, scenes, showSettings, fullscreen } = useAppStateStore();

  // Settings tab
  const settingsTabRef = useRef<HTMLDivElement>(null);
  const noScenesAvailable = !scenesLoading && scenes.length === 0;
  
  /* ------------------------------- Fullscreen ------------------------------- */
  const pageRef = useRef<HTMLElement>(null);
  const initialLoad = useRef(true);
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (fullscreen) {
      pageRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [fullscreen]);

  /* -------------------------------- component ------------------------------- */

  // Show loading icon when fetching data
  if (scenesLoading && !showSettings)
    return <Loading heading="Fetching scenes..." />;

  return (
  <main data-testid="FeedPage" ref={pageRef}>
      <VideoScroller />
      <Transition
        in={showSettings || noScenesAvailable}
        nodeRef={settingsTabRef}
        timeout={TRANSITION_DURATION}
        mountOnEnter
        unmountOnExit
      >
        {(state) => (
          <SettingsTab
            ref={settingsTabRef}
            transitionStatus={noScenesAvailable ? "entered" : state}
          />
        )}
      </Transition>
    </main>
  );
};

export default FeedPage;
