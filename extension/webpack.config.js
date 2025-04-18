import path from "path";

const __dirname = import.meta.dirname;
const exports = {
  mode: "development",
  devtool: "inline-source-map",
  experiments: {
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "webassembly/async",
      },
    ],
  },
  entry: {
    content: {
      import: "./content.js",
      chunkLoading: `import-scripts`,
    },
    background: {
      import: "./scripts/background.js",
      chunkLoading: `import-scripts`,
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    fallback: {
      path: false, // Use false for Node.js core modules if not required in the browser
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "webassembly/async", // enable wasm support for async loading
      },
    ],
  },
};
export default exports;
