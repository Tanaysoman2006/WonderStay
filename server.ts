import express, { Request, Response } from 'express';
import path from 'path';
import authRouter from './src/routes/auth.ts';
import listingsRouter from './src/routes/listings.ts';
import bookingsRouter from './src/routes/bookings.ts';
import reviewsRouter from './src/routes/reviews.ts';

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'WonderStay Full-Stack Platform API',
    currency: 'INR',
    features: ['auth', 'listings', 'bookings', 'reviews']
  });
});

app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const clientBuild = path.resolve(process.cwd(), 'dist');
    app.use(express.static(clientBuild));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(clientBuild, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`WonderStay backend running at http://localhost:${PORT}`);
  });
}

if (process.env.RUN_EXPRESS !== 'false') {
  startServer();
}
