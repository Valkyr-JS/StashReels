const { merge } = require("webpack-merge");
const common = require("./app.common.js");

module.exports = merge(common, {
  devServer: {
    port: 3030,
  },
  devtool: "eval-source-map",
  mode: "development",
});
