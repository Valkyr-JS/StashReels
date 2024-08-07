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

export const LoadVideosOnScroll: Story = {
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );

    // Run the previous story
    await LoadVideosOnRender.play!(context);

    const allVideos: HTMLVideoElement[] =
      within(scroller).getAllByTestId("VideoItem--video");
    const video0: HTMLVideoElement = allVideos[0];

    // Fire a scroll down event to video index 1.
    await waitFor(() => {
      scroller.scrollTo(0, (video0.scrollHeight / 3) * 2);
      expect(scroller.childNodes.length).toBe(ITEMS_TO_FETCH_PER_LOAD);
    });

    // Fire a scroll down event to video index 2, at which point a load request
    // is sent.
    await waitFor(() => {
      scroller.scrollTo(0, (video0.scrollHeight + video0.scrollHeight / 3) * 2);
      expect(scroller.childNodes.length).toBe(ITEMS_TO_FETCH_PER_LOAD);
    });

    // Fire a scroll down event to video index 3, at which point the requested
    // videos should be loaded.
    await waitFor(() => {
      scroller.scrollTo(
        0,
        (video0.scrollHeight * 2 + video0.scrollHeight / 3) * 2
      );
      expect(scroller.childNodes.length).toBe(ITEMS_TO_FETCH_PER_LOAD * 2);
    });
  },
};
