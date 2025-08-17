declare module "*.module.scss" {
  const content: Record<string, string>;
  export = content;
}

interface IitemData {
  /** The scene data. */
  scene: IsceneData;
  /** Function for handling setting the settings tab visibility. */
  setSettingsTabHandler: (show: boolean) => void;
  /** The subtitles state set by the user. */
  subtitlesOn: boolean;
  /** Function for handling toggling video audio on and off. */
  toggleAudioHandler: () => void;
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

interface IsceneData {
  /** The ID of the scene in Stash. */
  id: Scene["id"];
  /** The format of the video, e.g. "mp4". */
  format: string;
  /** The absolute path of the video stream. */
  path: string;
  captions?: {
    /** The file format of the subtitles file. Files are converted to VTT by
     * stash, but this is required as part of the path. */
    format: string;
    /** The ISO6391 code for the subtitle language. */
    lang: string;
    /** The Stash path to the subtitle file. */
    source: string;
  }[];
  /** The date of the scene. */
  date?: string;
  /** The parent of the studio hosting the scene. */
  parentStudio?: string;
  performers: { name: string; gender: GenderEnum }[];
  /** The studio hosting the scene. */
  studio?: string;
  /** The title of the scene. */
  title?: string;
  /** The unmodified scene info returned from Stash. */
  rawScene: any;
}

interface PluginConfig {
  /** The ID of the default filter to be loaded on startup. */
  defaultFilterID?: string;
  /** Hide the main navigation link to Stash TV.  */
  hideNavButton?: boolean;
  /** Set the maximum number of scenes that included in a playlist. The default value is 500. High values may result in long loading times or crashes. */
  maximumScenes?: number;
  /** The subtitle language code to be used when available. */
  subtitleLanguage?: string;
}
