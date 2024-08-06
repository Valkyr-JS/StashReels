declare module "*.module.scss" {
  const content: Record<string, string>;
  export = content;
}

interface IitemData {
  /** The zero-based index of the scene in the video queue. */
  index: number;
  /** The scene data. */
  scene: IsceneData;
}

interface IsceneData {
  /** The ID of the scene in Stash. */
  id: Scene["id"];
  /** The format of the video, e.g. "mp4". */
  format: string;
  /** The absolute path of the video stream. */
  path: string;
  /** The title of the scene. */
  title: string;
  /** The absolute path of the subtitles file. */
  captions?: {
    format: string;
    lang: string;
    source: string;
  }[];
}
