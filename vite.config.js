const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
  build: {
    target: 'node16',

    lib: {
      entry: resolve(__dirname, './src/botisimo-loyalty-api.ts'),
      name: 'BotisimoLoyaltyApi',
      fileName: (format) => `index.${format}.js`,
    },
  },
});
