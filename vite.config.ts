import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  plugins: [basicSsl()],
  server: {
    https: true,        // Enable HTTPS
    host: '0.0.0.0',    // Allow connections from your local network
    port: 3000          // Keep your desired port
  }
}
