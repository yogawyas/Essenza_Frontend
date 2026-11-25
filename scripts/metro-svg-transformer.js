const { createHash } = require('node:crypto');
const { join, resolve } = require('node:path');
const upstream = require('@react-native/metro-babel-transformer');
const { readPublicConfig } = require('../src/backend/publicConfig.build');
const projectRoot = join(__dirname, '..');
const publicConfigPath = join(projectRoot, 'src', 'backend', 'publicConfig.js');

exports.transform = ({ src, filename, ...options }) => {
  if (filename.endsWith('.svg')) {
    src = 'module.exports = ' + JSON.stringify(src) + ';';
  } else if (resolve(projectRoot, filename) === publicConfigPath) {
    src = 'export default ' + JSON.stringify(readPublicConfig(projectRoot)) + ';';
  }
  return upstream.transform({ ...options, filename, src });
};

exports.getCacheKey = () =>
  createHash('sha256')
    .update(upstream.getCacheKey())
    .update(JSON.stringify(readPublicConfig(projectRoot)))
    .digest('hex');
