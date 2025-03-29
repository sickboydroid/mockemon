const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  mode: "development", // Set mode to development for better debugging

  entry: "./src/scripts/script.js", // Entry point of the application

  output: {
    path: path.resolve(__dirname, "dist"), // Output directory
    filename: "bundle.js", // Output JS filename
    clean: true, // Clean dist folder before each build
  },

  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel to JavaScript files
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/, // Process CSS files
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i, // Handle image assets
        type: "asset/resource",
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/, // Match font files
        type: "asset/resource", // Webpack 5 handles assets natively
        generator: {
          filename: "fonts/[name][ext]", // Output folder for fonts
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),

    // Only enable the analyzer in development mode
    // new BundleAnalyzerPlugin(),
  ],
  devtool: "source-map", // Generate source maps for easier debugging

  devServer: {
    static: "./dist", // Serve static files from dist directory
    port: 3005, // Port number for the dev server
    open: true, // Open browser automatically
    hot: true, // Enable Hot Module Replacement (HMR)
    watchFiles: ["src/**/*.*", "assets/**/*.svg"], // Watch for changes in HTML files
  },
};
