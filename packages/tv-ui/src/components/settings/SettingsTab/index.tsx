import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCirclePlay, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import ISO6391 from "iso-639-1";
import React, { useContext, useEffect, useMemo } from "react";
import Select from "../Select";
import { components } from "react-select";
import "./SettingsTab.scss";
import { useAppStateStore } from "../../../store/appStateStore";
import SideDrawer from "../SideDrawer";
import Switch from "../Switch";
import { useMediaItems } from "../../../hooks/useMediaItems";
import { useMediaItemFilters } from "../../../hooks/useMediaItemFilters";
import { Button, Form, Accordion } from "react-bootstrap";
import { AccordionContext } from "react-bootstrap";
import cx from "classnames";
import useStashTvConfig from "../../../hooks/useStashTvConfig";

export default function SettingsTab() {
  const { data: { subtitleLanguage }, update: updateStashTvConfig } = useStashTvConfig()
  const {
    mediaItemFiltersLoading,
    mediaItemFiltersError,
    currentMediaItemFilter,
    setCurrentMediaItemFilterById,
    availableSavedFilters,
  } = useMediaItemFilters()

  const {
    isRandomised,
    crtEffect,
    scenePreviewOnly,
    onlyShowMatchingOrientation,
    showDevOptions,
    debugMode,
    autoPlay,
    startPosition,
    set: setAppSetting
  } = useAppStateStore();
  const { mediaItems, mediaItemsLoading, mediaItemsNeverLoaded, mediaItemsError } = useMediaItems()

  const noMediaItemsAvailable = !mediaItemFiltersLoading && !mediaItemsLoading && mediaItems.length === 0


  /* ---------------------------------- Forms --------------------------------- */

  const allFilters = useMemo(
    () => availableSavedFilters
      .map(filter => ({
        value: filter.id,
        label: filter.name + (filter.isStashTvDefaultFilter ? " (default)" : ""),
        isStashTvDefaultFilter: filter.isStashTvDefaultFilter,
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

  /* -------------------------------- Component ------------------------------- */
  return <SideDrawer
    title={<span ref={titleRef}>Settings</span>}
    closeDisabled={disableClose}
    className="SettingsTab"
  >
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
              onChange={(newValue) => newValue && setCurrentMediaItemFilterById(newValue.value)}
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

          {selectedFilter && !selectedFilter.isStashTvDefaultFilter && !noMediaItemsAvailable && <Form.Group>
            <Button
              onClick={() => {
                updateStashTvConfig(
                  {
                    defaultFilterId: selectedFilter?.value,
                  }
                );
              }}
            >
              Set "{selectedFilter?.label}" as the default filter
            </Button>
            <div>
              <Form.Text className="text-muted">
                Set the currently selected scene filter as the default filter
                when opening Stash TV.
              </Form.Text>
            </div>
          </Form.Group>}

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

          {selectedFilter?.filterType === "scene" && <Form.Group>
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
          </Form.Group>}

          <Form.Group>
            <Switch
              id="scene-preview-only"
              label="Scene Preview Only"
              checked={scenePreviewOnly}
              onChange={event => setAppSetting("scenePreviewOnly", event.target.checked)}
            />
            <Form.Text className="text-muted">Play a short preview rather than the full scene. (Requires the preview files to have been generated in Stash for a scene otherwise the full scene will be shown.)</Form.Text>
          </Form.Group>

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
        Help
      </AccordionToggle>
      <Accordion.Collapse eventKey="2">
        <>
          <Form.Group className="button-description-inline">
            <Button
              onClick={() => setAppSetting('showGuideOverlay', true)}
            >
              Show Guide
            </Button>
            <Form.Text className="text-muted">Show instructions for using Stash TV.</Form.Text>
          </Form.Group>
        </>
      </Accordion.Collapse>


      {showDevOptions && <>
        <AccordionToggle eventKey="3">
          Developer Options
        </AccordionToggle>
        <Accordion.Collapse eventKey="3">
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
              <Switch
                id="debug-mode"
                label="Debug Mode"
                checked={debugMode}
                onChange={event => setAppSetting("debugMode", event.target.checked)}
              />
              <Form.Text className="text-muted">Enable debug mode for additional logging and information.</Form.Text>
            </Form.Group>

            <Form.Group>
              <Switch
                id="enable-render-debugging"
                label="Enable Render Debugging"
                checked={JSON.parse(localStorage.getItem("enableRenderDebugging") || "false")}
                onChange={event => {
                  localStorage.setItem("enableRenderDebugging", JSON.stringify(event.target.checked))
                  window.location.reload()
                }}
              />
              <Form.Text className="text-muted">Enable render debugging.</Form.Text>
            </Form.Group>

            <Form.Group>
              <Button
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </Form.Group>

            <Form.Group>
              {import.meta.env.VITE_STASH_TV_VERSION}
            </Form.Group>
          </>
        </Accordion.Collapse>
      </>}
    </Accordion>

  </SideDrawer>;
};

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
