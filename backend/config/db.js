import mongoose from 'mongoose';

let isConnected = false;

// Attach lifecycle listeners once
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB Event]: Connected to database');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB Event]: Connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB Event]: Disconnected from database');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB Event]: Reconnected to database');
});

export const connectDB = async (retries = 5, delay = 2000) => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_app';

  if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    console.warn('[MongoDB Warning]: MONGODB_URI environment variable is not set in production!');
  }

  const mongooseOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    family: 4, // Force IPv4 to prevent IPv6 DNS delay loops
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return mongoose.connection;
      }
      const conn = await mongoose.connect(uri.trim(), mongooseOptions);
      isConnected = true;
      console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[MongoDB Connection Attempt ${attempt}/${retries} Failed]: ${error.message}`);
      if (attempt === retries) {
        console.error('[MongoDB Fatal]: Exceeded maximum connection attempts.');
        if (process.env.NODE_ENV === 'production') {
          // Do not hard exit in production to allow retry middleware / health check recovery
          console.warn('[MongoDB Warning]: Server remaining active in degraded mode.');
        } else {
          process.exit(1);
        }
      } else {
        const backoff = delay * attempt;
        console.log(`[MongoDB Retry]: Waiting ${backoff}ms before retrying...`);
        await new Promise((res) => setTimeout(res, backoff));
      }
    }
  }
};

export const checkDBHealth = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    status: stateCode === 1 ? 'ok' : 'degraded',
    state: stateMap[stateCode] || 'unknown',
    readyState: stateCode,
    dbName: mongoose.connection.name || null,
  };
};


