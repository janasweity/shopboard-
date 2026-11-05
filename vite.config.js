import { defineConfig } from 'vite'
import { products } from './src/data.ts'
import { serializeProducts } from './src/modules/products/products.api.ts'

function productsApi(server) {
  server.middlewares.use((request, response, next) => {
    const pathname = new URL(request.url, 'http://localhost').pathname
    if (pathname !== '/api/products') return next()

    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    if (request.method !== 'GET') {
      response.statusCode = 405
      response.setHeader('Allow', 'GET')
      response.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }

    response.end(JSON.stringify({ items: serializeProducts(products) }))
  })
}

export default defineConfig({
  server: { port: 5173, strictPort: true },
  plugins: [
    {
      name: 'raha-products-api',
      configureServer: productsApi,
      configurePreviewServer: productsApi,
    },
  ],
})
