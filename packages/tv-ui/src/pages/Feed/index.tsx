import React, { useEffect, useRef } from "react";
import "./Feed.scss";
import VideoScroller from "../../components/VideoScroller";
import { useAppStateStore } from "../../store/appStateStore";
import SettingsTab from "../../components/SettingsTab";
import Loading from "../../components/Loading";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { useMediaItems } from "../../hooks/useMediaItems";
import { useMediaItemFilters } from "../../hooks/useMediaItemFilters";
import GuideOverlay from "../../components/GuideOverlay";

export type ScenesQueryOptions = Parameters<typeof GQL.useFindScenesForTvQuery>[0]

interface FeedPageProps {
  className?: string;
}

const FeedPage: React.FC<FeedPageProps> = ({className}) => {
  const { showSettings, fullscreen, showGuideOverlay, set: setAppSetting } = useAppStateStore();
  const { mediaItemFiltersLoading } = useMediaItemFilters()
  const { mediaItems, mediaItemsLoading } = useMediaItems()

  const loadedButNoScenes = !mediaItemFiltersLoading && !mediaItemsLoading && mediaItems.length === 0

  // Show settings tab if we've finished loading scenes but have no scenes to show
  if (loadedButNoScenes && !showSettings) {
    setAppSetting("showSettings", true);
  }
  
    useEffect(() => {
      if (!showGuideOverlay) return;
      setAppSetting("showSettings", false);
    }, [showGuideOverlay]);
  
  /* ------------------------------- Fullscreen ------------------------------- */
  const initialLoad = useRef(true);
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (fullscreen) {
      document.scrollingElement?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [fullscreen]);

  /* -------------------------------- component ------------------------------- */

  return (
  <main data-testid="FeedPage" className={className}>
      {(mediaItemFiltersLoading || mediaItemsLoading) && <Loading heading="Fetching media..." />}
      {mediaItems.length > 0 && <VideoScroller />}
      {loadedButNoScenes && <div>No Media Found</div>}
      {showGuideOverlay && <GuideOverlay onClose={() => setAppSetting("showGuideOverlay", false)} />}
      <SettingsTab />
    </main>
  );
};

export default FeedPage;
