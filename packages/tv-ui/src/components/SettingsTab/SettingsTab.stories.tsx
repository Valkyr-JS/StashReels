import type { Meta, StoryObj } from "@storybook/react";
import { setCssVHDecorator } from "../../../../../.storybook/decorators";
import SettingsTab from ".";
import { fn } from "@storybook/test";

const meta = {
  title: "Components/Settings Tab",
  component: SettingsTab,
  tags: ["autodocs"],
  args: {
    currentFilter: undefined,
    fetchingData: false,
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
    isRandomised: false,
    pluginConfig: {
      defaultFilterID: "29",
      subtitleLanguage: "en",
    },
    pluginUpdateHandler: fn(),
    scenelessFilter: false,
    setFilterHandler: fn(),
    setIsRandomised: fn(),
    setSettingsTabHandler: fn(),
    transitionStatus: "entered",
    isTapNavigation: false,
    toggleIsTapNavigation: fn(),
  },
  decorators: [setCssVHDecorator],
} satisfies Meta<typeof SettingsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
