const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// web 플랫폼에서 .web.js → .js 순으로 해석
if (!config.resolver.platforms.includes('web')) {
  config.resolver.platforms.push('web');
}

module.exports = config;
