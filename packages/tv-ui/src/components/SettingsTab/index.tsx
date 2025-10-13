import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import ISO6391 from "iso-639-1";
import React, { useMemo } from "react";
import Select, {
  ActionMeta,
  SingleValue,
  ThemeConfig,
} from "react-select";
import "./SettingsTab.scss";
import { useStashConfigStore } from "../../store/stashConfigStore";
import { useAppStateStore } from "../../store/appStateStore";
import SideDrawer from "../SideDrawer";
import { useScenes } from "../../hooks/useScenes";
import { useApolloClient, type ApolloClient, type NormalizedCacheObject } from "@apollo/client";
import { useSceneFilters } from "../../hooks/useSceneFilters";

type ReactSelectOnChange = (
  newValue: SingleValue<{
    value: string;
    label: string;
  }>,
  actionMeta: ActionMeta<{
    value: string;
    label: string;
  }>
) => any;

export default function SettingsTab() {
  const { updateStashTvConfig, tv: {subtitleLanguage} } = useStashConfigStore();
  const apolloClient = useApolloClient() as ApolloClient<NormalizedCacheObject>;
  const {
    sceneFiltersNameAndIds,
    defaultStashTvFilterId,
    sceneFiltersLoading,
    currentSceneFilter,
    currentSceneFilterId,
    setCurrentSceneFilterById
  } = useSceneFilters()

  const { isRandomised, setIsRandomised, crtEffect, setCrtEffect } = useAppStateStore();
  const { scenes, scenesLoading } = useScenes()
    
  const noScenesAvailable = !sceneFiltersLoading && !scenesLoading && scenes.length === 0
  

  /* --------------------------- Fetching data alert -------------------------- */

  const fetchingDataWarning = scenesLoading ? (
    <div className='warning'>
      <h2>
        <FontAwesomeIcon icon={faSpinner} pulse />
        <span>Fetching data from Stash...</span>
      </h2>
      <p>Please wait while data is loaded.</p>
    </div>
  ) : null;

  /* ---------------------------------- Forms --------------------------------- */

  // Theming
  const reactSelectTheme: ThemeConfig = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      neutral0: theme.colors.neutral90,
      neutral5: theme.colors.neutral80,
      neutral10: theme.colors.neutral70,
      neutral20: theme.colors.neutral60,
      neutral30: theme.colors.neutral50,
      neutral40: theme.colors.neutral40,
      neutral50: theme.colors.neutral30,
      neutral60: theme.colors.neutral20,
      neutral70: theme.colors.neutral10,
      neutral80: theme.colors.neutral5,
      neutral90: theme.colors.neutral0,
      primary: theme.colors.neutral30,
      primary25: theme.colors.neutral60,
      primary50: theme.colors.neutral80,
    },
  });

  // 1. Select a scene filter
  const filters = useMemo(
    () => sceneFiltersNameAndIds
      .map(filter => ({
        value: filter.id,
        label: filter.name + (filter.id === defaultStashTvFilterId ? " (default)" : "")
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [sceneFiltersNameAndIds, defaultStashTvFilterId]
  )
  const selectedFilter = useMemo(() => filters.find(filter => filter.value === currentSceneFilterId), [currentSceneFilterId, filters]);

  const scenelessFilterError = noScenesAvailable ? (
    <div className="error">
      <h2>Filter contains no scenes!</h2>
      <p>
        No scenes were found in the currently selected filter. Please choose
        a different one.
      </p>
    </div>
  ) : null;

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

  const onChangeSubLanguage: ReactSelectOnChange = (option) => {
    updateStashTvConfig(
      apolloClient,
      {
        subtitleLanguage: option?.value ?? undefined,
      }
    );
    // Refresh the scene list without changing the current index.
  };

  /* -------------------------------- Component ------------------------------- */
  
  return <SideDrawer title="Settings" closeDisabled={noScenesAvailable || scenesLoading} className="SettingsTab">
    <div className="item">
      <label>
        <h3>Select a filter</h3>
        {!sceneFiltersLoading ? (
          <Select
            defaultValue={selectedFilter}
            onChange={(newValue) => newValue && setCurrentSceneFilterById(newValue.value)}
            options={filters}
            placeholder="None selected. Defaulted to all portrait scenes."
            theme={reactSelectTheme}
          />
        ) : (
          <div>Loading...</div>
        )}
      </label>
      <small>
        Choose a scene filter from Stash to use as your Stash TV
        filter
      </small>

      {fetchingDataWarning}
      {scenelessFilterError}
    </div>

    {selectedFilter && selectedFilter.value !== defaultStashTvFilterId && <div className="item">
      <button
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
      </button>
      <div>
        <small>
          Set the currently selected scene filter as the default filter
          when opening Stash TV.
        </small>
      </div>
    </div>}

    <div className="item checkbox-item">
      {currentSceneFilter?.generalFilter?.sort?.startsWith("random_") ? (
        <span>Filter is set to random order</span>
      ) : <>
        <label>
          <input
            checked={isRandomised}
            onChange={event => setIsRandomised(event.target.checked)}
            type="checkbox"
          />
          <h3>Randomise filter order</h3>
        </label>
        <small>Randomise the order of scenes in the filter.</small>
      </>}
    </div>

    <div className="item">
      <label>
        <h3>Subtitle language</h3>
        <Select
          defaultValue={defaultSubtitles}
          onChange={onChangeSubLanguage}
          options={subtitlesList}
          theme={reactSelectTheme}
        />
      </label>
      <small>
        Select the language to use for subtitles if available.
      </small>
    </div>

    <div className="item checkbox-item">
      <label>
        <input
          checked={crtEffect}
          onChange={event => setCrtEffect(event.target.checked)}
          type="checkbox"
        />
        <h3>CRT effect</h3>
      </label>
      <small>Emulate the visual effects of an old CRT television.</small>
    </div>
  </SideDrawer>;
};
