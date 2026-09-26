#!/usr/bin/env tsx
/**
 * MongoDB Connection Diagnostic Tool
 * Run this to test your MongoDB Atlas connection without starting the full server
 */

import mongoose from 'mongoose';
import dns from 'node:dns';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DNS_SERVERS = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

async function testConnection() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   MongoDB Connection Diagnostic Tool                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // 1. Check environment variable
  console.log('📋 1. Checking MONGODB_URI environment variable...');
  if (!MONGODB_URI) {
    console.error('   ❌ MONGODB_URI is not set in .env');
    process.exit(1);
  }

  // Extract cluster name (safely, without exposing credentials)
  const uriMatch = MONGODB_URI.match(/mongodb\+srv:\/\/[^:]+:.*?@([^/?]+)/);
  if (uriMatch) {
    console.log(`   ✓ Cluster: ${uriMatch[1]}`);
  }

  const dbMatch = MONGODB_URI.match(/\.net\/([^?]+)/);
  if (dbMatch) {
    console.log(`   ✓ Database: ${dbMatch[1]}`);
  } else {
    console.warn('   ⚠ Database name not found in URI (should be after hostname)');
  }

  const protocolCheck = MONGODB_URI.startsWith('mongodb+srv://');
  console.log(`   ${protocolCheck ? '✓' : '❌'} Protocol: mongodb+srv://`);

  // 2. Check DNS servers
  console.log('\n📋 2. Configuring DNS servers...');
  dns.setServers(MONGODB_DNS_SERVERS);
  console.log(`   ✓ DNS Servers: ${MONGODB_DNS_SERVERS.join(', ')}`);

  // 3. Test SRV record resolution
  console.log('\n📋 3. Testing SRV record resolution...');
  if (uriMatch) {
    const hostname = uriMatch[1];
    dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
      if (err) {
        console.error(`   ❌ SRV resolution failed: ${err.message}`);
        if (err.message.includes('ENOTFOUND')) {
          console.error('   ↳ Hostname not found - verify cluster address is correct');
        }
      } else if (addresses && addresses.length > 0) {
        console.log(`   ✓ Found ${addresses.length} MongoDB server(s)`);
        addresses.slice(0, 2).forEach((addr) => {
          console.log(`     - ${addr.name}:${addr.port}`);
        });
      }
    });
  }

  // 4. Test MongoDB connection
  console.log('\n📋 4. Testing MongoDB Atlas connection...');
  try {
    console.log('   Connecting (timeout: 10 seconds)...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'code_infinite',
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 5000,
    });

    console.log('   ✅ CONNECTION SUCCESSFUL!');
    console.log(`   ✓ Database: ${mongoose.connection.db?.databaseName || 'code_infinite'}`);
    console.log(`   ✓ State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Unknown'}`);

    // List collections
    const collections = await mongoose.connection.db?.listCollections().toArray();
    if (collections && collections.length > 0) {
      console.log(`   ✓ Collections: ${collections.length} found`);
      collections.slice(0, 5).forEach((col) => {
        console.log(`     - ${col.name}`);
      });
      if (collections.length > 5) {
        console.log(`     ... and ${collections.length - 5} more`);
      }
    } else {
      console.log('   ℹ No collections found (database may be empty)');
    }

    await mongoose.disconnect();
    console.log('\n✅ All checks passed!');
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Connection failed: ${message}`);

    if (message.includes('auth')) {
      console.error('\n🔑 Authentication Error:');
      console.error('   - Verify username is correct');
      console.error('   - Verify password is correct');
      console.error('   - Ensure you\'re using Database User credentials (not Atlas account login)');
      console.error('   - Check if database user is Active in Atlas > Security > Database Access');
    } else if (message.includes('ENOTFOUND')) {
      console.error('\n🌐 DNS/Hostname Error:');
      console.error('   - Verify cluster hostname is correct in your connection string');
      console.error('   - Check your internet connection');
      console.error('   - Try using different DNS servers');
    } else if (message.includes('timeout')) {
      console.error('\n⏱ Timeout Error:');
      console.error('   - Cluster may be unresponsive');
      console.error('   - Network connectivity issue');
      console.error('   - Try connecting later');
    } else {
      console.error('\n📝 Full error details:');
      console.error(error);
    }

    process.exit(1);
  }
}

testConnection();
