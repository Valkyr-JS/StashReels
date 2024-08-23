import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import FeedPage from ".";
import { ITEM_BUFFER_EACH_SIDE } from "../../constants";
import { setCssVHDecorator } from "../../../.storybook/decorators";

const meta = {
  title: "Pages/Feed",
  component: FeedPage,
  tags: ["autodocs"],
  args: {
    captionsDefault: undefined,
    currentFilter: undefined,
    filterList: [
      {
        value: "29",
        label: "Portrait scenes of Mia Melano",
      },
      {
        value: "20",
        label: "Recently played scenes",
      },
      {
        value: "5",
        label: "Recently released scenes",
      },
      {
        value: "12",
        label: "Recently updated scenes",
      },
      {
        value: "26",
        label: "Stashbox pending",
      },
      {
        value: "4",
        label: "Unorganised scenes",
      },
      {
        value: "24",
        label: "Unscraped OF scenes",
      },
      {
        value: "16",
        label: "Unscraped scenes",
      },
    ],
    pluginConfig: {
      defaultFilterID: "29",
    },
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
    setFilterHandler: fn(),
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
    await waitFor(() => {
      // No more than 11 videos should be loaded at once
      const allItems = canvas.getAllByTestId("VideoItem--container");
      expect(allItems.length).not.toBeGreaterThan(ITEM_BUFFER_EACH_SIDE + 1);
    });
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

    // Fire 15 scroll events, and check that there are never more than 11 videos at once (current plus five either side)

    // Fire a scroll down event to item index 1.
    for (let i = 0; i < ITEM_BUFFER_EACH_SIDE * 2 + 1; i++) {
      setTimeout(
        () => {
          const allItems = canvas.getAllByTestId("VideoItem--container");

          scroller.scrollTo(
            0,
            i * allItems[0].scrollHeight + (allItems[0].scrollHeight / 3) * 2
          );

          expect(allItems.length).not.toBeGreaterThan(
            ITEM_BUFFER_EACH_SIDE * 2 + 1
          );
        },
        1000 * i + 1000
      );
    }
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

export const ToggleSettings: Story = {
  name: "Toggle settings",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scroller: HTMLDivElement = canvas.getByTestId(
      "VideoScroller--container"
    );

    // Await promise for videos to be fetched
    await waitFor(() => expect(scroller.childNodes.length).toBeGreaterThan(0));

    const allVideos: HTMLVideoElement[] =
      canvas.getAllByTestId("VideoItem--video");
    const video: HTMLVideoElement = allVideos[0];

    // Wait for the video to load
    video.addEventListener("canplaythrough", async () => {
      const toggleSettingsButton = canvas.getAllByTestId(
        "VideoItem--settingsButton"
      )[0];
      const settingsTab = canvas.queryByTestId("SettingsTab");

      // Expect settings not to be shown and video to be playing by default.
      expect(settingsTab).not.toBeInTheDocument();
      await expect(video.paused).toBe(false);

      // Fire a click event to show the settings and pause the current video.
      userEvent.click(toggleSettingsButton, { delay: 300 });
      await waitFor(() => {
        const settingsTab = canvas.getByTestId("SettingsTab");
        expect(settingsTab).toBeInTheDocument();
        expect(video.paused).toBe(true);
      });

      await waitFor(() => {
        const settingsTab = canvas.queryByTestId("SettingsTab");

        // Fire a click on the close button in the settings tab to hide the
        // settings and resume the current video.
        const closeSettingsButton = canvas.queryByTestId(
          "SettingsTab--closeButton"
        );
        userEvent.click(closeSettingsButton as HTMLButtonElement, {
          delay: 300,
        });
        expect(settingsTab).not.toBeInTheDocument();
        expect(video.paused).toBe(false);
      });
    });
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
