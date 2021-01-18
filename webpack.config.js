const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    drinks: './app/index.ts',
    orders: './app/orders/index.ts',
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
        { from: './app/site.webmanifest', to: '' },
        { from: './app/fonts', to: 'fonts' },
        { from: './app/style', to: 'style' },
        { from: './app/img', to: 'img' },
        { from: './app/index.html', to: '' },
        { from: './app/orders/index.html', to: 'orders' },
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
  devServer: {
    contentBase: path.join(__dirname, 'app/dist'),
    compress: true,
    port: 9000,
  },
};
