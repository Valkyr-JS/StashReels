import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import VideoScroller from ".";
import {
  ITEMS_BEFORE_END_ON_FETCH,
  ITEMS_TO_FETCH_PER_LOAD,
} from "../../constants";

const meta = {
  title: "Components/VideoScroller",
  component: VideoScroller,
  tags: ["autodocs"],
  args: {
    fetchVideos: fn(),
    items: [
      {
        index: 0,
        loadMoreVideosHandler: fn(),
        scene: {
          captions: undefined,
          id: "4065",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/4065/stream",
        },
      },
      {
        index: 1,
        loadMoreVideosHandler: fn(),
        scene: {
          captions: undefined,
          id: "3193",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/3193/stream",
        },
      },
      {
        index: 2,
        loadMoreVideosHandler: fn(),
        scene: {
          captions: undefined,
          id: "3233",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/3233/stream",
        },
      },
      {
        index: 3,
        loadMoreVideosHandler: fn(),
        scene: {
          captions: undefined,
          id: "4225",
          format: "mp4",
          path: "http://192.168.0.20:9990/scene/4225/stream",
        },
      },
      {
        index: 4,
        loadMoreVideosHandler: fn(),
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

// ! This should be tested in the app component, where the fetchVideosHandler function will originate
// export const LoadVideosOnScroll: Story = {
//   play: async ({ canvasElement }) => {
//     const canvas = within(canvasElement);
//     const scroller: HTMLDivElement = canvas.getByTestId(
//       "VideoScroller--container"
//     );
//     const numOriginalVids = meta.args.items.length;

//     // Expect the default number of video items to be loaded.
//     await expect(scroller.childNodes.length).toBe(numOriginalVids);

//     const indexToLoadMore = ITEMS_TO_FETCH_PER_LOAD - ITEMS_BEFORE_END_ON_FETCH;
//     for (let i = 0; i < numOriginalVids; i++) {
//       // Allow time for scroll animation
//       setTimeout(
//         async () => {
//           // Expect the number of videos to be the originally passed amount,
//           // until more have been loaded at which point it should increase.
//           await expect(scroller.childElementCount).toBe(
//             i < indexToLoadMore
//               ? numOriginalVids
//               : numOriginalVids + ITEMS_TO_FETCH_PER_LOAD
//           );
//           // Fire a scroll down event down to the next video.
//           let scrollDistance = 0;
//           for (let j = 0; j < i; j++) {
//             scrollDistance += scroller.children[j].scrollHeight;
//           }
//           scroller.scrollTo(
//             0,
//             scrollDistance + (scroller.children[i].scrollHeight / 3) * 2
//           );
//         },
//         (i + 1) * 1500
//       );
//     }
//   },
// };

export const PlayNewVideoOnScroll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );
    const video0: HTMLVideoElement = canvas.getByTestId("VideoItem--video-0");
    const video1: HTMLVideoElement = canvas.getByTestId("VideoItem--video-1");
    const video2: HTMLVideoElement = canvas.getByTestId("VideoItem--video-2");
    const video3: HTMLVideoElement = canvas.getByTestId("VideoItem--video-3");
    const video4: HTMLVideoElement = canvas.getByTestId("VideoItem--video-4");

    // Wait for the video to load
    video0.addEventListener("canplaythrough", async () => {
      // Video 0 should be playing by default
      await expect(video0.paused).toBe(false);

      // Fire a scroll down event
      scroller.scrollTo(0, (video0.scrollHeight / 2) * 3);

      // Allow time for scroll animation
      setTimeout(async () => {
        // All videos should be paused, except video1 which should be playing
        await expect(video0.paused).toBe(true);
        await expect(video1.paused).toBe(false);
        await expect(video2.paused).toBe(true);
        await expect(video3.paused).toBe(true);
        await expect(video4.paused).toBe(true);

        // Fire a second scroll down event
        scroller.scrollTo(
          0,
          video0.scrollHeight + (video1.scrollHeight / 3) * 2
        );
      }, 3000);

      // Allow time for scroll animation
      setTimeout(async () => {
        // All videos should be paused, except video2 which should be playing
        await expect(video0.paused).toBe(true);
        await expect(video1.paused).toBe(true);
        await expect(video2.paused).toBe(false);
        await expect(video3.paused).toBe(true);
        await expect(video4.paused).toBe(true);

        // Fire a scroll up event
        scroller.scrollTo(0, (video0.scrollHeight / 3) * 2);
      }, 6000);

      // Allow time for scroll animation
      setTimeout(async () => {
        // All videos should be paused, except video1 which should be playing
        await expect(video0.paused).toBe(true);
        await expect(video1.paused).toBe(false);
        await expect(video2.paused).toBe(true);
        await expect(video3.paused).toBe(true);
        await expect(video4.paused).toBe(true);

        // The first three videos should retain their play duration, whilst the
        // others should have no play duration as they haven't been played yet.
        await expect(video0.currentTime).not.toBe(0);
        await expect(video1.currentTime).not.toBe(0);
        await expect(video2.currentTime).not.toBe(0);
        await expect(video3.currentTime).toBe(0);
        await expect(video4.currentTime).toBe(0);

        // Fire a scroll up event
        scroller.scrollTo(0, (video0.scrollHeight / 3) * 2);
      }, 9000);
    });
  },
};

export const TogglePlayOnTap: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const video: HTMLVideoElement = canvas.getByTestId("VideoItem--video-0");

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
