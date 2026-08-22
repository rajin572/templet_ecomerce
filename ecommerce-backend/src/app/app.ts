import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes';
import globalErrorHandler from '../middlewares/globalErrorHandler';
import notFound from '../middlewares/notFound';
import { config } from './config';

const app: Application = express();

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.clientUrls,
    credentials: true,
  })
);

// Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'ECommerce API is healthy' });
});

// Application Routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('ECommerce Backend API is running!');
});

// Global Error Handler
app.use(globalErrorHandler);

// Not Found Handler
app.use(notFound);

export default app;
