import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { default as cx } from "classnames";
import ISO6391 from "iso-639-1";
import React, { forwardRef, useMemo } from "react";
import Select, {
  ActionMeta,
  GroupBase,
  OptionsOrGroups,
  SingleValue,
  ThemeConfig,
} from "react-select";
import { TransitionStatus } from "react-transition-group";
import "./SettingsTab.scss";
import { TRANSITION_DURATION } from "../../constants";
import { useStashConfigStore } from "../../store/stashConfigStore";
import { useAppStateStore } from "../../store/appStateStore";

interface SettingsTabProps {
  transitionStatus: TransitionStatus;
}

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

const SettingsTab = forwardRef(
  (props: SettingsTabProps, ref: React.ForwardedRef<HTMLDivElement>) => {
  const { savedSceneFilters, stashTvConfig, updateStashTvConfig } = useStashConfigStore();
    const toggleableUiStyles: React.CSSProperties = {
      transitionDuration: TRANSITION_DURATION / 1000 + "s",
    };

    const { selectedSavedFilterId, setSelectedSavedFilterId, isRandomised, sceneFilter, setIsRandomised, scenesLoading, scenes, setShowSettings } = useAppStateStore();
    const noScenesAvailable = !scenesLoading && scenes.length === 0;

    const closeButton =
      noScenesAvailable || scenesLoading ? null : (
        <button
          data-testid="SettingsTab--closeButton"
          onClick={() => setShowSettings(false)}
          type="button"
        >
          <FontAwesomeIcon icon={faXmark} />
          <span className="sr-only">Close settings</span>
        </button>
      );

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

    // 1. Select a playlist
    const playlists = useMemo(
      () => savedSceneFilters
        .map(filter => ({
          value: filter.id,
          label: filter.name + (filter.id === stashTvConfig.stashTvDefaultFilterID ? " (default)" : "")
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      [savedSceneFilters, stashTvConfig.stashTvDefaultFilterID]
    )
    const selectedPlaylist = useMemo(() => playlists.find(filter => filter.value === selectedSavedFilterId), [selectedSavedFilterId, playlists]);

    const scenelessFilterError = noScenesAvailable ? (
      <div className="error">
        <h2>Playlist contains no scenes!</h2>
        <p>
          No scenes were found in the currently selected playlist. Please choose
          a different one.
        </p>
      </div>
    ) : null;

    // 2. Set current playlist as default

    // 3. Randomise playlist order

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

    const defaultSubtitles = stashTvConfig?.subtitleLanguage
      ? {
          label: ISO6391.getName(stashTvConfig.subtitleLanguage),
          value: stashTvConfig.subtitleLanguage,
        }
      : undefined;

    const onChangeSubLanguage: ReactSelectOnChange = (option) => {
      console.log("subtitles now in: ", option);
      updateStashTvConfig({
        ...stashTvConfig,
        subtitleLanguage: option?.value ?? undefined,
      });
      // Refresh the scene list without changing the current index.
    };

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className={cx("SettingsTab", props.transitionStatus)}
        data-testid="SettingsTab"
        ref={ref}
        style={toggleableUiStyles}
      >
        <div className="body">
          <div className="item">
            <label>
              <h3>Select a playlist</h3>
              <Select
                defaultValue={selectedPlaylist}
                onChange={(newValue) => setSelectedSavedFilterId(newValue?.value ?? undefined)}
                options={playlists}
                placeholder="None selected. Defaulted to all portrait scenes."
                theme={reactSelectTheme}
              />
            </label>
            <small>
              Choose a scene filter from Stash to use as your Stash TV
              playlist
            </small>

            {fetchingDataWarning}
            {scenelessFilterError}
          </div>

          {selectedPlaylist && selectedPlaylist.value !== stashTvConfig.stashTvDefaultFilterID && <div className="item">
            <button
              onClick={() => {
                updateStashTvConfig({
                  ...stashTvConfig,
                  stashTvDefaultFilterID: selectedPlaylist?.value,
                });
              }}
            >
              Set "{selectedPlaylist?.label}" as the default playlist
            </button>
            <div>
              <small>
                Set the currently selected scene filter as the default playlist
                when opening Stash TV.
              </small>
            </div>
          </div>}

          <div className="item checkbox-item">
            {sceneFilter?.generalFilter?.sort?.startsWith("random_") ? (
              <span>Playlist is set to random order</span>
            ) : <>
              <label>
                <input
                  checked={isRandomised}
                  onChange={event => setIsRandomised(event.target.checked)}
                  type="checkbox"
                />
                <h3>Randomise playlist order</h3>
              </label>
              <small>Randomise the order of scenes in the playlist.</small>
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
        </div>

        <div className="footer">
          <h2>Settings</h2>
          {closeButton}
        </div>
      </div>
    );
  }
);

export default SettingsTab;
