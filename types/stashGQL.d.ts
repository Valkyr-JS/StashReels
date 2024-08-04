type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Any: { input: any; output: any; }
  /** A String -> Boolean map */
  BoolMap: { input: any; output: any; }
  Int64: { input: any; output: any; }
  /** A String -> Any map */
  Map: { input: any; output: any; }
  /** A plugin ID -> Map (String -> Any map) map */
  PluginConfigMap: { input: any; output: any; }
  /** An RFC3339 timestamp */
  Time: { input: any; output: any; }
  /**
   * Timestamp is a point in time. It is always output as RFC3339-compatible time points.
   * It can be input as a RFC3339 string, or as "<4h" for "4 hours in the past" or ">5m"
   * for "5 minutes in the future"
   */
  Timestamp: { input: any; output: any; }
  /** A multipart file upload */
  Upload: { input: any; output: any; }
};

type AddTempDlnaipInput = {
  address: Scalars['String']['input'];
  /** Duration to enable, in minutes. 0 or null for indefinite. */
  duration?: InputMaybe<Scalars['Int']['input']>;
};

type AnonymiseDatabaseInput = {
  download?: InputMaybe<Scalars['Boolean']['input']>;
};

type AssignSceneFileInput = {
  file_id: Scalars['ID']['input'];
  scene_id: Scalars['ID']['input'];
};

type AutoTagMetadataInput = {
  /** Paths to tag, null for all files */
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** IDs of performers to tag files with, or "*" for all */
  performers?: InputMaybe<Array<Scalars['String']['input']>>;
  /** IDs of studios to tag files with, or "*" for all */
  studios?: InputMaybe<Array<Scalars['String']['input']>>;
  /** IDs of tags to tag files with, or "*" for all */
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

type AutoTagMetadataOptions = {
  __typename?: 'AutoTagMetadataOptions';
  /** IDs of performers to tag files with, or "*" for all */
  performers?: Maybe<Array<Scalars['String']['output']>>;
  /** IDs of studios to tag files with, or "*" for all */
  studios?: Maybe<Array<Scalars['String']['output']>>;
  /** IDs of tags to tag files with, or "*" for all */
  tags?: Maybe<Array<Scalars['String']['output']>>;
};

type BackupDatabaseInput = {
  download?: InputMaybe<Scalars['Boolean']['input']>;
};

type BaseFile = {
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


type BaseFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

const enum BlobsStorageType {
  /** Database */
  Database = 'DATABASE',
  /** Filesystem */
  Filesystem = 'FILESYSTEM'
};

type BulkGalleryUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<BulkUpdateIds>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  scene_ids?: InputMaybe<BulkUpdateIds>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

type BulkGroupUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

type BulkImageUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  gallery_ids?: InputMaybe<BulkUpdateIds>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<BulkUpdateIds>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

type BulkMovieUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

type BulkPerformerUpdateInput = {
  alias_list?: InputMaybe<BulkUpdateStrings>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_length?: InputMaybe<Scalars['String']['input']>;
  circumcised?: InputMaybe<CircumisedEnum>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  gender?: InputMaybe<GenderEnum>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** @deprecated Use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  penis_length?: InputMaybe<Scalars['Float']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

type BulkSceneUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  gallery_ids?: InputMaybe<BulkUpdateIds>;
  group_ids?: InputMaybe<BulkUpdateIds>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use group_ids */
  movie_ids?: InputMaybe<BulkUpdateIds>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<BulkUpdateIds>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<BulkUpdateIds>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<BulkUpdateStrings>;
};

type BulkTagUpdateInput = {
  aliases?: InputMaybe<BulkUpdateStrings>;
  child_ids?: InputMaybe<BulkUpdateIds>;
  description?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  parent_ids?: InputMaybe<BulkUpdateIds>;
};

const enum BulkUpdateIdMode {
  Add = 'ADD',
  Remove = 'REMOVE',
  Set = 'SET'
};

type BulkUpdateIds = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  mode: BulkUpdateIdMode;
};

type BulkUpdateStrings = {
  mode: BulkUpdateIdMode;
  values?: InputMaybe<Array<Scalars['String']['input']>>;
};

type CircumcisionCriterionInput = {
  modifier: CriterionModifier;
  value?: InputMaybe<Array<CircumisedEnum>>;
};

const enum CircumisedEnum {
  Cut = 'CUT',
  Uncut = 'UNCUT'
};

type CleanGeneratedInput = {
  /** Clean blob files without blob entries */
  blobFiles?: InputMaybe<Scalars['Boolean']['input']>;
  /** Do a dry run. Don't delete any files */
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean image thumbnails/clips without image entries */
  imageThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean marker files without marker entries */
  markers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean preview files without scene entries */
  screenshots?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean sprite and vtt files without scene entries */
  sprites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Clean scene transcodes without scene entries */
  transcodes?: InputMaybe<Scalars['Boolean']['input']>;
};

type CleanMetadataInput = {
  /** Do a dry run. Don't delete any files */
  dryRun: Scalars['Boolean']['input'];
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
};

type ConfigDlnaInput = {
  /** True if DLNA service should be enabled by default */
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** List of interfaces to run DLNA on. Empty for all */
  interfaces?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Defaults to 1338 */
  port?: InputMaybe<Scalars['Int']['input']>;
  serverName?: InputMaybe<Scalars['String']['input']>;
  /** Order to sort videos */
  videoSortOrder?: InputMaybe<Scalars['String']['input']>;
  /** List of IPs whitelisted for DLNA service */
  whitelistedIPs?: InputMaybe<Array<Scalars['String']['input']>>;
};

type ConfigDlnaResult = {
  __typename?: 'ConfigDLNAResult';
  /** True if DLNA service should be enabled by default */
  enabled: Scalars['Boolean']['output'];
  /** List of interfaces to run DLNA on. Empty for all */
  interfaces: Array<Scalars['String']['output']>;
  /** Defaults to 1338 */
  port: Scalars['Int']['output'];
  serverName: Scalars['String']['output'];
  /** Order to sort videos */
  videoSortOrder: Scalars['String']['output'];
  /** List of IPs whitelisted for DLNA service */
  whitelistedIPs: Array<Scalars['String']['output']>;
};

type ConfigDefaultSettingsInput = {
  autoTag?: InputMaybe<AutoTagMetadataInput>;
  /** If true, delete file checkbox will be checked by default */
  deleteFile?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, delete generated files checkbox will be checked by default */
  deleteGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  generate?: InputMaybe<GenerateMetadataInput>;
  identify?: InputMaybe<IdentifyMetadataInput>;
  scan?: InputMaybe<ScanMetadataInput>;
};

type ConfigDefaultSettingsResult = {
  __typename?: 'ConfigDefaultSettingsResult';
  autoTag?: Maybe<AutoTagMetadataOptions>;
  /** If true, delete file checkbox will be checked by default */
  deleteFile?: Maybe<Scalars['Boolean']['output']>;
  /** If true, delete generated supporting files checkbox will be checked by default */
  deleteGenerated?: Maybe<Scalars['Boolean']['output']>;
  generate?: Maybe<GenerateMetadataOptions>;
  identify?: Maybe<IdentifyMetadataTaskOptions>;
  scan?: Maybe<ScanMetadataOptions>;
};

type ConfigDisableDropdownCreate = {
  __typename?: 'ConfigDisableDropdownCreate';
  movie: Scalars['Boolean']['output'];
  performer: Scalars['Boolean']['output'];
  studio: Scalars['Boolean']['output'];
  tag: Scalars['Boolean']['output'];
};

type ConfigDisableDropdownCreateInput = {
  movie?: InputMaybe<Scalars['Boolean']['input']>;
  performer?: InputMaybe<Scalars['Boolean']['input']>;
  studio?: InputMaybe<Scalars['Boolean']['input']>;
  tag?: InputMaybe<Scalars['Boolean']['input']>;
};

type ConfigGeneralInput = {
  /** Path to backup directory */
  backupDirectoryPath?: InputMaybe<Scalars['String']['input']>;
  /** Path to blobs - required for filesystem blob storage */
  blobsPath?: InputMaybe<Scalars['String']['input']>;
  /** Where to store blobs */
  blobsStorage?: InputMaybe<BlobsStorageType>;
  /** Path to cache */
  cachePath?: InputMaybe<Scalars['String']['input']>;
  /** Whether to calculate MD5 checksums for scene video files */
  calculateMD5?: InputMaybe<Scalars['Boolean']['input']>;
  /** True if galleries should be created from folders with images */
  createGalleriesFromFolders?: InputMaybe<Scalars['Boolean']['input']>;
  /** Create Image Clips from Video extensions when Videos are disabled in Library */
  createImageClipsFromVideos?: InputMaybe<Scalars['Boolean']['input']>;
  /** Custom Performer Image Location */
  customPerformerImageLocation?: InputMaybe<Scalars['String']['input']>;
  /** Path to the SQLite database */
  databasePath?: InputMaybe<Scalars['String']['input']>;
  /** whether to include range in generated funscript heatmaps */
  drawFunscriptHeatmapRange?: InputMaybe<Scalars['Boolean']['input']>;
  /** Array of file regexp to exclude from Video Scans */
  excludes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Path to the ffmpeg binary. If empty, stash will attempt to find it in the path or config directory */
  ffmpegPath?: InputMaybe<Scalars['String']['input']>;
  /** Path to the ffprobe binary. If empty, stash will attempt to find it in the path or config directory */
  ffprobePath?: InputMaybe<Scalars['String']['input']>;
  /** Regex used to identify images as gallery covers */
  galleryCoverRegex?: InputMaybe<Scalars['String']['input']>;
  /** Array of gallery zip file extensions */
  galleryExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Path to generated files */
  generatedPath?: InputMaybe<Scalars['String']['input']>;
  /** Array of file regexp to exclude from Image Scans */
  imageExcludes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Array of image file extensions */
  imageExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * ffmpeg stream input args - injected before input file
   * These are applied when live transcoding
   */
  liveTranscodeInputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * ffmpeg stream output args - injected before output file
   * These are applied when live transcoding
   */
  liveTranscodeOutputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether to log http access */
  logAccess?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name of the log file */
  logFile?: InputMaybe<Scalars['String']['input']>;
  /** Minimum log level */
  logLevel?: InputMaybe<Scalars['String']['input']>;
  /** Whether to also output to stderr */
  logOut?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum session cookie age */
  maxSessionAge?: InputMaybe<Scalars['Int']['input']>;
  /** Max streaming transcode size */
  maxStreamingTranscodeSize?: InputMaybe<StreamingResolutionEnum>;
  /** Max generated transcode size */
  maxTranscodeSize?: InputMaybe<StreamingResolutionEnum>;
  /** Path to import/export files */
  metadataPath?: InputMaybe<Scalars['String']['input']>;
  /** Number of parallel tasks to start during scan/generate */
  parallelTasks?: InputMaybe<Scalars['Int']['input']>;
  /** Password */
  password?: InputMaybe<Scalars['String']['input']>;
  /** Source of plugin packages */
  pluginPackageSources?: InputMaybe<Array<PackageSourceInput>>;
  /** Path to plugins */
  pluginsPath?: InputMaybe<Scalars['String']['input']>;
  /** Include audio stream in previews */
  previewAudio?: InputMaybe<Scalars['Boolean']['input']>;
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd?: InputMaybe<Scalars['String']['input']>;
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart?: InputMaybe<Scalars['String']['input']>;
  /** Preset when generating preview */
  previewPreset?: InputMaybe<PreviewPreset>;
  /** Preview segment duration, in seconds */
  previewSegmentDuration?: InputMaybe<Scalars['Float']['input']>;
  /** Number of segments in a preview file */
  previewSegments?: InputMaybe<Scalars['Int']['input']>;
  /** Python path - resolved using path if unset */
  pythonPath?: InputMaybe<Scalars['String']['input']>;
  /** Source of scraper packages */
  scraperPackageSources?: InputMaybe<Array<PackageSourceInput>>;
  /** Path to scrapers */
  scrapersPath?: InputMaybe<Scalars['String']['input']>;
  /** Stash-box instances used for tagging */
  stashBoxes?: InputMaybe<Array<StashBoxInput>>;
  /** Array of file paths to content */
  stashes?: InputMaybe<Array<StashConfigInput>>;
  /** Transcode Hardware Acceleration */
  transcodeHardwareAcceleration?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * ffmpeg transcode input args - injected before input file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeInputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * ffmpeg transcode output args - injected before output file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeOutputArgs?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Username */
  username?: InputMaybe<Scalars['String']['input']>;
  /** Array of video file extensions */
  videoExtensions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Hash algorithm to use for generated file naming */
  videoFileNamingAlgorithm?: InputMaybe<HashAlgorithm>;
  /** Write image thumbnails to disk when generating on the fly */
  writeImageThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
};

type ConfigGeneralResult = {
  __typename?: 'ConfigGeneralResult';
  /** API Key */
  apiKey: Scalars['String']['output'];
  /** Path to backup directory */
  backupDirectoryPath: Scalars['String']['output'];
  /** Path to blobs - required for filesystem blob storage */
  blobsPath: Scalars['String']['output'];
  /** Where to store blobs */
  blobsStorage: BlobsStorageType;
  /** Path to cache */
  cachePath: Scalars['String']['output'];
  /** Whether to calculate MD5 checksums for scene video files */
  calculateMD5: Scalars['Boolean']['output'];
  /** Path to the config file used */
  configFilePath: Scalars['String']['output'];
  /** True if galleries should be created from folders with images */
  createGalleriesFromFolders: Scalars['Boolean']['output'];
  /** Create Image Clips from Video extensions when Videos are disabled in Library */
  createImageClipsFromVideos: Scalars['Boolean']['output'];
  /** Custom Performer Image Location */
  customPerformerImageLocation?: Maybe<Scalars['String']['output']>;
  /** Path to the SQLite database */
  databasePath: Scalars['String']['output'];
  /** whether to include range in generated funscript heatmaps */
  drawFunscriptHeatmapRange: Scalars['Boolean']['output'];
  /** Array of file regexp to exclude from Video Scans */
  excludes: Array<Scalars['String']['output']>;
  /** Path to the ffmpeg binary. If empty, stash will attempt to find it in the path or config directory */
  ffmpegPath: Scalars['String']['output'];
  /** Path to the ffprobe binary. If empty, stash will attempt to find it in the path or config directory */
  ffprobePath: Scalars['String']['output'];
  /** Regex used to identify images as gallery covers */
  galleryCoverRegex: Scalars['String']['output'];
  /** Array of gallery zip file extensions */
  galleryExtensions: Array<Scalars['String']['output']>;
  /** Path to generated files */
  generatedPath: Scalars['String']['output'];
  /** Array of file regexp to exclude from Image Scans */
  imageExcludes: Array<Scalars['String']['output']>;
  /** Array of image file extensions */
  imageExtensions: Array<Scalars['String']['output']>;
  /**
   * ffmpeg stream input args - injected before input file
   * These are applied when live transcoding
   */
  liveTranscodeInputArgs: Array<Scalars['String']['output']>;
  /**
   * ffmpeg stream output args - injected before output file
   * These are applied when live transcoding
   */
  liveTranscodeOutputArgs: Array<Scalars['String']['output']>;
  /** Whether to log http access */
  logAccess: Scalars['Boolean']['output'];
  /** Name of the log file */
  logFile?: Maybe<Scalars['String']['output']>;
  /** Minimum log level */
  logLevel: Scalars['String']['output'];
  /** Whether to also output to stderr */
  logOut: Scalars['Boolean']['output'];
  /** Maximum session cookie age */
  maxSessionAge: Scalars['Int']['output'];
  /** Max streaming transcode size */
  maxStreamingTranscodeSize?: Maybe<StreamingResolutionEnum>;
  /** Max generated transcode size */
  maxTranscodeSize?: Maybe<StreamingResolutionEnum>;
  /** Path to import/export files */
  metadataPath: Scalars['String']['output'];
  /** Number of parallel tasks to start during scan/generate */
  parallelTasks: Scalars['Int']['output'];
  /** Password */
  password: Scalars['String']['output'];
  /** Source of plugin packages */
  pluginPackageSources: Array<PackageSource>;
  /** Path to plugins */
  pluginsPath: Scalars['String']['output'];
  /** Include audio stream in previews */
  previewAudio: Scalars['Boolean']['output'];
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd: Scalars['String']['output'];
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart: Scalars['String']['output'];
  /** Preset when generating preview */
  previewPreset: PreviewPreset;
  /** Preview segment duration, in seconds */
  previewSegmentDuration: Scalars['Float']['output'];
  /** Number of segments in a preview file */
  previewSegments: Scalars['Int']['output'];
  /** Python path - resolved using path if unset */
  pythonPath: Scalars['String']['output'];
  /** Source of scraper packages */
  scraperPackageSources: Array<PackageSource>;
  /** Path to scrapers */
  scrapersPath: Scalars['String']['output'];
  /** Stash-box instances used for tagging */
  stashBoxes: Array<StashBox>;
  /** Array of file paths to content */
  stashes: Array<StashConfig>;
  /** Transcode Hardware Acceleration */
  transcodeHardwareAcceleration: Scalars['Boolean']['output'];
  /**
   * ffmpeg transcode input args - injected before input file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeInputArgs: Array<Scalars['String']['output']>;
  /**
   * ffmpeg transcode output args - injected before output file
   * These are applied to generated transcodes (previews and transcodes)
   */
  transcodeOutputArgs: Array<Scalars['String']['output']>;
  /** Username */
  username: Scalars['String']['output'];
  /** Array of video file extensions */
  videoExtensions: Array<Scalars['String']['output']>;
  /** Hash algorithm to use for generated file naming */
  videoFileNamingAlgorithm: HashAlgorithm;
  /** Write image thumbnails to disk when generating on the fly */
  writeImageThumbnails: Scalars['Boolean']['output'];
};

type ConfigImageLightboxInput = {
  displayMode?: InputMaybe<ImageLightboxDisplayMode>;
  resetZoomOnNav?: InputMaybe<Scalars['Boolean']['input']>;
  scaleUp?: InputMaybe<Scalars['Boolean']['input']>;
  scrollAttemptsBeforeChange?: InputMaybe<Scalars['Int']['input']>;
  scrollMode?: InputMaybe<ImageLightboxScrollMode>;
  slideshowDelay?: InputMaybe<Scalars['Int']['input']>;
};

type ConfigImageLightboxResult = {
  __typename?: 'ConfigImageLightboxResult';
  displayMode?: Maybe<ImageLightboxDisplayMode>;
  resetZoomOnNav?: Maybe<Scalars['Boolean']['output']>;
  scaleUp?: Maybe<Scalars['Boolean']['output']>;
  scrollAttemptsBeforeChange: Scalars['Int']['output'];
  scrollMode?: Maybe<ImageLightboxScrollMode>;
  slideshowDelay?: Maybe<Scalars['Int']['output']>;
};

type ConfigInterfaceInput = {
  /** If true, video will autostart on load in the scene player */
  autostartVideo?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, video will autostart when loading from play random or play selected */
  autostartVideoOnPlaySelected?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, next scene in playlist will be played at video end by default */
  continuePlaylistDefault?: InputMaybe<Scalars['Boolean']['input']>;
  /** Custom CSS */
  css?: InputMaybe<Scalars['String']['input']>;
  cssEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Custom Locales */
  customLocales?: InputMaybe<Scalars['String']['input']>;
  customLocalesEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Set to true to disable creating new objects via the dropdown menus */
  disableDropdownCreate?: InputMaybe<ConfigDisableDropdownCreateInput>;
  /** Funscript Time Offset */
  funscriptOffset?: InputMaybe<Scalars['Int']['input']>;
  /** Handy Connection Key */
  handyKey?: InputMaybe<Scalars['String']['input']>;
  imageLightbox?: InputMaybe<ConfigImageLightboxInput>;
  /** Custom Javascript */
  javascript?: InputMaybe<Scalars['String']['input']>;
  javascriptEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Interface language */
  language?: InputMaybe<Scalars['String']['input']>;
  /** Maximum duration (in seconds) in which a scene video will loop in the scene player */
  maximumLoopDuration?: InputMaybe<Scalars['Int']['input']>;
  /** Ordered list of items that should be shown in the menu */
  menuItems?: InputMaybe<Array<Scalars['String']['input']>>;
  /** True if we should not auto-open a browser window on startup */
  noBrowser?: InputMaybe<Scalars['Boolean']['input']>;
  /** True if we should send notifications to the desktop */
  notificationsEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Show scene scrubber by default */
  showScrubber?: InputMaybe<Scalars['Boolean']['input']>;
  /** If true, studio overlays will be shown as text instead of logo images */
  showStudioAsText?: InputMaybe<Scalars['Boolean']['input']>;
  /** Enable sound on mouseover previews */
  soundOnPreview?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether to use Stash Hosted Funscript */
  useStashHostedFunscript?: InputMaybe<Scalars['Boolean']['input']>;
  /** Wall playback type */
  wallPlayback?: InputMaybe<Scalars['String']['input']>;
  /** Show title and tags in wall view */
  wallShowTitle?: InputMaybe<Scalars['Boolean']['input']>;
};

type ConfigInterfaceResult = {
  __typename?: 'ConfigInterfaceResult';
  /** If true, video will autostart on load in the scene player */
  autostartVideo?: Maybe<Scalars['Boolean']['output']>;
  /** If true, video will autostart when loading from play random or play selected */
  autostartVideoOnPlaySelected?: Maybe<Scalars['Boolean']['output']>;
  /** If true, next scene in playlist will be played at video end by default */
  continuePlaylistDefault?: Maybe<Scalars['Boolean']['output']>;
  /** Custom CSS */
  css?: Maybe<Scalars['String']['output']>;
  cssEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** Custom Locales */
  customLocales?: Maybe<Scalars['String']['output']>;
  customLocalesEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** Fields are true if creating via dropdown menus are disabled */
  disableDropdownCreate: ConfigDisableDropdownCreate;
  /** Funscript Time Offset */
  funscriptOffset?: Maybe<Scalars['Int']['output']>;
  /** Handy Connection Key */
  handyKey?: Maybe<Scalars['String']['output']>;
  imageLightbox: ConfigImageLightboxResult;
  /** Custom Javascript */
  javascript?: Maybe<Scalars['String']['output']>;
  javascriptEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** Interface language */
  language?: Maybe<Scalars['String']['output']>;
  /** Maximum duration (in seconds) in which a scene video will loop in the scene player */
  maximumLoopDuration?: Maybe<Scalars['Int']['output']>;
  /** Ordered list of items that should be shown in the menu */
  menuItems?: Maybe<Array<Scalars['String']['output']>>;
  /** True if we should not auto-open a browser window on startup */
  noBrowser?: Maybe<Scalars['Boolean']['output']>;
  /** True if we should send desktop notifications */
  notificationsEnabled?: Maybe<Scalars['Boolean']['output']>;
  /** Show scene scrubber by default */
  showScrubber?: Maybe<Scalars['Boolean']['output']>;
  /** If true, studio overlays will be shown as text instead of logo images */
  showStudioAsText?: Maybe<Scalars['Boolean']['output']>;
  /** Enable sound on mouseover previews */
  soundOnPreview?: Maybe<Scalars['Boolean']['output']>;
  /** Whether to use Stash Hosted Funscript */
  useStashHostedFunscript?: Maybe<Scalars['Boolean']['output']>;
  /** Wall playback type */
  wallPlayback?: Maybe<Scalars['String']['output']>;
  /** Show title and tags in wall view */
  wallShowTitle?: Maybe<Scalars['Boolean']['output']>;
};

/** All configuration settings */
type ConfigResult = {
  __typename?: 'ConfigResult';
  defaults: ConfigDefaultSettingsResult;
  dlna: ConfigDlnaResult;
  general: ConfigGeneralResult;
  interface: ConfigInterfaceResult;
  plugins: Scalars['PluginConfigMap']['output'];
  scraping: ConfigScrapingResult;
  ui: Scalars['Map']['output'];
};


/** All configuration settings */
type ConfigResultPluginsArgs = {
  include?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type ConfigScrapingInput = {
  /** Tags blacklist during scraping */
  excludeTagPatterns?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Scraper CDP path. Path to chrome executable or remote address */
  scraperCDPPath?: InputMaybe<Scalars['String']['input']>;
  /** Whether the scraper should check for invalid certificates */
  scraperCertCheck?: InputMaybe<Scalars['Boolean']['input']>;
  /** Scraper user agent string */
  scraperUserAgent?: InputMaybe<Scalars['String']['input']>;
};

type ConfigScrapingResult = {
  __typename?: 'ConfigScrapingResult';
  /** Tags blacklist during scraping */
  excludeTagPatterns: Array<Scalars['String']['output']>;
  /** Scraper CDP path. Path to chrome executable or remote address */
  scraperCDPPath?: Maybe<Scalars['String']['output']>;
  /** Whether the scraper should check for invalid certificates */
  scraperCertCheck: Scalars['Boolean']['output'];
  /** Scraper user agent string */
  scraperUserAgent?: Maybe<Scalars['String']['output']>;
};

const enum CriterionModifier {
  /** >= AND <= */
  Between = 'BETWEEN',
  /** = */
  Equals = 'EQUALS',
  Excludes = 'EXCLUDES',
  /** > */
  GreaterThan = 'GREATER_THAN',
  Includes = 'INCLUDES',
  /** INCLUDES ALL */
  IncludesAll = 'INCLUDES_ALL',
  /** IS NULL */
  IsNull = 'IS_NULL',
  /** < */
  LessThan = 'LESS_THAN',
  /** MATCHES REGEX */
  MatchesRegex = 'MATCHES_REGEX',
  /** < OR > */
  NotBetween = 'NOT_BETWEEN',
  /** != */
  NotEquals = 'NOT_EQUALS',
  /** NOT MATCHES REGEX */
  NotMatchesRegex = 'NOT_MATCHES_REGEX',
  /** IS NOT NULL */
  NotNull = 'NOT_NULL'
};

type Dlnaip = {
  __typename?: 'DLNAIP';
  ipAddress: Scalars['String']['output'];
  /** Time until IP will be no longer allowed/disallowed */
  until?: Maybe<Scalars['Time']['output']>;
};

type DlnaStatus = {
  __typename?: 'DLNAStatus';
  allowedIPAddresses: Array<Dlnaip>;
  recentIPAddresses: Array<Scalars['String']['output']>;
  running: Scalars['Boolean']['output'];
  /** If not currently running, time until it will be started. If running, time until it will be stopped */
  until?: Maybe<Scalars['Time']['output']>;
};

type DateCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
  value2?: InputMaybe<Scalars['String']['input']>;
};

type DestroyFilterInput = {
  id: Scalars['ID']['input'];
};

/** Directory structure of a path */
type Directory = {
  __typename?: 'Directory';
  directories: Array<Scalars['String']['output']>;
  parent?: Maybe<Scalars['String']['output']>;
  path: Scalars['String']['output'];
};

type DisableDlnaInput = {
  /** Duration to enable, in minutes. 0 or null for indefinite. */
  duration?: InputMaybe<Scalars['Int']['input']>;
};

type EnableDlnaInput = {
  /** Duration to enable, in minutes. 0 or null for indefinite. */
  duration?: InputMaybe<Scalars['Int']['input']>;
};

type ExportObjectTypeInput = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
};

type ExportObjectsInput = {
  galleries?: InputMaybe<ExportObjectTypeInput>;
  groups?: InputMaybe<ExportObjectTypeInput>;
  images?: InputMaybe<ExportObjectTypeInput>;
  includeDependencies?: InputMaybe<Scalars['Boolean']['input']>;
  /** @deprecated Use groups instead */
  movies?: InputMaybe<ExportObjectTypeInput>;
  performers?: InputMaybe<ExportObjectTypeInput>;
  scenes?: InputMaybe<ExportObjectTypeInput>;
  studios?: InputMaybe<ExportObjectTypeInput>;
  tags?: InputMaybe<ExportObjectTypeInput>;
};

type FileSetFingerprintsInput = {
  /** only supplied fingerprint types will be modified */
  fingerprints: Array<SetFingerprintsInput>;
  id: Scalars['ID']['input'];
};

const enum FilterMode {
  Galleries = 'GALLERIES',
  Groups = 'GROUPS',
  Images = 'IMAGES',
  Movies = 'MOVIES',
  Performers = 'PERFORMERS',
  Scenes = 'SCENES',
  SceneMarkers = 'SCENE_MARKERS',
  Studios = 'STUDIOS',
  Tags = 'TAGS'
};

type FindFilterType = {
  direction?: InputMaybe<SortDirectionEnum>;
  page?: InputMaybe<Scalars['Int']['input']>;
  /** use per_page = -1 to indicate all results. Defaults to 25. */
  per_page?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

type FindGalleriesResultType = {
  __typename?: 'FindGalleriesResultType';
  count: Scalars['Int']['output'];
  galleries: Array<Gallery>;
};

type FindGalleryChaptersResultType = {
  __typename?: 'FindGalleryChaptersResultType';
  chapters: Array<GalleryChapter>;
  count: Scalars['Int']['output'];
};

type FindGroupsResultType = {
  __typename?: 'FindGroupsResultType';
  count: Scalars['Int']['output'];
  groups: Array<Group>;
};

type FindImagesResultType = {
  __typename?: 'FindImagesResultType';
  count: Scalars['Int']['output'];
  /** Total file size in bytes */
  filesize: Scalars['Float']['output'];
  images: Array<Image>;
  /** Total megapixels of the images */
  megapixels: Scalars['Float']['output'];
};

type FindJobInput = {
  id: Scalars['ID']['input'];
};

type FindMoviesResultType = {
  __typename?: 'FindMoviesResultType';
  count: Scalars['Int']['output'];
  movies: Array<Movie>;
};

type FindPerformersResultType = {
  __typename?: 'FindPerformersResultType';
  count: Scalars['Int']['output'];
  performers: Array<Performer>;
};

type FindSceneMarkersResultType = {
  __typename?: 'FindSceneMarkersResultType';
  count: Scalars['Int']['output'];
  scene_markers: Array<SceneMarker>;
};

type FindScenesResultType = {
  __typename?: 'FindScenesResultType';
  count: Scalars['Int']['output'];
  /** Total duration in seconds */
  duration: Scalars['Float']['output'];
  /** Total file size in bytes */
  filesize: Scalars['Float']['output'];
  scenes: Array<Scene>;
};

type FindStudiosResultType = {
  __typename?: 'FindStudiosResultType';
  count: Scalars['Int']['output'];
  studios: Array<Studio>;
};

type FindTagsResultType = {
  __typename?: 'FindTagsResultType';
  count: Scalars['Int']['output'];
  tags: Array<Tag>;
};

type Fingerprint = {
  __typename?: 'Fingerprint';
  type: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

type FloatCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['Float']['input'];
  value2?: InputMaybe<Scalars['Float']['input']>;
};

type Folder = {
  __typename?: 'Folder';
  created_at: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder_id?: Maybe<Scalars['ID']['output']>;
  path: Scalars['String']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};

/** Gallery type */
type Gallery = {
  __typename?: 'Gallery';
  chapters: Array<GalleryChapter>;
  code?: Maybe<Scalars['String']['output']>;
  cover?: Maybe<Image>;
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  files: Array<GalleryFile>;
  folder?: Maybe<Folder>;
  id: Scalars['ID']['output'];
  image_count: Scalars['Int']['output'];
  organized: Scalars['Boolean']['output'];
  performers: Array<Performer>;
  photographer?: Maybe<Scalars['String']['output']>;
  rating100?: Maybe<Scalars['Int']['output']>;
  scenes: Array<Scene>;
  studio?: Maybe<Studio>;
  tags: Array<Tag>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls: Array<Scalars['String']['output']>;
};

type GalleryAddInput = {
  gallery_id: Scalars['ID']['input'];
  image_ids: Array<Scalars['ID']['input']>;
};

type GalleryChapter = {
  __typename?: 'GalleryChapter';
  created_at: Scalars['Time']['output'];
  gallery: Gallery;
  id: Scalars['ID']['output'];
  image_index: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updated_at: Scalars['Time']['output'];
};

type GalleryChapterCreateInput = {
  gallery_id: Scalars['ID']['input'];
  image_index: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

type GalleryChapterUpdateInput = {
  gallery_id?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  image_index?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

type GalleryCreateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  scene_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title: Scalars['String']['input'];
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type GalleryDestroyInput = {
  /**
   * If true, then the zip file will be deleted if the gallery is zip-file-based.
   * If gallery is folder-based, then any files not associated with other
   * galleries will be deleted, along with the folder, if it is not empty.
   */
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

type GalleryFile = BaseFile & {
  __typename?: 'GalleryFile';
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


type GalleryFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

type GalleryFilterType = {
  AND?: InputMaybe<GalleryFilterType>;
  NOT?: InputMaybe<GalleryFilterType>;
  OR?: InputMaybe<GalleryFilterType>;
  /** Filter by average image resolution */
  average_resolution?: InputMaybe<ResolutionCriterionInput>;
  /** Filter by file checksum */
  checksum?: InputMaybe<StringCriterionInput>;
  /** Filter by studio code */
  code?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  /** Filter by zip-file count */
  file_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include galleries that have chapters. `true` or `false` */
  has_chapters?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<IntCriterionInput>;
  /** Filter by number of images in this gallery */
  image_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related images that meet this criteria */
  images_filter?: InputMaybe<ImageFilterType>;
  /** Filter to only include galleries missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter to include/exclude galleries that were created from zip */
  is_zip?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by organized */
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by path */
  path?: InputMaybe<StringCriterionInput>;
  /** Filter galleries by performer age at time of gallery */
  performer_age?: InputMaybe<IntCriterionInput>;
  /** Filter by performer count */
  performer_count?: InputMaybe<IntCriterionInput>;
  /** Filter galleries that have performers that have been favorited */
  performer_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include galleries with performers with these tags */
  performer_tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter to only include galleries with these performers */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by related performers that meet this criteria */
  performers_filter?: InputMaybe<PerformerFilterType>;
  /** Filter by photographer */
  photographer?: InputMaybe<StringCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter to only include galleries with these scenes */
  scenes?: InputMaybe<MultiCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scenes_filter?: InputMaybe<SceneFilterType>;
  /** Filter to only include galleries with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include galleries with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related tags that meet this criteria */
  tags_filter?: InputMaybe<TagFilterType>;
  title?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

type GalleryRemoveInput = {
  gallery_id: Scalars['ID']['input'];
  image_ids: Array<Scalars['ID']['input']>;
};

type GalleryUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  primary_file_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  scene_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type GenderCriterionInput = {
  modifier: CriterionModifier;
  value?: InputMaybe<GenderEnum>;
  value_list?: InputMaybe<Array<GenderEnum>>;
};

const enum GenderEnum {
  Female = 'FEMALE',
  Intersex = 'INTERSEX',
  Male = 'MALE',
  NonBinary = 'NON_BINARY',
  TransgenderFemale = 'TRANSGENDER_FEMALE',
  TransgenderMale = 'TRANSGENDER_MALE'
};

type GenerateApiKeyInput = {
  clear?: InputMaybe<Scalars['Boolean']['input']>;
};

type GenerateMetadataInput = {
  clipPreviews?: InputMaybe<Scalars['Boolean']['input']>;
  covers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate transcodes even if not required */
  forceTranscodes?: InputMaybe<Scalars['Boolean']['input']>;
  imagePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  imageThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
  interactiveHeatmapsSpeeds?: InputMaybe<Scalars['Boolean']['input']>;
  /** marker ids to generate for */
  markerIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  markerImagePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  markerScreenshots?: InputMaybe<Scalars['Boolean']['input']>;
  markers?: InputMaybe<Scalars['Boolean']['input']>;
  /** overwrite existing media */
  overwrite?: InputMaybe<Scalars['Boolean']['input']>;
  phashes?: InputMaybe<Scalars['Boolean']['input']>;
  previewOptions?: InputMaybe<GeneratePreviewOptionsInput>;
  previews?: InputMaybe<Scalars['Boolean']['input']>;
  /** scene ids to generate for */
  sceneIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  sprites?: InputMaybe<Scalars['Boolean']['input']>;
  transcodes?: InputMaybe<Scalars['Boolean']['input']>;
};

type GenerateMetadataOptions = {
  __typename?: 'GenerateMetadataOptions';
  clipPreviews?: Maybe<Scalars['Boolean']['output']>;
  covers?: Maybe<Scalars['Boolean']['output']>;
  imagePreviews?: Maybe<Scalars['Boolean']['output']>;
  imageThumbnails?: Maybe<Scalars['Boolean']['output']>;
  interactiveHeatmapsSpeeds?: Maybe<Scalars['Boolean']['output']>;
  markerImagePreviews?: Maybe<Scalars['Boolean']['output']>;
  markerScreenshots?: Maybe<Scalars['Boolean']['output']>;
  markers?: Maybe<Scalars['Boolean']['output']>;
  phashes?: Maybe<Scalars['Boolean']['output']>;
  previewOptions?: Maybe<GeneratePreviewOptions>;
  previews?: Maybe<Scalars['Boolean']['output']>;
  sprites?: Maybe<Scalars['Boolean']['output']>;
  transcodes?: Maybe<Scalars['Boolean']['output']>;
};

type GeneratePreviewOptions = {
  __typename?: 'GeneratePreviewOptions';
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd?: Maybe<Scalars['String']['output']>;
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart?: Maybe<Scalars['String']['output']>;
  /** Preset when generating preview */
  previewPreset?: Maybe<PreviewPreset>;
  /** Preview segment duration, in seconds */
  previewSegmentDuration?: Maybe<Scalars['Float']['output']>;
  /** Number of segments in a preview file */
  previewSegments?: Maybe<Scalars['Int']['output']>;
};

type GeneratePreviewOptionsInput = {
  /** Duration of end of video to exclude when generating previews */
  previewExcludeEnd?: InputMaybe<Scalars['String']['input']>;
  /** Duration of start of video to exclude when generating previews */
  previewExcludeStart?: InputMaybe<Scalars['String']['input']>;
  /** Preset when generating preview */
  previewPreset?: InputMaybe<PreviewPreset>;
  /** Preview segment duration, in seconds */
  previewSegmentDuration?: InputMaybe<Scalars['Float']['input']>;
  /** Number of segments in a preview file */
  previewSegments?: InputMaybe<Scalars['Int']['input']>;
};

type Group = {
  __typename?: 'Group';
  aliases?: Maybe<Scalars['String']['output']>;
  back_image_path?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  /** Duration in seconds */
  duration?: Maybe<Scalars['Int']['output']>;
  front_image_path?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rating100?: Maybe<Scalars['Int']['output']>;
  scene_count: Scalars['Int']['output'];
  scenes: Array<Scene>;
  studio?: Maybe<Studio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags: Array<Tag>;
  updated_at: Scalars['Time']['output'];
  urls: Array<Scalars['String']['output']>;
};

type GroupCreateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  /** Duration in seconds */
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type GroupDestroyInput = {
  id: Scalars['ID']['input'];
};

type GroupFilterType = {
  AND?: InputMaybe<GroupFilterType>;
  NOT?: InputMaybe<GroupFilterType>;
  OR?: InputMaybe<GroupFilterType>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  director?: InputMaybe<StringCriterionInput>;
  /** Filter by duration (in seconds) */
  duration?: InputMaybe<IntCriterionInput>;
  /** Filter to only include groups missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter to only include groups where performer appears in a scene */
  performers?: InputMaybe<MultiCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scenes_filter?: InputMaybe<SceneFilterType>;
  /** Filter to only include groups with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  synopsis?: InputMaybe<StringCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include groups with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

type GroupUpdateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

const enum HashAlgorithm {
  Md5 = 'MD5',
  /** oshash */
  Oshash = 'OSHASH'
};

type HierarchicalMultiCriterionInput = {
  depth?: InputMaybe<Scalars['Int']['input']>;
  excludes?: InputMaybe<Array<Scalars['ID']['input']>>;
  modifier: CriterionModifier;
  value?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type HistoryMutationResult = {
  __typename?: 'HistoryMutationResult';
  count: Scalars['Int']['output'];
  history: Array<Scalars['Time']['output']>;
};

type IdentifyFieldOptions = {
  __typename?: 'IdentifyFieldOptions';
  /** creates missing objects if needed - only applicable for performers, tags and studios */
  createMissing?: Maybe<Scalars['Boolean']['output']>;
  field: Scalars['String']['output'];
  strategy: IdentifyFieldStrategy;
};

type IdentifyFieldOptionsInput = {
  /** creates missing objects if needed - only applicable for performers, tags and studios */
  createMissing?: InputMaybe<Scalars['Boolean']['input']>;
  field: Scalars['String']['input'];
  strategy: IdentifyFieldStrategy;
};

const enum IdentifyFieldStrategy {
  /** Never sets the field value */
  Ignore = 'IGNORE',
  /**
   * For multi-value fields, merge with existing.
   * For single-value fields, ignore if already set
   */
  Merge = 'MERGE',
  /**
   * Always replaces the value if a value is found.
   * For multi-value fields, any existing values are removed and replaced with the
   * scraped values.
   */
  Overwrite = 'OVERWRITE'
};

type IdentifyMetadataInput = {
  /** Options defined here override the configured defaults */
  options?: InputMaybe<IdentifyMetadataOptionsInput>;
  /** paths of scenes to identify - ignored if scene ids are set */
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** scene ids to identify */
  sceneIDs?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** An ordered list of sources to identify items with. Only the first source that finds a match is used. */
  sources: Array<IdentifySourceInput>;
};

type IdentifyMetadataOptions = {
  __typename?: 'IdentifyMetadataOptions';
  /** any fields missing from here are defaulted to MERGE and createMissing false */
  fieldOptions?: Maybe<Array<IdentifyFieldOptions>>;
  /** defaults to true if not provided */
  includeMalePerformers?: Maybe<Scalars['Boolean']['output']>;
  /** defaults to true if not provided */
  setCoverImage?: Maybe<Scalars['Boolean']['output']>;
  setOrganized?: Maybe<Scalars['Boolean']['output']>;
  /** tag to tag skipped multiple matches with */
  skipMultipleMatchTag?: Maybe<Scalars['String']['output']>;
  /** defaults to true if not provided */
  skipMultipleMatches?: Maybe<Scalars['Boolean']['output']>;
  /** tag to tag skipped single name performers with */
  skipSingleNamePerformerTag?: Maybe<Scalars['String']['output']>;
  /** defaults to true if not provided */
  skipSingleNamePerformers?: Maybe<Scalars['Boolean']['output']>;
};

type IdentifyMetadataOptionsInput = {
  /** any fields missing from here are defaulted to MERGE and createMissing false */
  fieldOptions?: InputMaybe<Array<IdentifyFieldOptionsInput>>;
  /** defaults to true if not provided */
  includeMalePerformers?: InputMaybe<Scalars['Boolean']['input']>;
  /** defaults to true if not provided */
  setCoverImage?: InputMaybe<Scalars['Boolean']['input']>;
  setOrganized?: InputMaybe<Scalars['Boolean']['input']>;
  /** tag to tag skipped multiple matches with */
  skipMultipleMatchTag?: InputMaybe<Scalars['String']['input']>;
  /** defaults to true if not provided */
  skipMultipleMatches?: InputMaybe<Scalars['Boolean']['input']>;
  /** tag to tag skipped single name performers with */
  skipSingleNamePerformerTag?: InputMaybe<Scalars['String']['input']>;
  /** defaults to true if not provided */
  skipSingleNamePerformers?: InputMaybe<Scalars['Boolean']['input']>;
};

type IdentifyMetadataTaskOptions = {
  __typename?: 'IdentifyMetadataTaskOptions';
  /** Options defined here override the configured defaults */
  options?: Maybe<IdentifyMetadataOptions>;
  /** An ordered list of sources to identify items with. Only the first source that finds a match is used. */
  sources: Array<IdentifySource>;
};

type IdentifySource = {
  __typename?: 'IdentifySource';
  /** Options defined for a source override the defaults */
  options?: Maybe<IdentifyMetadataOptions>;
  source: ScraperSource;
};

type IdentifySourceInput = {
  /** Options defined for a source override the defaults */
  options?: InputMaybe<IdentifyMetadataOptionsInput>;
  source: ScraperSourceInput;
};

type Image = {
  __typename?: 'Image';
  code?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use visual_files */
  files: Array<ImageFile>;
  galleries: Array<Gallery>;
  id: Scalars['ID']['output'];
  o_counter?: Maybe<Scalars['Int']['output']>;
  organized: Scalars['Boolean']['output'];
  paths: ImagePathsType;
  performers: Array<Performer>;
  photographer?: Maybe<Scalars['String']['output']>;
  rating100?: Maybe<Scalars['Int']['output']>;
  studio?: Maybe<Studio>;
  tags: Array<Tag>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls: Array<Scalars['String']['output']>;
  visual_files: Array<VisualFile>;
};

type ImageDestroyInput = {
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};

type ImageFile = BaseFile & {
  __typename?: 'ImageFile';
  basename: Scalars['String']['output'];
  created_at: Scalars['Time']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  width: Scalars['Int']['output'];
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


type ImageFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

type ImageFileType = {
  __typename?: 'ImageFileType';
  height: Scalars['Int']['output'];
  mod_time: Scalars['Time']['output'];
  size: Scalars['Int']['output'];
  width: Scalars['Int']['output'];
};

type ImageFilterType = {
  AND?: InputMaybe<ImageFilterType>;
  NOT?: InputMaybe<ImageFilterType>;
  OR?: InputMaybe<ImageFilterType>;
  /** Filter by file checksum */
  checksum?: InputMaybe<StringCriterionInput>;
  /** Filter by studio code */
  code?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  /** Filter by file count */
  file_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include images with these galleries */
  galleries?: InputMaybe<MultiCriterionInput>;
  /** Filter by related galleries that meet this criteria */
  galleries_filter?: InputMaybe<GalleryFilterType>;
  /**  Filter by image id */
  id?: InputMaybe<IntCriterionInput>;
  /** Filter to only include images missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by o-counter */
  o_counter?: InputMaybe<IntCriterionInput>;
  /** Filter by organized */
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by orientation */
  orientation?: InputMaybe<OrientationCriterionInput>;
  /** Filter by path */
  path?: InputMaybe<StringCriterionInput>;
  /** Filter images by performer age at time of image */
  performer_age?: InputMaybe<IntCriterionInput>;
  /** Filter by performer count */
  performer_count?: InputMaybe<IntCriterionInput>;
  /** Filter images that have performers that have been favorited */
  performer_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include images with performers with these tags */
  performer_tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter to only include images with these performers */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by related performers that meet this criteria */
  performers_filter?: InputMaybe<PerformerFilterType>;
  /** Filter by photographer */
  photographer?: InputMaybe<StringCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by resolution */
  resolution?: InputMaybe<ResolutionCriterionInput>;
  /** Filter to only include images with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include images with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related tags that meet this criteria */
  tags_filter?: InputMaybe<TagFilterType>;
  title?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

const enum ImageLightboxDisplayMode {
  FitX = 'FIT_X',
  FitXy = 'FIT_XY',
  Original = 'ORIGINAL'
};

const enum ImageLightboxScrollMode {
  PanY = 'PAN_Y',
  Zoom = 'ZOOM'
};

type ImagePathsType = {
  __typename?: 'ImagePathsType';
  image?: Maybe<Scalars['String']['output']>;
  preview?: Maybe<Scalars['String']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
};

type ImageUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  gallery_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  id: Scalars['ID']['input'];
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  primary_file_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type ImagesDestroyInput = {
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

const enum ImportDuplicateEnum {
  Fail = 'FAIL',
  Ignore = 'IGNORE',
  Overwrite = 'OVERWRITE'
};

const enum ImportMissingRefEnum {
  Create = 'CREATE',
  Fail = 'FAIL',
  Ignore = 'IGNORE'
};

type ImportObjectsInput = {
  duplicateBehaviour: ImportDuplicateEnum;
  file: Scalars['Upload']['input'];
  missingRefBehaviour: ImportMissingRefEnum;
};

type IntCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['Int']['input'];
  value2?: InputMaybe<Scalars['Int']['input']>;
};

type Job = {
  __typename?: 'Job';
  addTime: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  endTime?: Maybe<Scalars['Time']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  progress?: Maybe<Scalars['Float']['output']>;
  startTime?: Maybe<Scalars['Time']['output']>;
  status: JobStatus;
  subTasks?: Maybe<Array<Scalars['String']['output']>>;
};

const enum JobStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Finished = 'FINISHED',
  Ready = 'READY',
  Running = 'RUNNING',
  Stopping = 'STOPPING'
};

type JobStatusUpdate = {
  __typename?: 'JobStatusUpdate';
  job: Job;
  type: JobStatusUpdateType;
};

const enum JobStatusUpdateType {
  Add = 'ADD',
  Remove = 'REMOVE',
  Update = 'UPDATE'
};

type LatestVersion = {
  __typename?: 'LatestVersion';
  release_date: Scalars['String']['output'];
  shorthash: Scalars['String']['output'];
  url: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

type LogEntry = {
  __typename?: 'LogEntry';
  level: LogLevel;
  message: Scalars['String']['output'];
  time: Scalars['Time']['output'];
};

const enum LogLevel {
  Debug = 'Debug',
  Error = 'Error',
  Info = 'Info',
  Progress = 'Progress',
  Trace = 'Trace',
  Warning = 'Warning'
};

type MarkerStringsResultType = {
  __typename?: 'MarkerStringsResultType';
  count: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

type MigrateBlobsInput = {
  deleteOld?: InputMaybe<Scalars['Boolean']['input']>;
};

type MigrateInput = {
  backupPath: Scalars['String']['input'];
};

type MigrateSceneScreenshotsInput = {
  deleteFiles?: InputMaybe<Scalars['Boolean']['input']>;
  overwriteExisting?: InputMaybe<Scalars['Boolean']['input']>;
};

type MoveFilesInput = {
  /** valid only for single file id. If empty, existing basename is used */
  destination_basename?: InputMaybe<Scalars['String']['input']>;
  /** valid for single or multiple file ids */
  destination_folder?: InputMaybe<Scalars['String']['input']>;
  /** valid for single or multiple file ids */
  destination_folder_id?: InputMaybe<Scalars['ID']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

type Movie = {
  __typename?: 'Movie';
  aliases?: Maybe<Scalars['String']['output']>;
  back_image_path?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  /** Duration in seconds */
  duration?: Maybe<Scalars['Int']['output']>;
  front_image_path?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rating100?: Maybe<Scalars['Int']['output']>;
  scene_count: Scalars['Int']['output'];
  scenes: Array<Scene>;
  studio?: Maybe<Studio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags: Array<Tag>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls: Array<Scalars['String']['output']>;
};

type MovieCreateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  /** Duration in seconds */
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type MovieDestroyInput = {
  id: Scalars['ID']['input'];
};

type MovieFilterType = {
  AND?: InputMaybe<MovieFilterType>;
  NOT?: InputMaybe<MovieFilterType>;
  OR?: InputMaybe<MovieFilterType>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  director?: InputMaybe<StringCriterionInput>;
  /** Filter by duration (in seconds) */
  duration?: InputMaybe<IntCriterionInput>;
  /** Filter to only include movies missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter to only include movies where performer appears in a scene */
  performers?: InputMaybe<MultiCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scenes_filter?: InputMaybe<SceneFilterType>;
  /** Filter to only include movies with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  synopsis?: InputMaybe<StringCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include movies with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

type MovieUpdateInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  back_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  front_image?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type MultiCriterionInput = {
  excludes?: InputMaybe<Array<Scalars['ID']['input']>>;
  modifier: CriterionModifier;
  value?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type Mutation = {
  __typename?: 'Mutation';
  addGalleryImages: Scalars['Boolean']['output'];
  /** Enables an IP address for DLNA for an optional duration */
  addTempDLNAIP: Scalars['Boolean']['output'];
  /** Anonymise the database in a separate file. Optionally returns a link to download the database file */
  anonymiseDatabase?: Maybe<Scalars['String']['output']>;
  /** Backup the database. Optionally returns a link to download the database file */
  backupDatabase?: Maybe<Scalars['String']['output']>;
  bulkGalleryUpdate?: Maybe<Array<Gallery>>;
  bulkGroupUpdate?: Maybe<Array<Group>>;
  bulkImageUpdate?: Maybe<Array<Image>>;
  /** @deprecated Use bulkGroupUpdate instead */
  bulkMovieUpdate?: Maybe<Array<Movie>>;
  bulkPerformerUpdate?: Maybe<Array<Performer>>;
  bulkSceneUpdate?: Maybe<Array<Scene>>;
  bulkTagUpdate?: Maybe<Array<Tag>>;
  configureDLNA: ConfigDlnaResult;
  configureDefaults: ConfigDefaultSettingsResult;
  /** Change general configuration options */
  configureGeneral: ConfigGeneralResult;
  configureInterface: ConfigInterfaceResult;
  /** overwrites the entire plugin configuration for the given plugin */
  configurePlugin: Scalars['Map']['output'];
  configureScraping: ConfigScrapingResult;
  /**
   * overwrites the UI configuration
   * if input is provided, then the entire UI configuration is replaced
   * if partial is provided, then the partial UI configuration is merged into the existing UI configuration
   */
  configureUI: Scalars['Map']['output'];
  /**
   * sets a single UI key value
   * key is a dot separated path to the value
   */
  configureUISetting: Scalars['Map']['output'];
  deleteFiles: Scalars['Boolean']['output'];
  destroySavedFilter: Scalars['Boolean']['output'];
  /** Disables DLNA for an optional duration. Has no effect if DLNA is disabled by default */
  disableDLNA: Scalars['Boolean']['output'];
  /** Downloads and installs ffmpeg and ffprobe binaries into the configuration directory. Returns the job ID. */
  downloadFFMpeg: Scalars['ID']['output'];
  /** Enables DLNA for an optional duration. Has no effect if DLNA is enabled by default */
  enableDLNA: Scalars['Boolean']['output'];
  /** DANGEROUS: Execute an arbitrary SQL statement without returning any rows. */
  execSQL: SqlExecResult;
  /** Returns a link to download the result */
  exportObjects?: Maybe<Scalars['String']['output']>;
  fileSetFingerprints: Scalars['Boolean']['output'];
  galleriesUpdate?: Maybe<Array<Maybe<Gallery>>>;
  galleryChapterCreate?: Maybe<GalleryChapter>;
  galleryChapterDestroy: Scalars['Boolean']['output'];
  galleryChapterUpdate?: Maybe<GalleryChapter>;
  galleryCreate?: Maybe<Gallery>;
  galleryDestroy: Scalars['Boolean']['output'];
  galleryUpdate?: Maybe<Gallery>;
  /** Generate and set (or clear) API key */
  generateAPIKey: Scalars['String']['output'];
  groupCreate?: Maybe<Group>;
  groupDestroy: Scalars['Boolean']['output'];
  groupUpdate?: Maybe<Group>;
  groupsDestroy: Scalars['Boolean']['output'];
  /** Decrements the o-counter for an image. Returns the new value */
  imageDecrementO: Scalars['Int']['output'];
  imageDestroy: Scalars['Boolean']['output'];
  /** Increments the o-counter for an image. Returns the new value */
  imageIncrementO: Scalars['Int']['output'];
  /** Resets the o-counter for a image to 0. Returns the new value */
  imageResetO: Scalars['Int']['output'];
  imageUpdate?: Maybe<Image>;
  imagesDestroy: Scalars['Boolean']['output'];
  imagesUpdate?: Maybe<Array<Maybe<Image>>>;
  /** Performs an incremental import. Returns the job ID */
  importObjects: Scalars['ID']['output'];
  /**
   * Installs the given packages.
   * If a package is already installed, it will be updated if needed..
   * If an error occurs when installing a package, the job will continue to install the remaining packages.
   * Returns the job ID
   */
  installPackages: Scalars['ID']['output'];
  /** Start auto-tagging. Returns the job ID */
  metadataAutoTag: Scalars['ID']['output'];
  /** Clean metadata. Returns the job ID */
  metadataClean: Scalars['ID']['output'];
  /** Clean generated files. Returns the job ID */
  metadataCleanGenerated: Scalars['ID']['output'];
  /** Start a full export. Outputs to the metadata directory. Returns the job ID */
  metadataExport: Scalars['ID']['output'];
  /** Start generating content. Returns the job ID */
  metadataGenerate: Scalars['ID']['output'];
  /** Identifies scenes using scrapers. Returns the job ID */
  metadataIdentify: Scalars['ID']['output'];
  /** Start an full import. Completely wipes the database and imports from the metadata directory. Returns the job ID */
  metadataImport: Scalars['ID']['output'];
  /** Start a scan. Returns the job ID */
  metadataScan: Scalars['ID']['output'];
  /** Migrates the schema to the required version. Returns the job ID */
  migrate: Scalars['ID']['output'];
  /** Migrates blobs from the old storage system to the current one */
  migrateBlobs: Scalars['ID']['output'];
  /** Migrate generated files for the current hash naming */
  migrateHashNaming: Scalars['ID']['output'];
  /** Migrates legacy scene screenshot files into the blob storage */
  migrateSceneScreenshots: Scalars['ID']['output'];
  /**
   * Moves the given files to the given destination. Returns true if successful.
   * Either the destination_folder or destination_folder_id must be provided.
   * If both are provided, the destination_folder_id takes precedence.
   * Destination folder must be a subfolder of one of the stash library paths.
   * If provided, destination_basename must be a valid filename with an extension that
   * matches one of the media extensions.
   * Creates folder hierarchy if needed.
   */
  moveFiles: Scalars['Boolean']['output'];
  /** @deprecated Use groupCreate instead */
  movieCreate?: Maybe<Movie>;
  /** @deprecated Use groupDestroy instead */
  movieDestroy: Scalars['Boolean']['output'];
  /** @deprecated Use groupUpdate instead */
  movieUpdate?: Maybe<Movie>;
  /** @deprecated Use groupsDestroy instead */
  moviesDestroy: Scalars['Boolean']['output'];
  /** Optimises the database. Returns the job ID */
  optimiseDatabase: Scalars['ID']['output'];
  performerCreate?: Maybe<Performer>;
  performerDestroy: Scalars['Boolean']['output'];
  performerUpdate?: Maybe<Performer>;
  performersDestroy: Scalars['Boolean']['output'];
  /** DANGEROUS: Execute an arbitrary SQL statement that returns rows. */
  querySQL: SqlQueryResult;
  reloadPlugins: Scalars['Boolean']['output'];
  /** Reload scrapers */
  reloadScrapers: Scalars['Boolean']['output'];
  removeGalleryImages: Scalars['Boolean']['output'];
  /** Removes an IP address from the temporary DLNA whitelist */
  removeTempDLNAIP: Scalars['Boolean']['output'];
  /**
   * Runs a plugin operation. The operation is run immediately and does not use the job queue.
   * Returns a map of the result.
   */
  runPluginOperation?: Maybe<Scalars['Any']['output']>;
  /**
   * Run a plugin task.
   * If task_name is provided, then the task must exist in the plugin config and the tasks configuration
   * will be used to run the plugin.
   * If no task_name is provided, then the plugin will be executed with the arguments provided only.
   * Returns the job ID
   */
  runPluginTask: Scalars['ID']['output'];
  saveFilter: SavedFilter;
  /** Increments the o-counter for a scene. Uses the current time if none provided. */
  sceneAddO: HistoryMutationResult;
  /** Increments the play count for the scene. Uses the current time if none provided. */
  sceneAddPlay: HistoryMutationResult;
  sceneAssignFile: Scalars['Boolean']['output'];
  sceneCreate?: Maybe<Scene>;
  /**
   * Decrements the o-counter for a scene. Returns the new value
   * @deprecated Use sceneRemoveO instead
   */
  sceneDecrementO: Scalars['Int']['output'];
  /** Decrements the o-counter for a scene, removing the last recorded time if specific time not provided. Returns the new value */
  sceneDeleteO: HistoryMutationResult;
  /** Decrements the play count for the scene, removing the specific times or the last recorded time if not provided. */
  sceneDeletePlay: HistoryMutationResult;
  sceneDestroy: Scalars['Boolean']['output'];
  /** Generates screenshot at specified time in seconds. Leave empty to generate default screenshot */
  sceneGenerateScreenshot: Scalars['String']['output'];
  /**
   * Increments the o-counter for a scene. Returns the new value
   * @deprecated Use sceneAddO instead
   */
  sceneIncrementO: Scalars['Int']['output'];
  /**
   * Increments the play count for the scene. Returns the new play count value.
   * @deprecated Use sceneAddPlay instead
   */
  sceneIncrementPlayCount: Scalars['Int']['output'];
  sceneMarkerCreate?: Maybe<SceneMarker>;
  sceneMarkerDestroy: Scalars['Boolean']['output'];
  sceneMarkerUpdate?: Maybe<SceneMarker>;
  sceneMerge?: Maybe<Scene>;
  /** Resets the o-counter for a scene to 0. Returns the new value */
  sceneResetO: Scalars['Int']['output'];
  /** Resets the play count for a scene to 0. Returns the new play count value. */
  sceneResetPlayCount: Scalars['Int']['output'];
  /** Sets the resume time point (if provided) and adds the provided duration to the scene's play duration */
  sceneSaveActivity: Scalars['Boolean']['output'];
  sceneUpdate?: Maybe<Scene>;
  scenesDestroy: Scalars['Boolean']['output'];
  scenesUpdate?: Maybe<Array<Maybe<Scene>>>;
  /** @deprecated now uses UI config */
  setDefaultFilter: Scalars['Boolean']['output'];
  /**
   * Enable/disable plugins - enabledMap is a map of plugin IDs to enabled booleans.
   * Plugins not in the map are not affected.
   */
  setPluginsEnabled: Scalars['Boolean']['output'];
  setup: Scalars['Boolean']['output'];
  /** Run batch performer tag task. Returns the job ID. */
  stashBoxBatchPerformerTag: Scalars['String']['output'];
  /** Run batch studio tag task. Returns the job ID. */
  stashBoxBatchStudioTag: Scalars['String']['output'];
  stopAllJobs: Scalars['Boolean']['output'];
  stopJob: Scalars['Boolean']['output'];
  studioCreate?: Maybe<Studio>;
  studioDestroy: Scalars['Boolean']['output'];
  studioUpdate?: Maybe<Studio>;
  studiosDestroy: Scalars['Boolean']['output'];
  /** Submit fingerprints to stash-box instance */
  submitStashBoxFingerprints: Scalars['Boolean']['output'];
  /** Submit performer as draft to stash-box instance */
  submitStashBoxPerformerDraft?: Maybe<Scalars['ID']['output']>;
  /** Submit scene as draft to stash-box instance */
  submitStashBoxSceneDraft?: Maybe<Scalars['ID']['output']>;
  tagCreate?: Maybe<Tag>;
  tagDestroy: Scalars['Boolean']['output'];
  tagUpdate?: Maybe<Tag>;
  tagsDestroy: Scalars['Boolean']['output'];
  tagsMerge?: Maybe<Tag>;
  /**
   * Uninstalls the given packages.
   * If an error occurs when uninstalling a package, the job will continue to uninstall the remaining packages.
   * Returns the job ID
   */
  uninstallPackages: Scalars['ID']['output'];
  /**
   * Updates the given packages.
   * If a package is not installed, it will not be installed.
   * If a package does not need to be updated, it will not be updated.
   * If no packages are provided, all packages of the given type will be updated.
   * If an error occurs when updating a package, the job will continue to update the remaining packages.
   * Returns the job ID.
   */
  updatePackages: Scalars['ID']['output'];
};


type MutationAddGalleryImagesArgs = {
  input: GalleryAddInput;
};


type MutationAddTempDlnaipArgs = {
  input: AddTempDlnaipInput;
};


type MutationAnonymiseDatabaseArgs = {
  input: AnonymiseDatabaseInput;
};


type MutationBackupDatabaseArgs = {
  input: BackupDatabaseInput;
};


type MutationBulkGalleryUpdateArgs = {
  input: BulkGalleryUpdateInput;
};


type MutationBulkGroupUpdateArgs = {
  input: BulkGroupUpdateInput;
};


type MutationBulkImageUpdateArgs = {
  input: BulkImageUpdateInput;
};


type MutationBulkMovieUpdateArgs = {
  input: BulkMovieUpdateInput;
};


type MutationBulkPerformerUpdateArgs = {
  input: BulkPerformerUpdateInput;
};


type MutationBulkSceneUpdateArgs = {
  input: BulkSceneUpdateInput;
};


type MutationBulkTagUpdateArgs = {
  input: BulkTagUpdateInput;
};


type MutationConfigureDlnaArgs = {
  input: ConfigDlnaInput;
};


type MutationConfigureDefaultsArgs = {
  input: ConfigDefaultSettingsInput;
};


type MutationConfigureGeneralArgs = {
  input: ConfigGeneralInput;
};


type MutationConfigureInterfaceArgs = {
  input: ConfigInterfaceInput;
};


type MutationConfigurePluginArgs = {
  input: Scalars['Map']['input'];
  plugin_id: Scalars['ID']['input'];
};


type MutationConfigureScrapingArgs = {
  input: ConfigScrapingInput;
};


type MutationConfigureUiArgs = {
  input?: InputMaybe<Scalars['Map']['input']>;
  partial?: InputMaybe<Scalars['Map']['input']>;
};


type MutationConfigureUiSettingArgs = {
  key: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Any']['input']>;
};


type MutationDeleteFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


type MutationDestroySavedFilterArgs = {
  input: DestroyFilterInput;
};


type MutationDisableDlnaArgs = {
  input: DisableDlnaInput;
};


type MutationEnableDlnaArgs = {
  input: EnableDlnaInput;
};


type MutationExecSqlArgs = {
  args?: InputMaybe<Array<InputMaybe<Scalars['Any']['input']>>>;
  sql: Scalars['String']['input'];
};


type MutationExportObjectsArgs = {
  input: ExportObjectsInput;
};


type MutationFileSetFingerprintsArgs = {
  input: FileSetFingerprintsInput;
};


type MutationGalleriesUpdateArgs = {
  input: Array<GalleryUpdateInput>;
};


type MutationGalleryChapterCreateArgs = {
  input: GalleryChapterCreateInput;
};


type MutationGalleryChapterDestroyArgs = {
  id: Scalars['ID']['input'];
};


type MutationGalleryChapterUpdateArgs = {
  input: GalleryChapterUpdateInput;
};


type MutationGalleryCreateArgs = {
  input: GalleryCreateInput;
};


type MutationGalleryDestroyArgs = {
  input: GalleryDestroyInput;
};


type MutationGalleryUpdateArgs = {
  input: GalleryUpdateInput;
};


type MutationGenerateApiKeyArgs = {
  input: GenerateApiKeyInput;
};


type MutationGroupCreateArgs = {
  input: GroupCreateInput;
};


type MutationGroupDestroyArgs = {
  input: GroupDestroyInput;
};


type MutationGroupUpdateArgs = {
  input: GroupUpdateInput;
};


type MutationGroupsDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


type MutationImageDecrementOArgs = {
  id: Scalars['ID']['input'];
};


type MutationImageDestroyArgs = {
  input: ImageDestroyInput;
};


type MutationImageIncrementOArgs = {
  id: Scalars['ID']['input'];
};


type MutationImageResetOArgs = {
  id: Scalars['ID']['input'];
};


type MutationImageUpdateArgs = {
  input: ImageUpdateInput;
};


type MutationImagesDestroyArgs = {
  input: ImagesDestroyInput;
};


type MutationImagesUpdateArgs = {
  input: Array<ImageUpdateInput>;
};


type MutationImportObjectsArgs = {
  input: ImportObjectsInput;
};


type MutationInstallPackagesArgs = {
  packages: Array<PackageSpecInput>;
  type: PackageType;
};


type MutationMetadataAutoTagArgs = {
  input: AutoTagMetadataInput;
};


type MutationMetadataCleanArgs = {
  input: CleanMetadataInput;
};


type MutationMetadataCleanGeneratedArgs = {
  input: CleanGeneratedInput;
};


type MutationMetadataGenerateArgs = {
  input: GenerateMetadataInput;
};


type MutationMetadataIdentifyArgs = {
  input: IdentifyMetadataInput;
};


type MutationMetadataScanArgs = {
  input: ScanMetadataInput;
};


type MutationMigrateArgs = {
  input: MigrateInput;
};


type MutationMigrateBlobsArgs = {
  input: MigrateBlobsInput;
};


type MutationMigrateSceneScreenshotsArgs = {
  input: MigrateSceneScreenshotsInput;
};


type MutationMoveFilesArgs = {
  input: MoveFilesInput;
};


type MutationMovieCreateArgs = {
  input: MovieCreateInput;
};


type MutationMovieDestroyArgs = {
  input: MovieDestroyInput;
};


type MutationMovieUpdateArgs = {
  input: MovieUpdateInput;
};


type MutationMoviesDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


type MutationPerformerCreateArgs = {
  input: PerformerCreateInput;
};


type MutationPerformerDestroyArgs = {
  input: PerformerDestroyInput;
};


type MutationPerformerUpdateArgs = {
  input: PerformerUpdateInput;
};


type MutationPerformersDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


type MutationQuerySqlArgs = {
  args?: InputMaybe<Array<InputMaybe<Scalars['Any']['input']>>>;
  sql: Scalars['String']['input'];
};


type MutationRemoveGalleryImagesArgs = {
  input: GalleryRemoveInput;
};


type MutationRemoveTempDlnaipArgs = {
  input: RemoveTempDlnaipInput;
};


type MutationRunPluginOperationArgs = {
  args?: InputMaybe<Scalars['Map']['input']>;
  plugin_id: Scalars['ID']['input'];
};


type MutationRunPluginTaskArgs = {
  args?: InputMaybe<Array<PluginArgInput>>;
  args_map?: InputMaybe<Scalars['Map']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  plugin_id: Scalars['ID']['input'];
  task_name?: InputMaybe<Scalars['String']['input']>;
};


type MutationSaveFilterArgs = {
  input: SaveFilterInput;
};


type MutationSceneAddOArgs = {
  id: Scalars['ID']['input'];
  times?: InputMaybe<Array<Scalars['Timestamp']['input']>>;
};


type MutationSceneAddPlayArgs = {
  id: Scalars['ID']['input'];
  times?: InputMaybe<Array<Scalars['Timestamp']['input']>>;
};


type MutationSceneAssignFileArgs = {
  input: AssignSceneFileInput;
};


type MutationSceneCreateArgs = {
  input: SceneCreateInput;
};


type MutationSceneDecrementOArgs = {
  id: Scalars['ID']['input'];
};


type MutationSceneDeleteOArgs = {
  id: Scalars['ID']['input'];
  times?: InputMaybe<Array<Scalars['Timestamp']['input']>>;
};


type MutationSceneDeletePlayArgs = {
  id: Scalars['ID']['input'];
  times?: InputMaybe<Array<Scalars['Timestamp']['input']>>;
};


type MutationSceneDestroyArgs = {
  input: SceneDestroyInput;
};


type MutationSceneGenerateScreenshotArgs = {
  at?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
};


type MutationSceneIncrementOArgs = {
  id: Scalars['ID']['input'];
};


type MutationSceneIncrementPlayCountArgs = {
  id: Scalars['ID']['input'];
};


type MutationSceneMarkerCreateArgs = {
  input: SceneMarkerCreateInput;
};


type MutationSceneMarkerDestroyArgs = {
  id: Scalars['ID']['input'];
};


type MutationSceneMarkerUpdateArgs = {
  input: SceneMarkerUpdateInput;
};


type MutationSceneMergeArgs = {
  input: SceneMergeInput;
};


type MutationSceneResetOArgs = {
  id: Scalars['ID']['input'];
};


type MutationSceneResetPlayCountArgs = {
  id: Scalars['ID']['input'];
};


type MutationSceneSaveActivityArgs = {
  id: Scalars['ID']['input'];
  playDuration?: InputMaybe<Scalars['Float']['input']>;
  resume_time?: InputMaybe<Scalars['Float']['input']>;
};


type MutationSceneUpdateArgs = {
  input: SceneUpdateInput;
};


type MutationScenesDestroyArgs = {
  input: ScenesDestroyInput;
};


type MutationScenesUpdateArgs = {
  input: Array<SceneUpdateInput>;
};


type MutationSetDefaultFilterArgs = {
  input: SetDefaultFilterInput;
};


type MutationSetPluginsEnabledArgs = {
  enabledMap: Scalars['BoolMap']['input'];
};


type MutationSetupArgs = {
  input: SetupInput;
};


type MutationStashBoxBatchPerformerTagArgs = {
  input: StashBoxBatchTagInput;
};


type MutationStashBoxBatchStudioTagArgs = {
  input: StashBoxBatchTagInput;
};


type MutationStopJobArgs = {
  job_id: Scalars['ID']['input'];
};


type MutationStudioCreateArgs = {
  input: StudioCreateInput;
};


type MutationStudioDestroyArgs = {
  input: StudioDestroyInput;
};


type MutationStudioUpdateArgs = {
  input: StudioUpdateInput;
};


type MutationStudiosDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


type MutationSubmitStashBoxFingerprintsArgs = {
  input: StashBoxFingerprintSubmissionInput;
};


type MutationSubmitStashBoxPerformerDraftArgs = {
  input: StashBoxDraftSubmissionInput;
};


type MutationSubmitStashBoxSceneDraftArgs = {
  input: StashBoxDraftSubmissionInput;
};


type MutationTagCreateArgs = {
  input: TagCreateInput;
};


type MutationTagDestroyArgs = {
  input: TagDestroyInput;
};


type MutationTagUpdateArgs = {
  input: TagUpdateInput;
};


type MutationTagsDestroyArgs = {
  ids: Array<Scalars['ID']['input']>;
};


type MutationTagsMergeArgs = {
  input: TagsMergeInput;
};


type MutationUninstallPackagesArgs = {
  packages: Array<PackageSpecInput>;
  type: PackageType;
};


type MutationUpdatePackagesArgs = {
  packages?: InputMaybe<Array<PackageSpecInput>>;
  type: PackageType;
};

type OrientationCriterionInput = {
  value: Array<OrientationEnum>;
};

const enum OrientationEnum {
  /** Landscape */
  Landscape = 'LANDSCAPE',
  /** Portrait */
  Portrait = 'PORTRAIT',
  /** Square */
  Square = 'SQUARE'
};

type PHashDuplicationCriterionInput = {
  /** Currently unimplemented */
  distance?: InputMaybe<Scalars['Int']['input']>;
  duplicated?: InputMaybe<Scalars['Boolean']['input']>;
};

type Package = {
  __typename?: 'Package';
  date?: Maybe<Scalars['Timestamp']['output']>;
  metadata: Scalars['Map']['output'];
  name: Scalars['String']['output'];
  package_id: Scalars['String']['output'];
  requires: Array<Package>;
  sourceURL: Scalars['String']['output'];
  /** The version of this package currently available from the remote source */
  source_package?: Maybe<Package>;
  version?: Maybe<Scalars['String']['output']>;
};

type PackageSource = {
  __typename?: 'PackageSource';
  local_path?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

type PackageSourceInput = {
  local_path?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

type PackageSpecInput = {
  id: Scalars['String']['input'];
  sourceURL: Scalars['String']['input'];
};

const enum PackageType {
  Plugin = 'Plugin',
  Scraper = 'Scraper'
};

type Performer = {
  __typename?: 'Performer';
  alias_list: Array<Scalars['String']['output']>;
  birthdate?: Maybe<Scalars['String']['output']>;
  career_length?: Maybe<Scalars['String']['output']>;
  circumcised?: Maybe<CircumisedEnum>;
  country?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  death_date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  disambiguation?: Maybe<Scalars['String']['output']>;
  ethnicity?: Maybe<Scalars['String']['output']>;
  eye_color?: Maybe<Scalars['String']['output']>;
  fake_tits?: Maybe<Scalars['String']['output']>;
  favorite: Scalars['Boolean']['output'];
  gallery_count: Scalars['Int']['output'];
  gender?: Maybe<GenderEnum>;
  group_count: Scalars['Int']['output'];
  /** @deprecated use groups instead */
  groups: Array<Group>;
  hair_color?: Maybe<Scalars['String']['output']>;
  height_cm?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  ignore_auto_tag: Scalars['Boolean']['output'];
  image_count: Scalars['Int']['output'];
  image_path?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use urls */
  instagram?: Maybe<Scalars['String']['output']>;
  measurements?: Maybe<Scalars['String']['output']>;
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  /** @deprecated use groups instead */
  movies: Array<Movie>;
  name: Scalars['String']['output'];
  o_counter?: Maybe<Scalars['Int']['output']>;
  penis_length?: Maybe<Scalars['Float']['output']>;
  performer_count: Scalars['Int']['output'];
  piercings?: Maybe<Scalars['String']['output']>;
  rating100?: Maybe<Scalars['Int']['output']>;
  scene_count: Scalars['Int']['output'];
  scenes: Array<Scene>;
  stash_ids: Array<StashId>;
  tags: Array<Tag>;
  tattoos?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use urls */
  twitter?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
  weight?: Maybe<Scalars['Int']['output']>;
};

type PerformerCreateInput = {
  alias_list?: InputMaybe<Array<Scalars['String']['input']>>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_length?: InputMaybe<Scalars['String']['input']>;
  circumcised?: InputMaybe<CircumisedEnum>;
  country?: InputMaybe<Scalars['String']['input']>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  gender?: InputMaybe<GenderEnum>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Int']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  penis_length?: InputMaybe<Scalars['Float']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

type PerformerDestroyInput = {
  id: Scalars['ID']['input'];
};

type PerformerFilterType = {
  AND?: InputMaybe<PerformerFilterType>;
  NOT?: InputMaybe<PerformerFilterType>;
  OR?: InputMaybe<PerformerFilterType>;
  /** Filter by age */
  age?: InputMaybe<IntCriterionInput>;
  /** Filter by aliases */
  aliases?: InputMaybe<StringCriterionInput>;
  /** Filter by birth year */
  birth_year?: InputMaybe<IntCriterionInput>;
  /** Filter by birthdate */
  birthdate?: InputMaybe<DateCriterionInput>;
  /** Filter by career length */
  career_length?: InputMaybe<StringCriterionInput>;
  /** Filter by ciricumcision */
  circumcised?: InputMaybe<CircumcisionCriterionInput>;
  /** Filter by country */
  country?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by death date */
  death_date?: InputMaybe<DateCriterionInput>;
  /** Filter by death year */
  death_year?: InputMaybe<IntCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  disambiguation?: InputMaybe<StringCriterionInput>;
  /** Filter by ethnicity */
  ethnicity?: InputMaybe<StringCriterionInput>;
  /** Filter by eye color */
  eye_color?: InputMaybe<StringCriterionInput>;
  /** Filter by fake tits value */
  fake_tits?: InputMaybe<StringCriterionInput>;
  /** Filter by favorite */
  filter_favorites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by related galleries that meet this criteria */
  galleries_filter?: InputMaybe<GalleryFilterType>;
  /** Filter by gallery count */
  gallery_count?: InputMaybe<IntCriterionInput>;
  /** Filter by gender */
  gender?: InputMaybe<GenderCriterionInput>;
  /** Filter by hair color */
  hair_color?: InputMaybe<StringCriterionInput>;
  /** Filter by height in cm */
  height_cm?: InputMaybe<IntCriterionInput>;
  /** Filter by autotag ignore value */
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by image count */
  image_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related images that meet this criteria */
  images_filter?: InputMaybe<ImageFilterType>;
  /** Filter to only include performers missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by measurements */
  measurements?: InputMaybe<StringCriterionInput>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter by o count */
  o_counter?: InputMaybe<IntCriterionInput>;
  /** Filter by penis length value */
  penis_length?: InputMaybe<FloatCriterionInput>;
  /** Filter by performers where performer appears with another performer in scene/image/gallery */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by piercings */
  piercings?: InputMaybe<StringCriterionInput>;
  /** Filter by play count */
  play_count?: InputMaybe<IntCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by scene count */
  scene_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scenes_filter?: InputMaybe<SceneFilterType>;
  /** Filter by StashID */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter by studios where performer appears in scene/image/gallery */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include performers with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related tags that meet this criteria */
  tags_filter?: InputMaybe<TagFilterType>;
  /** Filter by tattoos */
  tattoos?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
  /** Filter by weight */
  weight?: InputMaybe<IntCriterionInput>;
};

type PerformerUpdateInput = {
  alias_list?: InputMaybe<Array<Scalars['String']['input']>>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_length?: InputMaybe<Scalars['String']['input']>;
  circumcised?: InputMaybe<CircumisedEnum>;
  country?: InputMaybe<Scalars['String']['input']>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  gender?: InputMaybe<GenderEnum>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height_cm?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['ID']['input'];
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  penis_length?: InputMaybe<Scalars['Float']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

type PhashDistanceCriterionInput = {
  distance?: InputMaybe<Scalars['Int']['input']>;
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
};

type Plugin = {
  __typename?: 'Plugin';
  description?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  hooks?: Maybe<Array<PluginHook>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  paths: PluginPaths;
  /**
   * Plugin IDs of plugins that this plugin depends on.
   * Applies only for UI plugins to indicate css/javascript load order.
   */
  requires?: Maybe<Array<Scalars['ID']['output']>>;
  settings?: Maybe<Array<PluginSetting>>;
  tasks?: Maybe<Array<PluginTask>>;
  url?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['String']['output']>;
};

type PluginArgInput = {
  key: Scalars['String']['input'];
  value?: InputMaybe<PluginValueInput>;
};

type PluginHook = {
  __typename?: 'PluginHook';
  description?: Maybe<Scalars['String']['output']>;
  hooks?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  plugin: Plugin;
};

type PluginPaths = {
  __typename?: 'PluginPaths';
  css?: Maybe<Array<Scalars['String']['output']>>;
  javascript?: Maybe<Array<Scalars['String']['output']>>;
};

type PluginResult = {
  __typename?: 'PluginResult';
  error?: Maybe<Scalars['String']['output']>;
  result?: Maybe<Scalars['String']['output']>;
};

type PluginSetting = {
  __typename?: 'PluginSetting';
  description?: Maybe<Scalars['String']['output']>;
  display_name?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  type: PluginSettingTypeEnum;
};

const enum PluginSettingTypeEnum {
  Boolean = 'BOOLEAN',
  Number = 'NUMBER',
  String = 'STRING'
};

type PluginTask = {
  __typename?: 'PluginTask';
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  plugin: Plugin;
};

type PluginValueInput = {
  a?: InputMaybe<Array<PluginValueInput>>;
  b?: InputMaybe<Scalars['Boolean']['input']>;
  f?: InputMaybe<Scalars['Float']['input']>;
  i?: InputMaybe<Scalars['Int']['input']>;
  o?: InputMaybe<Array<PluginArgInput>>;
  str?: InputMaybe<Scalars['String']['input']>;
};

const enum PreviewPreset {
  /** X264_FAST */
  Fast = 'fast',
  /** X264_MEDIUM */
  Medium = 'medium',
  /** X264_SLOW */
  Slow = 'slow',
  /** X264_SLOWER */
  Slower = 'slower',
  /** X264_ULTRAFAST */
  Ultrafast = 'ultrafast',
  /** X264_VERYFAST */
  Veryfast = 'veryfast',
  /** X264_VERYSLOW */
  Veryslow = 'veryslow'
};

/** The query root for this schema */
type Query = {
  __typename?: 'Query';
  /** @deprecated Use findGalleries instead */
  allGalleries: Array<Gallery>;
  /** @deprecated Use findImages instead */
  allImages: Array<Image>;
  /** @deprecated Use findGroups instead */
  allMovies: Array<Movie>;
  allPerformers: Array<Performer>;
  /** @deprecated Use findSceneMarkers instead */
  allSceneMarkers: Array<SceneMarker>;
  /** @deprecated Use findScenes instead */
  allScenes: Array<Scene>;
  /** @deprecated Use findStudios instead */
  allStudios: Array<Studio>;
  /** @deprecated Use findTags instead */
  allTags: Array<Tag>;
  /** List available packages */
  availablePackages: Array<Package>;
  /** Returns the current, complete configuration */
  configuration: ConfigResult;
  /** Returns an array of paths for the given path */
  directory: Directory;
  dlnaStatus: DlnaStatus;
  /** @deprecated default filter now stored in UI config */
  findDefaultFilter?: Maybe<SavedFilter>;
  /**
   * Returns any groups of scenes that are perceptual duplicates within the queried distance
   * and the difference between their duration is smaller than durationDiff
   */
  findDuplicateScenes: Array<Array<Scene>>;
  findGalleries: FindGalleriesResultType;
  findGallery?: Maybe<Gallery>;
  /** Find a group by ID */
  findGroup?: Maybe<Group>;
  /** A function which queries Group objects */
  findGroups: FindGroupsResultType;
  findImage?: Maybe<Image>;
  /** A function which queries Scene objects */
  findImages: FindImagesResultType;
  findJob?: Maybe<Job>;
  /**
   * Find a movie by ID
   * @deprecated Use findGroup instead
   */
  findMovie?: Maybe<Movie>;
  /**
   * A function which queries Movie objects
   * @deprecated Use findGroups instead
   */
  findMovies: FindMoviesResultType;
  /** Find a performer by ID */
  findPerformer?: Maybe<Performer>;
  /** A function which queries Performer objects */
  findPerformers: FindPerformersResultType;
  findSavedFilter?: Maybe<SavedFilter>;
  findSavedFilters: Array<SavedFilter>;
  /** Find a scene by ID or Checksum */
  findScene?: Maybe<Scene>;
  findSceneByHash?: Maybe<Scene>;
  /** A function which queries SceneMarker objects */
  findSceneMarkers: FindSceneMarkersResultType;
  /** A function which queries Scene objects */
  findScenes: FindScenesResultType;
  findScenesByPathRegex: FindScenesResultType;
  /** Find a studio by ID */
  findStudio?: Maybe<Studio>;
  /** A function which queries Studio objects */
  findStudios: FindStudiosResultType;
  findTag?: Maybe<Tag>;
  findTags: FindTagsResultType;
  /** List installed packages */
  installedPackages: Array<Package>;
  jobQueue?: Maybe<Array<Job>>;
  latestversion: LatestVersion;
  /** List available scrapers */
  listScrapers: Array<Scraper>;
  logs: Array<LogEntry>;
  /** Get marker strings */
  markerStrings: Array<Maybe<MarkerStringsResultType>>;
  /** Retrieve random scene markers for the wall */
  markerWall: Array<SceneMarker>;
  parseSceneFilenames: SceneParserResultType;
  /** List available plugin operations */
  pluginTasks?: Maybe<Array<PluginTask>>;
  /** List loaded plugins */
  plugins?: Maybe<Array<Plugin>>;
  /** Organize scene markers by tag for a given scene ID */
  sceneMarkerTags: Array<SceneMarkerTag>;
  /** Return valid stream paths */
  sceneStreams: Array<SceneStreamEndpoint>;
  /** Retrieve random scenes for the wall */
  sceneWall: Array<Scene>;
  /** Scrapes a complete gallery record based on a URL */
  scrapeGalleryURL?: Maybe<ScrapedGallery>;
  /** Scrapes a complete group record based on a URL */
  scrapeGroupURL?: Maybe<ScrapedGroup>;
  /**
   * Scrapes a complete movie record based on a URL
   * @deprecated Use scrapeGroupURL instead
   */
  scrapeMovieURL?: Maybe<ScrapedMovie>;
  /** Scrape for multiple performers */
  scrapeMultiPerformers: Array<Array<ScrapedPerformer>>;
  /** Scrape for multiple scenes */
  scrapeMultiScenes: Array<Array<ScrapedScene>>;
  /** Scrapes a complete performer record based on a URL */
  scrapePerformerURL?: Maybe<ScrapedPerformer>;
  /** Scrapes a complete scene record based on a URL */
  scrapeSceneURL?: Maybe<ScrapedScene>;
  /** Scrape for a single gallery */
  scrapeSingleGallery: Array<ScrapedGallery>;
  /** Scrape for a single group */
  scrapeSingleGroup: Array<ScrapedGroup>;
  /**
   * Scrape for a single movie
   * @deprecated Use scrapeSingleGroup instead
   */
  scrapeSingleMovie: Array<ScrapedMovie>;
  /** Scrape for a single performer */
  scrapeSinglePerformer: Array<ScrapedPerformer>;
  /** Scrape for a single scene */
  scrapeSingleScene: Array<ScrapedScene>;
  /** Scrape for a single studio */
  scrapeSingleStudio: Array<ScrapedStudio>;
  /** Scrapes content based on a URL */
  scrapeURL?: Maybe<ScrapedContent>;
  /** Get stats */
  stats: StatsResultType;
  systemStatus: SystemStatus;
  validateStashBoxCredentials: StashBoxValidationResult;
  version: Version;
};


/** The query root for this schema */
type QueryAvailablePackagesArgs = {
  source: Scalars['String']['input'];
  type: PackageType;
};


/** The query root for this schema */
type QueryDirectoryArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
type QueryFindDefaultFilterArgs = {
  mode: FilterMode;
};


/** The query root for this schema */
type QueryFindDuplicateScenesArgs = {
  distance?: InputMaybe<Scalars['Int']['input']>;
  duration_diff?: InputMaybe<Scalars['Float']['input']>;
};


/** The query root for this schema */
type QueryFindGalleriesArgs = {
  filter?: InputMaybe<FindFilterType>;
  gallery_filter?: InputMaybe<GalleryFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** The query root for this schema */
type QueryFindGalleryArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindGroupArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindGroupsArgs = {
  filter?: InputMaybe<FindFilterType>;
  group_filter?: InputMaybe<GroupFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** The query root for this schema */
type QueryFindImageArgs = {
  checksum?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** The query root for this schema */
type QueryFindImagesArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  image_filter?: InputMaybe<ImageFilterType>;
  image_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};


/** The query root for this schema */
type QueryFindJobArgs = {
  input: FindJobInput;
};


/** The query root for this schema */
type QueryFindMovieArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindMoviesArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  movie_filter?: InputMaybe<MovieFilterType>;
};


/** The query root for this schema */
type QueryFindPerformerArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindPerformersArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  performer_filter?: InputMaybe<PerformerFilterType>;
  performer_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};


/** The query root for this schema */
type QueryFindSavedFilterArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindSavedFiltersArgs = {
  mode?: InputMaybe<FilterMode>;
};


/** The query root for this schema */
type QueryFindSceneArgs = {
  checksum?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** The query root for this schema */
type QueryFindSceneByHashArgs = {
  input: SceneHashInput;
};


/** The query root for this schema */
type QueryFindSceneMarkersArgs = {
  filter?: InputMaybe<FindFilterType>;
  scene_marker_filter?: InputMaybe<SceneMarkerFilterType>;
};


/** The query root for this schema */
type QueryFindScenesArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  scene_filter?: InputMaybe<SceneFilterType>;
  scene_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};


/** The query root for this schema */
type QueryFindScenesByPathRegexArgs = {
  filter?: InputMaybe<FindFilterType>;
};


/** The query root for this schema */
type QueryFindStudioArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindStudiosArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  studio_filter?: InputMaybe<StudioFilterType>;
};


/** The query root for this schema */
type QueryFindTagArgs = {
  id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QueryFindTagsArgs = {
  filter?: InputMaybe<FindFilterType>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  tag_filter?: InputMaybe<TagFilterType>;
};


/** The query root for this schema */
type QueryInstalledPackagesArgs = {
  type: PackageType;
};


/** The query root for this schema */
type QueryListScrapersArgs = {
  types: Array<ScrapeContentType>;
};


/** The query root for this schema */
type QueryMarkerStringsArgs = {
  q?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
type QueryMarkerWallArgs = {
  q?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
type QueryParseSceneFilenamesArgs = {
  config: SceneParserInput;
  filter?: InputMaybe<FindFilterType>;
};


/** The query root for this schema */
type QuerySceneMarkerTagsArgs = {
  scene_id: Scalars['ID']['input'];
};


/** The query root for this schema */
type QuerySceneStreamsArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** The query root for this schema */
type QuerySceneWallArgs = {
  q?: InputMaybe<Scalars['String']['input']>;
};


/** The query root for this schema */
type QueryScrapeGalleryUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
type QueryScrapeGroupUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
type QueryScrapeMovieUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
type QueryScrapeMultiPerformersArgs = {
  input: ScrapeMultiPerformersInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeMultiScenesArgs = {
  input: ScrapeMultiScenesInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapePerformerUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
type QueryScrapeSceneUrlArgs = {
  url: Scalars['String']['input'];
};


/** The query root for this schema */
type QueryScrapeSingleGalleryArgs = {
  input: ScrapeSingleGalleryInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeSingleGroupArgs = {
  input: ScrapeSingleGroupInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeSingleMovieArgs = {
  input: ScrapeSingleMovieInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeSinglePerformerArgs = {
  input: ScrapeSinglePerformerInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeSingleSceneArgs = {
  input: ScrapeSingleSceneInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeSingleStudioArgs = {
  input: ScrapeSingleStudioInput;
  source: ScraperSourceInput;
};


/** The query root for this schema */
type QueryScrapeUrlArgs = {
  ty: ScrapeContentType;
  url: Scalars['String']['input'];
};


/** The query root for this schema */
type QueryValidateStashBoxCredentialsArgs = {
  input: StashBoxInput;
};

type RemoveTempDlnaipInput = {
  address: Scalars['String']['input'];
};

type ResolutionCriterionInput = {
  modifier: CriterionModifier;
  value: ResolutionEnum;
};

const enum ResolutionEnum {
  /** 8K */
  EightK = 'EIGHT_K',
  /** 5K */
  FiveK = 'FIVE_K',
  /** 4K */
  FourK = 'FOUR_K',
  /** 1080p */
  FullHd = 'FULL_HD',
  /** 8K+ */
  Huge = 'HUGE',
  /** 240p */
  Low = 'LOW',
  /** 1440p */
  QuadHd = 'QUAD_HD',
  /** 360p */
  R360P = 'R360P',
  /** 7K */
  SevenK = 'SEVEN_K',
  /** 6K */
  SixK = 'SIX_K',
  /** 480p */
  Standard = 'STANDARD',
  /** 720p */
  StandardHd = 'STANDARD_HD',
  /** 144p */
  VeryLow = 'VERY_LOW',
  /**
   * 1920p
   * @deprecated Use 4K instead
   */
  VrHd = 'VR_HD',
  /** 540p */
  WebHd = 'WEB_HD'
};

type SqlExecResult = {
  __typename?: 'SQLExecResult';
  /**
   * The integer generated by the database in response to a command.
   * Typically this will be from an "auto increment" column when inserting a new row.
   * Not all databases support this feature, and the syntax of such statements varies.
   */
  last_insert_id?: Maybe<Scalars['Int64']['output']>;
  /**
   * The number of rows affected by the query, usually an UPDATE, INSERT, or DELETE.
   * Not all queries or databases support this feature.
   */
  rows_affected?: Maybe<Scalars['Int64']['output']>;
};

type SqlQueryResult = {
  __typename?: 'SQLQueryResult';
  /** The column names, in the order they appear in the result set. */
  columns: Array<Scalars['String']['output']>;
  /** The returned rows. */
  rows: Array<Array<Maybe<Scalars['Any']['output']>>>;
};

type SaveFilterInput = {
  find_filter?: InputMaybe<FindFilterType>;
  /** provide ID to overwrite existing filter */
  id?: InputMaybe<Scalars['ID']['input']>;
  mode: FilterMode;
  name: Scalars['String']['input'];
  object_filter?: InputMaybe<Scalars['Map']['input']>;
  ui_options?: InputMaybe<Scalars['Map']['input']>;
};

type SavedFilter = {
  __typename?: 'SavedFilter';
  /**
   * JSON-encoded filter string
   * @deprecated use find_filter and object_filter instead
   */
  filter: Scalars['String']['output'];
  find_filter?: Maybe<SavedFindFilterType>;
  id: Scalars['ID']['output'];
  mode: FilterMode;
  name: Scalars['String']['output'];
  object_filter?: Maybe<Scalars['Map']['output']>;
  ui_options?: Maybe<Scalars['Map']['output']>;
};

type SavedFindFilterType = {
  __typename?: 'SavedFindFilterType';
  direction?: Maybe<SortDirectionEnum>;
  page?: Maybe<Scalars['Int']['output']>;
  /** use per_page = -1 to indicate all results. Defaults to 25. */
  per_page?: Maybe<Scalars['Int']['output']>;
  q?: Maybe<Scalars['String']['output']>;
  sort?: Maybe<Scalars['String']['output']>;
};

/** Filter options for meta data scannning */
type ScanMetaDataFilterInput = {
  /** If set, files with a modification time before this time point are ignored by the scan */
  minModTime?: InputMaybe<Scalars['Timestamp']['input']>;
};

type ScanMetadataInput = {
  /** Filter options for the scan */
  filter?: InputMaybe<ScanMetaDataFilterInput>;
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Forces a rescan on files even if modification time is unchanged */
  rescan?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image clip previews during scan */
  scanGenerateClipPreviews?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate covers during scan */
  scanGenerateCovers?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image previews during scan */
  scanGenerateImagePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate phashes during scan */
  scanGeneratePhashes?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate previews during scan */
  scanGeneratePreviews?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate sprites during scan */
  scanGenerateSprites?: InputMaybe<Scalars['Boolean']['input']>;
  /** Generate image thumbnails during scan */
  scanGenerateThumbnails?: InputMaybe<Scalars['Boolean']['input']>;
};

type ScanMetadataOptions = {
  __typename?: 'ScanMetadataOptions';
  /** Forces a rescan on files even if modification time is unchanged */
  rescan: Scalars['Boolean']['output'];
  /** Generate image clip previews during scan */
  scanGenerateClipPreviews: Scalars['Boolean']['output'];
  /** Generate covers during scan */
  scanGenerateCovers: Scalars['Boolean']['output'];
  /** Generate image previews during scan */
  scanGenerateImagePreviews: Scalars['Boolean']['output'];
  /** Generate phashes during scan */
  scanGeneratePhashes: Scalars['Boolean']['output'];
  /** Generate previews during scan */
  scanGeneratePreviews: Scalars['Boolean']['output'];
  /** Generate sprites during scan */
  scanGenerateSprites: Scalars['Boolean']['output'];
  /** Generate image thumbnails during scan */
  scanGenerateThumbnails: Scalars['Boolean']['output'];
};

type Scene = {
  __typename?: 'Scene';
  captions?: Maybe<Array<VideoCaption>>;
  code?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Time']['output'];
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  files: Array<VideoFile>;
  galleries: Array<Gallery>;
  groups: Array<SceneGroup>;
  id: Scalars['ID']['output'];
  interactive: Scalars['Boolean']['output'];
  interactive_speed?: Maybe<Scalars['Int']['output']>;
  /** The last time play count was updated */
  last_played_at?: Maybe<Scalars['Time']['output']>;
  /** @deprecated Use groups */
  movies: Array<SceneMovie>;
  o_counter?: Maybe<Scalars['Int']['output']>;
  /** Times the o counter was incremented */
  o_history: Array<Scalars['Time']['output']>;
  organized: Scalars['Boolean']['output'];
  paths: ScenePathsType;
  performers: Array<Performer>;
  /** The number ot times a scene has been played */
  play_count?: Maybe<Scalars['Int']['output']>;
  /** The total time a scene has spent playing */
  play_duration?: Maybe<Scalars['Float']['output']>;
  /** Times a scene was played */
  play_history: Array<Scalars['Time']['output']>;
  rating100?: Maybe<Scalars['Int']['output']>;
  /** The time index a scene was left at */
  resume_time?: Maybe<Scalars['Float']['output']>;
  /** Return valid stream paths */
  sceneStreams: Array<SceneStreamEndpoint>;
  scene_markers: Array<SceneMarker>;
  stash_ids: Array<StashId>;
  studio?: Maybe<Studio>;
  tags: Array<Tag>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at: Scalars['Time']['output'];
  /** @deprecated Use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls: Array<Scalars['String']['output']>;
};

type SceneCreateInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  cover_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  /**
   * The first id will be assigned as primary.
   * Files will be reassigned from existing scenes if applicable.
   * Files must not already be primary for another scene.
   */
  file_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  gallery_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  groups?: InputMaybe<Array<SceneGroupInput>>;
  /** @deprecated Use groups */
  movies?: InputMaybe<Array<SceneMovieInput>>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type SceneDestroyInput = {
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};

type SceneFileType = {
  __typename?: 'SceneFileType';
  audio_codec?: Maybe<Scalars['String']['output']>;
  bitrate?: Maybe<Scalars['Int']['output']>;
  duration?: Maybe<Scalars['Float']['output']>;
  framerate?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['String']['output']>;
  video_codec?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

type SceneFilterType = {
  AND?: InputMaybe<SceneFilterType>;
  NOT?: InputMaybe<SceneFilterType>;
  OR?: InputMaybe<SceneFilterType>;
  /** Filter by audio codec */
  audio_codec?: InputMaybe<StringCriterionInput>;
  /** Filter by bit rate */
  bitrate?: InputMaybe<IntCriterionInput>;
  /** Filter by captions */
  captions?: InputMaybe<StringCriterionInput>;
  /** Filter by file checksum */
  checksum?: InputMaybe<StringCriterionInput>;
  code?: InputMaybe<StringCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by date */
  date?: InputMaybe<DateCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  director?: InputMaybe<StringCriterionInput>;
  /** Filter Scenes that have an exact phash match available */
  duplicated?: InputMaybe<PHashDuplicationCriterionInput>;
  /** Filter by duration (in seconds) */
  duration?: InputMaybe<IntCriterionInput>;
  /** Filter by file count */
  file_count?: InputMaybe<IntCriterionInput>;
  /** Filter by frame rate */
  framerate?: InputMaybe<IntCriterionInput>;
  /** Filter to only include scenes with this gallery */
  galleries?: InputMaybe<MultiCriterionInput>;
  /** Filter by related galleries that meet this criteria */
  galleries_filter?: InputMaybe<GalleryFilterType>;
  /** Filter to only include scenes with this group */
  groups?: InputMaybe<MultiCriterionInput>;
  /** Filter by related groups that meet this criteria */
  groups_filter?: InputMaybe<GroupFilterType>;
  /** Filter to only include scenes which have markers. `true` or `false` */
  has_markers?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<IntCriterionInput>;
  /** Filter by interactive */
  interactive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by InteractiveSpeed */
  interactive_speed?: InputMaybe<IntCriterionInput>;
  /** Filter to only include scenes missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by scene last played time */
  last_played_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by related markers that meet this criteria */
  markers_filter?: InputMaybe<SceneMarkerFilterType>;
  /**
   * Filter to only include scenes with this movie
   * @deprecated use groups instead
   */
  movies?: InputMaybe<MultiCriterionInput>;
  /**
   * Filter by related movies that meet this criteria
   * @deprecated use groups_filter instead
   */
  movies_filter?: InputMaybe<MovieFilterType>;
  /** Filter by o-counter */
  o_counter?: InputMaybe<IntCriterionInput>;
  /** Filter by organized */
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by orientation */
  orientation?: InputMaybe<OrientationCriterionInput>;
  /** Filter by file oshash */
  oshash?: InputMaybe<StringCriterionInput>;
  /** Filter by path */
  path?: InputMaybe<StringCriterionInput>;
  /** Filter scenes by performer age at time of scene */
  performer_age?: InputMaybe<IntCriterionInput>;
  /** Filter by performer count */
  performer_count?: InputMaybe<IntCriterionInput>;
  /** Filter scenes that have performers that have been favorited */
  performer_favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only include scenes with performers with these tags */
  performer_tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter to only include scenes with these performers */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by related performers that meet this criteria */
  performers_filter?: InputMaybe<PerformerFilterType>;
  /**
   * Filter by file phash
   * @deprecated Use phash_distance instead
   */
  phash?: InputMaybe<StringCriterionInput>;
  /** Filter by file phash distance */
  phash_distance?: InputMaybe<PhashDistanceCriterionInput>;
  /** Filter by play count */
  play_count?: InputMaybe<IntCriterionInput>;
  /** Filter by play duration (in seconds) */
  play_duration?: InputMaybe<IntCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by resolution */
  resolution?: InputMaybe<ResolutionCriterionInput>;
  /** Filter by resume time */
  resume_time?: InputMaybe<IntCriterionInput>;
  /** Filter by StashID */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter to only include scenes with this studio */
  studios?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related studios that meet this criteria */
  studios_filter?: InputMaybe<StudioFilterType>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include scenes with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by related tags that meet this criteria */
  tags_filter?: InputMaybe<TagFilterType>;
  title?: InputMaybe<StringCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
  /** Filter by video codec */
  video_codec?: InputMaybe<StringCriterionInput>;
};

type SceneGroup = {
  __typename?: 'SceneGroup';
  group: Group;
  scene_index?: Maybe<Scalars['Int']['output']>;
};

type SceneGroupInput = {
  group_id: Scalars['ID']['input'];
  scene_index?: InputMaybe<Scalars['Int']['input']>;
};

type SceneHashInput = {
  checksum?: InputMaybe<Scalars['String']['input']>;
  oshash?: InputMaybe<Scalars['String']['input']>;
};

type SceneMarker = {
  __typename?: 'SceneMarker';
  created_at: Scalars['Time']['output'];
  id: Scalars['ID']['output'];
  /** The path to the preview image for this marker */
  preview: Scalars['String']['output'];
  primary_tag: Tag;
  scene: Scene;
  /** The path to the screenshot image for this marker */
  screenshot: Scalars['String']['output'];
  seconds: Scalars['Float']['output'];
  /** The path to stream this marker */
  stream: Scalars['String']['output'];
  tags: Array<Tag>;
  title: Scalars['String']['output'];
  updated_at: Scalars['Time']['output'];
};

type SceneMarkerCreateInput = {
  primary_tag_id: Scalars['ID']['input'];
  scene_id: Scalars['ID']['input'];
  seconds: Scalars['Float']['input'];
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title: Scalars['String']['input'];
};

type SceneMarkerFilterType = {
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter to only include scene markers with these performers */
  performers?: InputMaybe<MultiCriterionInput>;
  /** Filter by cscene reation time */
  scene_created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by scene date */
  scene_date?: InputMaybe<DateCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scene_filter?: InputMaybe<SceneFilterType>;
  /** Filter to only include scene markers attached to a scene with these tags */
  scene_tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by lscene ast update time */
  scene_updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter to only include scene markers with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
};

type SceneMarkerTag = {
  __typename?: 'SceneMarkerTag';
  scene_markers: Array<SceneMarker>;
  tag: Tag;
};

type SceneMarkerUpdateInput = {
  id: Scalars['ID']['input'];
  primary_tag_id?: InputMaybe<Scalars['ID']['input']>;
  scene_id?: InputMaybe<Scalars['ID']['input']>;
  seconds?: InputMaybe<Scalars['Float']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

type SceneMergeInput = {
  destination: Scalars['ID']['input'];
  o_history?: InputMaybe<Scalars['Boolean']['input']>;
  play_history?: InputMaybe<Scalars['Boolean']['input']>;
  /**
   * If destination scene has no files, then the primary file of the
   * first source scene will be assigned as primary
   */
  source: Array<Scalars['ID']['input']>;
  values?: InputMaybe<SceneUpdateInput>;
};

type SceneMovie = {
  __typename?: 'SceneMovie';
  movie: Movie;
  scene_index?: Maybe<Scalars['Int']['output']>;
};

type SceneMovieId = {
  __typename?: 'SceneMovieID';
  movie_id: Scalars['ID']['output'];
  scene_index?: Maybe<Scalars['String']['output']>;
};

type SceneMovieInput = {
  movie_id: Scalars['ID']['input'];
  scene_index?: InputMaybe<Scalars['Int']['input']>;
};

type SceneParserInput = {
  capitalizeTitle?: InputMaybe<Scalars['Boolean']['input']>;
  ignoreOrganized?: InputMaybe<Scalars['Boolean']['input']>;
  ignoreWords?: InputMaybe<Array<Scalars['String']['input']>>;
  whitespaceCharacters?: InputMaybe<Scalars['String']['input']>;
};

type SceneParserResult = {
  __typename?: 'SceneParserResult';
  code?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  gallery_ids?: Maybe<Array<Scalars['ID']['output']>>;
  movies?: Maybe<Array<SceneMovieId>>;
  performer_ids?: Maybe<Array<Scalars['ID']['output']>>;
  /** @deprecated Use 1-100 range with rating100 */
  rating?: Maybe<Scalars['Int']['output']>;
  rating100?: Maybe<Scalars['Int']['output']>;
  scene: Scene;
  studio_id?: Maybe<Scalars['ID']['output']>;
  tag_ids?: Maybe<Array<Scalars['ID']['output']>>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

type SceneParserResultType = {
  __typename?: 'SceneParserResultType';
  count: Scalars['Int']['output'];
  results: Array<SceneParserResult>;
};

type ScenePathsType = {
  __typename?: 'ScenePathsType';
  caption?: Maybe<Scalars['String']['output']>;
  funscript?: Maybe<Scalars['String']['output']>;
  interactive_heatmap?: Maybe<Scalars['String']['output']>;
  preview?: Maybe<Scalars['String']['output']>;
  screenshot?: Maybe<Scalars['String']['output']>;
  sprite?: Maybe<Scalars['String']['output']>;
  stream?: Maybe<Scalars['String']['output']>;
  vtt?: Maybe<Scalars['String']['output']>;
  webp?: Maybe<Scalars['String']['output']>;
};

type SceneStreamEndpoint = {
  __typename?: 'SceneStreamEndpoint';
  label?: Maybe<Scalars['String']['output']>;
  mime_type?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

type SceneUpdateInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  cover_image?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  gallery_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  groups?: InputMaybe<Array<SceneGroupInput>>;
  id: Scalars['ID']['input'];
  /** @deprecated Use groups */
  movies?: InputMaybe<Array<SceneMovieInput>>;
  /** @deprecated Unsupported - Use sceneIncrementO/sceneDecrementO */
  o_counter?: InputMaybe<Scalars['Int']['input']>;
  organized?: InputMaybe<Scalars['Boolean']['input']>;
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /**
   * The number ot times a scene has been played
   * @deprecated Unsupported - Use sceneIncrementPlayCount/sceneDecrementPlayCount
   */
  play_count?: InputMaybe<Scalars['Int']['input']>;
  /** The total time a scene has spent playing */
  play_duration?: InputMaybe<Scalars['Float']['input']>;
  primary_file_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  /** The time index a scene was left at */
  resume_time?: InputMaybe<Scalars['Float']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  studio_id?: InputMaybe<Scalars['ID']['input']>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated Use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type ScenesDestroyInput = {
  delete_file?: InputMaybe<Scalars['Boolean']['input']>;
  delete_generated?: InputMaybe<Scalars['Boolean']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

/** Type of the content a scraper generates */
const enum ScrapeContentType {
  Gallery = 'GALLERY',
  Group = 'GROUP',
  Movie = 'MOVIE',
  Performer = 'PERFORMER',
  Scene = 'SCENE'
};

type ScrapeMultiPerformersInput = {
  /** Instructs to query by scene fingerprints */
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type ScrapeMultiScenesInput = {
  /** Instructs to query by scene fingerprints */
  scene_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type ScrapeSingleGalleryInput = {
  /** Instructs to query by gallery id */
  gallery_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by gallery fragment */
  gallery_input?: InputMaybe<ScrapedGalleryInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

type ScrapeSingleGroupInput = {
  /** Instructs to query by group id */
  group_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by group fragment */
  group_input?: InputMaybe<ScrapedGroupInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

type ScrapeSingleMovieInput = {
  /** Instructs to query by movie id */
  movie_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by movie fragment */
  movie_input?: InputMaybe<ScrapedMovieInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

type ScrapeSinglePerformerInput = {
  /** Instructs to query by performer id */
  performer_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by performer fragment */
  performer_input?: InputMaybe<ScrapedPerformerInput>;
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
};

type ScrapeSingleSceneInput = {
  /** Instructs to query by string */
  query?: InputMaybe<Scalars['String']['input']>;
  /** Instructs to query by scene fingerprints */
  scene_id?: InputMaybe<Scalars['ID']['input']>;
  /** Instructs to query by scene fragment */
  scene_input?: InputMaybe<ScrapedSceneInput>;
};

type ScrapeSingleStudioInput = {
  /** Query can be either a name or a Stash ID */
  query?: InputMaybe<Scalars['String']['input']>;
};

const enum ScrapeType {
  /** From existing object */
  Fragment = 'FRAGMENT',
  /** From text query */
  Name = 'NAME',
  /** From URL */
  Url = 'URL'
};

/** Scraped Content is the forming union over the different scrapers */
type ScrapedContent = ScrapedGallery | ScrapedGroup | ScrapedMovie | ScrapedPerformer | ScrapedScene | ScrapedStudio | ScrapedTag;

type ScrapedGallery = {
  __typename?: 'ScrapedGallery';
  code?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  performers?: Maybe<Array<ScrapedPerformer>>;
  photographer?: Maybe<Scalars['String']['output']>;
  studio?: Maybe<ScrapedStudio>;
  tags?: Maybe<Array<ScrapedTag>>;
  title?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

type ScrapedGalleryInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  photographer?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A group from a scraping operation... */
type ScrapedGroup = {
  __typename?: 'ScrapedGroup';
  aliases?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  back_image?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  front_image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['String']['output']>;
  stored_id?: Maybe<Scalars['ID']['output']>;
  studio?: Maybe<ScrapedStudio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

type ScrapedGroupInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['String']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A movie from a scraping operation... */
type ScrapedMovie = {
  __typename?: 'ScrapedMovie';
  aliases?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  back_image?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['String']['output']>;
  /** This should be a base64 encoded data URL */
  front_image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['String']['output']>;
  stored_id?: Maybe<Scalars['ID']['output']>;
  studio?: Maybe<ScrapedStudio>;
  synopsis?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

type ScrapedMovieInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['String']['input']>;
  synopsis?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A performer from a scraping operation... */
type ScrapedPerformer = {
  __typename?: 'ScrapedPerformer';
  aliases?: Maybe<Scalars['String']['output']>;
  birthdate?: Maybe<Scalars['String']['output']>;
  career_length?: Maybe<Scalars['String']['output']>;
  circumcised?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  death_date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  disambiguation?: Maybe<Scalars['String']['output']>;
  ethnicity?: Maybe<Scalars['String']['output']>;
  eye_color?: Maybe<Scalars['String']['output']>;
  fake_tits?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hair_color?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['String']['output']>;
  /**
   * This should be a base64 encoded data URL
   * @deprecated use images instead
   */
  image?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  /** @deprecated use urls */
  instagram?: Maybe<Scalars['String']['output']>;
  measurements?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  penis_length?: Maybe<Scalars['String']['output']>;
  piercings?: Maybe<Scalars['String']['output']>;
  remote_site_id?: Maybe<Scalars['String']['output']>;
  /** Set if performer matched */
  stored_id?: Maybe<Scalars['ID']['output']>;
  tags?: Maybe<Array<ScrapedTag>>;
  tattoos?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  twitter?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
  weight?: Maybe<Scalars['String']['output']>;
};

type ScrapedPerformerInput = {
  aliases?: InputMaybe<Scalars['String']['input']>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  career_length?: InputMaybe<Scalars['String']['input']>;
  circumcised?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  death_date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  disambiguation?: InputMaybe<Scalars['String']['input']>;
  ethnicity?: InputMaybe<Scalars['String']['input']>;
  eye_color?: InputMaybe<Scalars['String']['input']>;
  fake_tits?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  hair_color?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  instagram?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  penis_length?: InputMaybe<Scalars['String']['input']>;
  piercings?: InputMaybe<Scalars['String']['input']>;
  remote_site_id?: InputMaybe<Scalars['String']['input']>;
  /** Set if performer matched */
  stored_id?: InputMaybe<Scalars['ID']['input']>;
  tattoos?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  twitter?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
  weight?: InputMaybe<Scalars['String']['input']>;
};

type ScrapedScene = {
  __typename?: 'ScrapedScene';
  code?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  director?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  file?: Maybe<SceneFileType>;
  fingerprints?: Maybe<Array<StashBoxFingerprint>>;
  groups?: Maybe<Array<ScrapedGroup>>;
  /** This should be a base64 encoded data URL */
  image?: Maybe<Scalars['String']['output']>;
  /** @deprecated use groups */
  movies?: Maybe<Array<ScrapedMovie>>;
  performers?: Maybe<Array<ScrapedPerformer>>;
  remote_site_id?: Maybe<Scalars['String']['output']>;
  studio?: Maybe<ScrapedStudio>;
  tags?: Maybe<Array<ScrapedTag>>;
  title?: Maybe<Scalars['String']['output']>;
  /** @deprecated use urls */
  url?: Maybe<Scalars['String']['output']>;
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

type ScrapedSceneInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  director?: InputMaybe<Scalars['String']['input']>;
  remote_site_id?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use urls */
  url?: InputMaybe<Scalars['String']['input']>;
  urls?: InputMaybe<Array<Scalars['String']['input']>>;
};

type ScrapedStudio = {
  __typename?: 'ScrapedStudio';
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  parent?: Maybe<ScrapedStudio>;
  remote_site_id?: Maybe<Scalars['String']['output']>;
  /** Set if studio matched */
  stored_id?: Maybe<Scalars['ID']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

type ScrapedTag = {
  __typename?: 'ScrapedTag';
  name: Scalars['String']['output'];
  /** Set if tag matched */
  stored_id?: Maybe<Scalars['ID']['output']>;
};

type Scraper = {
  __typename?: 'Scraper';
  /** Details for gallery scraper */
  gallery?: Maybe<ScraperSpec>;
  /** Details for group scraper */
  group?: Maybe<ScraperSpec>;
  id: Scalars['ID']['output'];
  /**
   * Details for movie scraper
   * @deprecated use group
   */
  movie?: Maybe<ScraperSpec>;
  name: Scalars['String']['output'];
  /** Details for performer scraper */
  performer?: Maybe<ScraperSpec>;
  /** Details for scene scraper */
  scene?: Maybe<ScraperSpec>;
};

type ScraperSource = {
  __typename?: 'ScraperSource';
  /** Scraper ID to scrape with. Should be unset if stash_box_endpoint/stash_box_index is set */
  scraper_id?: Maybe<Scalars['ID']['output']>;
  /** Stash-box endpoint */
  stash_box_endpoint?: Maybe<Scalars['String']['output']>;
  /**
   * Index of the configured stash-box instance to use. Should be unset if scraper_id is set
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: Maybe<Scalars['Int']['output']>;
};

type ScraperSourceInput = {
  /** Scraper ID to scrape with. Should be unset if stash_box_endpoint/stash_box_index is set */
  scraper_id?: InputMaybe<Scalars['ID']['input']>;
  /** Stash-box endpoint */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /**
   * Index of the configured stash-box instance to use. Should be unset if scraper_id is set
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

type ScraperSpec = {
  __typename?: 'ScraperSpec';
  supported_scrapes: Array<ScrapeType>;
  /** URLs matching these can be scraped with */
  urls?: Maybe<Array<Scalars['String']['output']>>;
};

type SetDefaultFilterInput = {
  /** null to clear */
  find_filter?: InputMaybe<FindFilterType>;
  mode: FilterMode;
  object_filter?: InputMaybe<Scalars['Map']['input']>;
  ui_options?: InputMaybe<Scalars['Map']['input']>;
};

type SetFingerprintsInput = {
  type: Scalars['String']['input'];
  /** an null value will remove the fingerprint */
  value?: InputMaybe<Scalars['String']['input']>;
};

type SetupInput = {
  /** Empty to indicate default - only applicable if storeBlobsInDatabase is false */
  blobsLocation: Scalars['String']['input'];
  /** Empty to indicate default */
  cacheLocation: Scalars['String']['input'];
  /** Empty to indicate $HOME/.stash/config.yml default */
  configLocation: Scalars['String']['input'];
  /** Empty to indicate default */
  databaseFile: Scalars['String']['input'];
  /** Empty to indicate default */
  generatedLocation: Scalars['String']['input'];
  stashes: Array<StashConfigInput>;
  storeBlobsInDatabase: Scalars['Boolean']['input'];
};

const enum SortDirectionEnum {
  Asc = 'ASC',
  Desc = 'DESC'
};

type StashBox = {
  __typename?: 'StashBox';
  api_key: Scalars['String']['output'];
  endpoint: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

/** If neither ids nor names are set, tag all items */
type StashBoxBatchTagInput = {
  /** If batch adding studios, should their parent studios also be created? */
  createParent: Scalars['Boolean']['input'];
  /**
   * Stash endpoint to use for the tagging
   * @deprecated use stash_box_endpoint
   */
  endpoint?: InputMaybe<Scalars['Int']['input']>;
  /** Fields to exclude when executing the tagging */
  exclude_fields?: InputMaybe<Array<Scalars['String']['input']>>;
  /** If set, only tag these ids */
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** If set, only tag these names */
  names?: InputMaybe<Array<Scalars['String']['input']>>;
  /**
   * If set, only tag these performer ids
   * @deprecated use ids
   */
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /**
   * If set, only tag these performer names
   * @deprecated use names
   */
  performer_names?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Refresh items already tagged by StashBox if true. Only tag items with no StashBox tagging if false */
  refresh: Scalars['Boolean']['input'];
  /** Endpoint of the stash-box instance to use */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
};

type StashBoxDraftSubmissionInput = {
  id: Scalars['String']['input'];
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use stash_box_endpoint */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

type StashBoxFingerprint = {
  __typename?: 'StashBoxFingerprint';
  algorithm: Scalars['String']['output'];
  duration: Scalars['Int']['output'];
  hash: Scalars['String']['output'];
};

type StashBoxFingerprintSubmissionInput = {
  scene_ids: Array<Scalars['String']['input']>;
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /** @deprecated use stash_box_endpoint */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

type StashBoxInput = {
  api_key: Scalars['String']['input'];
  endpoint: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

type StashBoxPerformerQueryInput = {
  /** Instructs query by scene fingerprints */
  performer_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Query by query string */
  q?: InputMaybe<Scalars['String']['input']>;
  /** Endpoint of the stash-box instance to use */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /**
   * Index of the configured stash-box instance to use
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

type StashBoxPerformerQueryResult = {
  __typename?: 'StashBoxPerformerQueryResult';
  query: Scalars['String']['output'];
  results: Array<ScrapedPerformer>;
};

type StashBoxSceneQueryInput = {
  /** Query by query string */
  q?: InputMaybe<Scalars['String']['input']>;
  /** Instructs query by scene fingerprints */
  scene_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** Endpoint of the stash-box instance to use */
  stash_box_endpoint?: InputMaybe<Scalars['String']['input']>;
  /**
   * Index of the configured stash-box instance to use
   * @deprecated use stash_box_endpoint
   */
  stash_box_index?: InputMaybe<Scalars['Int']['input']>;
};

type StashBoxValidationResult = {
  __typename?: 'StashBoxValidationResult';
  status: Scalars['String']['output'];
  valid: Scalars['Boolean']['output'];
};

type StashConfig = {
  __typename?: 'StashConfig';
  excludeImage: Scalars['Boolean']['output'];
  excludeVideo: Scalars['Boolean']['output'];
  path: Scalars['String']['output'];
};

/** Stash configuration details */
type StashConfigInput = {
  excludeImage: Scalars['Boolean']['input'];
  excludeVideo: Scalars['Boolean']['input'];
  path: Scalars['String']['input'];
};

type StashId = {
  __typename?: 'StashID';
  endpoint: Scalars['String']['output'];
  stash_id: Scalars['String']['output'];
};

type StashIdCriterionInput = {
  /**
   * If present, this value is treated as a predicate.
   * That is, it will filter based on stash_ids with the matching endpoint
   */
  endpoint?: InputMaybe<Scalars['String']['input']>;
  modifier: CriterionModifier;
  stash_id?: InputMaybe<Scalars['String']['input']>;
};

type StashIdInput = {
  endpoint: Scalars['String']['input'];
  stash_id: Scalars['String']['input'];
};

type StatsResultType = {
  __typename?: 'StatsResultType';
  gallery_count: Scalars['Int']['output'];
  group_count: Scalars['Int']['output'];
  image_count: Scalars['Int']['output'];
  images_size: Scalars['Float']['output'];
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  performer_count: Scalars['Int']['output'];
  scene_count: Scalars['Int']['output'];
  scenes_duration: Scalars['Float']['output'];
  scenes_played: Scalars['Int']['output'];
  scenes_size: Scalars['Float']['output'];
  studio_count: Scalars['Int']['output'];
  tag_count: Scalars['Int']['output'];
  total_o_count: Scalars['Int']['output'];
  total_play_count: Scalars['Int']['output'];
  total_play_duration: Scalars['Float']['output'];
};

const enum StreamingResolutionEnum {
  /** 4k */
  FourK = 'FOUR_K',
  /** 1080p */
  FullHd = 'FULL_HD',
  /** 240p */
  Low = 'LOW',
  /** Original */
  Original = 'ORIGINAL',
  /** 480p */
  Standard = 'STANDARD',
  /** 720p */
  StandardHd = 'STANDARD_HD'
};

type StringCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
};

type Studio = {
  __typename?: 'Studio';
  aliases: Array<Scalars['String']['output']>;
  child_studios: Array<Studio>;
  created_at: Scalars['Time']['output'];
  details?: Maybe<Scalars['String']['output']>;
  favorite: Scalars['Boolean']['output'];
  gallery_count: Scalars['Int']['output'];
  group_count: Scalars['Int']['output'];
  groups: Array<Group>;
  id: Scalars['ID']['output'];
  ignore_auto_tag: Scalars['Boolean']['output'];
  image_count: Scalars['Int']['output'];
  image_path?: Maybe<Scalars['String']['output']>;
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  /** @deprecated use groups instead */
  movies: Array<Movie>;
  name: Scalars['String']['output'];
  parent_studio?: Maybe<Studio>;
  performer_count: Scalars['Int']['output'];
  rating100?: Maybe<Scalars['Int']['output']>;
  scene_count: Scalars['Int']['output'];
  stash_ids: Array<StashId>;
  tags: Array<Tag>;
  updated_at: Scalars['Time']['output'];
  url?: Maybe<Scalars['String']['output']>;
};


type StudioGallery_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type StudioGroup_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type StudioImage_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type StudioMovie_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type StudioPerformer_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type StudioScene_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};

type StudioCreateInput = {
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  details?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parent_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  url?: InputMaybe<Scalars['String']['input']>;
};

type StudioDestroyInput = {
  id: Scalars['ID']['input'];
};

type StudioFilterType = {
  AND?: InputMaybe<StudioFilterType>;
  NOT?: InputMaybe<StudioFilterType>;
  OR?: InputMaybe<StudioFilterType>;
  /** Filter by studio aliases */
  aliases?: InputMaybe<StringCriterionInput>;
  /** Filter by subsidiary studio count */
  child_count?: InputMaybe<IntCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  details?: InputMaybe<StringCriterionInput>;
  /** Filter by favorite */
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by related galleries that meet this criteria */
  galleries_filter?: InputMaybe<GalleryFilterType>;
  /** Filter by gallery count */
  gallery_count?: InputMaybe<IntCriterionInput>;
  /** Filter by autotag ignore value */
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by image count */
  image_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related images that meet this criteria */
  images_filter?: InputMaybe<ImageFilterType>;
  /** Filter to only include studios missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<StringCriterionInput>;
  /** Filter to only include studios with this parent studio */
  parents?: InputMaybe<MultiCriterionInput>;
  rating100?: InputMaybe<IntCriterionInput>;
  /** Filter by scene count */
  scene_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scenes_filter?: InputMaybe<SceneFilterType>;
  /** Filter by StashID */
  stash_id_endpoint?: InputMaybe<StashIdCriterionInput>;
  /** Filter by tag count */
  tag_count?: InputMaybe<IntCriterionInput>;
  /** Filter to only include studios with these tags */
  tags?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by url */
  url?: InputMaybe<StringCriterionInput>;
};

type StudioUpdateInput = {
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  details?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parent_id?: InputMaybe<Scalars['ID']['input']>;
  rating100?: InputMaybe<Scalars['Int']['input']>;
  stash_ids?: InputMaybe<Array<StashIdInput>>;
  tag_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  url?: InputMaybe<Scalars['String']['input']>;
};

type Subscription = {
  __typename?: 'Subscription';
  /** Update from the metadata manager */
  jobsSubscribe: JobStatusUpdate;
  loggingSubscribe: Array<LogEntry>;
  scanCompleteSubscribe: Scalars['Boolean']['output'];
};

type SystemStatus = {
  __typename?: 'SystemStatus';
  appSchema: Scalars['Int']['output'];
  configPath?: Maybe<Scalars['String']['output']>;
  databasePath?: Maybe<Scalars['String']['output']>;
  databaseSchema?: Maybe<Scalars['Int']['output']>;
  ffmpegPath?: Maybe<Scalars['String']['output']>;
  ffprobePath?: Maybe<Scalars['String']['output']>;
  homeDir: Scalars['String']['output'];
  os: Scalars['String']['output'];
  status: SystemStatusEnum;
  workingDir: Scalars['String']['output'];
};

const enum SystemStatusEnum {
  NeedsMigration = 'NEEDS_MIGRATION',
  Ok = 'OK',
  Setup = 'SETUP'
};

type Tag = {
  __typename?: 'Tag';
  aliases: Array<Scalars['String']['output']>;
  child_count: Scalars['Int']['output'];
  children: Array<Tag>;
  created_at: Scalars['Time']['output'];
  description?: Maybe<Scalars['String']['output']>;
  favorite: Scalars['Boolean']['output'];
  gallery_count: Scalars['Int']['output'];
  group_count: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  ignore_auto_tag: Scalars['Boolean']['output'];
  image_count: Scalars['Int']['output'];
  image_path?: Maybe<Scalars['String']['output']>;
  /** @deprecated use group_count instead */
  movie_count: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parent_count: Scalars['Int']['output'];
  parents: Array<Tag>;
  performer_count: Scalars['Int']['output'];
  scene_count: Scalars['Int']['output'];
  scene_marker_count: Scalars['Int']['output'];
  studio_count: Scalars['Int']['output'];
  updated_at: Scalars['Time']['output'];
};


type TagGallery_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagGroup_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagImage_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagMovie_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagPerformer_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagScene_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagScene_Marker_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};


type TagStudio_CountArgs = {
  depth?: InputMaybe<Scalars['Int']['input']>;
};

type TagCreateInput = {
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  child_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parent_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type TagDestroyInput = {
  id: Scalars['ID']['input'];
};

type TagFilterType = {
  AND?: InputMaybe<TagFilterType>;
  NOT?: InputMaybe<TagFilterType>;
  OR?: InputMaybe<TagFilterType>;
  /** Filter by tag aliases */
  aliases?: InputMaybe<StringCriterionInput>;
  /** Filter by number f child tags the tag has */
  child_count?: InputMaybe<IntCriterionInput>;
  /** Filter by child tags */
  children?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by creation time */
  created_at?: InputMaybe<TimestampCriterionInput>;
  /** Filter by tag description */
  description?: InputMaybe<StringCriterionInput>;
  /** Filter by favorite */
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by related galleries that meet this criteria */
  galleries_filter?: InputMaybe<GalleryFilterType>;
  /** Filter by number of galleries with this tag */
  gallery_count?: InputMaybe<IntCriterionInput>;
  /** Filter by number of group with this tag */
  group_count?: InputMaybe<IntCriterionInput>;
  /** Filter by autotag ignore value */
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by number of images with this tag */
  image_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related images that meet this criteria */
  images_filter?: InputMaybe<ImageFilterType>;
  /** Filter to only include tags missing this property */
  is_missing?: InputMaybe<Scalars['String']['input']>;
  /** Filter by number of markers with this tag */
  marker_count?: InputMaybe<IntCriterionInput>;
  /** Filter by number of movies with this tag */
  movie_count?: InputMaybe<IntCriterionInput>;
  /** Filter by tag name */
  name?: InputMaybe<StringCriterionInput>;
  /** Filter by number of parent tags the tag has */
  parent_count?: InputMaybe<IntCriterionInput>;
  /** Filter by parent tags */
  parents?: InputMaybe<HierarchicalMultiCriterionInput>;
  /** Filter by number of performers with this tag */
  performer_count?: InputMaybe<IntCriterionInput>;
  /** Filter by number of scenes with this tag */
  scene_count?: InputMaybe<IntCriterionInput>;
  /** Filter by related scenes that meet this criteria */
  scenes_filter?: InputMaybe<SceneFilterType>;
  /** Filter by number of studios with this tag */
  studio_count?: InputMaybe<IntCriterionInput>;
  /** Filter by last update time */
  updated_at?: InputMaybe<TimestampCriterionInput>;
};

type TagUpdateInput = {
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  child_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
  ignore_auto_tag?: InputMaybe<Scalars['Boolean']['input']>;
  /** This should be a URL or a base64 encoded data URL */
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parent_ids?: InputMaybe<Array<Scalars['ID']['input']>>;
};

type TagsMergeInput = {
  destination: Scalars['ID']['input'];
  source: Array<Scalars['ID']['input']>;
};

type TimestampCriterionInput = {
  modifier: CriterionModifier;
  value: Scalars['String']['input'];
  value2?: InputMaybe<Scalars['String']['input']>;
};

type Version = {
  __typename?: 'Version';
  build_time: Scalars['String']['output'];
  hash: Scalars['String']['output'];
  version?: Maybe<Scalars['String']['output']>;
};

type VideoCaption = {
  __typename?: 'VideoCaption';
  caption_type: Scalars['String']['output'];
  language_code: Scalars['String']['output'];
};

type VideoFile = BaseFile & {
  __typename?: 'VideoFile';
  audio_codec: Scalars['String']['output'];
  basename: Scalars['String']['output'];
  bit_rate: Scalars['Int']['output'];
  created_at: Scalars['Time']['output'];
  duration: Scalars['Float']['output'];
  fingerprint?: Maybe<Scalars['String']['output']>;
  fingerprints: Array<Fingerprint>;
  format: Scalars['String']['output'];
  frame_rate: Scalars['Float']['output'];
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  mod_time: Scalars['Time']['output'];
  parent_folder_id: Scalars['ID']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int64']['output'];
  updated_at: Scalars['Time']['output'];
  video_codec: Scalars['String']['output'];
  width: Scalars['Int']['output'];
  zip_file_id?: Maybe<Scalars['ID']['output']>;
};


type VideoFileFingerprintArgs = {
  type: Scalars['String']['input'];
};

type VisualFile = ImageFile | VideoFile;
