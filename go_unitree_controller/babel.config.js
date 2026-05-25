module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Necesario para los decoradores de WatermelonDB (@field, @date, etc.)
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
