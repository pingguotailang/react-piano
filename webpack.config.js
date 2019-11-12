//声明path变量
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  //打包源文件
  entry: './src/index.js',
  //输出配置
  output: {
    //输出文件名称
    filename: 'index.js',
    //输入文件路径
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(['dist/']),
    new HTMLWebpackPlugin({
      title: 'piano',
      template: './src/index.html' // 使用模版
    }),
    // new webpack.optimize.UglifyJsPlugin(),
    new webpack.ProvidePlugin({
      _: 'lodash',
      $: 'jquery',
      jQuery: 'jquery'
    }),
    // 拷贝本地静态数据
    new CopyWebpackPlugin(
      [
        { from: './src/audio', to: 'audio' },
      ],
      { ignore: [], copyUnmodified: true, debug: 'debug' }
    )
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env', 'react', 'stage-0'],
          plugins: [require('babel-plugin-transform-object-rest-spread')]
        }
      },
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'publish')
      ],
      exclude: /node_modules/
    },
    {
      test: /\.less$/,
      use: [{
        loader: "style-loader"
      }, {
        loader: "css-loader"
      }, {
        loader: "less-loader",
        options: {
          javascriptEnabled: true,
        },
      }]
    },
    ]
  },
};