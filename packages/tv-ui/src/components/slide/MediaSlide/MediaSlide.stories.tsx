import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import MediaSlide from ".";
import { setCssVHDecorator } from "../../../../../.storybook/decorators";
import { GenderEnum } from "stash-ui/dist/src/core/generated-graphql";

const meta = {
  title: "Components/MediaSlide",
  component: MediaSlide,
  tags: ["autodocs"],
  args: {
    currentIndex: 0,
    index: 0,
    isLetterboxed: true,
    isFullscreen: false,
    isForceLandscape: true,
    isMuted: true,
    changeItemHandler: fn(),
    loopOnEnd: false,
    scene: {
      date: "2021-02-18",
      format: "mp4",
      id: "3097",
      performers: [
        { name: "Scarlett Johannson", gender: "FEMALE" as GenderEnum.Female },
        { name: "Jennifer Lawrence", gender: "FEMALE" as GenderEnum.Female },
      ],
      parentStudio: "Parent studio name",
      path: process.env.STASH_ADDRESS + "/scene/3097/stream",
      studio: "Studio name",
      title: "Scene Title 1",
          rawScene: {},
    },
    settingsTabIsVisible: false,
    setSettingsTabHandler: fn(),
    subtitlesOn: true,
    toggleAudioHandler: fn(),
    toggleFullscreenHandler: fn(),
    toggleLetterboxingHandler: fn(),
    toggleForceLandscapeHandler: fn(),
    toggleLoopHandler: fn(),
    toggleSubtitlesHandler: fn(),
    toggleUiHandler: fn(),
    uiIsVisible: true,
  },
  decorators: [setCssVHDecorator],
} satisfies Meta<typeof MediaSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { captionsDefault: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const video: HTMLVideoElement = canvas.getByTestId("MediaSlide--video");
    const track = canvas.queryByTestId("MediaSlide--subtitles");
    const subtitlesButton = canvas.queryByTestId("MediaSlide--subtitlesButton");

    // Wait for the video to load
    video.addEventListener("canplaythrough", async () => {
      // No tracks in the video if there aren't any
      expect(track).not.toBeInTheDocument();

      // Subtitle buttons should not be rendered if there are no tracks to
      // toggle.
      expect(subtitlesButton).not.toBeInTheDocument();
    });
  },
};

export const EmptySceneInfo: Story = {
  name: "No scene info",
  args: {
    scene: {
      format: "mp4",
      id: "3097",
      path: process.env.STASH_ADDRESS + "/scene/3097/stream",
      performers: [],
      rawScene: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sceneInfoButton = canvas.queryByTestId("MediaSlide--infoButton");
    const sceneInfoPanel = canvas.queryByTestId("MediaSlide--sceneInfo");

    // The scene info button and panel should not be in the document.
    expect(sceneInfoButton).not.toBeInTheDocument();
    expect(sceneInfoPanel).not.toBeInTheDocument();
  },
};

export const Subtitles: Story = {
  args: {
    captionsDefault: "uk",
    index: 1,
    scene: {
      captions: [
        {
          format: "srt",
          lang: "uk",
          source: process.env.STASH_ADDRESS + "/scene/5133/caption",
        },
        {
          format: "srt",
          lang: "en",
          source: process.env.STASH_ADDRESS + "/scene/5133/caption",
        },
        {
          format: "srt",
          lang: "us",
          source: process.env.STASH_ADDRESS + "/scene/5133/caption",
        },
      ],
      performers: [
        { name: "Scarlett Johannson", gender: "FEMALE" as GenderEnum.Female },
        { name: "Jennifer Lawrence", gender: "FEMALE" as GenderEnum.Female },
      ],
      format: "mp4",
      id: "5133",
      path: process.env.STASH_ADDRESS + "/scene/5133/stream",
      title: "Scene Title 2",
      rawScene: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allVideos: HTMLVideoElement[] =
      canvas.getAllByTestId("MediaSlide--video");
    const video: HTMLVideoElement = allVideos[0];

    // Wait for the video to load
    video.addEventListener("canplaythrough", async () => {
      // Show default track automatically
      expect(video.textTracks[0].mode).toBe("showing");

      // Only render the track that matches the user's selected default.
      expect(video.textTracks.length).toBe(1);
      expect(video.textTracks[0].language).toBe("uk");
    });
  },
};

export const TogglePlayOnTap: Story = {
  name: "Toggle play on tap",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allVideos: HTMLVideoElement[] =
      canvas.getAllByTestId("MediaSlide--video");
    const video: HTMLVideoElement = allVideos[0];

    // Wait for the video to load
    video.addEventListener("canplaythrough", async () => {
      // Video should be playing by default
      await expect(video.paused).toBe(false);

      // First click should pause the video
      await userEvent.click(video, { delay: 1500 });
      await expect(video.paused).toBe(true);

      // Second click should play the video again
      await userEvent.click(video, { delay: 1500 });
      await expect(video.paused).toBe(false);
    });
  },
};

export const ToggleSceneInfoButton: Story = {
  name: "Toggle scene info",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sceneInfoButton = canvas.getByTestId("MediaSlide--infoButton");
    const sceneInfoPanel = canvas.queryByTestId("MediaSlide--sceneInfo");

    // Panel should not be visible by default
    expect(sceneInfoPanel).not.toBeInTheDocument();

    // Fire a click to display the panel
    userEvent.click(sceneInfoButton, { delay: 300 });
    await waitFor(() => expect(sceneInfoPanel).not.toBeInTheDocument());

    // Fire another click to hide the panel again
    userEvent.click(sceneInfoButton, { delay: 300 });
    await waitFor(() => {
      // Find it again
      const sceneInfoPanel = canvas.queryByTestId("MediaSlide--sceneInfo");
      expect(sceneInfoPanel).toBeInTheDocument();
    });
  },
};
