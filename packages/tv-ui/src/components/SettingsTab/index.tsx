import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import ISO6391 from "iso-639-1";
import React, { useEffect, useMemo } from "react";
import Select from "react-select";
import "./SettingsTab.scss";
import { useStashConfigStore } from "../../store/stashConfigStore";
import { useAppStateStore } from "../../store/appStateStore";
import SideDrawer from "../SideDrawer";
import { useMediaItems } from "../../hooks/useMediaItems";
import { useApolloClient, type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import { useMediaItemFilters } from "../../hooks/useMediaItemFilters";
import { Button, Form } from "react-bootstrap";
import cx from "classnames";

export default function SettingsTab() {
  const { updateStashTvConfig, tv: {subtitleLanguage} } = useStashConfigStore();
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const {
    mediaItemFiltersLoading,
    mediaItemFiltersError,
    currentMediaItemFilter,
    setCurrentMediaItemFilterById,
    clearCurrentMediaItemFilter,
    availableSavedFilters,
  } = useMediaItemFilters()

  const { 
    isRandomised,
    crtEffect,
    scenePreviewOnly,
    onlyShowMatchingOrientation,
    debugMode,
    autoPlay,
    set: setAppSetting
  } = useAppStateStore();
  const { mediaItems, mediaItemsLoading } = useMediaItems()

  const noMediaItemsAvailable = !mediaItemFiltersLoading && !mediaItemsLoading && mediaItems.length === 0
  
  const [mediaFilterType, setMediaFilterType] = React.useState<"scene" | "marker">("scene");
  useEffect(() => {
    if (!currentMediaItemFilter) return;
    setMediaFilterType(currentMediaItemFilter.entityType);
  }, [currentMediaItemFilter]);


  /* --------------------------- Fetching data alert -------------------------- */

  const fetchingDataWarning = mediaItemsLoading ? (
    <div className='warning'>
      <h2>
        <FontAwesomeIcon icon={faSpinner} pulse />
        <span>Fetching data from Stash...</span>
      </h2>
      <p>Please wait while data is loaded.</p>
    </div>
  ) : null;

  /* ---------------------------------- Forms --------------------------------- */

  // 1. Select a media filter
  const filterTypes = [
    {
      label: "Scenes",
      value: "scene",
    },
    {
      label: "Markers",
      value: "marker",
    },
  ] as const;
  const filters = useMemo(
    () => availableSavedFilters
      .filter(filter => filter.entityType === mediaFilterType)
      .map(filter => ({
        value: filter.id,
        label: filter.name + (filter.isStashTvDefaultFilter ? " (default)" : ""),
        isStashTvDefaultFilter: filter.isStashTvDefaultFilter,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [availableSavedFilters, mediaFilterType]
  )
  const selectedFilter = filters.find(filter => filter.value === currentMediaItemFilter?.savedFilter?.id)

  // 2. Set current filter as default

  // 3. Randomise filter order

  // 4. Set subtitles language
  const subtitlesList = ISO6391.getAllNames()
    .map((name) => ({
      label: name,
      value: ISO6391.getCode(name),
    }))
    .sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });

  const defaultSubtitles = subtitleLanguage
    ? {
      label: ISO6391.getName(subtitleLanguage),
      value: subtitleLanguage,
    }
    : undefined;
  
  const titleRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!titleRef.current) return;
    let enableDebugModeTimer: NodeJS.Timeout | undefined;
    const handlePointerDown = () => {
      enableDebugModeTimer = setTimeout(() => {
        setAppSetting("debugMode", true);
      }, 5000);
    };
    const handlePointerUp = () => {
      clearTimeout(enableDebugModeTimer);
    };
    titleRef.current.addEventListener("pointerdown", handlePointerDown)
    titleRef.current.addEventListener("pointerup", handlePointerUp)
    return () => {
      titleRef.current?.removeEventListener("pointerdown", handlePointerDown)
      titleRef.current?.removeEventListener("pointerup", handlePointerUp)
    }
      
  }, [titleRef])

  /* -------------------------------- Component ------------------------------- */
  
  return <SideDrawer
    title={<span ref={titleRef}>Settings</span>}
    closeDisabled={noMediaItemsAvailable || mediaItemsLoading || Boolean(mediaItemFiltersError)}
    className="SettingsTab"
  >
    <div className="item">
      <label htmlFor="filter-type">
        Media Type
      </label>
      {/* We use the "react-select" class name so that stash styles are applied */}
      <Select
        inputId="filter-type"
        className={cx("react-select")}
        classNamePrefix="react-select"
        value={filterTypes.find(ft => ft.value === mediaFilterType)}
        onChange={(newValue) => {
          if (!newValue) return;
          setMediaFilterType(newValue.value);
          if (newValue.value !== currentMediaItemFilter?.entityType) clearCurrentMediaItemFilter();
        }}
        options={filterTypes}
        placeholder={"Select filter type"}
      />
    </div>
    <div className="item">
      <label htmlFor="filter">
        {filterTypes.find(type => type.value === mediaFilterType)?.label} Filter
      </label>
      {/* We use the "react-select" class name so that stash styles are applied */}
      {!mediaItemFiltersLoading ? (
        <Select
          inputId="filter"
          className={cx("react-select")}
          classNamePrefix="react-select"
          value={selectedFilter ?? null}
          onChange={(newValue) => newValue && setCurrentMediaItemFilterById(newValue.value)}
          options={filters}
          placeholder={`${filters.length > 0 ? "No filter selected" : "No filters saved in stash"}. Showing all scenes.`}
        />
      ) : (
        <div>Loading...</div>
      )}
      <small>
        Choose a scene filter from Stash to use as your Stash TV
        filter
      </small>

      {fetchingDataWarning}
      {mediaItemFiltersError ? (
        <div className="error">
          <h2>An error occurred loading scene filters.</h2>
          <p>
            Try reloading the page.
          </p>
        </div>
      ) : null}
      {noMediaItemsAvailable && (
        <div className="error">
          <h2>Filter contains no scenes!</h2>
          <p>
            No scenes were found in the currently selected filter. Please choose
            a different one.
          </p>
        </div>
      )}
    </div>

    {selectedFilter && !selectedFilter.isStashTvDefaultFilter && <div className="item">
      <Button
        onClick={() => {
          updateStashTvConfig(
            apolloClient,
            {
              defaultFilterId: selectedFilter?.value,
            }
          );
        }}
      >
        Set "{selectedFilter?.label}" as the default filter
      </Button>
      <div>
        <small>
          Set the currently selected scene filter as the default filter
          when opening Stash TV.
        </small>
      </div>
    </div>}

    <div className="item checkbox-item">
      {currentMediaItemFilter?.savedFilter?.find_filter?.sort?.startsWith("random_") ? (
        <span>Filter sort order is random</span>
      ) : <>
          <Form.Switch
            id="randomise-filter"
            checked={isRandomised}
            label="Randomise filter order"
            onChange={event => {console.log(event); setAppSetting("isRandomised", event.target.checked)}}
          />
        <small>Randomise the order of scenes in the filter.</small>
      </>}
    </div>

    <div className="item">
      <label htmlFor="subtitle-language">
        Subtitle language
      </label>
      {/* We use the "react-select" class name so that stash styles are applied */}
      <Select
        inputId="subtitle-language"
        className={cx("react-select")}
        classNamePrefix="react-select"
        value={defaultSubtitles}
        onChange={(newValue) => {
          if (!newValue) return;
          updateStashTvConfig(
            apolloClient,
            {
              subtitleLanguage: newValue.value,
            }
          );
        }}
        options={subtitlesList}
        placeholder="Select a subtitle language"
      />
      <small>
        Select the language to use for subtitles if available.
      </small>
    </div>

    <div className="item checkbox-item">
      <Form.Switch
        id="scene-preview-only"
        label="Scene Preview Only"
        checked={scenePreviewOnly}
        onChange={event => setAppSetting("scenePreviewOnly", event.target.checked)}
      />
      <small>Play a short preview rather than the full scene. (Requires the preview files to have been generated in Stash for a scene otherwise the full scene will be shown.)</small>
    </div>

    <div className="item checkbox-item">
      <Form.Switch
        id="only-show-matching-orientation"
        label="Only Show Scenes Matching Orientation"
        checked={onlyShowMatchingOrientation}
        onChange={event => setAppSetting("onlyShowMatchingOrientation", event.target.checked)}
      />
      <small>Limit scenes to only those in the same orientation as the current window.</small>
    </div>

    <div className="item checkbox-item">
      <Form.Switch
        id="auto-play"
        label="Auto Play"
        checked={autoPlay}
        onChange={event => setAppSetting("autoPlay", event.target.checked)}
      />
      <small>Automatically play scenes.</small>
    </div>

    <div className="item checkbox-item">
      <Form.Switch
        id="crt-effect"
        label="CRT Effect"
        checked={crtEffect}
        onChange={event => setAppSetting("crtEffect", event.target.checked)}
      />
      <small>Emulate the visual effects of an old CRT television.</small>
    </div>

    <div className="item checkbox-item" style={{display: debugMode ? "block" : "none"}}>
      <Form.Switch
        id="debug-mode"
        label="Debug Mode"
        checked={debugMode}
        onChange={event => setAppSetting("debugMode", event.target.checked)}
      />
      <small>Enable debug mode for additional logging and information.</small>
    </div>

    <div className="item checkbox-item">
      <label>
        <Button
          onClick={() => setAppSetting('showGuideOverlay', true)}
        >
          Show Guide
        </Button>
      </label>
      <small>Open the guide see instructions for using Stash TV.</small>
    </div>

    {debugMode && <div className="item">
      <Button
        onClick={() => window.location.reload()}
      >
        Reload Page
      </Button>
    </div>}

    {debugMode && <div className="item">
      {import.meta.env.VITE_STASH_TV_VERSION}
    </div>}
  </SideDrawer>;
};