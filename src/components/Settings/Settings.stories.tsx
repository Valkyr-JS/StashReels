import type { Meta, StoryObj } from "@storybook/react";
import { setCssVHDecorator } from "../../../.storybook/decorators";
import Settings from ".";

const meta = {
  title: "Components/Settings",
  component: Settings,
  tags: ["autodocs"],
  args: {},
  decorators: [setCssVHDecorator],
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
