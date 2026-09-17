const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
// Enable Cross-Origin Resource Sharing (allows frontend at port 5173 to contact backend at port 5000)
app.use(cors());
// Parse incoming requests that carry JSON payloads
app.use(express.json());

// DATABASE CONNECTION
const connectDatabase = async () => {
  let dbUri = process.env.MONGODB_URI;

  // Zero-setup Fallback: If no URI is configured, spin up a local in-memory MongoDB server
  if (!dbUri) {
    console.log('\n======================================================');
    console.log('No MONGODB_URI found in backend/.env');
    console.log('Launching mongodb-memory-server (Local In-Memory DB)...');
    console.log('======================================================\n');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryDb = await MongoMemoryServer.create();
      dbUri = memoryDb.getUri();
    } catch (error) {
      console.error('Failed to launch MongoDB Memory Server:', error);
      process.exit(1);
    }
  }

  try {
    await mongoose.connect(dbUri);
    const isLocalMem = dbUri.includes('127.0.0.1') || dbUri.includes('localhost') && !process.env.MONGODB_URI;
    console.log(`>>> Connected to MongoDB database [${isLocalMem ? 'Temporary In-Memory Server' : 'Custom Configured DB'}]`);
  } catch (error) {
    console.error('MongoDB database connection error:', error);
    process.exit(1);
  }
};

connectDatabase();

// ROUTES
const notesRouter = require('./routes/notes');
// Mount CRUD routes to /api/notes
app.use('/api/notes', notesRouter);

// Catch-all route handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// START EXPRESS SERVER
app.listen(PORT, () => {
  console.log(`>>> Express server is running on http://localhost:${PORT}`);
});
