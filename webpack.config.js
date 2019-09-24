//声明path变量
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

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
    new HTMLWebpackPlugin({
      title: '猎豹前端框架',
      template: './src/index.html' // 使用模版
    }),
    new webpack.ProvidePlugin({
      _: 'lodash',
      $: 'jquery',
      jQuery: 'jquery'
    }),
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