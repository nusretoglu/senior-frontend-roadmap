# Message Queues - Xabar Navbatlari

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Foydalanuvchi "Hisobotni Excelga yuklash" tugmasini bosganda API 10 soniya javob bermasligi (Timeout) — asabbuzar holat. Frontendchi "Backend sekin" deb noliydi. Haqiqiy yechim esa Queue (Navbat) ishlatishdir: Backend 1 millisekundda "Sizning so'rovingiz qabul qilindi, fayl tayyor bo'lgach xabar beramiz" (HTTP 202 Accepted) deb javob beradi. Asosiy ish esa orqa fonda (Background) navbat bilan bajariladi. Agar siz Queue nimaligini tushunmasangiz, bunday uzoq kutiladigan jarayonlarga mos UX (Loading, Progress bar, Notification) qura olmaysiz.

> [!NOTE]
> **Real-hayot analogiyasi: "Makdonaldsdagi Navbat"**  
> Tasavvur qiling siz Makdonaldsda burger buyurtma qilyapsiz.  
> **Sinxron (Queue yo'q):** Kassir sizdan pulni oladi va o'zi oshxonaga kirib burgerni pishirib chiqadi. Bu vaqtda orqangizdagi 10 kishi kutyapti. Dastur qotadi.  
> **Asinxron (Queue bilan):** Kassir (API) pulni oladi va sizga raqam yozilgan chek beradi (Job ID). "Mana, raqamingiz 45, tayyor bo'lsa ekranda yonadi" deydi va keyingi mijozni qabul qiladi. Orqa fondagi oshpazlar (Workers) esa buyurtmalarni navbat (Queue) bo'yicha pishiraveradi.

Message Queue - bu tizimlar o'rtasida asinxron xabar almashish uchun ishlatiladigan vosita. Bu pattern og'ir ishlarni background'da bajarish, tizimlarni ajratish (decoupling) va yuqori yukni boshqarish uchun muhim.
## Nima Uchun Queue Kerak?

### Muammo: Sinxron Ishlov Berish

```
┌─────────────────────────────────────────────────────────────────┐
│               SYNCHRONOUS PROCESSING (Yomon)                    │
│                                                                  │
│  User Request ───────────────────────────────────────► Response │
│       │                                                    ▲    │
│       ▼                                                    │    │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │    │
│  │ Validate│ → │ Process │ → │Send Mail│ → │ Resize  │ ──┘    │
│  │  Input  │   │  Order  │   │  (2s)   │   │ Images  │         │
│  │  (10ms) │   │  (50ms) │   │         │   │  (5s)   │         │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘         │
│                                                                  │
│  Total Response Time: 7+ seconds 😱                             │
│  User kutmoqda...                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Yechim: Asinxron Queue

```
┌─────────────────────────────────────────────────────────────────┐
│                ASYNCHRONOUS PROCESSING (Yaxshi)                  │
│                                                                  │
│  User Request ─────────────────────► Response (60ms) ✓          │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                        │
│  │ Validate│ → │ Process │ → │  Queue  │                        │
│  │  Input  │   │  Order  │   │  (5ms)  │                        │
│  │  (10ms) │   │  (50ms) │   └────┬────┘                        │
│  └─────────┘   └─────────┘        │                             │
│                                    │                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  Background Workers                │                             │
│                                    ▼                             │
│                            ┌─────────────┐                       │
│                            │   Worker 1  │                       │
│                            │  Send Mail  │                       │
│                            └─────────────┘                       │
│                            ┌─────────────┐                       │
│                            │   Worker 2  │                       │
│                            │Resize Images│                       │
│                            └─────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## Queue Use Cases

### 1. Og'ir Ishlar

```javascript
// ❌ Sinxron - User kutadi
app.post('/upload', async (req, res) => {
  const image = req.file;

  // Resize (5s)
  await sharp(image).resize(1200).toFile('large.jpg');
  await sharp(image).resize(600).toFile('medium.jpg');
  await sharp(image).resize(150).toFile('thumb.jpg');

  // Upload to CDN (3s)
  await cdn.upload(['large.jpg', 'medium.jpg', 'thumb.jpg']);

  res.json({ success: true });  // 8+ sekund keyin
});

// ✅ Asinxron - User kutmaydi
app.post('/upload', async (req, res) => {
  const image = req.file;
  const jobId = generateId();

  // Queue'ga qo'sh (5ms)
  await queue.add('processImage', {
    imagePath: image.path,
    jobId
  });

  res.json({
    jobId,
    status: 'processing',
    statusUrl: `/api/jobs/${jobId}`
  });  // 50ms da javob
});
```

### 2. External Service Calls

```javascript
// Email, SMS, Push notifications
await queue.add('notifications', {
  type: 'email',
  to: user.email,
  template: 'welcome',
  data: { name: user.name }
});

// Third-party integrations
await queue.add('syncToSalesforce', {
  action: 'createContact',
  data: customerData
});
```

### 3. Scheduled Jobs

```javascript
// Har soat report yuborish
await queue.add('sendDailyReport', {}, {
  repeat: { cron: '0 9 * * *' }  // Har kuni 9:00
});

// Delayed job
await queue.add('sendReminder', {
  userId: user.id,
  message: 'Your trial expires tomorrow'
}, {
  delay: 6 * 24 * 60 * 60 * 1000  // 6 kundan keyin
});
```

### 4. Load Leveling

```javascript
// Traffic spike'larni tekislash
// 1000 req/s → Queue → 100 req/s to DB

app.post('/analytics/event', async (req, res) => {
  // Queue'ga yoz (tez, fail qilmaydi)
  await queue.add('trackEvent', req.body, {
    priority: 10  // Past priority
  });

  res.status(202).json({ accepted: true });
});
```

## Bull Queue (Node.js)

Bull - Redis asosida ishlaydigan eng mashhur Node.js queue library.

### Setup

```javascript
import Queue from 'bull';
import Redis from 'ioredis';

// Redis connection
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
};

// Queue yaratish
const emailQueue = new Queue('email', { redis: redisConfig });
const imageQueue = new Queue('image', { redis: redisConfig });

// Yoki shared connection
const client = new Redis(redisConfig);
const subscriber = new Redis(redisConfig);

const createQueue = (name) => new Queue(name, {
  createClient: (type) => {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(redisConfig);
    }
  }
});
```

### Producer (Job Qo'shish)

```javascript
// Basic job
await emailQueue.add({
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome'
});

// Named job
await emailQueue.add('sendWelcome', {
  userId: 123
});

// Job options bilan
await emailQueue.add('sendReport', data, {
  // Priority (1 = eng yuqori)
  priority: 1,

  // Delay
  delay: 5000,  // 5 sekund

  // Retry
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },

  // Remove on complete
  removeOnComplete: true,
  removeOnFail: 100,  // Keep last 100 failed

  // Job timeout
  timeout: 30000,

  // Job ID (duplicate prevention)
  jobId: `report-${userId}-${date}`
});

// Bulk add
await emailQueue.addBulk([
  { name: 'sendEmail', data: { to: 'a@b.com' } },
  { name: 'sendEmail', data: { to: 'c@d.com' } },
  { name: 'sendEmail', data: { to: 'e@f.com' } }
]);
```

### Consumer (Worker)

```javascript
// Single processor
emailQueue.process(async (job) => {
  console.log(`Processing job ${job.id}`);

  const { to, subject, template } = job.data;
  await sendEmail(to, subject, template);

  // Progress update
  job.progress(50);

  await logToAnalytics(job.id);

  job.progress(100);

  return { sent: true, timestamp: Date.now() };
});

// Named processors
emailQueue.process('sendWelcome', async (job) => {
  const user = await getUser(job.data.userId);
  await sendWelcomeEmail(user);
});

emailQueue.process('sendReport', async (job) => {
  const report = await generateReport(job.data);
  await sendReportEmail(report);
});

// Concurrency
emailQueue.process(5, async (job) => {
  // 5 ta parallel job
});

// Separate worker file
// worker.js
import Queue from 'bull';

const emailQueue = new Queue('email', process.env.REDIS_URL);

emailQueue.process(async (job) => {
  await processEmail(job.data);
});
```

### Events va Monitoring

```javascript
// Job events
emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
  // Alert to monitoring system
  notifySlack(`Email job failed: ${err.message}`);
});

emailQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id}: ${progress}%`);
});

emailQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

// Global events
emailQueue.on('error', (err) => {
  console.error('Queue error:', err);
});

emailQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} waiting`);
});

// Queue metrics
const counts = await emailQueue.getJobCounts();
// { waiting: 10, active: 2, completed: 100, failed: 5, delayed: 3 }

const jobs = await emailQueue.getJobs(['waiting', 'active']);
```

### Error Handling va Retry

```javascript
// Retry strategy
emailQueue.process(async (job) => {
  try {
    await sendEmail(job.data);
  } catch (error) {
    if (error.code === 'RATE_LIMITED') {
      // Retry keyin
      throw new Error('Rate limited');
    }

    if (error.code === 'INVALID_EMAIL') {
      // Retry qilma
      return { skipped: true, reason: 'Invalid email' };
    }

    throw error;
  }
});

// Failed jobs'ni qayta ishga tushirish
const failedJobs = await emailQueue.getFailed();
for (const job of failedJobs) {
  await job.retry();
}

// Yoki bulk retry
await emailQueue.clean(0, 'failed');  // Remove all failed
// Yoki
for (const job of failedJobs) {
  if (job.failedReason.includes('temporary')) {
    await job.retry();
  }
}
```

### Scheduled Jobs

```javascript
// Repeating jobs
await emailQueue.add('dailyReport', {}, {
  repeat: {
    cron: '0 9 * * *',  // Har kuni 9:00
    tz: 'Asia/Tashkent'
  }
});

// Every N milliseconds
await emailQueue.add('healthCheck', {}, {
  repeat: {
    every: 60000  // Har minut
  }
});

// Delayed job
await emailQueue.add('sendReminder', data, {
  delay: 24 * 60 * 60 * 1000  // 24 soat
});

// Get repeatable jobs
const repeatableJobs = await emailQueue.getRepeatableJobs();

// Remove repeatable job
await emailQueue.removeRepeatableByKey(repeatableJobs[0].key);
```

## RabbitMQ

RabbitMQ - enterprise-grade message broker.

### Setup

```javascript
import amqp from 'amqplib';

class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.close();
      process.exit(0);
    });
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
```

### Direct Queue

```javascript
const rabbitmq = new RabbitMQ();
await rabbitmq.connect();

// Queue e'lon qilish
const queueName = 'email';
await rabbitmq.channel.assertQueue(queueName, {
  durable: true,  // Server restart'dan keyin saqlanadi
  arguments: {
    'x-dead-letter-exchange': 'dlx',
    'x-message-ttl': 86400000  // 24 soat
  }
});

// Producer
async function sendToQueue(queue, message) {
  rabbitmq.channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,  // Disk'ga yoziladi
      contentType: 'application/json'
    }
  );
}

await sendToQueue('email', {
  to: 'user@example.com',
  subject: 'Hello'
});

// Consumer
async function consume(queue, handler) {
  await rabbitmq.channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      await handler(data);
      rabbitmq.channel.ack(msg);  // Success
    } catch (error) {
      console.error('Processing error:', error);
      // Requeue yoki DLQ
      rabbitmq.channel.nack(msg, false, false);  // DLQ'ga yuborish
    }
  }, {
    noAck: false  // Manual acknowledgment
  });
}

await consume('email', async (data) => {
  await sendEmail(data.to, data.subject);
});
```

### Exchange Patterns

```javascript
// Direct Exchange
await channel.assertExchange('direct_logs', 'direct', { durable: true });
await channel.publish('direct_logs', 'error', Buffer.from(message));

// Fanout Exchange (broadcast)
await channel.assertExchange('notifications', 'fanout', { durable: true });
// Barcha queue'larga yuboriladi
await channel.publish('notifications', '', Buffer.from(message));

// Topic Exchange (pattern matching)
await channel.assertExchange('logs', 'topic', { durable: true });
await channel.publish('logs', 'user.created', Buffer.from(message));
await channel.publish('logs', 'order.created', Buffer.from(message));

// Subscribe to patterns
await channel.bindQueue(queue, 'logs', 'user.*');    // user.created, user.updated
await channel.bindQueue(queue, 'logs', '*.created'); // user.created, order.created
await channel.bindQueue(queue, 'logs', '#');         // All messages
```

## Queue Patterns

### 1. Work Queue (Competing Consumers)

```javascript
// Bir nechta worker bir xil queue'dan oladi
// Load balancing avtomatik

// Queue
await queue.add('processOrder', orderData);
await queue.add('processOrder', orderData);
await queue.add('processOrder', orderData);

// Worker 1
queue.process('processOrder', async (job) => {
  await processOrder(job.data);
});

// Worker 2 (parallel instance)
queue.process('processOrder', async (job) => {
  await processOrder(job.data);
});

// Har bir job faqat bitta worker tomonidan olinadi
```

### 2. Pub/Sub (Fan-out)

```javascript
// Bitta message ko'p subscriber'larga

const pubsub = new Redis();

// Publisher
await pubsub.publish('orders', JSON.stringify({
  event: 'order.created',
  data: order
}));

// Subscriber 1: Email service
const emailSubscriber = new Redis();
emailSubscriber.subscribe('orders');
emailSubscriber.on('message', (channel, message) => {
  const { event, data } = JSON.parse(message);
  if (event === 'order.created') {
    sendOrderConfirmation(data);
  }
});

// Subscriber 2: Inventory service
const inventorySubscriber = new Redis();
inventorySubscriber.subscribe('orders');
inventorySubscriber.on('message', (channel, message) => {
  const { event, data } = JSON.parse(message);
  if (event === 'order.created') {
    updateInventory(data);
  }
});
```

### 3. Request-Reply

```javascript
// Synchronous-like behavior over queue

// Client
async function requestReply(queue, replyQueue, data, timeout = 30000) {
  const correlationId = generateId();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);

    // Reply listener
    const replyHandler = (msg) => {
      if (msg.properties.correlationId === correlationId) {
        clearTimeout(timer);
        resolve(JSON.parse(msg.content));
      }
    };

    channel.consume(replyQueue, replyHandler, { noAck: true });

    // Send request
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
      correlationId,
      replyTo: replyQueue
    });
  });
}

// Server
channel.consume('rpc_queue', async (msg) => {
  const data = JSON.parse(msg.content);
  const result = await processRequest(data);

  channel.sendToQueue(
    msg.properties.replyTo,
    Buffer.from(JSON.stringify(result)),
    { correlationId: msg.properties.correlationId }
  );

  channel.ack(msg);
});
```

### 4. Dead Letter Queue (DLQ)

```javascript
// Failed messages uchun alohida queue

// Main queue setup (Bull)
const mainQueue = new Queue('orders', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnFail: false
  }
});

// DLQ
const deadLetterQueue = new Queue('orders-dlq', { redis: redisConfig });

mainQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // Max retries reached - move to DLQ
    await deadLetterQueue.add('failed-order', {
      originalData: job.data,
      error: err.message,
      failedAt: Date.now(),
      attempts: job.attemptsMade
    });
  }
});

// DLQ processor (manual review)
deadLetterQueue.process('failed-order', async (job) => {
  // Alert admins
  await notifyAdmins({
    subject: 'Order processing failed',
    data: job.data
  });
});
```

### 5. Priority Queue

```javascript
// Muhim ishlarni avval bajarish

// High priority
await queue.add('urgent', urgentData, { priority: 1 });

// Medium priority
await queue.add('normal', normalData, { priority: 5 });

// Low priority
await queue.add('background', backgroundData, { priority: 10 });

// Priority-aware processing
// Bull avtomatik priority bo'yicha oladi
```

### 6. Idempotency

```javascript
// Duplicate job'larni oldini olish

// Unique job ID
await queue.add('processPayment', paymentData, {
  jobId: `payment-${paymentData.transactionId}`
});

// Agar bir xil jobId mavjud bo'lsa, skip qilinadi

// Manual idempotency check
queue.process(async (job) => {
  const { transactionId } = job.data;

  // Check if already processed
  const processed = await redis.get(`processed:${transactionId}`);
  if (processed) {
    return { skipped: true, reason: 'Already processed' };
  }

  // Process
  await processPayment(job.data);

  // Mark as processed
  await redis.setex(`processed:${transactionId}`, 86400, '1');

  return { success: true };
});
```

## Event-Driven Architecture

### Event Bus

```javascript
// Centralized event management

class EventBus {
  constructor(redis) {
    this.redis = redis;
    this.queues = new Map();
  }

  async emit(eventName, data) {
    const event = {
      id: generateId(),
      name: eventName,
      data,
      timestamp: Date.now()
    };

    // Persist event
    await this.redis.lpush('events:log', JSON.stringify(event));

    // Publish to subscribers
    await this.redis.publish('events', JSON.stringify(event));

    // Add to event-specific queue
    const queue = this.getQueue(eventName);
    await queue.add(eventName, data);

    return event.id;
  }

  getQueue(eventName) {
    if (!this.queues.has(eventName)) {
      this.queues.set(eventName, new Queue(eventName, { redis: redisConfig }));
    }
    return this.queues.get(eventName);
  }

  on(eventName, handler) {
    const queue = this.getQueue(eventName);
    queue.process(eventName, async (job) => {
      await handler(job.data);
    });
  }
}

// Usage
const eventBus = new EventBus(redis);

// Emit
await eventBus.emit('user.created', { userId: 123, email: 'user@example.com' });

// Handle
eventBus.on('user.created', async (data) => {
  await sendWelcomeEmail(data.email);
});

eventBus.on('user.created', async (data) => {
  await createUserInCRM(data);
});
```

### Saga Pattern

```javascript
// Distributed transactions across services

class OrderSaga {
  constructor(queues) {
    this.queues = queues;
  }

  async execute(orderData) {
    const sagaId = generateId();

    try {
      // Step 1: Reserve inventory
      const inventoryResult = await this.reserveInventory(sagaId, orderData);

      // Step 2: Process payment
      const paymentResult = await this.processPayment(sagaId, orderData);

      // Step 3: Create order
      const order = await this.createOrder(sagaId, orderData);

      // Step 4: Confirm inventory
      await this.confirmInventory(sagaId);

      return { success: true, order };

    } catch (error) {
      // Compensate (rollback)
      await this.compensate(sagaId, error);
      throw error;
    }
  }

  async compensate(sagaId, error) {
    // Reverse actions in reverse order
    await this.queues.inventory.add('releaseReservation', { sagaId });
    await this.queues.payment.add('refundPayment', { sagaId });
    await this.queues.orders.add('cancelOrder', { sagaId });
  }
}
```

## Bull Board - UI Monitoring

```javascript
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [
    new BullAdapter(emailQueue),
    new BullAdapter(imageQueue),
    new BullAdapter(orderQueue)
  ],
  serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());
// http://localhost:3000/admin/queues
```

## Frontend Uchun Queue Bilimi

### 1. Job Status Tracking

```javascript
// Backend: Job status endpoint
app.post('/api/upload', async (req, res) => {
  const job = await imageQueue.add('processImage', {
    file: req.file.path
  });

  res.json({
    jobId: job.id,
    status: 'queued'
  });
});

app.get('/api/jobs/:id', async (req, res) => {
  const job = await imageQueue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const state = await job.getState();
  const progress = job.progress();

  res.json({
    id: job.id,
    state,  // 'waiting', 'active', 'completed', 'failed'
    progress,
    result: job.returnvalue,
    error: job.failedReason
  });
});

// Frontend: Polling
function useJobStatus(jobId) {
  const [status, setStatus] = useState({ state: 'waiting', progress: 0 });

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      setStatus(data);

      if (['completed', 'failed'].includes(data.state)) {
        return;  // Stop polling
      }

      setTimeout(poll, 1000);  // Poll every second
    };

    poll();
  }, [jobId]);

  return status;
}

// Usage
function UploadProgress({ jobId }) {
  const { state, progress, result, error } = useJobStatus(jobId);

  if (state === 'waiting') return <Spinner />;
  if (state === 'active') return <ProgressBar value={progress} />;
  if (state === 'completed') return <Success result={result} />;
  if (state === 'failed') return <Error message={error} />;
}
```

### 2. Real-time Updates

```javascript
// Backend: WebSocket/SSE
const socketIo = require('socket.io');

imageQueue.on('progress', (job, progress) => {
  io.to(`job:${job.id}`).emit('progress', { progress });
});

imageQueue.on('completed', (job, result) => {
  io.to(`job:${job.id}`).emit('completed', { result });
});

imageQueue.on('failed', (job, err) => {
  io.to(`job:${job.id}`).emit('failed', { error: err.message });
});

// Frontend: Socket.IO
function useJobRealtime(jobId) {
  const [status, setStatus] = useState({ state: 'waiting' });

  useEffect(() => {
    socket.emit('subscribe', `job:${jobId}`);

    socket.on('progress', (data) => {
      setStatus(prev => ({ ...prev, progress: data.progress }));
    });

    socket.on('completed', (data) => {
      setStatus({ state: 'completed', result: data.result });
    });

    socket.on('failed', (data) => {
      setStatus({ state: 'failed', error: data.error });
    });

    return () => {
      socket.emit('unsubscribe', `job:${jobId}`);
    };
  }, [jobId]);

  return status;
}
```

### 3. Batch Operations

```javascript
// Backend: Bulk job qo'shish
app.post('/api/products/import', async (req, res) => {
  const products = req.body.products;
  const batchId = generateId();

  const jobs = await productQueue.addBulk(
    products.map((product, index) => ({
      name: 'importProduct',
      data: { ...product, batchId, index },
      opts: { jobId: `${batchId}-${index}` }
    }))
  );

  res.json({
    batchId,
    totalJobs: jobs.length
  });
});

app.get('/api/batches/:id', async (req, res) => {
  const jobs = await productQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  const batchJobs = jobs.filter(j => j.data.batchId === req.params.id);

  const stats = {
    total: batchJobs.length,
    completed: batchJobs.filter(j => j.finishedOn).length,
    failed: batchJobs.filter(j => j.failedReason).length,
    progress: batchJobs.reduce((sum, j) => sum + (j.progress() || 0), 0) / batchJobs.length
  };

  res.json(stats);
});

// Frontend
function BatchProgress({ batchId }) {
  const { data } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => fetch(`/api/batches/${batchId}`).then(r => r.json()),
    refetchInterval: 1000,  // Poll every second
    enabled: !!batchId
  });

  if (!data) return <Loading />;

  return (
    <div>
      <ProgressBar value={data.progress} />
      <span>{data.completed} / {data.total} completed</span>
      {data.failed > 0 && <Alert>{data.failed} failed</Alert>}
    </div>
  );
}
```

## Interview Savollari

### 1. Queue nima uchun kerak va qachon ishlatiladi?

**Javob:**
```
Queue kerak bo'lganda:

1. Og'ir/sekin operatsiyalar:
   - Image/video processing
   - PDF generation
   - Email/SMS yuborish
   - External API calls

2. Reliability kerak:
   - Payment processing
   - Order fulfillment
   - Data sync

3. Load leveling:
   - Traffic spike'lar
   - Rate limiting
   - Batch processing

4. Decoupling:
   - Microservices
   - Event-driven architecture
   - Async communication

Afzalliklari:
- User kutmaydi (fast response)
- Retry/resilience
- Horizontal scaling
- Monitoring/visibility

Kamchiliklari:
- Complexity
- Eventual consistency
- Debugging qiyinroq
```

### 2. Bull va RabbitMQ farqi nima?

**Javob:**
```
Bull (Redis-based):
- Simple, lightweight
- Node.js uchun optimized
- Redis dependency
- Good for: Single app, simple queues

Features:
- Priority queues
- Delayed jobs
- Repeatable jobs
- Job events
- UI (Bull Board)

RabbitMQ (AMQP):
- Enterprise-grade
- Language agnostic
- Complex routing (exchanges)
- Good for: Microservices, complex patterns

Features:
- Multiple exchange types
- Dead letter queues
- Clustering
- Persistence
- AMQP protocol

Tanlash:
- Simple queue, Node.js: Bull
- Microservices, complex routing: RabbitMQ
- Event streaming: Kafka
```

### 3. Idempotency nima va queue'da qanday ta'minlanadi?

**Javob:**
```
Idempotency = bir xil operatsiya bir necha marta
bajarilsa ham natija bir xil

Muammo:
- Network failure → retry → duplicate
- Job qayta ishga tushiriladi

Yechimlar:

1. Unique job ID:
await queue.add('payment', data, {
  jobId: `payment-${transactionId}`
});

2. Processed check:
const processed = await redis.get(`done:${id}`);
if (processed) return;

// Process
await redis.setex(`done:${id}`, 86400, '1');

3. Database constraint:
INSERT INTO payments (id, ...)
ON CONFLICT (id) DO NOTHING;

4. Distributed lock:
const lock = await redlock.acquire([`lock:${id}`], 5000);
try {
  await process();
} finally {
  await lock.release();
}

Best practice:
- Har doim idempotent design
- Unique identifier (transaction_id, event_id)
- Processed status track
```

### 4. Dead Letter Queue nima va qanday ishlatiladi?

**Javob:**
```
Dead Letter Queue (DLQ):
- Failed messages uchun alohida queue
- Max retries'dan keyin
- Manual review uchun

Use case:
1. Temporary failure: Retry
2. Permanent failure: DLQ
3. Invalid data: DLQ + alert

Implementation:
queue.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    await dlq.add('failed', {
      originalJob: job.data,
      error: err.message,
      failedAt: Date.now()
    });

    // Alert
    await notifyOps({
      subject: 'Job failed after max retries',
      job: job.data,
      error: err
    });
  }
});

DLQ handling:
- Auto-retry after fix
- Manual investigation
- Data correction
- Metrics/alerting
```

### 5. Queue monitoring va scaling qanday amalga oshiriladi?

**Javob:**
```
Monitoring:

1. Metrics:
- Queue depth (waiting jobs)
- Processing rate
- Error rate
- Latency (wait time)

2. Tools:
- Bull Board (UI)
- Prometheus + Grafana
- CloudWatch (AWS)
- Custom dashboards

3. Alerts:
- Queue too deep
- High error rate
- Stalled workers

Scaling:

1. Horizontal (workers):
// Run multiple worker processes
pm2 start worker.js -i 4

2. Vertical (concurrency):
queue.process(10, async (job) => {
  // 10 parallel jobs
});

3. Partitioning:
// Separate queues by priority/type
const urgentQueue = new Queue('urgent');
const normalQueue = new Queue('normal');

4. Auto-scaling:
// Cloud: Scale workers based on queue depth
if (queueDepth > threshold) {
  scaleUp();
}

Best practices:
- Monitor queue depth
- Set alerts
- Horizontal scaling preferred
- Circuit breaker for external services
```

## Frontend-Backend Aloqa

### Async Operations UI Pattern

```javascript
// 3 state: Immediate → Processing → Complete

// 1. Immediate feedback
const submitOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  // Response immediately with jobId
  return response.data;  // { orderId, jobId, status: 'processing' }
};

// 2. Show processing state
function OrderStatus({ orderId, jobId }) {
  const { data: status } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.get(`/jobs/${jobId}`),
    refetchInterval: (data) => {
      // Stop polling when complete
      return data?.state === 'completed' ? false : 1000;
    }
  });

  return (
    <div>
      <h2>Order #{orderId}</h2>

      {status?.state === 'active' && (
        <ProcessingIndicator
          message="Processing your order..."
          progress={status.progress}
        />
      )}

      {status?.state === 'completed' && (
        <SuccessMessage>
          Order confirmed! Check your email.
        </SuccessMessage>
      )}

      {status?.state === 'failed' && (
        <ErrorMessage>
          Something went wrong. Please contact support.
        </ErrorMessage>
      )}
    </div>
  );
}
```

### Optimistic UI + Queue

```javascript
// Immediately show success, queue handles actual work

const addToCart = useMutation({
  mutationFn: async (product) => {
    const response = await api.post('/cart/add', { productId: product.id });
    return response.data;  // { cartId, jobId }
  },

  // Optimistic update - immediately show in cart
  onMutate: async (product) => {
    await queryClient.cancelQueries({ queryKey: ['cart'] });
    const previousCart = queryClient.getQueryData(['cart']);

    queryClient.setQueryData(['cart'], (old) => ({
      ...old,
      items: [...old.items, { ...product, pending: true }]
    }));

    return { previousCart };
  },

  // Server confirms
  onSuccess: (data, product) => {
    queryClient.setQueryData(['cart'], (old) => ({
      ...old,
      items: old.items.map(item =>
        item.id === product.id
          ? { ...item, pending: false }
          : item
      )
    }));
  },

  // Rollback on error
  onError: (err, product, context) => {
    queryClient.setQueryData(['cart'], context.previousCart);
    toast.error('Failed to add to cart');
  }
});
```

## Xulosa

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Job ID (Chek raqam) bilan ishlash:** Uzoq ishlaydigan API ga so'rov yuborganingizda (Masalan: Video yuklash), Backend sizga darhol `jobId` qaytarishi kerak. Siz bu ID ni olib, WebSocket orqali yoki har 3 soniyada (Polling) "Bu ID dagi ish necha foiz bo'ldi?" deb so'rab turasiz.
2. **Idempotency:** Bitta "Buyurtma berish" tugmasini asabiy foydalanuvchi 5 marta bosib yuborsa, Queue ga 5 ta bir xil vazifa tushib qolmasligi kerak. Bunga frontend tomondan tugmani o'chirib qo'yish (disable) orqali yordam berasiz, lekin Asosiy xavfsizlik Backend da bitta jarayonni faqat bir marta bajariladigan qilib sozlanganida (Idempotency) yotadi.
3. **Dead Letter Queue (O'lik xatlar qutisi):** Agar Worker 3 marta urinib ham videoni formati xatoligi uchun o'zgartira olmasa, bu vazifani (Job) Queue dan olib tashlab, foydalanuvchiga (Frontend) "Fayl yaroqsiz" degan xato xabarini ko'rsatish zarur. Agar Frontendda shuni tutib oladigan Notification tizimi bo'lmasa, foydalanuvchi umrbod kutib qoladi.

---

## Xulosa

| Tushuncha | Nima u? | Vazifasi |
|-----------|---------|----------|
| **Producer (Yuboruvchi)** | Veb-sayt (API orqali) yoki App | Yangi vazifani (Masalan: "Email jo'nat") Navbatga qo'shadi. |
| **Queue (Navbat)** | RabbitMQ yoki Redis BullMQ | Vazifalar ro'yxatini tartib bilan xotirada saqlab turadi. |
| **Consumer / Worker (Bajaruvchi)** | Orqa fonda ishlaydigan Server | Navbatdan bitta-bitta vazifani olib, sekin-asta bajaradi. |
| **Job ID** | Bajarilayotgan ish raqami | Frontend ishning statusini (Kutmoqda, % bajarildi, Xato) tekshirishi uchun pasport. |

Queue bilimi frontend dasturchi uchun Asinxron foydalanuvchi interfeysini (Async UX) yaratishning kalitidir. Saytda nima tez bajarilishi (Sinxron API) va nima orqa fonda, biroz vaqtdan keyin bajarilishini (Queue) tushunsangiz, siz foydalanuvchiga Toaster (Bildirishnoma), Progress Bar va WebSocket orqali ajoyib interaktivlik taqdim eta olasiz.
