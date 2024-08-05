import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";
import VideoItem from ".";

const meta = {
  title: "Components/VideoItem",
  component: VideoItem,
  tags: ["autodocs"],
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  //   args: { onClick: fn() },
} satisfies Meta<typeof VideoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "3097",
    index: 1,
    lastVideoIndex: 1,
    scene: {
      format: "mp4",
      path: process.env.STASH_ADDRESS + "/scene/3097/stream",
    },
  },
};
