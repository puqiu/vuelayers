// This is webpack config for docs hot mode
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const utils = require('./utils')
const config = require('./config')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: utils.vueLoaderConfig()
      },
      {
        test: /\.md$/,
        loader: 'vue-markdown-loader'
      },
      ...utils.styleLoaders({
        sourceMap: true
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin(Object.assign(config.replaces, {
      'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
    })),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'docs/index.html',
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ]
})

webpackConfig.entry = {
  app: [
    './build/dev-client',
    utils.resolve('docs/main.js')
  ]
}

module.exports = webpackConfig
