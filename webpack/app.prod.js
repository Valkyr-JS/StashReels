const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge");
const common = require("./app.common.js");

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  output: {
    path: path.join(__dirname, "../dist/app/"),
    filename: "bundle.js",
    clean: true,
  },
});
