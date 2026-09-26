// server/config/database.ts
import mongoose from 'mongoose';
import dns from 'node:dns';
import { LOCAL_MONGODB_URI, MONGODB_DNS_SERVERS, MONGODB_URI, USE_LOCAL_MONGODB } from './env';

/**
 * Analyzes the MongoDB connection error and returns a diagnostic message
 */
function getDiagnosticMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  if (message.includes('DNS')) {
    return 'DNS resolution failed - check your internet connection and network setup';
  }
  if (message.includes('auth')) {
    return 'Authentication failed - verify username/password and Atlas database user credentials';
  }
  if (message.includes('connect')) {
    return 'Connection failed - verify cluster hostname and network access settings';
  }
  if (message.includes('ENOTFOUND')) {
    return 'Hostname not found - check the cluster address in MONGODB_URI';
  }
  if (message.includes('ECONNREFUSED')) {
    return 'Connection refused - verify the cluster is running and accessible';
  }
  if (message.includes('timeout')) {
    return 'Connection timeout - cluster may be unresponsive or network is unreachable';
  }
  
  return message;
}

export const connectDB = async (): Promise<void> => {
  if (!MONGODB_URI) {
    console.error(
      '[MongoDB] ERROR: MONGODB_URI is not configured.\n' +
      'Please configure the MongoDB Atlas connection string in .env\n' +
      'Use the MongoDB Atlas connection string configured for your environment.'
    );
    if (!USE_LOCAL_MONGODB) {
      throw new Error('MongoDB connection required but not configured');
    }
    console.log('[MongoDB] USE_LOCAL_MONGODB=true, attempting local connection...');
  }

  try {
    if (MONGODB_URI) {
      dns.setServers(MONGODB_DNS_SERVERS);
      console.log('[MongoDB] Connecting to Atlas...');
      
      // Log connection string format (without credentials)
      const uriParts = MONGODB_URI.match(/mongodb\+srv:\/\/[^:]+:.*?@([^/?]+)/);
      if (uriParts) {
        console.log(`[MongoDB] Cluster: ${uriParts[1]}`);
      }
      
      await mongoose.connect(MONGODB_URI, { 
        dbName: 'code_infinite',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log('[MongoDB] ✓ Atlas connected successfully');
      console.log(`[MongoDB] Database: code_infinite`);
      return;
    }
  } catch (error) {
    const diagnostic = getDiagnosticMessage(error);
    console.error(`[MongoDB] ✗ Atlas connection failed:`);
    console.error(`[MongoDB] Reason: ${diagnostic}`);
    console.error('[MongoDB] Troubleshooting checklist:');
    console.error('  1. Verify MONGODB_URI format includes: /database_name after hostname');
    console.error('  2. Confirm username is the Atlas Database User (not website login)');
    console.error('  3. Verify password is correct for the database user');
    console.error('  4. Check cluster hostname matches Atlas cluster settings');
    console.error('  5. Ensure Network Access includes your IP (currently: 0.0.0.0/0 ✓)');
    console.error('  6. Try testing connection in MongoDB Atlas website');
    console.error('[MongoDB] Full error:', error instanceof Error ? error.message : String(error));

    if (!USE_LOCAL_MONGODB) {
      throw new Error(
        `MongoDB Atlas connection failed: ${diagnostic}\n` +
        `To use local MongoDB, set USE_LOCAL_MONGODB=true in .env`
      );
    }
  }

  // Only attempt local fallback if explicitly enabled
  if (USE_LOCAL_MONGODB && LOCAL_MONGODB_URI !== MONGODB_URI) {
    try {
      console.log('[MongoDB] USE_LOCAL_MONGODB=true, attempting local connection...');
      await mongoose.disconnect();
      await mongoose.connect(LOCAL_MONGODB_URI, { 
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`[MongoDB] ✓ Local MongoDB connected at ${LOCAL_MONGODB_URI}`);
      console.log(`[MongoDB] Database: code_infinite`);
      return;
    } catch (localError) {
      const localMessage = localError instanceof Error ? localError.message : String(localError);
      console.error('[MongoDB] ✗ Local MongoDB connection failed:', localMessage);
      throw new Error(`Failed to connect to local MongoDB: ${localMessage}`);
    }
  }
};
