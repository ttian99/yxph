import webpack from 'webpack';
import config from './webpack.config.babel';
import _ from 'lodash';

const prodConfig = {
  devtool: 'source-map',

  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false,
      },
    }),
  ],
};

_.merge(config, prodConfig);

export default config;
