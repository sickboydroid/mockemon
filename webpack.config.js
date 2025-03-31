const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "development",

  entry: {
    login: "./src/scripts/login.js",
    home: "./src/scripts/home.js",
    meeting: "./src/scripts/meeting.js",
  },

  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].bundle.js",
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]",
        },
      },
    ],
  },

  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      filename: "login.html",
      template: "src/html/login.html",
      chunks: ["login"],
    }),
    new HtmlWebpackPlugin({
      filename: "home.html",
      template: "src/html/home.html",
      chunks: ["home"],
    }),
    new HtmlWebpackPlugin({
      filename: "meeting.html",
      template: "src/html/meeting.html",
      chunks: ["meeting"],
    }),
  ],

  devtool: "source-map",

  devServer: {
    static: "./public",
    port: 3005,
    open: "login.html",
    hot: true,
    historyApiFallback: true,
    watchFiles: ["src/**/*.*", "assets/**/*.svg"],
  },
};
