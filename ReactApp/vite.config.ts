import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': resolve(__dirname, 'src/api'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@components': resolve(__dirname, 'src/components'),
      '@store': resolve(__dirname, 'src/store'),
      '@auth': resolve(__dirname, 'src/auth'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@data': resolve(__dirname, 'src/data'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1', // Force IPv4 to avoid ::1 connection issues
    open: false,
    proxy: {
      // Personnel Service (8089)
      '/api/personnel': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        secure: false
      },
      '/api/auth': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        secure: false
      },
      '/api/companies': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        secure: false
      },
      
      // PPE Service (8088)
      '/api/ppeitems': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false
      },
      '/api/ppeassignments': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false
      },
      '/api/ppeissues': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false
      },
      
      // Activities Service (8091)
      '/api/personneldocuments': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/communications': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/activities': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/daily-isg-reports': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/nonconformities': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/warnings': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/penalties': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/correctiveactions': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/preventiveactions': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/photos': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/toolboxes': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/controlforms': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/machinetemplates': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/controlformtemplates': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/machines': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/reminders': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      },
      '/api/controlformexecutions': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        secure: false
      }
      ,
      // Legislation Service (8093)
      '/api/regulations': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false
      },
      '/api/regulationchanges': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false
      },
      '/api/companycompliance': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
