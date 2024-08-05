import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import VideoItem from ".";

const meta = {
  title: "Components/VideoItem",
  component: VideoItem,
  tags: ["autodocs"],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  //   args: { onClick: fn() },
  args: {
    index: 1,
    scene: {
      format: "mp4",
      id: "3097",
      path: process.env.STASH_ADDRESS + "/scene/3097/stream",
    },
  },
} satisfies Meta<typeof VideoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TogglePlayOnTap: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const video: HTMLVideoElement = canvas.getByTestId("VideoItem--video");

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
    },
  },
};
