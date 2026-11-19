const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaults = getDefaultConfig(__dirname);
const config = {
  resolver: {
    assetExts: defaults.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaults.resolver.sourceExts, 'svg'],
  },
  transformer: {
    babelTransformerPath: require.resolve('./scripts/metro-svg-transformer'),
  },
};

module.exports = mergeConfig(defaults, config);
