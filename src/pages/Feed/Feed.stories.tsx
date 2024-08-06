import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "@storybook/test";
import FeedPage from ".";
import { ITEMS_TO_FETCH_PER_LOAD } from "../../constants";

const meta = {
  title: "Pages/Feed",
  component: FeedPage,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof FeedPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoadVideosOnRender: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );

    // No videos should be loaded on initial render. They still need to be fetched.
    expect(scroller.childNodes.length).toBe(0);

    // Await promise for videos to be fetched
    await waitFor(() =>
      expect(scroller.childNodes.length).toBe(ITEMS_TO_FETCH_PER_LOAD)
    );
  },
};

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
