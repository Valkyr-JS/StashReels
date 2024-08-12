import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import FeedPage from ".";
import { ITEMS_TO_FETCH_PER_LOAD } from "../../constants";
import { setCssVHDecorator } from "../../../.storybook/decorators";

const meta = {
  title: "Pages/Feed",
  component: FeedPage,
  tags: ["autodocs"],
  args: {
    captionsDefault: undefined,
    query: `{
      findScenes(
        filter: {per_page: -1, sort: "random"}
        scene_filter: {orientation: {value: PORTRAIT}}
      ) {
        scenes {
          captions {
            caption_type
            language_code
          }
          date
          id
          files {
            format
          }
          paths {
            caption
            stream
          }
          performers {
            gender
            name
          }
          studio {
            name
            parent_studio {
              name
            }
          }
          title
        }
      }
    }`,
  },
  decorators: [setCssVHDecorator],
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

export const ToggleAudio: Story = {
  play: async (context) => {
    // Run the previous story
    await LoadVideosOnRender.play!(context);

    const canvas = within(context.canvasElement);
    const allItems: HTMLDivElement[] = canvas.getAllByTestId(
      "VideoItem--container"
    );
    const allVideos: HTMLVideoElement[] =
      canvas.getAllByTestId("VideoItem--video");
    const item0: HTMLDivElement = allItems[0];
    const video0: HTMLVideoElement = allVideos[0];
    const muteButton0: HTMLButtonElement = within(item0).getByTestId(
      "VideoItem--muteButton"
    );

    // Delay the video to make sure its loaded
    await waitFor(() =>
      // Video should be muted by default
      expect(video0.muted).toBe(true)
    );

    // Trigger a click on the mute button to unmute the video.
    await userEvent.click(muteButton0, { delay: 500 });
    await expect(video0.muted).toBe(false);

    // Trigger a second click on the mute button to mute it again.
    await userEvent.click(muteButton0);
    await expect(video0.muted).toBe(true);
  },
};

export const ToggleLoop: Story = {
  play: async (context) => {
    const canvas = within(context.canvasElement);

    // Run the previous story
    await LoadVideosOnRender.play!(context);
    const allLoopButtons: HTMLButtonElement[] = canvas.getAllByTestId(
      "VideoItem--loopButton"
    );
    const loopButton0 = allLoopButtons[0];

    const allVideos: HTMLVideoElement[] =
      canvas.getAllByTestId("VideoItem--video");
    const video0 = allVideos[0];

    // Default state should be to continue to the next video.
    await expect(video0.loop).toBe(false);

    // Fire a click to change to loop the current video.
    await userEvent.click(loopButton0, { delay: 100 });
    await expect(video0.loop).toBe(true);

    // Fire a second click to change back to continuing to the next video.
    await userEvent.click(loopButton0, { delay: 100 });
    await expect(video0.loop).toBe(false);
  },
};

export const ToggleCaptions: Story = {
  args: {
    captionsDefault: "uk",
    query: `{
      findScenes(
        filter: {per_page: -1, sort: "random"}
        scene_filter: {orientation: {value: PORTRAIT}, captions: {modifier: NOT_NULL, value:""}}
      ) {
        scenes {
          captions {
            caption_type
            language_code
          }
          date
          id
          files {
            format
          }
          paths {
            caption
            stream
          }
          performers {
            gender
            name
          }
          studio {
            name
            parent_studio {
              name
            }
          }
          title
        }
      }
    }`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );

    // Await promise for videos to be fetched
    await waitFor(() => expect(scroller.childNodes.length).toBeGreaterThan(0));

    const video: HTMLVideoElement = canvas.getByTestId("VideoItem--video");
    const subtitlesButton = canvas.getByTestId("VideoItem--subtitlesButton");

    // Wait for the video to load
    video.addEventListener("canplaythrough", async () => {
      // Show default track automatically
      expect(video.textTracks[0].mode).toBe("showing");

      // Only render the track that matches the user's selected default.
      expect(video.textTracks.length).toBe(1);
      expect(video.textTracks[0].language).toBe("uk");

      // Subtitle buttons should not be rendered if there are no tracks to
      // toggle.
      expect(subtitlesButton).toBeInTheDocument();

      // Fire a click to toggle off subtitles
      await userEvent.click(subtitlesButton);
      await expect(video.textTracks[0].mode).toBe("disabled");

      // Fire a click to toggle on subtitles
      await userEvent.click(subtitlesButton);
      await expect(video.textTracks[0].mode).toBe("showing");
    });
  },
};

export const ToggleFullscreen: Story = {
  name: "Toggle fullscreen mode",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );

    // Await promise for videos to be fetched
    await waitFor(() => expect(scroller.childNodes.length).toBeGreaterThan(0));

    const toggleFullscreenButton = canvas.getAllByTestId(
      "VideoItem--fullscreenButton"
    )[0];
    const FeedPage = canvas.getByTestId("FeedPage");

    // UI should not be in fullscreen by default
    await expect(document.fullscreenElement).toBeNull();

    // Fire a click event to make the page fullscreen.
    await userEvent.click(toggleFullscreenButton, { delay: 300 });
    await waitFor(() => expect(document.fullscreenElement).toBe(FeedPage));

    // Fire another click event to exit fullscreen.
    await userEvent.click(toggleFullscreenButton, { delay: 300 });
    await waitFor(() => expect(document.fullscreenElement).toBeNull());
  },
};

export const ToggleUiVisibility: Story = {
  name: "Toggle UI visibility",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );

    // Await promise for videos to be fetched
    await waitFor(() => expect(scroller.childNodes.length).toBeGreaterThan(0));

    const toggleUiButton = canvas.getAllByTestId("VideoItem--showUiButton")[0];
    const togglableUi = canvas.queryAllByTestId("VideoItem--toggleableUi")[0];

    // UI should be visible by default
    await expect(togglableUi).toBeInTheDocument();

    // Fire a click event to hide the controls and remove them from the DOM.
    userEvent.click(toggleUiButton, { delay: 300 });
    await waitFor(() => expect(togglableUi).not.toBeInTheDocument());

    // Fire a second click to re-add the controls to the DOM again and display
    // them.
    userEvent.click(toggleUiButton, { delay: 300 });
    await waitFor(() => {
      // Find it again
      const togglableUi = canvas.queryAllByTestId("VideoItem--toggleableUi")[0];
      expect(togglableUi).toBeInTheDocument();
    });
  },
};
