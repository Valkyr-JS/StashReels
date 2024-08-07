import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import type { Preview } from "@storybook/react";
import "../src/globals.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
    viewport: {
      defaultViewport: "iphone5",
      viewports: {
        ...INITIAL_VIEWPORTS,
        galaxyS21u: {
          name: "Galaxy S21 Ultra",
          styles: {
            width: "480px",
            height: "1067px",
          },
        },
      },
    },
  },
};

export default preview;
