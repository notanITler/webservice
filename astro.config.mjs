import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.gehrke-webservice.de',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
});
