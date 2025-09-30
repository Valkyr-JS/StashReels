import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { default as cx } from "classnames";
import ISO6391 from "iso-639-1";
import React, { useMemo, useEffect, useRef } from "react";
import Select, {
  ActionMeta,
  SingleValue,
  ThemeConfig,
} from "react-select";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated, config } from "@react-spring/web";
import "./SettingsTab.scss";
import { useStashConfigStore } from "../../store/stashConfigStore";
import { useAppStateStore } from "../../store/appStateStore";

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
  const ref = useRef<HTMLDivElement>(null);
  const { savedSceneFilters, stashTvConfig, updateStashTvConfig } = useStashConfigStore();

  const { selectedSavedFilterId, setSelectedSavedFilterId, isRandomised, sceneFilter, setIsRandomised, scenesLoading, scenes, setShowSettings, crtEffect, setCrtEffect, showSettings } = useAppStateStore();
  const noScenesAvailable = !scenesLoading && scenes.length === 0;

  const [sidebarWidth, setSidebarWidth] = React.useState(window.innerWidth);
  useEffect(() => {
    const width = ref?.current?.clientWidth
    if (width) {
      setSidebarWidth(width)
    }
  }, [])

  const [{ x }, api] = useSpring(() => ({
    from: {
      x: showSettings || noScenesAvailable ? 0 : 0,
    },
    config: {
      tension: 230,  // Lower tension for smoother motion
      friction: 26,  // Balanced friction for natural movement
      mass: 1.2      // Slightly more mass for momentum
    }
  }));
  useEffect(() => {
    if (showSettings) {
      open();
    } else {
      close();
    }
  }, [showSettings]);

  const open = ({ canceled }: { canceled: boolean } = { canceled: false }) => {
    api.start({
      x: sidebarWidth,
      immediate: false,
      // when cancel is true, it means that the user passed the upwards threshold
      // so we change the spring config to create a nice wobbly effect
      config: canceled ? config.wobbly : config.stiff,
      onRest: () => setShowSettings(true)
    })

  }
  const close = () => {
    api.start({
      x: 0,
      immediate: false,
      config: { ...config.stiff },
      onRest: () => setShowSettings(false)
    })
  }

  // Setup drag gesture for swiping
  const bind = useDrag((event) => {
    const { values, direction: [dx], dragging, offset: [ox], cancel, last, velocity: [vx], canceled } = event

    if (dragging) {
      // If we drag more than 1.5x the sidebar width, we cancel the drag and snap back
      if (values[0] / sidebarWidth > 1.5) {
        cancel()
      } else {
        api.start({ x: ox, immediate: true });
      }
    } else if (last) {
      // Quick but maybe short swipe to the right
      if (vx > 0.5 && dx > 0) {
        open({ canceled })
        // Quick but maybe short swipe to the left
      } else if (vx > 0.5 && dx < 0) {
        close()
        // Swipe to the right past halfway point
      } else if (ox > (sidebarWidth * 0.5)) {
        open({ canceled })
        // Swipe to the left past halfway point
      } else {
        close()
      }
    }
  }, {
    filterTaps: true,
    bounds: () => ({ left: 0, right: sidebarWidth }),
    rubberband: true,
    from: () => [x.get(), 0],
  });

  const overlayOpacity = x.to((px) => Math.min(sidebarWidth, (px / sidebarWidth)))
  const overlayDisplay = x.to((px) => px > 0 ? 'block' : 'none')

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
    updateStashTvConfig({
      ...stashTvConfig,
      subtitleLanguage: option?.value ?? undefined,
    });
    // Refresh the scene list without changing the current index.
  };

  /* -------------------------------- Component ------------------------------- */

  return <>
    <animated.div
      className={cx("SettingsTab")}
      data-testid="SettingsTab"
      ref={ref}
      style={{ x }}
      {...bind()}
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
      </div>

      <div className="footer">
        <h2>Settings</h2>
        {closeButton}
      </div>
    </animated.div>
    <animated.div
      className="settings-overlay"
      style={{ display: overlayDisplay, opacity: overlayOpacity }}
      onClick={() => close()}
    />
  </>;
};
