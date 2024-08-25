import React, { useEffect, useRef, useState } from "react";
import "./Feed.scss";
import VideoScroller from "../../components/VideoScroller";
import { fetchData } from "../../helpers";
import SettingsTab from "../../components/SettingsTab";
import { Transition } from "react-transition-group";
import { TRANSITION_DURATION } from "../../constants";
import { GroupBase, OptionsOrGroups } from "react-select";
import Loading from "../../components/Loading";

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
  query: string;
  /** Function to set a given filter as a playlist. */
  setFilterHandler: (option: { value: string; label: string }) => void;
}

const FeedPage: React.FC<FeedPageProps> = (props) => {
  /** Get and set the raw scene data from Stash. */
  const [allSceneData, setAllSceneData] = useState<IsceneData[]>([]);

  /** Get and set the processed scene data. */
  const [allProcessedData, setAllProcessedData] = useState<IitemData[]>([]);

  /** Indicates if the app is currently fetching data */
  const [fetchingData, setFetchingData] = useState(false);

  /**
   * ? All scene data is fetched and from Stash on load. However, it is not
   * loaded into the scroller until the user reaches the appropriate point. This
   * reduces the amount of videos loaded at once.
   */
  useEffect(() => {
    // Component is mounted
    let isMounted = true;

    // Set fetching as started
    setFetchingData(true);
    fetchData(props.query).then(
      (res: { data: { findScenes: FindScenesResultType } }) => {
        console.log("fetched");
        if (isMounted) {
          // Process fetched scene data, filtering out invalid scenes
          const processedData = res.data.findScenes.scenes
            .map(processSceneData)
            .filter((d) => !!d);

          // Update the full scene data
          setAllSceneData(processedData);

          // Set fetching as ended
          setFetchingData(false);
        }
      }
    );
    return () => {
      // Unmount component before re-render
      isMounted = false;
    };
  }, [props.query]);

  /** Handles fetching video data */
  const handleProcessingItemData = () => {
    // Once the scene data has been fetched, process it for use in an item.
    const processedItems: IitemData[] = allSceneData.map((sc) => {
      return {
        scene: sc,
        setSettingsTabHandler: handleSetSettingsTab,
        subtitlesOn,
        toggleAudioHandler: handleTogglingAudio,
        toggleFullscreenHandler: handleTogglingFullscreen,
        toggleLetterboxingHandler: handleTogglingFillScreen,
        toggleLoopHandler: handleTogglingLooping,
        toggleSubtitlesHandler: handleTogglingSubtitles,
        toggleUiHandler: handleTogglingUI,
      };
    });
    setAllProcessedData(processedItems);
  };

  /* ---------------------------------- Audio --------------------------------- */

  const [isMuted, setIsMuted] = useState(true);
  const handleTogglingAudio = () => setIsMuted((prev) => !prev);

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

  /* --------------------------------- Looping -------------------------------- */

  const [loopOnEnd, setLoopOnEnd] = useState(false);
  const handleTogglingLooping = () => setLoopOnEnd((prev) => !prev);

  useEffect(() => {
    // Once scene data is loaded, process and queue it into the scroller.
    handleProcessingItemData();
  }, [allSceneData]);

  /* ---------------------------- Randomise scenes ---------------------------- */

  const [isRandomised, setIsRandomised] = useState(false);

  /** Randomise the order of the items in the current playlist. */
  const handleRandomisingItemOrder = (items: IitemData[]) => {
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

  const noScenesAvailable = !fetchingData && allProcessedData.length === 0;

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
  if (fetchingData) return <Loading heading="Fetching scenes..." />;

  return (
    <main data-testid="FeedPage" ref={pageRef}>
      <VideoScroller
        captionsDefault={props.pluginConfig?.subtitleLanguage}
        isFullscreen={isFullscreen}
        isLetterboxed={isLetterboxed}
        isMuted={isMuted}
        items={allProcessedData}
        loopOnEnd={loopOnEnd}
        settingsTabIsVisible={showSettings}
        subtitlesOn={subtitlesOn}
        uiIsVisible={showUI}
      />
      <Transition
        in={showSettings}
        nodeRef={settingsTabRef}
        timeout={TRANSITION_DURATION}
        mountOnEnter
        unmountOnExit
      >
        {(state) => (
          <SettingsTab
            currentFilter={props.currentFilter}
            fetchingData={fetchingData}
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

/** Process individual scene data from Stash to app format. */
const processSceneData = (sc: Scene): IsceneData | null => {
  if (!sc.paths.stream) return null;

  const processedData: IsceneData = {
    date: sc.date ?? undefined,
    format: sc.files[0].format,
    id: sc.id,
    parentStudio: sc.studio?.parent_studio?.name ?? undefined,
    path: sc.paths.stream,
    performers: sc.performers.map((pf) => {
      return { name: pf.name, gender: pf.gender || ("UNKNOWN" as GenderEnum) };
    }),
    studio: sc.studio?.name ?? undefined,
    title: sc.title ?? undefined,
    captions: sc.captions
      ?.map((cap) => {
        if (typeof sc.paths.caption === "string") {
          return {
            format: cap.caption_type,
            lang: cap.language_code,
            source: sc.paths.caption,
          };
        }
      })
      .filter((c) => !!c),
  };

  return processedData;
};
