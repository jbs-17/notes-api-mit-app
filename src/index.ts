import express from 'express'
import { fileURLToPath } from 'url'
import { errorHandler } from './middleware/error.handler.js'
import { authGoogleRoutes } from './api/auth/route.js';
import path from 'path';







const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

app.get("/", async(req,res)=>{
  res.type("html").sendFile(path.join(__dirname, "../components/index.html"));
})

app.get('/health', (req, res) => {
  res.json({
    message : "OK"
  });
})




app.use(authGoogleRoutes);

app.use(errorHandler);

export default app
