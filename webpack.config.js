const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    drinks: './app/static/index.ts',
    orders: './app/static/orders/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'app/dist'),
    filename: (pathData) => {
      return pathData.chunk.name === 'drinks' ? 'index.js' : 'orders/index.js';
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: './app/static/site.webmanifest', to: '' },
        { from: './app/static/fonts', to: 'fonts' },
        { from: './app/static/style', to: 'style' },
        { from: './app/static/img', to: 'img' },
        { from: './app/static/index.html', to: '' },
        { from: './app/static/orders/index.html', to: 'orders' },
      ],
    }),
  ],
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
};
