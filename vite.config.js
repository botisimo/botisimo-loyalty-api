const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
  build: {
    target: 'node16',

    lib: {
      entry: resolve(__dirname, './dist/botisimo-api.ts'),
      name: 'BotisimoApi',
      fileName: (format) => `index.${format}.js`,
    },
  },
});
