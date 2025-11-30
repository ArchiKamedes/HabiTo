const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver } = config;
const { assetExts, sourceExts } = resolver;

config.resolver.assetExts = [...assetExts, 'glb', 'gltf', 'png', 'jpg'];
config.resolver.sourceExts = sourceExts.filter(
  (ext) => !['glb', 'gltf', 'png', 'jpg'].includes(ext)
);

module.exports = config;