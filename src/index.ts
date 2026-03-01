import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { errorHandler } from './error.handler.js'
import { authGoogleRoutes } from './api/auth/route.js';







const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

// Home route - HTML
app.get('/health', (req, res) => {
  res.json({
    message : "OK"
  });
})




app.use(authGoogleRoutes);
app.use(errorHandler)


export default app
