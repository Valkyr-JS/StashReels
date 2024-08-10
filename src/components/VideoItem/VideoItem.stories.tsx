import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import VideoItem from ".";
import { setCssVHDecorator } from "../../../.storybook/decorators";

const meta = {
  title: "Components/VideoItem",
  component: VideoItem,
  tags: ["autodocs"],
  args: {
    index: 0,
    isMuted: true,
    loadMoreVideosHandler: fn(),
    loopOnEnd: false,
    scene: {
      format: "mp4",
      id: "3097",
      path: process.env.STASH_ADDRESS + "/scene/3097/stream",
      title: "Scene Title 1",
    },
    toggleAudioHandler: fn(),
    toggleLoopHandler: fn(),
  },
  decorators: [setCssVHDecorator],
} satisfies Meta<typeof VideoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Subtitles: Story = {
  args: {
    index: 1,
    scene: {
      captions: [
        {
          format: "srt",
          lang: "uk",
          source: process.env.STASH_ADDRESS + "/scene/5133/caption",
        },
      ],
      format: "mp4",
      id: "5133",
      path: process.env.STASH_ADDRESS + "/scene/5133/stream",
      title: "Scene Title 2",
    },
  },
};

export const TogglePlayOnTap: Story = {
  name: "Toggle play on tap",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allVideos: HTMLVideoElement[] =
      canvas.getAllByTestId("VideoItem--video");
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

export const ToggleUiVisibility: Story = {
  name: "Toggle UI visibility",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleUiButton = canvas.getAllByTestId("VideoItem--showUiButton")[0];
    const togglableUi = canvas.queryAllByTestId("VideoItem--toggleableUi")[0];

    // UI should be visible by default
    expect(togglableUi).toBeInTheDocument();

    // Fire a click event to hide the controls and remove them from the DOM.
    userEvent.click(toggleUiButton);
    await waitFor(() => expect(togglableUi).not.toBeInTheDocument());

    // Fire a second click to re-add the controls to the DOM again and display
    // them.
    userEvent.click(toggleUiButton);
    await waitFor(() => {
      // Find it again
      const togglableUi = canvas.queryAllByTestId("VideoItem--toggleableUi")[0];
      expect(togglableUi).toBeInTheDocument();
    });
  },
};
