import react from '@vitejs/plugin-react-swc'
import { internalIpV4 } from 'internal-ip'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const host = await internalIpV4()
  console.log('🚀 ~ file: vite.config.ts:8 ~ defineConfig ~ host:', host)
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // listen on all addresses
      port: 9002,
      strictPort: true,
      hmr: {
        // protocol: 'ws',
        // host,
        // port: 5183,
      },
    },
  }
})
