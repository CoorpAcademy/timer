const path = require("path");

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: "/",
    filename: "bundle.js"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: [path.join(__dirname, 'src')]
    }]
  }
}