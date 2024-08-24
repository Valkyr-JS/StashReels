const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const pluginID = "StashReels";

module.exports = {
  entry: "./src/main.tsx",
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  output: {
    filename: pluginID + ".js",
    path: path.resolve(__dirname, "../dist/"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/source.yml",
          to: pluginID + ".yml",
        },
      ],
    }),
  ],
};
