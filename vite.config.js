import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        signup: './signup.html',
        profile: './profile.html',
        checker: './checker.html',
        history: './history.html',
        settings: './settings.html'
      }
    }
  }
});
