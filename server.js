import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import dbConnect from './config/dbConnect.js'
import { adminRoute } from './routes/admin.routes.js'
import { projectRoute } from './routes/project.routes.js'
import { productRoute } from './routes/product.routes.js'
import { categoryRoute } from './routes/category.routes.js'
import { contactRoute } from './routes/contact.routes.js'
import { blogRoute } from './routes/blog.routes.js'
import { quoteRoute } from './routes/quote.routes.js'
dotenv.config()

const port = process.env.PORT || 3200
const app = express()
dbConnect();

// SSE clients store
const sseClients = new Set();
export const pushNotification = (data) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => res.write(payload));
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://aluzen-website-eta.vercel.app',
  'https://aluzen-admn-panel.vercel.app',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use('/uploads', express.static('uploads'))

// SSE endpoint — admin panel connects here
app.get('/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  // Send heartbeat every 25s to keep connection alive
  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000);
  sseClients.add(res);
  req.on('close', () => { clearInterval(heartbeat); sseClients.delete(res); });
});

app.use('/admin', adminRoute)
app.use('/project', projectRoute)
app.use('/product', productRoute)
app.use('/category', categoryRoute)
app.use('/contact', contactRoute)
app.use('/blog', blogRoute)
app.use('/quote', quoteRoute)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})