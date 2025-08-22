import * as GQL from "stash-ui/dist/src/core/generated-graphql";

export interface TvItem {
  /** The scene data. */
  scene: GQL.TvSceneDataFragment;
  /** Function for handling setting the settings tab visibility. */
  setSettingsTabHandler: (show: boolean) => void;
  /** The subtitles state set by the user. */
  subtitlesOn: boolean;
  /** Function for handling toggling video audio on and off. */
  toggleAudioHandler: (newState?: boolean) => void;
  /** Function for handling toggling fullscreen mode on and off. */
  toggleFullscreenHandler: () => void;
  /** Function for handling toggling letterboxing on and off. */
  toggleLetterboxingHandler: () => void;
  /** Function for handling toggling rotation on and off. */
  toggleForceLandscapeHandler: () => void;
  /** Function for handling toggling video looping on and off. */
  toggleLoopHandler: () => void;
  /** Function for handling toggling video subtitles on and off. */
  toggleSubtitlesHandler: () => void;
  /** Function for handling toggling the UI button visibility */
  toggleUiHandler: () => void;
}

export interface PluginConfig {
  /** The ID of the default filter to be loaded on startup. */
  defaultFilterID?: string;
  /** Hide the main navigation link to Stash TV.  */
  hideNavButton?: boolean;
  /** Set the maximum number of scenes that included in a playlist. The default value is 500. High values may result in long loading times or crashes. */
  maximumScenes?: number;
  /** The subtitle language code to be used when available. */
  subtitleLanguage?: string;
}