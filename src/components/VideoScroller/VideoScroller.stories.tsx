import type { Meta, StoryObj } from "@storybook/react";
import VideoScroller from ".";

const meta = {
  title: "Components/VideoScroller",
  component: VideoScroller,
  tags: ["autodocs"],
  args: {
    items: [
      {
        index: 0,
        scene: {
          captions: undefined,
          id: "4225",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/4225/stream",
        },
      },
      {
        index: 1,
        scene: {
          captions: undefined,
          id: "4065",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/4065/stream",
        },
      },
      {
        index: 2,
        scene: {
          captions: undefined,
          id: "3193",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/3193/stream",
        },
      },
      {
        index: 3,
        scene: {
          captions: undefined,
          id: "3233",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/3233/stream",
        },
      },
      {
        index: 4,
        scene: {
          captions: undefined,
          id: "3376",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/3376/stream",
        },
      },
    ],
  },
} satisfies Meta<typeof VideoScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
