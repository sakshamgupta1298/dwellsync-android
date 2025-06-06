import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes';
import { initializeSocket } from './socket';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', routes);

// Initialize Socket.IO
const { io } = initializeSocket(httpServer);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dwellsync')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 