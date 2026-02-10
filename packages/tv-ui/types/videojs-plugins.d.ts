// Type declarations for videojs plugins that don't have their own type definitions

declare module 'videojs-abloop' {
  import type { VideoJsPlayer } from 'video.js';

  export interface Options {
    start?: number;
    end?: number;
    enabled?: boolean;
    loopIfBeforeStart?: boolean;
    loopIfAfterEnd?: boolean;
    pauseAfterLoop?: boolean;
    pauseBeforeLoop?: boolean;
    createButtons?: boolean;
  }

  export interface AbLoopPlugin {
    setOptions(options: Partial<Options>): void;
    getOptions(): Options;
    enable(): void;
    disable(): void;
    setStart(time?: number): void;
    setEnd(time?: number): void;
    goToStart(): void;
    goToEnd(): void;
    validateLoop(): void;
  }

  const abLoopPlugin: (this: VideoJsPlayer, options?: Partial<Options>) => void;
  export default abLoopPlugin;

  // Export namespace for easier type access
  export namespace abLoopPlugin {
    export type { Options };
  }
}

// Extend video.js module to include proper types
declare module 'video.js' {
  // Fix VideoJsPlayerOptions export
  export interface VideoJsPlayerOptions extends ComponentOptions {
    children?: string[] | ComponentOptions[];
    plugins?: Record<string, any>;
    muted?: boolean;
    loop?: boolean;
  }

  export interface VideoJsPlayer {
    // Plugin properties
    abLoopPlugin?: import('videojs-abloop').AbLoopPlugin;
    markers?: (options?: any) => {
      add: (markers: any[]) => void;
      getMarkers: () => any[];
      remove: (indices: number[]) => void;
      removeAll: () => void;
      updateTime: (force?: boolean) => void;
      reset: (markers: any[]) => void;
      destroy: () => void;
    };

    // Core player methods
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    one(event: string, callback: Function): void;
    trigger(event: string): void;
    ready(callback: Function): void;
    el(): HTMLElement;
    getChild(name: string): any;
    addClass(className: string): void;
    removeClass(className: string): void;
    toJSON(): { plugins: Record<string, any> };
    focus(): void;
    readyState(): number;

    // Playback control
    play(): Promise<void>;
    pause(): void;
    paused(): boolean;
    currentTime(): number;
    currentTime(seconds: number): void;
    duration(): number;
    duration(seconds: number): void;
    played(): TimeRanges;
    loop(): boolean;
    loop(value: boolean): void;
    muted(): boolean;
    muted(value: boolean): void;
    playbackRate(): number;
    playbackRate(rate: number): void;

    // State
    isDisposed(): boolean;
    scrubbing(): boolean;
    scrubbing(value: boolean): void;
    userActive(): boolean;
    userActive(value: boolean): void;

    // Mobile UI
    emitTapEvents(): void;

    // Big play button (custom property)
    bigPlayButton?: { el(): HTMLElement };

    // Custom properties added by our code
    _scene?: any;
  }

  export interface VideoJsStatic {
    hook(type: string, callback: Function): void;
    registerPlugin(name: string, plugin: Function): void;
  }

  const videojs: VideoJsStatic & ((element: string | Element, options?: VideoJsPlayerOptions) => VideoJsPlayer);
  export default videojs;
}
