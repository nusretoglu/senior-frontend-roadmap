# Polling Strategies

## Kirish

Polling - bu client'ning server'dan ma'lumotlarni muntazam so'rab turishi. WebSocket yoki SSE mavjud bo'lmagan yoki mos kelmaydigan holatlarda fallback sifatida ishlatiladi. To'g'ri implement qilingan polling samarali va ishonchli bo'lishi mumkin.

## Polling Turlari

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         POLLING SPECTRUM                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Short Polling          Long Polling           Adaptive Polling         │
│  ─────────────          ────────────           ────────────────         │
│                                                                          │
│  Client: Request        Client: Request        Client: Request          │
│  Server: Immediate      Server: Wait for       Server: Based on         │
│          response               data                   activity         │
│                                                                          │
│  Fixed interval         Hold until data        Dynamic interval         │
│  High overhead          Lower overhead         Optimized overhead       │
│  Simple                 More complex           Most complex             │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────►│
│  High latency                                              Low latency   │
│  High resource usage                              Low resource usage     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Short Polling

### Asosiy Konsept

Client belgilangan interval bilan server'ga so'rov yuboradi:

```
Client                              Server
  │                                    │
  │────── GET /api/data ──────────────►│
  │◄───── Response (empty) ────────────│
  │                                    │
  │ wait(5000ms)                       │
  │                                    │
  │────── GET /api/data ──────────────►│
  │◄───── Response (empty) ────────────│
  │                                    │
  │ wait(5000ms)                       │
  │                                    │
  │────── GET /api/data ──────────────►│
  │◄───── Response {data} ─────────────│
  │                                    │
```

### Implementation

```javascript
class ShortPolling {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      interval: 5000,
      immediate: true,
      ...options
    };

    this.isPolling = false;
    this.timeoutId = null;
    this.lastData = null;
    this.handlers = new Set();
  }

  start() {
    if (this.isPolling) return;
    this.isPolling = true;

    if (this.options.immediate) {
      this.poll();
    } else {
      this.scheduleNextPoll();
    }
  }

  stop() {
    this.isPolling = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  async poll() {
    if (!this.isPolling) return;

    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Faqat o'zgarish bo'lsa notify qilish
      if (this.hasChanged(data)) {
        this.lastData = data;
        this.notify(data);
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.scheduleNextPoll();
    }
  }

  scheduleNextPoll() {
    if (!this.isPolling) return;

    this.timeoutId = setTimeout(() => {
      this.poll();
    }, this.options.interval);
  }

  hasChanged(newData) {
    return JSON.stringify(newData) !== JSON.stringify(this.lastData);
  }

  onData(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  notify(data) {
    this.handlers.forEach((handler) => handler(data));
  }

  handleError(error) {
    console.error('Polling error:', error);
  }
}

// Ishlatish
const poller = new ShortPolling('/api/notifications', {
  interval: 10000
});

poller.onData((data) => {
  console.log('New data:', data);
});

poller.start();
```

## Long Polling

### Asosiy Konsept

Server yangi data bo'lguncha response'ni ushlab turadi:

```
Client                              Server
  │                                    │
  │────── GET /api/data ──────────────►│
  │                                    │ (waiting for data...)
  │                                    │
  │                                    │ (data arrives!)
  │◄───── Response {data} ─────────────│
  │                                    │
  │────── GET /api/data ──────────────►│  (immediately reconnect)
  │                                    │ (waiting...)
  │                                    │
```

### Server Implementation (Node.js)

```javascript
class LongPollingServer {
  constructor() {
    this.waitingClients = new Map();
    this.messageQueue = new Map();
    this.timeout = 30000; // 30 seconds
  }

  // Client request handler
  async handleRequest(req, res, userId) {
    const clientId = `${userId}-${Date.now()}`;
    const lastEventId = req.query.lastEventId;

    // Queued message'lar bormi?
    const queuedMessages = this.getQueuedMessages(userId, lastEventId);
    if (queuedMessages.length > 0) {
      return res.json({
        messages: queuedMessages,
        lastEventId: queuedMessages[queuedMessages.length - 1].id
      });
    }

    // Client'ni ro'yxatga olish
    this.waitingClients.set(clientId, { res, userId });

    // Timeout
    const timeoutId = setTimeout(() => {
      if (this.waitingClients.has(clientId)) {
        this.waitingClients.delete(clientId);
        res.json({ messages: [], timeout: true });
      }
    }, this.timeout);

    // Client disconnect
    req.on('close', () => {
      clearTimeout(timeoutId);
      this.waitingClients.delete(clientId);
    });

    // Cleanup callback qaytarish
    return () => {
      clearTimeout(timeoutId);
      this.waitingClients.delete(clientId);
    };
  }

  // Message broadcast
  sendToUser(userId, message) {
    const messageWithId = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    let delivered = false;

    // Waiting client'larga yuborish
    this.waitingClients.forEach((client, clientId) => {
      if (client.userId === userId) {
        client.res.json({
          messages: [messageWithId],
          lastEventId: messageWithId.id
        });
        this.waitingClients.delete(clientId);
        delivered = true;
      }
    });

    // Delivered bo'lmasa queue'ga qo'shish
    if (!delivered) {
      this.queueMessage(userId, messageWithId);
    }

    return messageWithId;
  }

  // Message queue management
  queueMessage(userId, message) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }

    const queue = this.messageQueue.get(userId);
    queue.push(message);

    // Queue size limit
    if (queue.length > 100) {
      queue.shift();
    }
  }

  getQueuedMessages(userId, lastEventId) {
    const queue = this.messageQueue.get(userId) || [];

    if (!lastEventId) {
      return queue;
    }

    const lastIndex = queue.findIndex((m) => m.id === lastEventId);
    if (lastIndex === -1) {
      return queue;
    }

    return queue.slice(lastIndex + 1);
  }

  clearQueue(userId) {
    this.messageQueue.delete(userId);
  }
}

// Express routes
const longPolling = new LongPollingServer();

app.get('/api/poll', authenticateUser, async (req, res) => {
  await longPolling.handleRequest(req, res, req.user.id);
});

app.post('/api/messages', authenticateUser, (req, res) => {
  const message = longPolling.sendToUser(req.body.userId, req.body.message);
  res.json({ success: true, messageId: message.id });
});
```

### Client Implementation

```javascript
class LongPollingClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      timeout: 35000,
      retryDelay: 1000,
      maxRetries: 10,
      ...options
    };

    this.isPolling = false;
    this.retryCount = 0;
    this.lastEventId = null;
    this.abortController = null;
    this.handlers = new Set();
  }

  start() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.poll();
  }

  stop() {
    this.isPolling = false;
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  async poll() {
    if (!this.isPolling) return;

    this.abortController = new AbortController();

    try {
      const url = new URL(this.url, window.location.origin);
      if (this.lastEventId) {
        url.searchParams.set('lastEventId', this.lastEventId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: this.abortController.signal,
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Reset retry count on success
      this.retryCount = 0;

      // Update last event ID
      if (data.lastEventId) {
        this.lastEventId = data.lastEventId;
      }

      // Process messages
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach((msg) => this.notify(msg));
      }

      // Immediately poll again
      if (this.isPolling) {
        this.poll();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Intentional abort
      }

      this.handleError(error);
    }
  }

  handleError(error) {
    console.error('Long polling error:', error);

    if (this.retryCount >= this.options.maxRetries) {
      this.notify({ type: 'error', message: 'Max retries reached' });
      this.stop();
      return;
    }

    // Exponential backoff
    const delay = this.options.retryDelay * Math.pow(2, this.retryCount);
    this.retryCount++;

    setTimeout(() => {
      if (this.isPolling) {
        this.poll();
      }
    }, Math.min(delay, 30000));
  }

  onMessage(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  notify(message) {
    this.handlers.forEach((handler) => handler(message));
  }
}

// Ishlatish
const client = new LongPollingClient('/api/poll');

client.onMessage((message) => {
  console.log('Received:', message);
});

client.start();
```

## Adaptive Polling

### Asosiy Konsept

Interval dinamik ravishda activity'ga qarab o'zgaradi:

```javascript
class AdaptivePolling {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      minInterval: 1000,      // 1 second
      maxInterval: 60000,     // 1 minute
      intervalStep: 1.5,      // Multiplier
      activityThreshold: 5,   // Messages before speeding up
      inactivityThreshold: 3, // Empty responses before slowing down
      ...options
    };

    this.currentInterval = this.options.minInterval;
    this.emptyResponseCount = 0;
    this.recentActivityCount = 0;
    this.isPolling = false;
    this.timeoutId = null;
    this.handlers = new Set();
  }

  start() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.poll();
  }

  stop() {
    this.isPolling = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  async poll() {
    if (!this.isPolling) return;

    try {
      const response = await fetch(this.url, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data && data.length > 0) {
        // Activity detected - speed up
        this.handleActivity(data);
      } else {
        // No activity - slow down
        this.handleInactivity();
      }
    } catch (error) {
      console.error('Polling error:', error);
      this.handleInactivity();
    }

    this.scheduleNextPoll();
  }

  handleActivity(data) {
    this.emptyResponseCount = 0;
    this.recentActivityCount += data.length;

    // Speed up if high activity
    if (this.recentActivityCount >= this.options.activityThreshold) {
      this.currentInterval = Math.max(
        this.currentInterval / this.options.intervalStep,
        this.options.minInterval
      );
      this.recentActivityCount = 0;
    }

    data.forEach((item) => this.notify(item));
  }

  handleInactivity() {
    this.emptyResponseCount++;
    this.recentActivityCount = 0;

    // Slow down if no activity
    if (this.emptyResponseCount >= this.options.inactivityThreshold) {
      this.currentInterval = Math.min(
        this.currentInterval * this.options.intervalStep,
        this.options.maxInterval
      );
      this.emptyResponseCount = 0;
    }
  }

  scheduleNextPoll() {
    if (!this.isPolling) return;

    this.timeoutId = setTimeout(() => {
      this.poll();
    }, this.currentInterval);
  }

  // User activity'ni detect qilish
  onUserActivity() {
    // User faol - intervalni tezlashtirish
    this.currentInterval = this.options.minInterval;
    this.emptyResponseCount = 0;
  }

  onMessage(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  notify(item) {
    this.handlers.forEach((handler) => handler(item));
  }

  // Stats
  getStats() {
    return {
      currentInterval: this.currentInterval,
      emptyResponses: this.emptyResponseCount,
      recentActivity: this.recentActivityCount
    };
  }
}

// Ishlatish
const adaptive = new AdaptivePolling('/api/updates', {
  minInterval: 2000,
  maxInterval: 30000
});

// User activity detection
document.addEventListener('mousemove', () => adaptive.onUserActivity());
document.addEventListener('keydown', () => adaptive.onUserActivity());
document.addEventListener('click', () => adaptive.onUserActivity());

adaptive.onMessage((data) => {
  console.log('Update:', data);
});

adaptive.start();
```

## Exponential Backoff with Jitter

### Server Overload Protection

```javascript
class BackoffPolling {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      baseInterval: 1000,
      maxInterval: 60000,
      multiplier: 2,
      jitterFactor: 0.25, // 0-25% random jitter
      ...options
    };

    this.currentInterval = this.options.baseInterval;
    this.consecutiveErrors = 0;
    this.isPolling = false;
  }

  calculateNextInterval() {
    // Exponential backoff
    const exponentialInterval = Math.min(
      this.options.baseInterval * Math.pow(this.options.multiplier, this.consecutiveErrors),
      this.options.maxInterval
    );

    // Add jitter
    const jitter = exponentialInterval * Math.random() * this.options.jitterFactor;

    return exponentialInterval + jitter;
  }

  async poll() {
    if (!this.isPolling) return;

    try {
      const response = await fetch(this.url);

      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After');
        this.currentInterval = retryAfter
          ? parseInt(retryAfter) * 1000
          : this.calculateNextInterval();
        this.consecutiveErrors++;
      } else if (response.status >= 500) {
        // Server error
        this.consecutiveErrors++;
        this.currentInterval = this.calculateNextInterval();
      } else {
        // Success
        this.consecutiveErrors = 0;
        this.currentInterval = this.options.baseInterval;

        const data = await response.json();
        this.handleData(data);
      }
    } catch (error) {
      // Network error
      this.consecutiveErrors++;
      this.currentInterval = this.calculateNextInterval();
    }

    this.scheduleNextPoll();
  }

  scheduleNextPoll() {
    setTimeout(() => this.poll(), this.currentInterval);
  }
}
```

## Real-World Case: Email Client Polling

```javascript
class EmailPollingService {
  constructor() {
    this.folders = new Map();
    this.unreadCount = 0;

    // Har xil folder uchun har xil interval
    this.folderIntervals = {
      inbox: 5000,      // Har 5 soniya
      sent: 60000,      // Har 1 daqiqa
      spam: 300000,     // Har 5 daqiqa
      trash: 600000     // Har 10 daqiqa
    };
  }

  start() {
    Object.entries(this.folderIntervals).forEach(([folder, interval]) => {
      this.startFolderPolling(folder, interval);
    });
  }

  startFolderPolling(folder, interval) {
    const poller = new AdaptivePolling(`/api/email/${folder}`, {
      minInterval: interval,
      maxInterval: interval * 10
    });

    poller.onMessage((emails) => {
      this.updateFolder(folder, emails);
    });

    this.folders.set(folder, poller);
    poller.start();
  }

  updateFolder(folder, emails) {
    const newEmails = emails.filter((e) => !e.seen);

    if (newEmails.length > 0 && folder === 'inbox') {
      this.showNotification(newEmails);
      this.updateUnreadCount();
    }

    this.emit('folderUpdate', { folder, emails });
  }

  // User inbox'ni ochganda
  onInboxFocus() {
    const inboxPoller = this.folders.get('inbox');
    if (inboxPoller) {
      inboxPoller.onUserActivity();
    }
  }

  // Tab ko'rinmas bo'lganda
  onTabHidden() {
    // Polling'ni sekinlashtirish
    this.folders.forEach((poller) => {
      poller.options.minInterval *= 2;
    });
  }

  // Tab ko'rinsa
  onTabVisible() {
    // Normal interval'ga qaytarish
    Object.entries(this.folderIntervals).forEach(([folder, interval]) => {
      const poller = this.folders.get(folder);
      if (poller) {
        poller.options.minInterval = interval;
        poller.onUserActivity();
      }
    });
  }

  stop() {
    this.folders.forEach((poller) => poller.stop());
  }
}

// Page visibility bilan
const emailService = new EmailPollingService();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    emailService.onTabHidden();
  } else {
    emailService.onTabVisible();
  }
});

emailService.start();
```

## NOTO'G'RI vs TO'G'RI Kodlar

### 1. Cleanup

```javascript
// NOTO'G'RI: Memory leak
useEffect(() => {
  setInterval(() => {
    fetchData();
  }, 5000);
}, []);

// TO'G'RI: Cleanup
useEffect(() => {
  const intervalId = setInterval(() => {
    fetchData();
  }, 5000);

  return () => clearInterval(intervalId);
}, []);
```

### 2. Race Condition

```javascript
// NOTO'G'RI: Oldingi request tugamasdan yangi request
async function poll() {
  const data = await fetch('/api/data');
  // Agar bu request sekin bo'lsa, keyingisi allaqachon boshlanadi
}
setInterval(poll, 1000);

// TO'G'RI: Ketma-ket bajarish
async function poll() {
  try {
    const data = await fetch('/api/data');
    handleData(data);
  } finally {
    // Request tugagandan keyin keyingisini schedule qilish
    setTimeout(poll, 1000);
  }
}
poll();
```

### 3. Error Handling

```javascript
// NOTO'G'RI: Error'da polling to'xtab qoladi
async function poll() {
  const response = await fetch('/api/data'); // Error bo'lsa catch yo'q
  const data = await response.json();
  handleData(data);
  setTimeout(poll, 5000);
}

// TO'G'RI: Error resilient
async function poll() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    handleData(data);
    errorCount = 0;
    setTimeout(poll, 5000);
  } catch (error) {
    errorCount++;
    const backoffDelay = Math.min(5000 * Math.pow(2, errorCount), 60000);
    console.error('Poll error, retrying in', backoffDelay);
    setTimeout(poll, backoffDelay);
  }
}
```

### 4. Unnecessary Polling

```javascript
// NOTO'G'RI: Tab ko'rinmas bo'lsa ham polling
setInterval(fetchUpdates, 5000);

// TO'G'RI: Visibility-aware
let pollInterval;

function startPolling() {
  pollInterval = setInterval(fetchUpdates, 5000);
}

function stopPolling() {
  clearInterval(pollInterval);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    fetchUpdates(); // Darhol yangilash
    startPolling();
  }
});
```

### 5. Cache Busting

```javascript
// NOTO'G'RI: Cache muammolari
fetch('/api/data');

// TO'G'RI: Cache-control va timestamp
fetch('/api/data', {
  headers: {
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache'
  }
});

// Yoki URL'ga timestamp qo'shish
fetch(`/api/data?_t=${Date.now()}`);
```

## Reconnect Bug'larni Hal Qilish

### 1. Thundering Herd

```javascript
// MUAMMO: Server restart qilganda barcha clientlar bir vaqtda reconnect

// YECHIM: Jitter bilan staggered reconnect
class JitteredPolling {
  constructor(url, baseInterval) {
    this.url = url;
    this.baseInterval = baseInterval;
  }

  getNextInterval() {
    // Random jitter: 0-25% qo'shimcha
    const jitter = this.baseInterval * Math.random() * 0.25;
    return this.baseInterval + jitter;
  }

  scheduleNext() {
    setTimeout(() => this.poll(), this.getNextInterval());
  }
}
```

### 2. Request Pileup

```javascript
// MUAMMO: Sekin response'lar to'planib qoladi

// YECHIM: AbortController bilan
class SafePolling {
  constructor(url) {
    this.url = url;
    this.abortController = null;
  }

  async poll() {
    // Avvalgisini bekor qilish
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    try {
      const response = await fetch(this.url, {
        signal: this.abortController.signal
      });
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Previous request cancelled');
        return null;
      }
      throw error;
    }
  }
}
```

### 3. Stale Data

```javascript
// MUAMMO: Eski data yangi data ustiga yoziladi

// YECHIM: Timestamp yoki version check
class VersionedPolling {
  constructor(url) {
    this.url = url;
    this.lastVersion = 0;
    this.lastTimestamp = 0;
  }

  async poll() {
    const response = await fetch(this.url);
    const data = await response.json();

    // Version check
    if (data.version <= this.lastVersion) {
      console.log('Stale data, ignoring');
      return null;
    }

    // Timestamp check
    if (data.timestamp < this.lastTimestamp) {
      console.log('Out of order data, ignoring');
      return null;
    }

    this.lastVersion = data.version;
    this.lastTimestamp = data.timestamp;

    return data;
  }
}
```

### 4. Connection State Sync

```javascript
// MUAMMO: Offline/online state to'g'ri track qilinmaydi

// YECHIM: Online/offline events
class NetworkAwarePolling {
  constructor(url) {
    this.url = url;
    this.isOnline = navigator.onLine;
    this.isPolling = false;

    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  handleOnline() {
    this.isOnline = true;
    if (this.shouldPoll && !this.isPolling) {
      this.start();
    }
  }

  handleOffline() {
    this.isOnline = false;
    this.stop();
    this.emit('offline');
  }

  async poll() {
    if (!this.isOnline) {
      this.scheduleNext();
      return;
    }

    try {
      const data = await this.fetchData();
      this.handleData(data);
    } catch (error) {
      // Network error - probably offline
      if (!navigator.onLine) {
        this.handleOffline();
      }
    }

    this.scheduleNext();
  }
}
```

## Vue.js Integration

```javascript
// composables/usePolling.js
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useDocumentVisibility } from '@vueuse/core';

export function usePolling(url, options = {}) {
  const {
    interval = 5000,
    immediate = true,
    pauseOnHidden = true
  } = options;

  const data = ref(null);
  const error = ref(null);
  const isPolling = ref(false);
  const lastUpdated = ref(null);

  const visibility = useDocumentVisibility();

  let timeoutId = null;
  let abortController = null;

  async function poll() {
    if (!isPolling.value) return;

    abortController = new AbortController();

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      data.value = await response.json();
      lastUpdated.value = new Date();
      error.value = null;
    } catch (e) {
      if (e.name !== 'AbortError') {
        error.value = e;
      }
    }

    scheduleNext();
  }

  function scheduleNext() {
    if (!isPolling.value) return;
    timeoutId = setTimeout(poll, interval);
  }

  function start() {
    isPolling.value = true;
    poll();
  }

  function stop() {
    isPolling.value = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (abortController) {
      abortController.abort();
    }
  }

  // Visibility change handling
  if (pauseOnHidden) {
    watch(visibility, (isVisible) => {
      if (isVisible === 'visible') {
        if (!isPolling.value) {
          start();
        }
      } else {
        stop();
      }
    });
  }

  onMounted(() => {
    if (immediate) {
      start();
    }
  });

  onUnmounted(() => {
    stop();
  });

  return {
    data,
    error,
    isPolling,
    lastUpdated,
    start,
    stop,
    refresh: poll
  };
}
```

### Component'da Ishlatish

```vue
<script setup>
import { usePolling } from '@/composables/usePolling';

const { data, error, isPolling, lastUpdated, refresh } = usePolling('/api/stats', {
  interval: 10000,
  pauseOnHidden: true
});
</script>

<template>
  <div class="dashboard">
    <div class="status">
      <span :class="{ active: isPolling }">
        {{ isPolling ? 'Live' : 'Paused' }}
      </span>
      <span v-if="lastUpdated">
        Updated: {{ lastUpdated.toLocaleTimeString() }}
      </span>
    </div>

    <div v-if="error" class="error">
      {{ error.message }}
    </div>

    <div v-if="data" class="stats">
      <div>Users: {{ data.activeUsers }}</div>
      <div>Requests: {{ data.requestsPerMinute }}/min</div>
    </div>

    <button @click="refresh">Refresh Now</button>
  </div>
</template>
```

## Interview Savollari

### 1. Short polling va Long polling farqi?

**Javob:**

| Xususiyat | Short Polling | Long Polling |
|-----------|---------------|--------------|
| Response | Darhol | Data bo'lganda |
| Connection | Har request yangi | Uzoq davomli |
| Latency | Interval kadar | Real-time |
| Server load | Yuqori (ko'p request) | O'rtacha |
| Implementation | Oddiy | Murakkab |

### 2. Polling vs WebSocket qachon?

**Javob:**

**Polling tanlash:**
- Legacy infrastructure
- Proxy/firewall restrictions
- Infrequent updates (> 30 seconds)
- Fallback mechanism kerak
- Simple implementation kerak

**WebSocket tanlash:**
- High-frequency updates
- Bidirectional communication
- Low latency critical
- Modern infrastructure

### 3. Exponential backoff nima uchun kerak?

**Javob:**
1. **Server protection:** Overload'dan himoya
2. **Thundering herd prevention:** Jitter bilan
3. **Resource efficiency:** Keraksiz request'larni kamaytirish
4. **Network resilience:** Temporary failure'larni handle qilish

```javascript
function getBackoffDelay(attempt, baseDelay = 1000, maxDelay = 60000) {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = exponentialDelay * Math.random() * 0.25;
  return exponentialDelay + jitter;
}
```

### 4. Polling'da race condition qanday oldini olinadi?

**Javob:**
1. **Sequential execution:** Bir vaqtda faqat bitta request
2. **AbortController:** Oldingi request'ni bekor qilish
3. **Request ID:** Response'ni to'g'ri request'ga matching
4. **Timestamp/Version:** Stale data'ni filter qilish

### 5. Tab visibility bilan polling qanday optimizatsiya qilinadi?

**Javob:**
```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab ko'rinmas:
    // - Polling to'xtatish yoki sekinlashtirish
    // - Resource saqlash
    stopPolling();
  } else {
    // Tab ko'rinadi:
    // - Darhol yangilash
    // - Normal polling boshlash
    fetchImmediately();
    startPolling();
  }
});
```

## Xulosa

Polling - oddiy va universal yechim bo'lsa ham, to'g'ri implement qilish muhim:

1. **Interval optimization:** Adaptive/exponential backoff
2. **Error handling:** Retry logic bilan
3. **Resource efficiency:** Visibility-aware, cleanup
4. **Race condition:** AbortController, sequential execution
5. **Fallback:** WebSocket/SSE ishlamasa

Production'da polling'ni WebSocket/SSE bilan fallback sifatida ishlatish eng yaxshi amaliyot.

Keyingi bo'lim: [Reconnect Strategies](./04-reconnect-strategies.md)
