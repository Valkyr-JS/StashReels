import type { Meta, StoryObj } from "@storybook/react";
import { setCssVHDecorator } from "../../../.storybook/decorators";
import SettingsTab from ".";
import { fn } from "@storybook/test";

const meta = {
  title: "Components/Settings Tab",
  component: SettingsTab,
  tags: ["autodocs"],
  args: {
    setSettingsTabHandler: fn(),
    transitionStatus: "entered",
  },
  decorators: [setCssVHDecorator],
} satisfies Meta<typeof SettingsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
