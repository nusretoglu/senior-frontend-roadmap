# Server-Sent Events (SSE)

## Kirish

Server-Sent Events (SSE) - bu server'dan client'ga bir tomonlama (unidirectional) real-time ma'lumot yuborish texnologiyasi. WebSocket'dan farqli o'laroq, SSE oddiy HTTP protokoli ustida ishlaydi va browser tomonidan avtomatik reconnection qo'llab-quvvatlanadi.

## SSE vs WebSocket

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SSE vs WebSocket                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Server-Sent Events                    WebSocket                        │
│  ──────────────────                    ─────────                        │
│                                                                          │
│  Server ────────────► Client           Server ◄────────► Client         │
│  (One-way only)                        (Full-duplex)                    │
│                                                                          │
│  HTTP/1.1, HTTP/2                      WebSocket Protocol               │
│  Text only (UTF-8)                     Text + Binary                    │
│  Auto reconnect                        Manual reconnect                 │
│  Simple to implement                   More complex                     │
│  Works with proxies                    Proxy issues possible            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## SSE Protocol Format

SSE xabarlari oddiy text format'ida yuboriladi:

```
event: eventName
data: {"key": "value"}
id: 12345
retry: 5000

data: simple message without event type

event: update
data: line 1
data: line 2
id: 12346

```

**Muhim qoidalar:**
- Har bir field `:` bilan ajratiladi (`:` dan keyin space optional)
- Xabarlar bo'sh qator (`\n\n`) bilan ajratiladi
- `data` - xabar content'i (ko'p qatorli bo'lishi mumkin)
- `event` - custom event type (default: `message`)
- `id` - xabar ID'si (reconnect uchun)
- `retry` - reconnect interval (milliseconds)

## Asosiy API

### Client-Side (EventSource API)

```javascript
// Oddiy connection
const eventSource = new EventSource('/api/events');

// Message event (default)
eventSource.onmessage = (event) => {
  console.log('Message:', event.data);
  console.log('Last Event ID:', event.lastEventId);
};

// Custom event types
eventSource.addEventListener('notification', (event) => {
  const data = JSON.parse(event.data);
  showNotification(data);
});

eventSource.addEventListener('update', (event) => {
  updateDashboard(JSON.parse(event.data));
});

// Connection ochilganda
eventSource.onopen = (event) => {
  console.log('Connection opened');
};

// Xatolik yuz berganda
eventSource.onerror = (event) => {
  if (eventSource.readyState === EventSource.CONNECTING) {
    console.log('Reconnecting...');
  } else if (eventSource.readyState === EventSource.CLOSED) {
    console.log('Connection closed');
  }
};

// Connection yopish
eventSource.close();
```

### ReadyState Values

```javascript
EventSource.CONNECTING = 0;  // Connecting yoki reconnecting
EventSource.OPEN = 1;        // Connected
EventSource.CLOSED = 2;      // Connection closed
```

### Server-Side (Node.js/Express)

```javascript
import express from 'express';

const app = express();

// SSE endpoint
app.get('/api/events', (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx uchun

  // CORS (kerak bo'lsa)
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Initial connection message
  res.write('data: Connected\n\n');

  // Client ID
  const clientId = Date.now();

  // Client'ni ro'yxatga olish
  clients.set(clientId, res);

  // Heartbeat (connection alive saqlash)
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(clientId);
  });
});

// Barcha client'larga xabar yuborish
function broadcast(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((client) => {
    client.write(message);
  });
}

// Bitta client'ga xabar yuborish
function sendToClient(clientId, event, data) {
  const client = clients.get(clientId);
  if (client) {
    client.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}
```

## Production-Ready SSE Implementation

### Server (Node.js)

```javascript
class SSEManager {
  constructor() {
    this.clients = new Map();
    this.channels = new Map();
    this.messageId = 0;
  }

  // Client connection
  handleConnection(req, res, userId) {
    const clientId = `${userId}-${Date.now()}`;

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    // Last-Event-ID dan davom ettirish
    const lastEventId = req.headers['last-event-id'];
    if (lastEventId) {
      this.replayEvents(res, parseInt(lastEventId));
    }

    // Client ma'lumotlari
    const client = {
      id: clientId,
      userId,
      res,
      channels: new Set(),
      connectedAt: Date.now()
    };

    this.clients.set(clientId, client);

    // Heartbeat
    const heartbeatInterval = setInterval(() => {
      if (!res.writableEnded) {
        res.write(': heartbeat\n\n');
      }
    }, 25000);

    // Retry interval
    res.write('retry: 5000\n\n');

    // Initial event
    this.sendEvent(res, 'connected', {
      clientId,
      serverTime: Date.now()
    });

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      this.removeClient(clientId);
    });

    return clientId;
  }

  // Channel subscription
  subscribe(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.channels.add(channel);

    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel).add(clientId);

    this.sendEvent(client.res, 'subscribed', { channel });
  }

  // Channel unsubscription
  unsubscribe(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.channels.delete(channel);

    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
    }

    this.sendEvent(client.res, 'unsubscribed', { channel });
  }

  // Event yuborish
  sendEvent(res, event, data, id = null) {
    if (res.writableEnded) return;

    const eventId = id || ++this.messageId;
    let message = `id: ${eventId}\n`;
    message += `event: ${event}\n`;
    message += `data: ${JSON.stringify(data)}\n\n`;

    res.write(message);
  }

  // Channel'ga broadcast
  broadcastToChannel(channel, event, data) {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    const eventId = ++this.messageId;

    channelClients.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && !client.res.writableEnded) {
        this.sendEvent(client.res, event, data, eventId);
      }
    });

    // Event'ni cache qilish (replay uchun)
    this.cacheEvent(eventId, channel, event, data);
  }

  // User'ga yuborish
  sendToUser(userId, event, data) {
    this.clients.forEach((client) => {
      if (client.userId === userId && !client.res.writableEnded) {
        this.sendEvent(client.res, event, data);
      }
    });
  }

  // Client olib tashlash
  removeClient(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Channel'lardan olib tashlash
    client.channels.forEach((channel) => {
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(clientId);
      }
    });

    this.clients.delete(clientId);
  }

  // Event cache (replay uchun)
  eventCache = [];
  maxCacheSize = 1000;

  cacheEvent(id, channel, event, data) {
    this.eventCache.push({
      id,
      channel,
      event,
      data,
      timestamp: Date.now()
    });

    // Cache size limit
    if (this.eventCache.length > this.maxCacheSize) {
      this.eventCache = this.eventCache.slice(-this.maxCacheSize);
    }
  }

  // Missed events replay
  replayEvents(res, lastEventId) {
    const missedEvents = this.eventCache.filter((e) => e.id > lastEventId);

    missedEvents.forEach((cached) => {
      this.sendEvent(res, cached.event, cached.data, cached.id);
    });
  }

  // Stats
  getStats() {
    return {
      totalClients: this.clients.size,
      channels: Object.fromEntries(
        Array.from(this.channels.entries()).map(([channel, clients]) => [
          channel,
          clients.size
        ])
      )
    };
  }
}

// Express middleware
const sseManager = new SSEManager();

app.get('/api/events', authenticateUser, (req, res) => {
  const clientId = sseManager.handleConnection(req, res, req.user.id);

  // Auto-subscribe to user channel
  sseManager.subscribe(clientId, `user:${req.user.id}`);
});

app.post('/api/events/subscribe', authenticateUser, (req, res) => {
  const { clientId, channel } = req.body;
  sseManager.subscribe(clientId, channel);
  res.json({ success: true });
});
```

### Client (Production-Ready)

```javascript
class SSEClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      withCredentials: true,
      maxRetries: 10,
      retryInterval: 5000,
      ...options
    };

    this.eventSource = null;
    this.retryCount = 0;
    this.eventHandlers = new Map();
    this.state = 'disconnected';
    this.lastEventId = null;
  }

  connect() {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }

    this.state = 'connecting';
    this.emit('stateChange', this.state);

    try {
      // URL with last event ID
      const url = new URL(this.url, window.location.origin);
      if (this.lastEventId) {
        url.searchParams.set('lastEventId', this.lastEventId);
      }

      this.eventSource = new EventSource(url.toString(), {
        withCredentials: this.options.withCredentials
      });

      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error);
    }
  }

  setupEventHandlers() {
    this.eventSource.onopen = () => {
      this.state = 'connected';
      this.retryCount = 0;
      this.emit('stateChange', this.state);
      this.emit('connected');
    };

    this.eventSource.onerror = (event) => {
      if (this.eventSource.readyState === EventSource.CLOSED) {
        this.handleDisconnect();
      } else if (this.eventSource.readyState === EventSource.CONNECTING) {
        this.state = 'reconnecting';
        this.emit('stateChange', this.state);
      }
    };

    // Default message handler
    this.eventSource.onmessage = (event) => {
      this.handleEvent('message', event);
    };
  }

  // Custom event subscription
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());

      // EventSource'ga listener qo'shish
      if (this.eventSource && eventType !== 'message') {
        this.eventSource.addEventListener(eventType, (event) => {
          this.handleEvent(eventType, event);
        });
      }
    }

    this.eventHandlers.get(eventType).add(handler);

    return () => this.off(eventType, handler);
  }

  off(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  handleEvent(eventType, event) {
    // Update last event ID
    if (event.lastEventId) {
      this.lastEventId = event.lastEventId;
    }

    // Parse data
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      data = event.data;
    }

    // Call handlers
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data, event);
        } catch (error) {
          console.error(`Handler error for ${eventType}:`, error);
        }
      });
    }
  }

  handleDisconnect() {
    this.state = 'disconnected';
    this.emit('stateChange', this.state);

    if (this.retryCount < this.options.maxRetries) {
      this.retryCount++;
      const delay = this.options.retryInterval * this.retryCount;

      setTimeout(() => {
        this.emit('reconnecting', { attempt: this.retryCount });
        this.connect();
      }, delay);
    } else {
      this.emit('maxRetriesReached');
    }
  }

  handleError(error) {
    console.error('SSE Error:', error);
    this.emit('error', error);
  }

  emit(eventType, data) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  // HTTP POST orqali server'ga xabar yuborish
  async send(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      return response.json();
    } catch (error) {
      console.error('Send error:', error);
      throw error;
    }
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.state = 'disconnected';
    this.emit('stateChange', this.state);
  }

  get isConnected() {
    return this.state === 'connected';
  }
}
```

## Real-World Case: Stock Price Updates

### Server

```javascript
class StockPriceService {
  constructor(sseManager) {
    this.sseManager = sseManager;
    this.prices = new Map();
    this.subscribers = new Map();
  }

  // Price update'larni simulate qilish
  startPriceUpdates() {
    setInterval(() => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

      symbols.forEach((symbol) => {
        // Random price change
        const currentPrice = this.prices.get(symbol) || 100;
        const change = (Math.random() - 0.5) * 2;
        const newPrice = Math.max(1, currentPrice + change);

        this.prices.set(symbol, newPrice);

        // Broadcast to subscribers
        this.broadcastPriceUpdate(symbol, {
          symbol,
          price: newPrice.toFixed(2),
          change: change.toFixed(2),
          changePercent: ((change / currentPrice) * 100).toFixed(2),
          timestamp: Date.now()
        });
      });
    }, 1000);
  }

  broadcastPriceUpdate(symbol, data) {
    this.sseManager.broadcastToChannel(`stock:${symbol}`, 'priceUpdate', data);
  }

  // Watchlist update
  updateWatchlist(userId, symbols) {
    const current = this.subscribers.get(userId) || new Set();

    // Yangi subscription'lar
    symbols.forEach((symbol) => {
      if (!current.has(symbol)) {
        this.sseManager.clients.forEach((client) => {
          if (client.userId === userId) {
            this.sseManager.subscribe(client.id, `stock:${symbol}`);
          }
        });
      }
    });

    // Eski subscription'larni olib tashlash
    current.forEach((symbol) => {
      if (!symbols.includes(symbol)) {
        this.sseManager.clients.forEach((client) => {
          if (client.userId === userId) {
            this.sseManager.unsubscribe(client.id, `stock:${symbol}`);
          }
        });
      }
    });

    this.subscribers.set(userId, new Set(symbols));
  }
}

// Routes
app.get('/api/stocks/stream', authenticateUser, (req, res) => {
  const clientId = sseManager.handleConnection(req, res, req.user.id);

  // User's watchlist'iga auto-subscribe
  const watchlist = getUserWatchlist(req.user.id);
  watchlist.forEach((symbol) => {
    sseManager.subscribe(clientId, `stock:${symbol}`);
  });

  // Initial prices
  watchlist.forEach((symbol) => {
    const price = stockService.prices.get(symbol);
    if (price) {
      sseManager.sendEvent(res, 'priceUpdate', {
        symbol,
        price: price.toFixed(2)
      });
    }
  });
});

app.post('/api/stocks/watchlist', authenticateUser, (req, res) => {
  const { symbols } = req.body;
  stockService.updateWatchlist(req.user.id, symbols);
  res.json({ success: true });
});
```

### Client (Vue.js)

```vue
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { SSEClient } from '@/utils/sse';

const stocks = ref(new Map());
const connectionState = ref('disconnected');

let sseClient = null;

onMounted(() => {
  sseClient = new SSEClient('/api/stocks/stream');

  sseClient.on('stateChange', (state) => {
    connectionState.value = state;
  });

  sseClient.on('priceUpdate', (data) => {
    stocks.value.set(data.symbol, {
      ...data,
      previousPrice: stocks.value.get(data.symbol)?.price
    });
  });

  sseClient.connect();
});

onUnmounted(() => {
  sseClient?.close();
});

const stockList = computed(() => {
  return Array.from(stocks.value.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
});

async function addToWatchlist(symbol) {
  await sseClient.send('/api/stocks/watchlist', {
    symbols: [...stocks.value.keys(), symbol]
  });
}
</script>

<template>
  <div class="stock-dashboard">
    <div :class="['connection-status', connectionState]">
      {{ connectionState }}
    </div>

    <table class="stock-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Price</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in stockList" :key="stock.symbol">
          <td>{{ stock.symbol }}</td>
          <td :class="{ flash: stock.price !== stock.previousPrice }">
            ${{ stock.price }}
          </td>
          <td :class="{ positive: stock.change > 0, negative: stock.change < 0 }">
            {{ stock.change > 0 ? '+' : '' }}{{ stock.change }}
            ({{ stock.changePercent }}%)
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.flash {
  animation: flash 0.3s ease;
}

@keyframes flash {
  0% { background-color: yellow; }
  100% { background-color: transparent; }
}

.positive { color: green; }
.negative { color: red; }
</style>
```

## NOTO'G'RI vs TO'G'RI Kodlar

### 1. Memory Leak

```javascript
// NOTO'G'RI: EventSource yopilmagan
useEffect(() => {
  const eventSource = new EventSource('/api/events');
  eventSource.onmessage = handleMessage;
}, []);

// TO'G'RI: Cleanup bilan
useEffect(() => {
  const eventSource = new EventSource('/api/events');
  eventSource.onmessage = handleMessage;

  return () => {
    eventSource.close();
  };
}, []);
```

### 2. Server-Side Buffer

```javascript
// NOTO'G'RI: Response buffering
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  // Xato: Cache-Control yo'q, nginx buffer
});

// TO'G'RI: Buffer'larni o'chirish
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx
  res.flushHeaders(); // Headers'ni darhol yuborish
});
```

### 3. Error Handling

```javascript
// NOTO'G'RI: Error'da hang bo'lib qoladi
eventSource.onerror = (e) => {
  console.error('SSE error');
};

// TO'G'RI: State-based handling
eventSource.onerror = (event) => {
  switch (eventSource.readyState) {
    case EventSource.CONNECTING:
      console.log('Reconnecting...');
      updateUI('reconnecting');
      break;
    case EventSource.CLOSED:
      console.log('Connection failed permanently');
      updateUI('disconnected');
      // Fallback to polling
      startPolling();
      break;
  }
};
```

### 4. JSON Parsing

```javascript
// NOTO'G'RI: Parse error handling yo'q
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleData(data);
};

// TO'G'RI: Safe parsing
eventSource.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (validateData(data)) {
      handleData(data);
    }
  } catch (error) {
    console.error('Invalid message:', event.data);
  }
};
```

### 5. Connection Limit

```javascript
// NOTO'G'RI: Har component o'z connection'iga ega
function Component1() {
  useEffect(() => {
    const es = new EventSource('/api/events'); // Connection 1
  }, []);
}

function Component2() {
  useEffect(() => {
    const es = new EventSource('/api/events'); // Connection 2
  }, []);
}

// Browser limit: 6 connections per domain!

// TO'G'RI: Shared connection
// sseService.js
let sharedConnection = null;
const listeners = new Map();

export function subscribe(channel, handler) {
  if (!sharedConnection) {
    sharedConnection = new EventSource('/api/events');
    sharedConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      listeners.forEach((handlers, ch) => {
        if (ch === data.channel) {
          handlers.forEach((h) => h(data));
        }
      });
    };
  }

  if (!listeners.has(channel)) {
    listeners.set(channel, new Set());
  }
  listeners.get(channel).add(handler);

  return () => {
    listeners.get(channel).delete(handler);
    if (listeners.get(channel).size === 0) {
      listeners.delete(channel);
    }
    if (listeners.size === 0) {
      sharedConnection.close();
      sharedConnection = null;
    }
  };
}
```

## Reconnect Bug'larni Hal Qilish

### 1. Missed Events on Reconnect

```javascript
// MUAMMO: Reconnect paytida event'lar yo'qoladi

// YECHIM: Last-Event-ID
// Server
app.get('/api/events', (req, res) => {
  const lastEventId = req.headers['last-event-id'];

  if (lastEventId) {
    // Missed event'larni yuborish
    const missedEvents = getEventsSince(parseInt(lastEventId));
    missedEvents.forEach((event) => {
      res.write(`id: ${event.id}\nevent: ${event.type}\ndata: ${event.data}\n\n`);
    });
  }
});

// Client
// EventSource avtomatik Last-Event-ID yuboradi
// Lekin custom implementation:
class ReliableSSE {
  connect() {
    const url = new URL(this.url);
    if (this.lastEventId) {
      url.searchParams.set('lastEventId', this.lastEventId);
    }

    this.eventSource = new EventSource(url.toString());

    this.eventSource.onmessage = (event) => {
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
        localStorage.setItem('sse_lastEventId', this.lastEventId);
      }
      this.handleMessage(event);
    };
  }
}
```

### 2. Infinite Reconnect Loop

```javascript
// MUAMMO: 401/403 da cheksiz reconnect

// YECHIM: Auth error'da reconnect to'xtatish
eventSource.onerror = (event) => {
  // EventSource API xato kodini bermaydi
  // Server side'da boshqacha yo'l:
  // 204 No Content qaytarish (connection yopiladi, auto-reconnect bo'lmaydi)
};

// Server
app.get('/api/events', (req, res) => {
  if (!req.user) {
    res.status(204).end(); // No auto-reconnect
    return;
  }
  // ... normal SSE
});

// Yoki client-side workaround
async function connectWithAuth() {
  // Avval auth check
  const authResponse = await fetch('/api/auth/check');
  if (!authResponse.ok) {
    throw new Error('Not authenticated');
  }

  // Keyin SSE
  return new EventSource('/api/events');
}
```

### 3. Tab Visibility Optimization

```javascript
// MUAMMO: Background tab'da keraksiz connection

// YECHIM: Visibility API
class SmartSSE {
  constructor(url) {
    this.url = url;
    this.eventSource = null;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  pause() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  resume() {
    if (!this.eventSource) {
      this.connect();
    }
  }
}
```

### 4. Stale Connection Detection

```javascript
// MUAMMO: Connection "o'lik" bo'lib qoladi (no error, no data)

// YECHIM: Heartbeat timeout
class SSEWithHeartbeat {
  constructor(url, heartbeatTimeout = 45000) {
    this.url = url;
    this.heartbeatTimeout = heartbeatTimeout;
    this.lastMessageTime = Date.now();
    this.checkInterval = null;
  }

  connect() {
    this.eventSource = new EventSource(this.url);

    this.eventSource.onmessage = (event) => {
      this.lastMessageTime = Date.now();
      this.handleMessage(event);
    };

    // Heartbeat check
    this.checkInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      if (timeSinceLastMessage > this.heartbeatTimeout) {
        console.warn('SSE heartbeat timeout, reconnecting...');
        this.reconnect();
      }
    }, 10000);
  }

  reconnect() {
    this.close();
    this.connect();
  }

  close() {
    clearInterval(this.checkInterval);
    this.eventSource?.close();
  }
}
```

## HTTP/2 va SSE

HTTP/2 bilan SSE afzalliklari:

1. **Multiplexing:** Bir connection'da ko'p stream
2. **No connection limit:** HTTP/1.1 dagi 6 connection limit yo'q
3. **Header compression:** Kamroq overhead

```javascript
// HTTP/2 enabled server (Node.js)
import { createSecureServer } from 'http2';
import fs from 'fs';

const server = createSecureServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
});

server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/api/events') {
    stream.respond({
      ':status': 200,
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache'
    });

    // SSE events
    setInterval(() => {
      stream.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
    }, 1000);
  }
});

server.listen(8443);
```

## Interview Savollari

### 1. SSE va WebSocket qachon ishlatiladi?

**Javob:**

**SSE ishlatish:**
- Server → Client only (news feed, notifications)
- Auto-reconnect kerak
- HTTP infrastructure bilan ishlash
- Simple implementation kerak
- Text data yetarli

**WebSocket ishlatish:**
- Bidirectional communication (chat, gaming)
- Binary data kerak
- Minimal latency muhim
- Custom protocol kerak

### 2. SSE connection limit muammosini qanday hal qilasiz?

**Javob:**
1. **Shared connection:** Bir EventSource, ko'p listener
2. **HTTP/2:** Connection multiplexing
3. **Service Worker:** Background'da connection boshqarish
4. **Tab coordination:** BroadcastChannel API

```javascript
// BroadcastChannel bilan tab coordination
const channel = new BroadcastChannel('sse-data');

// Leader tab
if (isLeader) {
  const es = new EventSource('/api/events');
  es.onmessage = (e) => channel.postMessage(e.data);
}

// Follower tabs
channel.onmessage = (e) => handleData(e.data);
```

### 3. Last-Event-ID qanday ishlaydi?

**Javob:**
1. Server har event'ga `id` beradi
2. Client connection uzilganda oxirgi `id`ni eslab qoladi
3. Reconnect'da `Last-Event-ID` header yuboriladi
4. Server shu ID'dan keyingi event'larni yuboradi

```javascript
// Server
res.write(`id: ${eventId}\ndata: ${data}\n\n`);

// Client reconnect'da avtomatik:
// GET /events
// Last-Event-ID: 12345
```

### 4. SSE vs Long Polling farqi?

**Javob:**
| Xususiyat | SSE | Long Polling |
|-----------|-----|--------------|
| Connection | Persistent | Har xabar uchun yangi |
| Overhead | Minimal | HTTP headers har safar |
| Reconnect | Automatic | Manual |
| Browser support | Modern | Universal |
| Multiple events | Bir response'da | Bir event per request |

### 5. SSE'da authentication qanday qilinadi?

**Javob:**
1. **Cookie-based:** `withCredentials: true`
2. **URL token:** `/api/events?token=xxx` (xavfsiz emas)
3. **Initial handshake:** Avval POST bilan auth, keyin SSE

```javascript
// Recommended: Cookie-based
const es = new EventSource('/api/events', {
  withCredentials: true // Cookie yuboriladi
});

// Server
app.get('/api/events', (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!validateSession(sessionId)) {
    res.status(204).end(); // No reconnect
    return;
  }
  // SSE start
});
```

## Xulosa

SSE - server'dan client'ga real-time data streaming uchun oddiy va samarali yechim:

1. **Simple API:** EventSource browser'da built-in
2. **Auto-reconnect:** Browser avtomatik reconnect qiladi
3. **HTTP compatible:** Proxy, firewall muammolari kam
4. **Last-Event-ID:** Missed message'larni tiklash mumkin

Production'da e'tibor bering:
- Connection limit (HTTP/2 yoki shared connection)
- Heartbeat (stale connection detection)
- Buffer'larni o'chirish (nginx, proxy)
- Proper cleanup (memory leak oldini olish)

Keyingi bo'lim: [Polling Strategies](./03-polling.md)
