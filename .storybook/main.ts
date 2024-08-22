import type { StorybookConfig } from "@storybook/react-webpack5";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/addon-webpack5-compiler-swc",
  ],

  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },

  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.(sa|sc|c)ss$/,
      use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
    });

    config.plugins?.push(
      new MiniCssExtractPlugin({
        filename: "styles.css",
      })
    );

    return config;
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};
export default config;
