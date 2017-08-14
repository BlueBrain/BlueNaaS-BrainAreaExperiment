let path = require('path');
let webpack = require('webpack');
module.exports = {
    'entry': {
        'app': './app.js',
        'vendor': [
            'vue','vue-resource', 'vue-router', 'hellojs',
            'vue-infinite-loading', 'vis', 'autocomplete-vue'
        ],
    },
    'output': {
        'path': __dirname,
        'filename': 'dist/[name].bundle.js',
    },
    'resolve': {
        'extensions': ['.vue', '.js'],
        'alias': {
            'vue$': 'vue/dist/vue.common.js',
            'components': path.resolve(__dirname, './components'),
            'config': path.resolve(__dirname, './config'),
            'assets': path.resolve(__dirname, './assets'),
            'mixins': path.resolve(__dirname, './mixins'),
        },
    },
    'module': {
        'rules': [
            {
                'enforce': 'pre',
                'test': [/\.vue$/, /\.js$/],
                'loader': 'eslint-loader',
                'exclude': /node_modules/,
            },
            {'test': /\.vue$/, 'use': 'vue-loader'},
            {'test': /\.html$/, 'use': 'html-loader'},
            {'test': /\.json$/, 'use': 'json-loader'},
            {'test': /\.png$/, 'loader': 'url-loader', 'query': {'mimetype': 'image/png'}},
        ],
    },
    'plugins': [
        new webpack.optimize.CommonsChunkPlugin("vendor")
    ],
};
