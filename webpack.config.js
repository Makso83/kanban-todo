const path = require('path');

module.exports = {
  mode: "production",
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist',
  },
  devtool: 'inner-map-source',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node-modules/
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts', '.js'
    ]
  },
  plugins: [

  ]

}
