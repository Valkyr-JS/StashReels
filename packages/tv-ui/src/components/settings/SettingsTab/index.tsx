import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCirclePlay, faLocationDot, faGripVertical, faThumbtack, faAdd, faTrashCan, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import ISO6391 from "iso-639-1";
import React, { memo, useContext, useEffect, useMemo, useState } from "react";
import Select from "../Select";
import { components } from "react-select";
import "./SettingsTab.scss";
import { DebuggingInfo, useAppStateStore } from "../../../store/appStateStore";
import SideDrawer from "../SideDrawer";
import Switch from "../Switch";
import { useMediaItems } from "../../../hooks/useMediaItems";
import { useMediaItemFilters } from "../../../hooks/useMediaItemFilters";
import { Button, Form, Accordion } from "react-bootstrap";
import { AccordionContext } from "react-bootstrap";
import cx from "classnames";
import useStashTvConfig from "../../../hooks/useStashTvConfig";
import { LogLevel } from "@logtape/logtape";
import { getLoggers } from "../../../helpers/logging";
import DraggableList from "../../DraggableList";
import { actionButtonsDetails, getActionButtonDetails } from "../../../helpers/getActionButtonDetails";
import ActionButton from "../../slide/ActionButton";
import objectHash from "object-hash";
import { ActionButtonConfig } from "../../slide/ActionButtons";
import { ActionButtonSettingsModal } from "../ActionButtonSettingsModal";
import { queryFindTagsByIDForSelect } from "stash-ui/dist/src/core/StashService";
import { FindTagsForSelectQuery } from "stash-ui/dist/src/core/generated-graphql";

const SettingsTab = memo(() => {
  const { data: { subtitleLanguage }, update: updateStashTvConfig } = useStashTvConfig()
  const {
    mediaItemFiltersLoading,
    mediaItemFiltersError,
    currentMediaItemFilter,
    availableSavedFilters,
  } = useMediaItemFilters()

  const {
    isRandomised,
    crtEffect,
    scenePreviewOnly,
    markerPreviewOnly,
    onlyShowMatchingOrientation,
    showDevOptions,
    videoJsEventsToLog,
    logLevel,
    loggersToShow,
    loggersToHide,
    showDebuggingInfo,
    autoPlay,
    startPosition,
    endPosition,
    playLength,
    minPlayLength,
    maxPlayLength,
    maxMedia,
    leftHandedUi,
    actionButtonsConfig,
    set: setAppSetting,
    setToDefault: setDefaultAppSetting,
    getDefault: getDefaultAppSetting,
  } = useAppStateStore();
  const { mediaItems, mediaItemsLoading, mediaItemsNeverLoaded, mediaItemsError } = useMediaItems()

  const noMediaItemsAvailable = !mediaItemFiltersLoading && !mediaItemsLoading && mediaItems.length === 0

  const actionButtonsConfigIsDefault = useMemo(() => {
    const defaultConfig = getDefaultAppSetting("actionButtonsConfig");
    const hashOptions: objectHash.NormalOption = { excludeKeys: key => ["id"].includes(key) }
    return objectHash(actionButtonsConfig, hashOptions) === objectHash(defaultConfig, hashOptions)
  }, [getDefaultAppSetting, actionButtonsConfig])


  /* ---------------------------------- Forms --------------------------------- */

  const allFilters = useMemo(
    () => availableSavedFilters
      .map(filter => ({
        value: filter.id,
        label: filter.name,
        filterType: filter.entityType
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [availableSavedFilters]
  )
  const allFiltersGrouped = useMemo(
    () => [
        {
          label: "Scene Filters",
          filterType: "scene",
          options: allFilters.filter(filter => filter.filterType === "scene")
        },
        {
          label: "Marker Filters",
          filterType: "marker",
          options: allFilters.filter(filter => filter.filterType === "marker")
        },
      ] as const,
    [allFilters]
  )
  const selectedFilter = allFilters.find(filter => filter.value === currentMediaItemFilter?.savedFilter?.id)

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
    let clearClickCountTimer: NodeJS.Timeout | undefined;
    let clickCount = 0
    const handlePointerUp = () => {
      clickCount += 1;
      if (clickCount > 4) {
        setAppSetting("showDevOptions", true);
      }
      clearTimeout(clearClickCountTimer);
      clearClickCountTimer = setTimeout(() => {
        clickCount = 0;
      }, 1000);
    };
    titleRef.current.addEventListener("pointerup", handlePointerUp)
    return () => {
      titleRef.current?.removeEventListener("pointerup", handlePointerUp)
    }

  }, [titleRef])

  const isFirstLoad = mediaItemsNeverLoaded && !mediaItemFiltersError && !mediaItemsError
  let disableClose: boolean | "because loading" = false;
  if (!isFirstLoad && (mediaItemFiltersLoading || mediaItemsLoading)) {
    disableClose = "because loading";
  } else if (!isFirstLoad && noMediaItemsAvailable) {
    disableClose = true;
  } else if (mediaItemsError || mediaItemFiltersError) {
    disableClose = true;
  }

  const startPositionOptions = [
    { value: 'resume', label: 'Resume from last position' },
    { value: 'beginning', label: 'Beginning' },
    { value: 'random', label: 'Random marker (or position if none)' },
  ] as const

  const endPositionOptions = [
    { value: 'video-end', label: 'End of video' },
    { value: 'fixed-length', label: 'After a fixed length of time' },
    { value: 'random-length', label: 'After a random length of time' },
  ] as const

  const logLevelOptions = useMemo(() => (
    Object.entries(
      {
        "trace": "Trace (most verbose)",
        "debug": "Debug",
        "info": "Info",
        "warning": "Warning",
        "error": "Error",
        "fatal": "Fatal (least verbose)",
      } satisfies { [K in LogLevel]: string; }
    ).map(([value, label]) => ({
      value: value as LogLevel,
      label,
    }))
  ), []);

  const [loggers, setLoggers] = React.useState(getLoggers());
  useEffect(() => {
    const interval = setInterval(() => {
      const newLoggers = getLoggers().filter(newLogger => !loggers.includes(newLogger))
      if (newLoggers.length === 0) return;
      setLoggers([
        ...loggers,
        ...newLoggers
      ]);
    }, 1000);
    return () => clearInterval(interval);
  }, [loggers]);

  const loggerOptions = useMemo(() => loggers
    .map(logger => logger.category)
    .filter(category =>
      category.length // Exclude root logger
      && category[0] !== "logtape" // Exclude logtape internal loggers
      && (category.length !== 1 || category[0] !== "stash-tv") // Exclude root stash-tv logger
    )
    .map(category => ({
      value: category,
      label: category.join(" / ").replace(/^stash-tv \/ /, ""),
    }))
    .toSorted((a, b) => a.label.localeCompare(b.label))
  , [loggers]);

  const showDebuggingInfoOptions = useMemo(() => (
    Object.entries(
      {
        "render-debugging": "Render Debugging",
        "onscreen-info": "On-screen Info",
      } satisfies { [K in DebuggingInfo]: string; }
    ).map(([value, label]) => ({
      value: value as DebuggingInfo,
      label,
    }))
  ), []);

  const [actionButtonDraft, setActionButtonDraft] = React.useState<ActionButtonConfig | null>(null);

  const saveActionButtonDraft = (actionButton: ActionButtonConfig) => {
    const existingButtonIndex = actionButtonsConfig.findIndex(button => button.id === actionButton.id);
    if (existingButtonIndex !== -1) {
      setAppSetting(
        "actionButtonsConfig",
        actionButtonsConfig.map((button, index) => index === existingButtonIndex ? actionButton : button)
      );
    } else {
      setAppSetting(
        "actionButtonsConfig",
        [...actionButtonsConfig, {...actionButton, id: Date.now().toString()}]
      );
    }
  }

  const [tags, setTags] = useState<FindTagsForSelectQuery["findTags"]["tags"]>([]);
  const tagIds = actionButtonsConfig.filter(config => 'tagId' in config)
      .map(config => config.tagId)
      .toSorted()
  useEffect(() => {
    queryFindTagsByIDForSelect(tagIds)
      .then(result => setTags(result.data.findTags.tags))
  }, [objectHash(tagIds)])

  const addableActionButtons = Object.keys(actionButtonsDetails)
    .map((type: keyof typeof actionButtonsDetails) => {
      let config: ActionButtonConfig;
      const configBase = {
        id: "",
        pinned: false,
      }
      if (type === "quick-tag") {
        config = {
          ...configBase,
          type,
          tagId: "",
          iconId: "tag",
        }
      } else {
        config = {
          ...configBase,
          type
        }
      }
      return {
        type,
        details: getActionButtonDetails(config),
        add() {
          if (type === "quick-tag") {
            setActionButtonDraft(config);
          } else {
            setAppSetting(
              "actionButtonsConfig",
              [
                ...actionButtonsConfig,
                {
                  ...config,
                  id: new Date().getTime().toString() + Math.random().toString(),
                }
              ]
            );
          }
        }
      }
    })
    // Exclude singleton button types that are already displayed
    .filter(
      actionButton => !actionButtonsConfig.some(config => config.type === actionButton.type)
        || actionButton.details.repeatable
    )

  /* -------------------------------- Component ------------------------------- */
  return <SideDrawer
    title={useMemo(() => <span ref={titleRef}>Settings</span>, [])}
    closeDisabled={disableClose}
    className="SettingsTab"
  >
    {actionButtonDraft && <ActionButtonSettingsModal
      actionButtonConfig={actionButtonDraft}
      onUpdate={setActionButtonDraft}
      onClose={() => setActionButtonDraft(null)}
      onSave={config => {
        saveActionButtonDraft(config)
        setActionButtonDraft(null)
      }}
    />}
    <Accordion defaultActiveKey="0">
      <AccordionToggle eventKey="0">
        Media Feed
      </AccordionToggle>
      <Accordion.Collapse eventKey="0">
        <>
          <Form.Group>
            <label htmlFor="filter">
              Media Filter
            </label>
            <Select
              inputId="filter"
              isLoading={mediaItemFiltersLoading || mediaItemsLoading}
              value={selectedFilter ?? null}
              onChange={(newValue) => newValue && setAppSetting("currentFilterId", newValue.value)}
              options={allFiltersGrouped}
              placeholder={`${allFilters.length > 0 ? "No filter selected" : "No filters saved in stash"}. Showing all scenes.`}
              components={{
                GroupHeading: (props) => (
                  <components.GroupHeading {...props}>
                    <FontAwesomeIcon icon={props.data.filterType === "scene" ? faCirclePlay : faLocationDot} />
                    {props.data.label}

                  </components.GroupHeading>
                ),
                SingleValue: (props) => (
                  <components.SingleValue {...props}>
                    <FontAwesomeIcon icon={props.data.filterType === "scene" ? faCirclePlay : faLocationDot} />
                    {props.data.label}
                  </components.SingleValue>
                ),
              }}
            />
            <Form.Text className="text-muted">
              Choose a scene filter from Stash to use as your Stash TV
              filter
            </Form.Text>

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
          </Form.Group>

          <Form.Group>
            {currentMediaItemFilter?.savedFilter?.find_filter?.sort?.startsWith("random_") ? (
              <span>Filter sort order is random</span>
            ) : <>
                <Switch
                  id="randomise-filter"
                  checked={isRandomised}
                  label="Randomise filter order"
                  onChange={event => {console.log(event); setAppSetting("isRandomised", event.target.checked)}}
                />
              <Form.Text className="text-muted">Randomise the order of scenes in the filter.</Form.Text>
            </>}
          </Form.Group>

          <Form.Group>
            <Switch
              id="only-show-matching-orientation"
              label="Only Show Scenes Matching Orientation"
              checked={onlyShowMatchingOrientation}
              onChange={event => setAppSetting("onlyShowMatchingOrientation", event.target.checked)}
            />
            <Form.Text className="text-muted">Limit scenes to only those in the same orientation as the current window.</Form.Text>
          </Form.Group>
        </>
      </Accordion.Collapse>
      <AccordionToggle eventKey="1">
        Media Player
      </AccordionToggle>
      <Accordion.Collapse eventKey="1">
        <>
          <Form.Group>
            <Switch
              id="auto-play"
              label="Auto Play"
              checked={autoPlay}
              onChange={event => setAppSetting("autoPlay", event.target.checked)}
            />
            <Form.Text className="text-muted">Automatically play scenes.</Form.Text>
          </Form.Group>

          {selectedFilter?.filterType === "scene" && (
            <Form.Group>
              <Switch
                id="scene-preview-only"
                label="Scene Preview Only"
                checked={scenePreviewOnly}
                onChange={event => setAppSetting("scenePreviewOnly", event.target.checked)}
              />
              <Form.Text className="text-muted">Play a short preview rather than the full scene. (Requires the preview files to have been generated in Stash for a scene otherwise the full scene will be shown.)</Form.Text>
            </Form.Group>
          )}
          {selectedFilter?.filterType === "marker" && (
            <Form.Group>
              <Switch
                id="marker-preview-only"
                label="Play Low-res Preview"
                checked={markerPreviewOnly}
                onChange={event => setAppSetting("markerPreviewOnly", event.target.checked)}
              />
              <Form.Text className="text-muted">Play the low-resolution maker preview which can be useful for low bandwidth situations. (Requires the preview files to have been generated in Stash for a marker otherwise the full-quality video will be shown.)</Form.Text>
            </Form.Group>
          )}

          {selectedFilter?.filterType === "scene" && !scenePreviewOnly && <>
            <Form.Group>
              <label htmlFor="start-position">
                Start Point
              </label>
              <Select
                inputId="start-position"
                value={startPositionOptions.find(option => option.value === startPosition) ?? null}
                onChange={(newValue) => newValue && setAppSetting("startPosition", newValue.value)}
                options={startPositionOptions}
              />
              <Form.Text className="text-muted">
                The point in the scene to start playback from.
              </Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="end-position">
                End Point
              </label>
              <Select
                inputId="end-position"
                value={endPositionOptions.find(option => option.value === endPosition) ?? null}
                onChange={(newValue) => newValue && setAppSetting("endPosition", newValue.value)}
                options={endPositionOptions}
              />
              <Form.Text className="text-muted">
                The point in the scene to end playback.
              </Form.Text>

              {endPosition === "fixed-length" && <Form.Group>
                <label htmlFor="play-length">
                  Play Length (Seconds)
                </label>
                <Form.Control
                  type="number"
                  id="play-length"
                  className="text-input"
                  value={playLength ?? ""}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setAppSetting(
                      "playLength",
                      event.currentTarget.value
                        ? Number.parseInt(event.currentTarget.value)
                        : undefined
                    )
                  }
                />
                <Form.Text className="text-muted">
                  The length to play the scene for after the start point. Will play the full scene if not set.
                </Form.Text>
              </Form.Group>}

              {endPosition === "random-length" && <Form.Group>
                <label>
                  Random Play Length Range (Seconds)
                </label>
                <div className="inline">
                  <label htmlFor="min-play-length" className="sr-only">
                    Random Length Minimum
                  </label>
                  <Form.Control
                    type="number"
                    id="min-play-length"
                    className="text-input"
                    placeholder="Min"
                    value={minPlayLength ?? ""}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setAppSetting(
                        "minPlayLength",
                        event.currentTarget.value
                          ? Number.parseInt(event.currentTarget.value)
                          : undefined
                      )
                    }
                  />
                  <label htmlFor="max-play-length" className="sr-only">
                    Random Length Maximum
                  </label>
                  <Form.Control
                    type="number"
                    id="max-play-length"
                    className="text-input"
                    value={maxPlayLength ?? ""}
                    placeholder="Max"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setAppSetting(
                        "maxPlayLength",
                        event.currentTarget.value
                          ? Number.parseInt(event.currentTarget.value)
                          : undefined
                      )
                    }
                  />
                </div>
                <Form.Text className="text-muted">
                  Sets the minimum and maximum length to randomly play the scene for.
                </Form.Text>
              </Form.Group>}
            </Form.Group>
          </>}

          <Form.Group>
            <label htmlFor="subtitle-language">
              Subtitle language
            </label>
            <Select
              inputId="subtitle-language"
              value={defaultSubtitles}
              onChange={(newValue) => {
                if (!newValue) return;
                updateStashTvConfig(
                  {
                    subtitleLanguage: newValue.value,
                  }
                );
              }}
              options={subtitlesList}
              placeholder="Select a subtitle language"
            />
            <Form.Text className="text-muted">
              Select the language to use for subtitles if available.
            </Form.Text>
          </Form.Group>

          <Form.Group>
            <Switch
              id="crt-effect"
              label="CRT Effect"
              checked={crtEffect}
              onChange={event => setAppSetting("crtEffect", event.target.checked)}
            />
            <Form.Text className="text-muted">Emulate the visual effects of an old CRT television.</Form.Text>
          </Form.Group>
        </>
      </Accordion.Collapse>
      <AccordionToggle eventKey="2">
        UI
      </AccordionToggle>
      <Accordion.Collapse eventKey="2">
        <>
          <Form.Group>
            <Switch
              id="left-handed-ui"
              label="Left-handed UI"
              checked={leftHandedUi}
              onChange={event => setAppSetting("leftHandedUi", event.target.checked)}
            />
            <Form.Text className="text-muted">Flip the user interface for left-handed use.</Form.Text>
          </Form.Group>
          <Form.Group>
            <label>Action Buttons</label>

            <DraggableList
              className={cx("draggable-list")}
              items={actionButtonsConfig.toReversed().toSorted((a, b) => (a.pinned ? 1 : 0) - (b.pinned ? 1 : 0))}
              onItemsOrderChange={(newOrder) => {
                const buttons = newOrder.toReversed()
                const indexOfFirstNonPinned = buttons.findIndex(button => !button.pinned)
                setAppSetting(
                  "actionButtonsConfig",
                  buttons.map((buttonConfig, index) => ({
                    ...buttonConfig,
                    pinned: buttonConfig.pinned && index >= indexOfFirstNonPinned ? false : buttonConfig.pinned,
                  }))
                )
              }}
              renderItem={(item, getDragHandleProps) => {
                const details = getActionButtonDetails(
                  item,
                  {
                    tagName: tags.find(
                      tag => 'tagId' in item ? tag.id === item.tagId : false
                    )?.name
                  }
                );
                return <div className={cx("draggable-list-item")}>
                  <div className="inline">
                    <div className="drag-handle" {...getDragHandleProps({className: "drag-handle"})}>
                      <FontAwesomeIcon icon={faGripVertical} />
                      <ActionButton
                        {...details.props}
                        className={"action-button-icon"}
                        active={false}
                        disabled={true}
                        key={item.id}
                        size="auto"
                      />
                    </div>
                    {details.inactiveText}
                  </div>
                  <div className="inline controls">
                    {["quick-tag"].includes(item.type) && <Button
                      variant="link"
                      className={cx("hide-button", "muted")}
                      onClick={() => setActionButtonDraft(item)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>}
                    {item.type !== "settings" && <Button
                      variant="link"
                      className={cx("hide-button", "muted")}
                      onClick={() => setAppSetting(
                        "actionButtonsConfig",
                        actionButtonsConfig.filter(button => button.id !== item.id)
                      )}
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                    </Button>}
                    <Button
                      variant="link"
                      className={cx("pin-button", {muted: !item.pinned})}
                      onClick={() => setAppSetting(
                        "actionButtonsConfig",
                        actionButtonsConfig.map(button => button.id === item.id ? {...button, pinned: !button.pinned} : button)
                      )}
                    >
                      <FontAwesomeIcon icon={faThumbtack} />
                    </Button>
                  </div>
                </div>
              }}
              getItemKey={(item) => item.id}
            />
            <div className="form-subgroup">
              {addableActionButtons.map(actionButton => (
                <Button
                  key={actionButton.type}
                  variant="link"
                  className={cx("add-action-button")}
                  onClick={() => actionButton.add()}
                >
                  <FontAwesomeIcon icon={faAdd} />
                  <div className="info">
                    <ActionButton
                      {...actionButton.details.props}
                      className={"action-button-icon"}
                      active={false}
                      disabled={true}
                      size="auto"
                    />
                    Add "{actionButton.details.inactiveText}"
                  </div>
                </Button>
              ))}
            </div>
            {!actionButtonsConfigIsDefault && <div className="inline form-subgroup">
              <Button
                variant="outline-warning"
                onClick={() => setDefaultAppSetting('actionButtonsConfig')}
              >
                Reset to default
              </Button>
            </div>}
            <Form.Text className="text-muted">
              Pinning buttons stops them from being pushed off screen when the window is not tall enough to show them
              all without scrolling.
            </Form.Text>
          </Form.Group>
        </>
      </Accordion.Collapse>
      <AccordionToggle eventKey="3">
        Help
      </AccordionToggle>
      <Accordion.Collapse eventKey="3">
        <>
          <Form.Group className="inline">
            <Button
              onClick={() => setAppSetting('showGuideOverlay', true)}
            >
              Show Guide
            </Button>
            <Form.Text className="text-muted">Show instructions for using Stash TV.</Form.Text>
          </Form.Group>
          <Form.Group>
            <strong>Version:</strong> {import.meta.env.VITE_STASH_TV_VERSION}
          </Form.Group>
        </>
      </Accordion.Collapse>


      {showDevOptions && <>
        <AccordionToggle eventKey="4">
          Developer Options
        </AccordionToggle>
        <Accordion.Collapse eventKey="4">
          <>
            <Form.Group>
              <Switch
                id="show-dev-options"
                label="Hide Developer Options"
                checked={showDevOptions}
                onChange={event => setAppSetting("showDevOptions", false)}
              />
              <Form.Text className="text-muted">Hide developer options.</Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="log-level">
                Log Level to Show
              </label>
              <Select
                inputId="log-level"
                value={logLevelOptions.find(option => option.value === logLevel) ?? null}
                onChange={(newValue) => newValue?.value && setAppSetting("logLevel", newValue.value)}
                options={logLevelOptions}
              />
              <Form.Text className="text-muted">The level of logging detail.</Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="loggers-to-show">
                Loggers to Show
              </label>
              <Select
                inputId="loggers-to-show"
                expandWidthToFit={true}
                options={loggerOptions}
                value={loggerOptions.filter(
                  ({value: category}) => loggersToShow.some(
                    shownCategory => (category.length === shownCategory.length) && category.every(
                      (part, index) => part === shownCategory[index]
                    )
                  )
                )}
                onChange={(newValues) => setAppSetting("loggersToShow", newValues.map(option => option.value))}
                isMulti={true}
                closeMenuOnSelect={false}
              />
              <Form.Text className="text-muted">Loggers to show logs from. An empty list will show any that aren't otherwise hidden.</Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="loggers-to-hide">
                Loggers to Hide
              </label>
              <Select
                inputId="loggers-to-hide"
                expandWidthToFit={true}
                options={loggerOptions}
                value={loggerOptions.filter(
                  ({value: category}) => loggersToHide.some(
                    hiddenCategory => (category.length === hiddenCategory.length) && category.every(
                      (part, index) => part === hiddenCategory[index]
                    )
                  )
                )}
                placeholder="All loggers"
                onChange={(newValues) => setAppSetting("loggersToHide", newValues.map(option => option.value))}
                isMulti={true}
                closeMenuOnSelect={false}
              />
              <Form.Text className="text-muted">Loggers to hide logs from.</Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="show-debugging-info">
                Additional Debugging Info
              </label>
              <Select
                inputId="show-debugging-info"
                value={showDebuggingInfoOptions.filter(option => showDebuggingInfo.includes(option.value))}
                onChange={(newValues) => setAppSetting("showDebuggingInfo", newValues.map(option => option.value))}
                options={showDebuggingInfoOptions}
                isMulti={true}
                closeMenuOnSelect={false}
              />
              <Form.Text className="text-muted">Additional debugging information.</Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="max-media">
                Media Limit
              </label>
              <Form.Control
                type="number"
                id="max-media"
                className="text-input"
                value={maxMedia ?? ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAppSetting(
                    "maxMedia",
                    event.currentTarget.value
                      ? Number.parseInt(event.currentTarget.value)
                      : undefined
                  )
                }
              />
              <Form.Text className="text-muted">
                Limit the number of media items that are shown (loading amount is unaffected).
              </Form.Text>
            </Form.Group>

            <Form.Group>
              <label htmlFor="video-js-events-to-log">
                Video.js Events To Log
              </label>
              <Select
                inputId="video-js-events-to-log"
                value={videoJsEventsToLog.map(eventName => ({
                  label: eventName,
                  value: eventName,
                }))}
                onChange={(newValue) => setAppSetting(
                  "videoJsEventsToLog",
                  newValue.some(item => item.value === "all") ? videoJsEvents : newValue.map(item => item.value)
                )}
                options={["all", ...videoJsEvents].map(eventName => ({
                  label: eventName,
                  value: eventName,
                }))}
                placeholder="Select video.js events to log"
                isMulti={true}
                closeMenuOnSelect={false}
              />
              <Form.Text className="text-muted">
                Which video.js events to log to the console.
              </Form.Text>
            </Form.Group>

            <Form.Group>
              <Button
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Form.Group>
          </>
        </Accordion.Collapse>
      </>}
    </Accordion>

  </SideDrawer>;
});

SettingsTab.displayName = "SettingsTab";
export default SettingsTab;

const AccordionToggle: Accordion["Toggle"] = (props) => {
  const {children, className, as, variant, eventKey, ...otherProps} = props;
  // @ts-expect-error - AccordionContext is imported from a library that used a different React instance but it seems to work fine
  const contextEventKey = useContext(AccordionContext);
  const open = contextEventKey === eventKey;
  return (
    <Accordion.Toggle className={cx(className, open ? 'open' : '')} as={Button} variant="link" eventKey={eventKey} {...otherProps}>
      <h3>
        <span>{children}</span>
        <FontAwesomeIcon icon={faChevronLeft} />
      </h3>
    </Accordion.Toggle>
  )
}

// Taken from: https://gist.github.com/alexrqs/a6db03bade4dc405a61c63294a64f97a?permalink_comment_id=4312389#gistcomment-4312389
const videoJsEvents = [...new Set([
  // HTMLMediaElement events
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',

  // HTMLVideoElement events
  'enterpictureinpicture',
  'leavepictureinpicture',

  // Element events
  'fullscreenchange',
  'resize',

  // video.js events
  'audioonlymodechange',
  'audiopostermodechange',
  'controlsdisabled',
  'controlsenabled',
  'debugon',
  'debugoff',
  'disablepictureinpicturechanged',
  'dispose',
  'enterFullWindow',
  'error',
  'exitFullWindow',
  'firstplay',
  'fullscreenerror',
  'languagechange',
  'loadedmetadata',
  'loadstart',
  'playerreset',
  'playerresize',
  'posterchange',
  'ready',
  'textdata',
  'useractive',
  'userinactive',
  'usingcustomcontrols',
  'usingnativecontrols',
])];
