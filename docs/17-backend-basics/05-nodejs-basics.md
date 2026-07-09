# Node.js Basics - Node.js Asoslari

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchilar orasida shunday hazil bor: "JS faqat Brauzer uchun o'yinchoq til". Node.js bu fikrni yo'qqa chiqardi va JS ni Serverga olib kirdi. Hozirda siz ishlatadigan VITE, Webpack, ESLint, Prettier, Tailwind kabi barcha "Frontend Asboblari" aynan Node.js da ishlaydi. Node.js qanday ishlashini (Event Loop, Single Thread) bilmasangiz, nega build jarayoni 5 daqiqa vaqt olyapti yoki nega Nuxt.js/Next.js dagi SSR (Server-Side Rendering) xatolar beryapti, bularning asl sababini topa olmaysiz.

> [!NOTE]
> **Real-hayot analogiyasi: "Barmen (Event Loop)"**  
> Tasavvur qiling bitta zo'r barmen (Node.js) 100 ta mijozga (So'rovlarga) xizmat qilyapti.  
> Agar u Java yoki PHP bo'lganida, birinchi mijozning qahvasi tayyor bo'lmaguncha, ikkinchi mijozdan buyurtma olmas edi (Sinxron). Lekin Node.js barmeni (Event Loop) juda ayyor: Birinchi mijozdan buyurtmani oladi-da, qahva mashinasiga bosib qo'yib, u pishguncha o'tib ikkinchi mijozdan buyurtma olaveradi. Qahva tayyor bo'lishi bilan signal chalinadi (Callback) va u qahvani egasiga uzatadi. Bitta Barmen — yuzlab mijozlar (Non-blocking I/O). Lekin bitta qoida bor: agar Barmen qahva pishirish o'rniga, kitob o'qib qolsa (Og'ir for-loop CPU vazifasi), butun kafe to'xtab qoladi!

Node.js - bu Chrome V8 JavaScript engine ustida qurilgan server-side JavaScript runtime. Frontend dasturchisi sifatida Node.js tushunish sizga full-stack rivojlanish, build tools, va backend jamoasi bilan samarali ishlash imkonini beradi.
## Node.js Arxitekturasi

### Event-Driven, Non-Blocking I/O

```
┌─────────────────────────────────────────────────────────────────┐
│                    NODE.JS ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    JavaScript Code                        │   │
│  │              (Single-threaded, Event Loop)                │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│  ┌────────────────────────────▼─────────────────────────────┐   │
│  │                      Node.js APIs                         │   │
│  │    fs, http, crypto, zlib, dns, net, os, path, etc.      │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│  ┌────────────────────────────▼─────────────────────────────┐   │
│  │                        libuv                              │   │
│  │    (C library: Event Loop, Thread Pool, Async I/O)       │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              Thread Pool (4 threads default)         │ │   │
│  │  │  - File system operations                            │ │   │
│  │  │  - DNS lookups                                       │ │   │
│  │  │  - Compression                                       │ │   │
│  │  │  - Crypto operations                                 │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Operating System                       │   │
│  │              (epoll, kqueue, IOCP, etc.)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Event Loop Phases

```
┌─────────────────────────────────────────────────────────────────┐
│                      EVENT LOOP PHASES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────┐                                             │
│   │    timers     │◄─── setTimeout(), setInterval()            │
│   └───────┬───────┘                                             │
│           │                                                      │
│   ┌───────▼───────┐                                             │
│   │ pending I/O   │◄─── System callbacks                        │
│   └───────┬───────┘                                             │
│           │                                                      │
│   ┌───────▼───────┐                                             │
│   │     idle      │◄─── Internal use                            │
│   └───────┬───────┘                                             │
│           │                                                      │
│   ┌───────▼───────┐                                             │
│   │     poll      │◄─── I/O callbacks (fs, network)            │
│   └───────┬───────┘                                             │
│           │                                                      │
│   ┌───────▼───────┐                                             │
│   │     check     │◄─── setImmediate()                          │
│   └───────┬───────┘                                             │
│           │                                                      │
│   ┌───────▼───────┐                                             │
│   │close callbacks│◄─── socket.on('close', ...)                 │
│   └───────┬───────┘                                             │
│           │                                                      │
│           └──────────────────► Loop continues...                │
│                                                                  │
│   process.nextTick() va Promise → microtask queue              │
│   (har phase o'rtasida bajariladi)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Event Loop Misol

```javascript
console.log('1. Script start');

setTimeout(() => {
  console.log('6. setTimeout');
}, 0);

setImmediate(() => {
  console.log('7. setImmediate');
});

Promise.resolve().then(() => {
  console.log('3. Promise 1');
}).then(() => {
  console.log('4. Promise 2');
});

process.nextTick(() => {
  console.log('2. nextTick');
});

console.log('5. Script end');

// Output:
// 1. Script start
// 5. Script end
// 2. nextTick
// 3. Promise 1
// 4. Promise 2
// 6. setTimeout (or 7 - order not guaranteed)
// 7. setImmediate (or 6)
```

## Core Modules

### File System (fs)

```javascript
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';

// Read file
async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('File not found');
    }
    throw error;
  }
}

// Write file
async function writeFile(filePath, content) {
  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

// Read directory
async function listFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  return entries.map(entry => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
    path: path.join(dirPath, entry.name)
  }));
}

// File stats
async function getFileInfo(filePath) {
  const stats = await fs.stat(filePath);

  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    isDirectory: stats.isDirectory()
  };
}

// Watch for changes
const watcher = fs.watch('./src', { recursive: true });

for await (const event of watcher) {
  console.log(`${event.eventType}: ${event.filename}`);
}
```

### HTTP Server

```javascript
import http from 'http';
import https from 'https';
import { URL } from 'url';

// Basic HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Routing
  if (req.method === 'GET' && url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/data') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: data }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// HTTP client
async function fetchData(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}
```

### Path Module

```javascript
import path from 'path';

// Path operations
const filePath = '/users/john/documents/file.txt';

path.basename(filePath);     // 'file.txt'
path.dirname(filePath);      // '/users/john/documents'
path.extname(filePath);      // '.txt'
path.parse(filePath);
// {
//   root: '/',
//   dir: '/users/john/documents',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Path construction
path.join('/users', 'john', 'documents', 'file.txt');
// '/users/john/documents/file.txt'

path.resolve('src', 'utils', 'helpers.js');
// '/absolute/path/to/project/src/utils/helpers.js'

// Relative path
path.relative('/users/john', '/users/john/documents/file.txt');
// 'documents/file.txt'

// Normalize path
path.normalize('/users//john/../john/./documents');
// '/users/john/documents'
```

### Process va Environment

```javascript
// Environment variables
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY
};

// Process info
console.log({
  pid: process.pid,
  ppid: process.ppid,
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.version,
  uptime: process.uptime(),
  memoryUsage: process.memoryUsage(),
  cpuUsage: process.cpuUsage()
});

// Command line arguments
const args = process.argv.slice(2);
// node script.js --port 3000 --env production
// args = ['--port', '3000', '--env', 'production']

// Exit handling
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await server.close();
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await cleanup();
  process.exit(0);
});
```

## Streams

Streams - bu katta ma'lumotlarni bo'laklarga bo'lib ishlovdan o'tkazish usuli.

### Stream Turlari

```
┌─────────────────────────────────────────────────────────────────┐
│                       STREAM TYPES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Readable          Writable          Duplex          Transform  │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐    ┌─────────┐ │
│  │  DATA   │──►    │  DATA   │◄──    │◄─ DATA ─►│   │ IN→OUT  │ │
│  │ SOURCE  │       │  SINK   │       │ BOTH WAY │   │TRANSFORM│ │
│  └─────────┘       └─────────┘       └─────────┘    └─────────┘ │
│                                                                  │
│  Examples:         Examples:         Examples:       Examples:   │
│  - fs.createRead   - fs.createWrite  - net.Socket   - zlib      │
│  - http request    - http response   - TCP socket   - crypto    │
│  - process.stdin   - process.stdout  - WebSocket    - CSV parse │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Readable Stream

```javascript
import { Readable } from 'stream';
import fs from 'fs';

// File stream
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 64KB chunks
});

readStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

readStream.on('end', () => {
  console.log('Finished reading');
});

readStream.on('error', (error) => {
  console.error('Read error:', error);
});

// Custom readable stream
class CounterStream extends Readable {
  constructor(max) {
    super({ objectMode: true });
    this.max = max;
    this.current = 0;
  }

  _read() {
    if (this.current < this.max) {
      this.push({ count: ++this.current });
    } else {
      this.push(null);  // End stream
    }
  }
}

const counter = new CounterStream(5);
counter.on('data', (data) => console.log(data));
// { count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }, { count: 5 }
```

### Writable Stream

```javascript
import { Writable } from 'stream';
import fs from 'fs';

// File write stream
const writeStream = fs.createWriteStream('output.txt');

writeStream.write('Hello ');
writeStream.write('World');
writeStream.end('!');

writeStream.on('finish', () => {
  console.log('Finished writing');
});

// Custom writable stream
class LogStream extends Writable {
  constructor(options) {
    super(options);
    this.logs = [];
  }

  _write(chunk, encoding, callback) {
    const log = {
      timestamp: new Date().toISOString(),
      message: chunk.toString()
    };
    this.logs.push(log);
    console.log(JSON.stringify(log));
    callback();
  }
}

const logger = new LogStream();
logger.write('Application started');
logger.write('Processing request');
```

### Transform Stream

```javascript
import { Transform } from 'stream';
import zlib from 'zlib';

// Custom transform
class UppercaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

// Usage
const uppercase = new UppercaseTransform();
process.stdin.pipe(uppercase).pipe(process.stdout);

// Built-in transforms
const gzip = zlib.createGzip();
const gunzip = zlib.createGunzip();

// Compress file
fs.createReadStream('file.txt')
  .pipe(gzip)
  .pipe(fs.createWriteStream('file.txt.gz'));

// Decompress file
fs.createReadStream('file.txt.gz')
  .pipe(gunzip)
  .pipe(fs.createWriteStream('file-decompressed.txt'));
```

### Pipeline

```javascript
import { pipeline } from 'stream/promises';
import fs from 'fs';
import zlib from 'zlib';

// Stream pipeline with error handling
async function compressFile(input, output) {
  await pipeline(
    fs.createReadStream(input),
    zlib.createGzip(),
    fs.createWriteStream(output)
  );
  console.log('Compression complete');
}

// HTTP response streaming
import http from 'http';

const server = http.createServer(async (req, res) => {
  if (req.url === '/download') {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Encoding', 'gzip');

    await pipeline(
      fs.createReadStream('large-file.json'),
      zlib.createGzip(),
      res
    );
  }
});

// Stream processing
async function processLargeCSV(inputPath) {
  const results = [];

  const lineTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          this.push(line.split(','));
        }
      }
      callback();
    }
  });

  await pipeline(
    fs.createReadStream(inputPath),
    lineTransform,
    new Writable({
      objectMode: true,
      write(row, encoding, callback) {
        results.push(row);
        callback();
      }
    })
  );

  return results;
}
```

## Clustering va Scaling

### Cluster Module

```javascript
import cluster from 'cluster';
import os from 'os';
import http from 'http';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Restart worker
    cluster.fork();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    for (const worker of Object.values(cluster.workers)) {
      worker.kill('SIGTERM');
    }
  });

} else {
  // Workers share the TCP connection
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Handled by worker ${process.pid}\n`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

### Worker Threads

```javascript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  // Main thread
  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL(import.meta.url), {
        workerData: data
      });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  // Run CPU-intensive tasks in parallel
  async function processInParallel(items) {
    const results = await Promise.all(
      items.map(item => runWorker(item))
    );
    return results;
  }

  // Usage
  const results = await processInParallel([
    { task: 'fibonacci', n: 40 },
    { task: 'fibonacci', n: 42 },
    { task: 'fibonacci', n: 44 }
  ]);

} else {
  // Worker thread
  const { task, n } = workerData;

  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

  const result = fibonacci(n);
  parentPort.postMessage(result);
}
```

### PM2 - Process Manager

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './dist/server.js',
    instances: 'max',  // Or number
    exec_mode: 'cluster',

    // Environment
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },

    // Logs
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',

    // Auto-restart
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,

    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000
  }]
};

// CLI commands:
// pm2 start ecosystem.config.js
// pm2 start ecosystem.config.js --env production
// pm2 reload api  // Zero-downtime restart
// pm2 scale api 4  // Scale to 4 instances
// pm2 logs
// pm2 monit
// pm2 status
```

## Error Handling

### Error Types

```javascript
// Built-in errors
try {
  JSON.parse('invalid json');
} catch (error) {
  if (error instanceof SyntaxError) {
    console.log('JSON parse error');
  }
}

// Custom errors
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Usage
function validateUser(data) {
  if (!data.email) {
    throw new ValidationError('email', 'Email is required');
  }
  if (!data.email.includes('@')) {
    throw new ValidationError('email', 'Invalid email format');
  }
}
```

### Async Error Handling

```javascript
// Express error handling
import express from 'express';

const app = express();

// Async wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User');
  }
  res.json(user);
}));

// Error middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.statusCode ? error.message : 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    }
  });
});

// Global unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Cleanup and exit
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, but log for monitoring
});
```

### Graceful Shutdown

```javascript
class GracefulShutdown {
  constructor() {
    this.isShuttingDown = false;
    this.connections = new Set();
    this.cleanupTasks = [];
  }

  trackConnection(conn) {
    this.connections.add(conn);
    conn.on('close', () => this.connections.delete(conn));
  }

  addCleanupTask(task) {
    this.cleanupTasks.push(task);
  }

  async shutdown(signal) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close();

    // Close existing connections
    for (const conn of this.connections) {
      conn.end();
    }

    // Run cleanup tasks
    for (const task of this.cleanupTasks) {
      try {
        await task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    }

    console.log('Graceful shutdown complete');
    process.exit(0);
  }
}

const shutdown = new GracefulShutdown();

// Track connections
server.on('connection', (conn) => {
  shutdown.trackConnection(conn);
});

// Add cleanup tasks
shutdown.addCleanupTask(() => db.close());
shutdown.addCleanupTask(() => redis.quit());
shutdown.addCleanupTask(() => queue.close());

// Handle signals
['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => shutdown.shutdown(signal));
});
```

## Performance

### Memory Management

```javascript
// Memory monitoring
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`
  };
}

// Memory leak prevention
class Cache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value) {
    // Evict oldest if at max
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key);
  }
}

// WeakMap for object references
const metadata = new WeakMap();

function setMetadata(obj, data) {
  metadata.set(obj, data);
  // When obj is garbage collected, metadata is too
}
```

### Performance Monitoring

```javascript
import { performance, PerformanceObserver } from 'perf_hooks';

// Performance measurement
performance.mark('start');
await someOperation();
performance.mark('end');

performance.measure('Operation', 'start', 'end');

// Observer
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

obs.observe({ entryTypes: ['measure'] });

// Async hooks for tracking
import async_hooks from 'async_hooks';

const asyncOperations = new Map();

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    asyncOperations.set(asyncId, {
      type,
      triggerAsyncId,
      startTime: Date.now()
    });
  },
  destroy(asyncId) {
    const op = asyncOperations.get(asyncId);
    if (op) {
      const duration = Date.now() - op.startTime;
      if (duration > 100) {
        console.log(`Slow async op: ${op.type} took ${duration}ms`);
      }
      asyncOperations.delete(asyncId);
    }
  }
});

hook.enable();
```

## Frontend Uchun Node.js Bilimi

### Build Tools va Development

```javascript
// Vite, Webpack, esbuild hammasi Node.js ustida ishlaydi

// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}

// Custom build script
import { build } from 'esbuild';
import { execSync } from 'child_process';

async function buildProject() {
  // TypeScript check
  execSync('tsc --noEmit', { stdio: 'inherit' });

  // Build
  await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: 'dist'
  });

  console.log('Build complete!');
}

buildProject().catch(console.error);
```

### API Proxy Development

```javascript
// Local development proxy
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Serve static files
app.use(express.static('dist'));

// Proxy API requests
app.use('/api', createProxyMiddleware({
  target: 'https://api.production.com',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Authorization', `Bearer ${process.env.API_KEY}`);
  }
}));

app.listen(3000);
```

### SSR/SSG Understanding

```javascript
// Server-Side Rendering (Nuxt/Next.js ichida)

// 1. Server receives request
// 2. Fetches data
// 3. Renders HTML
// 4. Sends to browser
// 5. Hydration on client

// Nuxt server route example
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  const users = await db.query('SELECT * FROM users LIMIT 10');
  return users;
});

// Data fetching
// pages/users.vue
const { data: users } = await useFetch('/api/users');
```

## Interview Savollari

### 1. Node.js event loop nima va qanday ishlaydi?

**Javob:**
```
Event Loop - bu Node.js'ning non-blocking I/O asosini tashkil
etuvchi mexanizm.

Phases:
1. Timers: setTimeout/setInterval callbacks
2. Pending I/O: System callbacks
3. Idle/Prepare: Internal
4. Poll: I/O callbacks (fs, network)
5. Check: setImmediate
6. Close: socket.on('close')

Microtasks (har phase o'rtasida):
- process.nextTick() - eng yuqori priority
- Promise callbacks

Ahamiyati:
- Single-threaded, lekin async operations parallel
- Non-blocking - boshqa ishlar kutmaydi
- Efficient - C10K problem yechimi

// Misol
setTimeout(() => console.log('1'), 0);
Promise.resolve().then(() => console.log('2'));
process.nextTick(() => console.log('3'));
console.log('4');
// Output: 4, 3, 2, 1
```

### 2. Streams nima va qachon ishlatiladi?

**Javob:**
```
Streams - katta ma'lumotlarni bo'laklarga bo'lib
ishlovdan o'tkazish usuli.

Turlari:
1. Readable - data source (fs.createReadStream)
2. Writable - data sink (fs.createWriteStream)
3. Duplex - both (net.Socket)
4. Transform - modify data (zlib)

Qachon ishlatiladi:
- Katta fayllar (video, logs)
- Real-time data (WebSocket)
- Memory-efficient processing
- Piping operations

Afzalliklari:
- Memory efficient (butun faylni RAM'ga yuklamaydi)
- Time efficient (birinchi chunk kelganda ishlay boshlaydi)
- Composable (pipe orqali ulanadi)

// Misol: 1GB faylni compress qilish
fs.createReadStream('large.json')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('large.json.gz'));
```

### 3. Clustering va Worker Threads farqi nima?

**Javob:**
```
Cluster:
- Multiple Node.js processes
- Separate memory
- Load balancing (shared port)
- HTTP servers uchun ideal

import cluster from 'cluster';
if (cluster.isPrimary) {
  for (let i = 0; i < 4; i++) cluster.fork();
} else {
  http.createServer(...).listen(3000);
}

Worker Threads:
- Single process, multiple threads
- Shared memory (SharedArrayBuffer)
- CPU-intensive tasks uchun
- No HTTP load balancing

import { Worker } from 'worker_threads';
const worker = new Worker('./heavy-task.js');
worker.on('message', (result) => { ... });

Qachon qaysi:
- HTTP server scaling: Cluster
- CPU-intensive (image processing): Worker Threads
- Parallel I/O: Neither (async enough)
```

### 4. Node.js'da error handling qanday qilinadi?

**Javob:**
```
1. Try/Catch (sync):
try {
  JSON.parse(invalid);
} catch (error) {
  // Handle
}

2. Async/Await:
try {
  await asyncOperation();
} catch (error) {
  // Handle
}

3. Promise .catch():
asyncOperation()
  .then(result => ...)
  .catch(error => ...);

4. Event emitters:
stream.on('error', (error) => ...);

5. Global handlers:
process.on('uncaughtException', (error) => {
  console.error(error);
  process.exit(1);  // Must exit
});

process.on('unhandledRejection', (reason) => {
  console.error(reason);
});

Best practices:
- Always handle errors
- Use custom error classes
- Log errors with context
- Graceful shutdown on fatal errors
- Don't swallow errors silently
```

### 5. Node.js'da memory leak qanday aniqlanadi va oldini olinadi?

**Javob:**
```
Aniqlash:

1. process.memoryUsage():
setInterval(() => {
  const { heapUsed } = process.memoryUsage();
  console.log(`Heap: ${Math.round(heapUsed / 1024 / 1024)} MB`);
}, 5000);

2. --inspect flag + Chrome DevTools:
node --inspect server.js
// Chrome: chrome://inspect

3. heapdump:
import heapdump from 'heapdump';
heapdump.writeSnapshot('./heap.heapsnapshot');

Keng tarqalgan sabablar:
- Global variables
- Event listeners (removeListener yo'q)
- Closures (keraksiz reference)
- Unbounded caches/arrays
- Uncleared timers/intervals

Oldini olish:
// WeakMap/WeakSet
const cache = new WeakMap();

// Event listener cleanup
emitter.removeListener('event', handler);

// Clear intervals
const timer = setInterval(...);
clearInterval(timer);

// Bounded cache
const cache = new LRUCache({ max: 500 });
```

## Frontend-Backend Aloqa

### Understanding Server Behavior

```javascript
// Frontend: Server qanday javob berishini tushunish

// 1. Streaming responses
fetch('/api/large-data')
  .then(response => {
    const reader = response.body.getReader();

    return new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
          // Process chunk immediately
        }
        controller.close();
      }
    });
  });

// 2. Server-Sent Events
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Real-time updates
};

// 3. Understanding timeouts
// Server has timeout, client should too
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);

fetch('/api/long-operation', {
  signal: controller.signal
});
```

### SSR Hydration

```javascript
// Nuxt/Next.js da hydration tushunish

// Server-side:
// 1. Component render
// 2. Data fetch
// 3. HTML generate
// 4. State serialize

// Client-side:
// 1. HTML display (fast)
// 2. JS load
// 3. Hydrate (attach events)
// 4. Reconcile state

// Hydration mismatch sabablari:
// - Date.now() (server vs client vaqt farqi)
// - window/document (server'da yo'q)
// - Random IDs (har render'da farqli)

// Yechim:
<ClientOnly>
  <ComponentWithBrowserAPIs />
</ClientOnly>

// Yoki:
const isClient = ref(false);
onMounted(() => {
  isClient.value = true;
});
```

## Xulosa

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **CPU Intensive ishlarni Node.js da qilmang:** Node.js videoni konvertatsiya qilish yoki 10 millionlik massivni saralash uchun yaratilmagan. Uning asosiy kuchi Tarmoq va Fayl (I/O) bilan ishlashda. Agar CPU ni band qilsangiz, Event Loop bloklanib qoladi va boshqa hamma foydalanuvchilar serveringizdan javob ololmay "qotib" qolishadi (Worker Threads ishlating).
2. **Asynchronous kod yozish (Promise/Async-Await):** Hech qachon `fs.readFileSync` kabi "Sync" metodlarni Web Server yozishda ishlatmang. "Sync" metod butun Node.js ni "to'xtatib" turadi. Har doim `fs.promises.readFile` (yoki await) kabi Asinxron usullarni qo'llang.
3. **Muntazam yangilab turish (NVM):** O'z kompyuteringizda doim `nvm` (Node Version Manager) ishlating. Har xil loyihalar har xil Node.js versiyalarida (masalan, bittasi v14, bittasi v20) ishlashi mumkin. NVM orqali kerakli versiyaga bir soniyada o'tib olishingiz mumkin.

---

## Xulosa

| Arxitektura qismi | Nima u? | Vazifasi |
|-------------------|---------|----------|
| **V8 Dvigateli** | Google Chrome ning yuragi (C++ da yozilgan) | Siz yozgan JS kodingizni Kompyuter (Mashina) tushunadigan tilga o'girib beradi. |
| **libuv (Event Loop)** | Asinxron operatsiyalarni boshqaruvchi kutubxona | Node.js ni bitta thread'da yuz minglab so'rovlarni qotmasdan bajarishini ta'minlaydi. |
| **Event-Driven** | Hodisaga asoslangan tizim | Fayl o'qib bo'linganda yoki Internetdan javob kelganda qandaydir funksiyani ishga tushirish (Callbacks, Promises). |
| **Package Manager (NPM)**| Paketlar boshqaruvchisi | Boshqa dasturchilar yozgan tayyor asboblarni kompyuteringizga o'rnatish. |

Node.js bilimi frontend dasturchi uchun xuddi haydovchining dvigatel qanday ishlashini bilishiga o'xshaydi. Nuxt.js/Next.js kabi ramkalar (Framework) aynan Node.js da ishlaydi (SSR). Event Loop ning bloklanishi, xatolarni to'g'ri ushlash va Memory Leak (xotira to'lishi) muammolarini faqat Node.js tag-tomirini tushunibgina yechish mumkin. O'z lokal muhitingizni to'laqonli boshqarish professional darajaning muhim bosqichidir.
