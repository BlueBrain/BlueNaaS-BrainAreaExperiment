let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './app.js',
    vendor: [
      'vue/dist/vue.min.js', 'vue-resource', 'vue-router',
      'hellojs', 'vue-infinite-loading', 'autocomplete-vue',
    ],
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
  },
  resolve: {
    extensions: ['.vue', '.js'],
    alias: {
      vue$: 'vue/dist/vue.common.js',
      components: path.resolve(__dirname, './components'),
      config: path.resolve(__dirname, './config'),
      assets: path.resolve(__dirname, './assets'),
      mixins: path.resolve(__dirname, './mixins'),
    },
  },
  // to be able to read it with the source-map-explorer
  // 'devtool': 'source-map',
  module: {
    rules: [
      {
        enforce: 'pre',
        test: [/\.vue$/, /\.js$/],
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {test: /\.vue$/, use: 'vue-loader'},
      {test: /\.html$/, use: 'html-loader'},
      {test: /\.json$/, use: 'json-loader'},
      {test: /\.png$/, loader: 'url-loader', query: {mimetype: 'image/png'}},
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor'),
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: './favicon.ico',
      inject: true,
    }),
  ],
};
