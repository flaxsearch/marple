var path = require('path');

module.exports = {
  entry: [
    './src/app.js'
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: { presets: ['react', 'es2015'] }
    }]
  },
  resolve: {
    alias: {
      config: path.join(__dirname, 'src/config', process.env.NODE_ENV)
    }
  }
};
