import React, { useEffect, useRef } from "react";
import "./Feed.scss";
import VideoScroller from "../../components/VideoScroller";
import { useAppStateStore } from "../../store/appStateStore";
import SettingsTab from "../../components/SettingsTab";
import Loading from "../../components/Loading";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useScenes } from "../../hooks/useScenes";

export type ScenesQueryOptions = Parameters<typeof GQL.useFindScenesForTvQuery>[0]

interface FeedPageProps {
  className?: string;
}

const FeedPage: React.FC<FeedPageProps> = ({className}) => {
  const { showSettings, setShowSettings, sceneFilterLoading, fullscreen } = useAppStateStore();
  const { scenes, scenesLoading } = useScenes()
  
  const loadedButNoScenes = !sceneFilterLoading && !scenesLoading && scenes.length === 0
  
  // Show settings tab if we've finished loading scenes but have no scenes to show
  if (loadedButNoScenes && !showSettings) {
    setShowSettings(true);
  }
  
  /* ------------------------------- Fullscreen ------------------------------- */
  const pageRef = useRef<HTMLElement>(null);
  const initialLoad = useRef(true);
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (fullscreen) {
      pageRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [fullscreen]);

  /* -------------------------------- component ------------------------------- */

  return (
  <main data-testid="FeedPage" ref={pageRef} className={className}>
      {scenesLoading && <Loading heading="Fetching scenes..." />}
      {scenes.length > 0 && <VideoScroller />}
      {loadedButNoScenes && <div>No Scenes Found</div>}
      <SettingsTab />
    </main>
  );
};

export default FeedPage;
