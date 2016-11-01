import webpack from 'webpack';

const config = {
  entry: {
    app: __dirname + '/lib/app.js',
    vendors: ['lodash', 'moment', 'underscore.string', 'redux', 'redux-thunk', 'redux-logger', 'immutable'],
  },

  output: {
    path: __dirname + '/src',
    publicPath: '/src/', // for webpack-dev-server
    filename: '[name].js',
  },

  // devtool: 'cheap-module-source-map',

  // 防止重复解析
  resolve: {
    alias: {},
  },

  module: {
    loaders: [
      {
        test: /\.(js)$/, exclude: /node_modules/,
        loader: 'babel?stage=0&optional=runtime',
      },
      {
        test: /\.(json)/, loader: 'json',
      },
    ],
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: ['node_modules', 'src', 'web-lib', /resource.*/, /hooks/],
      },
    ],
    // 防止重复去解析
    noParse: [],
  },

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
  ],
};

export default config;
