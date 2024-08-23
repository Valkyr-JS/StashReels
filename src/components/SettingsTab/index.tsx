import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { default as cx } from "classnames";
import React, { forwardRef, useEffect, useState } from "react";
import Select, {
  ActionMeta,
  GroupBase,
  OptionsOrGroups,
  SingleValue,
  ThemeConfig,
} from "react-select";
import { TransitionStatus } from "react-transition-group";
import * as styles from "./SettingsTab.module.scss";
import { TRANSITION_DURATION } from "../../constants";
import { updateUserConfig } from "../../helpers";

interface SettingsTabProps {
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
  /** Identifies whether the currently selected filter returns zero scenes. */
  scenelessFilter: boolean;
  /** Function to set a given filter as a playlist. */
  setFilterHandler: (option: { value: string; label: string }) => void;
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

    const classes = cx(styles["settings-tab"], props.transitionStatus);

    const closeButton = props.scenelessFilter ? null : (
      <button
        data-testid="SettingsTab--closeButton"
        onClick={closeButtonHandler}
        type="button"
      >
        <FontAwesomeIcon icon={faXmark} />
        <span className={styles["visually-hidden"]}>Close settings</span>
      </button>
    );

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
      }
    };

    const scenelessFilterWarning = props.scenelessFilter ? (
      <div className={styles["settings-tab--warning"]}>
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
    console.log("defaultPlaylist: ", defaultPlaylist);

    const onChangeDefaultPlaylist: React.ChangeEventHandler<
      HTMLInputElement
    > = (_e) => {
      if (props.currentFilter) {
        const newDefaultID = props.currentFilter.value;
        console.log(newDefaultID);
        setDefaultPlaylist(newDefaultID);
        updateUserConfig({
          ...props.pluginConfig,
          defaultFilterID: newDefaultID,
        });
      }
    };

    /* -------------------------------- Component ------------------------------- */

    return (
      <div
        className={classes}
        data-testid="SettingsTab"
        ref={ref}
        style={toggleableUiStyles}
      >
        <div className={styles["settings-tab--body"]}>
          <div className={styles["settings-tab--item"]}>
            <label>
              <h3>Select a playlist</h3>
              <Select
                defaultValue={props.currentFilter}
                onChange={onChangeSelectPlaylist}
                options={props.filterList}
                placeholder="Select a playlist..."
                theme={reactSelectTheme}
              />
            </label>
            <small>
              Choose a scene filter from Stash to use as your Stash Reels
              playlist
            </small>
          </div>
          <div className={styles["settings-tab--item"]}>
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
              when opening Stash Reels.
            </small>
          </div>
          {scenelessFilterWarning}
        </div>
        <div className={styles["settings-tab--footer"]}>
          <h2>Settings</h2>
          {closeButton}
        </div>
      </div>
    );
  }
);

export default SettingsTab;
