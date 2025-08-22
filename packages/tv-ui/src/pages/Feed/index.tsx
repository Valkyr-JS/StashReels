import React, { useEffect, useRef, useState } from "react";
import "./Feed.scss";
import VideoScroller from "../../components/VideoScroller";
import SettingsTab from "../../components/SettingsTab";
import { Transition } from "react-transition-group";
import { TRANSITION_DURATION } from "../../constants";
import { GroupBase, OptionsOrGroups } from "react-select";
import Loading from "../../components/Loading";
import * as GQL from "stash-ui/dist/src/core/generated-graphql";
import { PluginConfig, TvItem } from "../../../types/stash-tv";

export type ScenesQueryOptions = Parameters<typeof GQL.useFindScenesForTvQuery>[0]

interface FeedPageProps {
  /** The scene filter currently being used as the playlist. */
  currentFilter:
    | {
        value: string;
        label: string;
      }
    | undefined;
  /** The list of all user scene filters. */
  filterList: OptionsOrGroups<
    {
      value: string;
      label: string;
    },
    GroupBase<{
      value: string;
      label: string;
    }>
  >;
  /** The user's plugin config from Stash. */
  pluginConfig: PluginConfig;
  /** Function to handle updating the user config. */
  pluginUpdateHandler: (partialConfig: PluginConfig) => void;
  /** The GQL query for fetching data. */
  queryOptions: ScenesQueryOptions;
  /** Function to set a given filter as a playlist. */
  setFilterHandler: (option: { value: string; label: string }) => void;
}

const FeedPage: React.FC<FeedPageProps> = (props) => {
  /** Get and set the processed scene data. */
  const [allProcessedData, setAllProcessedData] = useState<TvItem[]>([]);

  const { data: rawSceneData, loading: rawSceneDataLoading } = GQL.useFindScenesForTvQuery(props.queryOptions)
  
  useEffect(() => {
    if (!rawSceneData) return;
    // Once scene data is loaded, process and queue it into the scroller.
    handleProcessingItemData();
  }, [rawSceneData]);

  /** Handles fetching video data */
  const handleProcessingItemData = () => {
    // Once the scene data has been fetched, process it for use in an item.
    const processedItems: TvItem[] = rawSceneData?.findScenes.scenes.map((sc) => {
      return {
        scene: sc,
        setSettingsTabHandler: handleSetSettingsTab,
        subtitlesOn,
        toggleAudioHandler: handleTogglingAudio,
        toggleFullscreenHandler: handleTogglingFullscreen,
        toggleLetterboxingHandler: handleTogglingFillScreen,
        toggleForceLandscapeHandler: handleTogglingForceLandscape,
        toggleLoopHandler: handleTogglingLooping,
        toggleSubtitlesHandler: handleTogglingSubtitles,
        toggleUiHandler: handleTogglingUI,
      };
    }) || [];
    setAllProcessedData(processedItems);
  };

  /* ---------------------------------- Audio --------------------------------- */

  const [isMuted, setIsMuted] = useState(true);
  const handleTogglingAudio = (newState?: boolean) => setIsMuted((prev) => newState !== undefined ? newState : !prev);

  /* ------------------------------- Fullscreen ------------------------------- */

  const [isFullscreen, setIsFullscreen] = useState(false);
  const pageRef = useRef<HTMLElement>(null);

  const handleTogglingFullscreen = () => {
    if (document.fullscreenElement === null) {
      pageRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Watch for fullscreen being changed by events other than the button click.
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  /* ------------------------------ Letterboxing ------------------------------ */

  const [isLetterboxed, setIsLetterboxed] = useState(true);
  const handleTogglingFillScreen = () => {
    console.log("set: ", !isLetterboxed);
    setIsLetterboxed((prev) => !prev);
  };

  /* ------------------------------ Force Landscape ------------------------------ */

  const [isForceLandscape, setIsForceLandscape] = useState<boolean>(
    JSON.parse(window.localStorage.getItem("forceLandscape") || "false")
  );
  const handleTogglingForceLandscape = () => {
    console.log("set: ", !isForceLandscape);
    window.localStorage.setItem("forceLandscape", JSON.stringify(!isForceLandscape));
    setIsForceLandscape((prev) => !prev);
  };

  /* --------------------------------- Looping -------------------------------- */

  const [loopOnEnd, setLoopOnEnd] = useState(false);
  const handleTogglingLooping = () => setLoopOnEnd((prev) => !prev);

  /* ---------------------------- Randomise scenes ---------------------------- */

  const [isRandomised, setIsRandomised] = useState(false);

  /** Randomise the order of the items in the current playlist. */
  const handleRandomisingItemOrder = (items: TvItem[]) => {
    const newOrder = [...items];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    setAllProcessedData(newOrder);
  };

  /** Reset the item order back to its original. */
  const handleResetItemOrder = () => handleProcessingItemData();

  /** Toggle randomising item order on and off. */
  const handleTogglingRandomise = () => {
    let currentState = false;
    setIsRandomised((prev) => {
      const newState = !prev;
      currentState = newState;
      return newState;
    });

    if (currentState) {
      handleRandomisingItemOrder(allProcessedData);
    } else {
      handleResetItemOrder();
    }
  };

  /* ------------------------------ Settings tab ------------------------------ */

  const [showSettings, setShowSettings] = useState(false);
  const settingsTabRef = useRef<HTMLDivElement>(null);
  const handleSetSettingsTab = (show: boolean) => setShowSettings(show);

  const noScenesAvailable = !rawSceneDataLoading && rawSceneData?.findScenes.scenes.length === 0;

  /* -------------------------------- Subtitles ------------------------------- */

  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const handleTogglingSubtitles = () => setSubtitlesOn((prev) => !prev);


  /* ----------------------------------- UI ----------------------------------- */

  const [showUI, setShowUI] = useState(true);

  const handleTogglingUI = () => {
    setShowUI((prev) => !prev);
  };

  /* -------------------------------- component ------------------------------- */

  // Show loading icon when fetching data
  if (rawSceneDataLoading && !showSettings)
    return <Loading heading="Fetching scenes..." />;

  return (
    <main data-testid="FeedPage" ref={pageRef}>
      <VideoScroller
        captionsDefault={props.pluginConfig?.subtitleLanguage}
        isFullscreen={isFullscreen}
        isLetterboxed={isLetterboxed}
        isForceLandscape={isForceLandscape}
        isMuted={isMuted}
        items={allProcessedData}
        loopOnEnd={loopOnEnd}
        settingsTabIsVisible={showSettings}
        subtitlesOn={subtitlesOn}
        uiIsVisible={showUI}
      />
      <Transition
        in={showSettings || noScenesAvailable}
        nodeRef={settingsTabRef}
        timeout={TRANSITION_DURATION}
        mountOnEnter
        unmountOnExit
      >
        {(state) => (
          <SettingsTab
            currentFilter={props.currentFilter}
            fetchingData={rawSceneDataLoading}
            filterList={props.filterList}
            isRandomised={isRandomised}
            pluginConfig={props.pluginConfig}
            pluginUpdateHandler={props.pluginUpdateHandler}
            ref={settingsTabRef}
            scenelessFilter={noScenesAvailable}
            setFilterHandler={props.setFilterHandler}
            setIsRandomised={handleTogglingRandomise}
            setSettingsTabHandler={handleSetSettingsTab}
            transitionStatus={noScenesAvailable ? "entered" : state}
          />
        )}
      </Transition>
    </main>
  );
};

export default FeedPage;
