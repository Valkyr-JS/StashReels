import type { Decorator } from "@storybook/react";
import { setCssVH } from "../packages/tv-ui/src/helpers";

/** Storybook decorator for setting the --vsr-vh CSS variable used in video
 * items. */
export const setCssVHDecorator: Decorator = (StoryFn) => {
  setCssVH();
  return StoryFn();
};
