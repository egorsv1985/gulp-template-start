const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    index: "./src/js/index.js",
    contacts: "./src/js/contacts.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
        include: [/node_modules\/air-datepicker/],
      },
    ],
  },
};
