var path = require('path');
module.exports = {
  entry: './app.js',
  output: {
    path: __dirname,
    filename: 'dist/[name].bundle.js',
  },
  resolve: {
    extensions: ['.vue', '.js'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      components: path.resolve(__dirname, './components'),
      config: path.resolve(__dirname, './config'),
      assets: path.resolve(__dirname, './assets'),
      mixins: path.resolve(__dirname, './mixins'),
    },
  },
  module: {
    rules: [
      {test: /\.vue$/, use: 'vue-loader'},
      {test: /\.html$/, use: 'html-loader'},
      {test: /\.json$/, use: 'json-loader'},
      {test: /\.png$/, loader: 'url-loader', query: {mimetype: 'image/png'}},
    ],
  },
};
