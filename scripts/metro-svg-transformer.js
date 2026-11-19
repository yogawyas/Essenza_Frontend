const upstream = require('@react-native/metro-babel-transformer');

exports.transform = ({ src, filename, ...options }) =>
  upstream.transform({
    ...options,
    filename,
    src: filename.endsWith('.svg')
      ? 'module.exports = ' + JSON.stringify(src) + ';'
      : src,
  });
