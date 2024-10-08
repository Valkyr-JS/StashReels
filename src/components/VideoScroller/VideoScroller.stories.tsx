import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import VideoScroller from ".";
import { setCssVHDecorator } from "../../../.storybook/decorators";

const meta = {
  title: "Components/VideoScroller",
  component: VideoScroller,
  tags: ["autodocs"],
  args: {
    isFullscreen: false,
    isLetterboxed: true,
    isMuted: true,
    items: [
      {
        scene: {
          captions: undefined,
          id: "2056",
          format: "mp4",
          path: process.env.STASH_ADDRESS + "/scene/2056/stream",
          performers: [],
          title: "Scene Title 1",
        },
        setSettingsTabHandler: fn(),
        subtitlesOn: false,
        toggleAudioHandler: fn(),
        toggleFullscreenHandler: fn(),
        toggleLetterboxingHandler: fn(),
        toggleLoopHandler: fn(),
        toggleSubtitlesHandler: fn(),
        toggleUiHandler: fn(),
      },
      {
        scene: {
          captions: undefined,
          id: "2057",
          format: "mp4",
          path: process.env.STASH_ADDRESS + "/scene/2057/stream",
          performers: [],
          title: "Scene Title 2",
        },
        setSettingsTabHandler: fn(),
        subtitlesOn: false,
        toggleAudioHandler: fn(),
        toggleFullscreenHandler: fn(),
        toggleLetterboxingHandler: fn(),
        toggleLoopHandler: fn(),
        toggleSubtitlesHandler: fn(),
        toggleUiHandler: fn(),
      },
      {
        scene: {
          captions: undefined,
          id: "2061",
          format: "mp4",
          path: process.env.STASH_ADDRESS + "/scene/2061/stream",
          performers: [],
          title: "Scene Title 3",
        },
        setSettingsTabHandler: fn(),
        subtitlesOn: false,
        toggleAudioHandler: fn(),
        toggleFullscreenHandler: fn(),
        toggleLetterboxingHandler: fn(),
        toggleLoopHandler: fn(),
        toggleSubtitlesHandler: fn(),
        toggleUiHandler: fn(),
      },
      {
        scene: {
          captions: undefined,
          id: "2063",
          format: "mp4",
          path: process.env.STASH_ADDRESS + "/scene/2063/stream",
          performers: [],
          title: "Scene Title 4",
        },
        setSettingsTabHandler: fn(),
        subtitlesOn: false,
        toggleAudioHandler: fn(),
        toggleFullscreenHandler: fn(),
        toggleLetterboxingHandler: fn(),
        toggleLoopHandler: fn(),
        toggleSubtitlesHandler: fn(),
        toggleUiHandler: fn(),
      },
      {
        scene: {
          captions: undefined,
          id: "3376",
          format: "mp4",
          path: process.env.STASH_ADDRESS + "/scene/3376/stream",
          performers: [],
          title: "Scene Title 5",
        },
        setSettingsTabHandler: fn(),
        subtitlesOn: false,
        toggleAudioHandler: fn(),
        toggleFullscreenHandler: fn(),
        toggleLetterboxingHandler: fn(),
        toggleLoopHandler: fn(),
        toggleSubtitlesHandler: fn(),
        toggleUiHandler: fn(),
      },
    ],
    loopOnEnd: false,
    settingsTabIsVisible: false,
    uiIsVisible: true,
  },
  decorators: [setCssVHDecorator],
} satisfies Meta<typeof VideoScroller>;

export default meta;
type Story = StoryObj<typeof VideoScroller>;

export const Default: Story = {};

export const PlayNewVideoOnScroll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );
    const allVideos: HTMLVideoElement[] =
      within(scroller).getAllByTestId("VideoItem--video");

    const video0: HTMLVideoElement = allVideos[0];
    const video1: HTMLVideoElement = allVideos[1];
    const video2: HTMLVideoElement = allVideos[2];
    const video3: HTMLVideoElement = allVideos[3];
    const video4: HTMLVideoElement = allVideos[4];

    // Wait for the video to load
    video0.addEventListener("canplaythrough", async () => {
      // Video 0 should be playing by default
      await expect(video0.paused).toBe(false);

      // Fire a scroll down event
      scroller.scrollTo(0, (video0.scrollHeight / 3) * 2);

      // Allow time for scroll animation
      await waitFor(() => {
        // All videos should be paused, except video1 which should be playing
        expect(video0.paused).toBe(true);
        expect(video1.paused).toBe(false);
        expect(video2.paused).toBe(true);
        expect(video3.paused).toBe(true);
        expect(video4.paused).toBe(true);

        // Fire a second scroll down event
        scroller.scrollTo(
          0,
          video0.scrollHeight + (video1.scrollHeight / 3) * 2
        );
      });

      // Allow time for scroll animation
      await waitFor(() => {
        // All videos should be paused, except video2 which should be playing
        expect(video0.paused).toBe(true);
        expect(video1.paused).toBe(true);
        expect(video2.paused).toBe(false);
        expect(video3.paused).toBe(true);
        expect(video4.paused).toBe(true);

        // Fire a scroll up event
        scroller.scrollTo(0, (video0.scrollHeight / 3) * 2);
      });

      // Allow time for scroll animation
      await waitFor(() => {
        // All videos should be paused, except video1 which should be playing
        expect(video0.paused).toBe(true);
        expect(video1.paused).toBe(false);
        expect(video2.paused).toBe(true);
        expect(video3.paused).toBe(true);
        expect(video4.paused).toBe(true);

        // The first three videos should retain their play duration, whilst the
        // others should have no play duration as they haven't been played yet.
        expect(video0.currentTime).not.toBe(0);
        expect(video1.currentTime).not.toBe(0);
        expect(video2.currentTime).not.toBe(0);
        expect(video3.currentTime).toBe(0);
        expect(video4.currentTime).toBe(0);
      });
    });
  },
};

export const TogglePlayOnTap: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );
    const allVideos: HTMLVideoElement[] =
      within(scroller).getAllByTestId("VideoItem--video");

    const video: HTMLVideoElement = allVideos[0];

    // Wait for the video to load
    video.addEventListener("canplaythrough", async () => {
      // Video should be playing by default
      await expect(video.paused).toBe(false);

      // First click should pause the video
      await userEvent.click(video, { delay: 500 });
      await expect(video.paused).toBe(true);

      // Second click should play the video again
      await userEvent.click(video, { delay: 1000 });
      await expect(video.paused).toBe(false);
    });
  },
};
