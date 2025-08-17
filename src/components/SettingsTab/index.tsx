import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { default as cx } from "classnames";
import ISO6391 from "iso-639-1";
import React, { forwardRef, useState } from "react";
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

interface SettingsTabProps {
  /** The scene filter currently being used as the playlist. */
  currentFilter:
    | {
        value: string;
        label: string;
      }
    | undefined;
  /** Whether the app is currently fetching scene data. */
  fetchingData: boolean;
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
  /** Whether the current playlist is randomised or not. */
  isRandomised: boolean;
  /** The user's plugin config from Stash. */
  pluginConfig: PluginConfig;
  /** Function to handle updating the user config. */
  pluginUpdateHandler: (partialConfig: PluginConfig) => void;
  /** Identifies whether the currently selected filter returns zero scenes. */
  scenelessFilter: boolean;
  /** Function to set a given filter as a playlist. */
  setFilterHandler: (option: { value: string; label: string }) => void;
  /** Function to set playlist as randomised or not. */
  setIsRandomised: () => void;
  /** Function to set the settings tab component visibility. */
  setSettingsTabHandler: (show: boolean) => void;
  /** The ReactTransitionGroup transition status. */
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
    const toggleableUiStyles: React.CSSProperties = {
      transitionDuration: TRANSITION_DURATION / 1000 + "s",
    };

    const closeButtonHandler = () => props.setSettingsTabHandler(false);

    const classes = cx("SettingsTab", props.transitionStatus);

    const closeButton =
      props.scenelessFilter || props.fetchingData ? null : (
        <button
          data-testid="SettingsTab--closeButton"
          onClick={closeButtonHandler}
          type="button"
        >
          <FontAwesomeIcon icon={faXmark} />
          <span className="sr-only">Close settings</span>
        </button>
      );

    /* --------------------------- Fetching data alert -------------------------- */

    const fetchingDataWarning = props.fetchingData ? (
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
    const onChangeSelectPlaylist: ReactSelectOnChange = (option) => {
      if (option?.value) {
        props.setFilterHandler(option);

        // Turn off randomiser
        if (props.isRandomised) props.setIsRandomised();
      }
    };

    const scenelessFilterError = props.scenelessFilter ? (
      <div className="error">
        <h2>Playlist contains no scenes!</h2>
        <p>
          No scenes were found in the currently selected playlist. Please choose
          a different one.
        </p>
      </div>
    ) : null;

    // 2. Set current playlist as default
    const [defaultPlaylist, setDefaultPlaylist] = useState<string | null>(
      props.pluginConfig?.defaultFilterID ?? null
    );

    const onChangeDefaultPlaylist: React.ChangeEventHandler<
      HTMLInputElement
    > = (_e) => {
      if (props.currentFilter) {
        const newDefaultID = props.currentFilter.value;
        setDefaultPlaylist(newDefaultID);
        props.pluginUpdateHandler({
          defaultFilterID: newDefaultID,
        });
      }
    };

    // 3. Randomise playlist order
    const onChangeRandomise: React.ChangeEventHandler<
      HTMLInputElement
    > = () => {
      props.setIsRandomised();
    };

    // 4. Set subtitles lanuage
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

    const defaultSubtitles = props.pluginConfig?.subtitleLanguage
      ? {
          label: ISO6391.getName(props.pluginConfig.subtitleLanguage),
          value: props.pluginConfig.subtitleLanguage,
        }
      : undefined;

    const onChangeSubLanguage: ReactSelectOnChange = (option) => {
      console.log("subtitles now in: ", option);

      // Update the config with the new language.
      props.pluginUpdateHandler({
        subtitleLanguage: option?.value ?? undefined,
      });

      // Refresh the scene list without changing the current index.
    };

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className={classes}
        data-testid="SettingsTab"
        ref={ref}
        style={toggleableUiStyles}
      >
        <div className="body">
          <div className="item">
            <label>
              <h3>Select a playlist</h3>
              <Select
                defaultValue={props.currentFilter}
                onChange={onChangeSelectPlaylist}
                options={props.filterList}
                placeholder="None selected. Defaulted to all portrait scenes."
                theme={reactSelectTheme}
              />
            </label>
            <small>
              Choose a scene filter from Stash to use as your Stash Swipe
              playlist
            </small>

            {fetchingDataWarning}
            {scenelessFilterError}
          </div>

          <div className="item checkbox-item">
            <label>
              <input
                checked={defaultPlaylist === props.currentFilter?.value}
                onChange={onChangeDefaultPlaylist}
                type="checkbox"
              />
              <h3>Set current playlist as default</h3>
            </label>
            <small>
              Set the currently selected scene filter as the default playlist
              when opening Stash Swipe.
            </small>
          </div>

          <div className="item checkbox-item">
            <label>
              <input
                checked={props.isRandomised}
                onChange={onChangeRandomise}
                type="checkbox"
              />
              <h3>Randomise playlist order</h3>
            </label>
            <small>Randomise the order of scenes in the playlist.</small>
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
