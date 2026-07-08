# WebSocket

## Kirish

WebSocket - bu client va server o'rtasida doimiy, full-duplex aloqa kanalini ta'minlovchi protokol. HTTP'dan farqli o'laroq, bir marta connection o'rnatilgandan keyin ikkala tomon ham istalgan vaqtda ma'lumot yuborishi mumkin.

## WebSocket Protocol Anatomiyasi

### HTTP Handshake

WebSocket aloqasi HTTP Upgrade so'rovi bilan boshlanadi:

```
Client Request:
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com

Server Response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

### Frame Structure

```
      0                   1                   2                   3
      0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
     +-+-+-+-+-------+-+-------------+-------------------------------+
     |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
     |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
     |N|V|V|V|       |S|             |   (if payload len==126/127)   |
     | |1|2|3|       |K|             |                               |
     +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
     |     Extended payload length continued, if payload len == 127  |
     + - - - - - - - - - - - - - - - +-------------------------------+
     |                               |Masking-key, if MASK set to 1  |
     +-------------------------------+-------------------------------+
     | Masking-key (continued)       |          Payload Data         |
     +-------------------------------- - - - - - - - - - - - - - - - +
     :                     Payload Data continued ...                :
     + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
     |                     Payload Data continued ...                |
     +---------------------------------------------------------------+
```

**Opcode turlari:**
- `0x0` - Continuation frame
- `0x1` - Text frame (UTF-8)
- `0x2` - Binary frame
- `0x8` - Connection close
- `0x9` - Ping
- `0xA` - Pong

## Asosiy API

### Client-Side (Browser)

```javascript
// Connection yaratish
const ws = new WebSocket('wss://api.example.com/ws');

// Connection ochilganda
ws.onopen = (event) => {
  console.log('Connected to server');
  ws.send(JSON.stringify({ type: 'subscribe', channel: 'updates' }));
};

// Xabar kelganda
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Connection yopilganda
ws.onclose = (event) => {
  console.log(`Closed: ${event.code} - ${event.reason}`);
};

// Xatolik yuz berganda
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Xabar yuborish
ws.send('Hello Server!');

// Connection yopish
ws.close(1000, 'Normal closure');
```

### Server-Side (Node.js with ws library)

```javascript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, request) => {
  const clientIp = request.socket.remoteAddress;
  console.log(`New client connected: ${clientIp}`);

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());
    console.log('Received:', data);

    // Echo back
    ws.send(JSON.stringify({ type: 'echo', data }));
  });

  ws.on('close', (code, reason) => {
    console.log(`Client disconnected: ${code} - ${reason}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Heartbeat
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Heartbeat interval
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeat);
});
```

## Production-Ready WebSocket Client

### Connection Manager Class

```javascript
class WebSocketManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: 10,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      heartbeatInterval: 30000,
      messageTimeout: 5000,
      ...options
    };

    this.ws = null;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.pendingMessages = new Map();
    this.eventHandlers = new Map();
    this.state = 'disconnected';
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
  }

  connect() {
    if (this.state === 'connecting' || this.state === 'connected') {
      return;
    }

    this.state = 'connecting';
    this.emit('stateChange', this.state);

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error);
    }
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      this.state = 'connected';
      this.reconnectAttempts = 0;
      this.emit('stateChange', this.state);
      this.emit('connected');

      // Queued xabarlarni yuborish
      this.flushMessageQueue();

      // Heartbeat boshlash
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onclose = (event) => {
      this.cleanup();

      if (event.code === 1000) {
        // Normal closure
        this.state = 'disconnected';
        this.emit('stateChange', this.state);
        return;
      }

      // Abnormal closure - reconnect
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      this.handleError(error);
    };
  }

  handleMessage(message) {
    // Pong response
    if (message.type === 'pong') {
      return;
    }

    // Acknowledgment
    if (message.type === 'ack' && message.id) {
      const pending = this.pendingMessages.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(message);
        this.pendingMessages.delete(message.id);
      }
      return;
    }

    // Regular message
    this.emit('message', message);
    this.emit(message.type, message);
  }

  send(type, payload, options = {}) {
    const message = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now()
    };

    if (this.state !== 'connected') {
      // Queue message for later
      this.messageQueue.push(message);
      return Promise.resolve({ queued: true, id: message.id });
    }

    return this.sendImmediate(message, options);
  }

  sendImmediate(message, options = {}) {
    return new Promise((resolve, reject) => {
      const { requireAck = false, timeout = this.options.messageTimeout } = options;

      try {
        this.ws.send(JSON.stringify(message));

        if (!requireAck) {
          resolve({ sent: true, id: message.id });
          return;
        }

        // Wait for acknowledgment
        const timeoutId = setTimeout(() => {
          this.pendingMessages.delete(message.id);
          reject(new Error(`Message timeout: ${message.id}`));
        }, timeout);

        this.pendingMessages.set(message.id, {
          resolve,
          reject,
          timeout: timeoutId
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendImmediate(message).catch(console.error);
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.options.heartbeatInterval);
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.state = 'failed';
      this.emit('stateChange', this.state);
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.state = 'reconnecting';
    this.emit('stateChange', this.state);

    const delay = Math.min(
      this.options.reconnectInterval *
        Math.pow(this.options.reconnectDecay, this.reconnectAttempts),
      this.options.maxReconnectInterval
    );

    // Jitter qo'shish (0-25% random delay)
    const jitter = delay * Math.random() * 0.25;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
      this.connect();
    }, delay + jitter);
  }

  cleanup() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Pending messages'larni reject qilish
    this.pendingMessages.forEach((pending) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    });
    this.pendingMessages.clear();
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.emit('error', error);
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close(1000, 'Client initiated disconnect');
    }
    this.state = 'disconnected';
    this.emit('stateChange', this.state);
  }

  // Event emitter methods
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event, ...args) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  get isConnected() {
    return this.state === 'connected';
  }

  get connectionState() {
    return this.state;
  }
}
```

### Ishlatish

```javascript
const wsManager = new WebSocketManager('wss://api.example.com/ws', {
  maxReconnectAttempts: 15,
  heartbeatInterval: 25000
});

// Event handlers
wsManager.on('connected', () => {
  console.log('Connected!');
  wsManager.send('subscribe', { channels: ['trades', 'orderbook'] });
});

wsManager.on('stateChange', (state) => {
  console.log('Connection state:', state);
  updateUIConnectionIndicator(state);
});

wsManager.on('message', (message) => {
  console.log('Received:', message);
});

wsManager.on('trades', (message) => {
  updateTradesUI(message.payload);
});

wsManager.on('error', (error) => {
  console.error('Error:', error);
});

// Connect
wsManager.connect();

// Send with acknowledgment
async function placeOrder(order) {
  try {
    const response = await wsManager.send('order', order, {
      requireAck: true,
      timeout: 10000
    });
    console.log('Order confirmed:', response);
  } catch (error) {
    console.error('Order failed:', error);
  }
}
```

## Binary Data bilan Ishlash

### Binary Data Yuborish

```javascript
// ArrayBuffer yuborish
const buffer = new ArrayBuffer(8);
const view = new DataView(buffer);
view.setFloat64(0, 123.456);
ws.send(buffer);

// Blob yuborish
const blob = new Blob(['Hello'], { type: 'text/plain' });
ws.send(blob);

// TypedArray yuborish
const uint8 = new Uint8Array([1, 2, 3, 4]);
ws.send(uint8.buffer);
```

### Binary Data Qabul Qilish

```javascript
ws.binaryType = 'arraybuffer'; // yoki 'blob'

ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    const view = new DataView(event.data);
    const value = view.getFloat64(0);
    console.log('Binary data:', value);
  } else {
    // Text data
    console.log('Text data:', event.data);
  }
};
```

### Protocol Buffers bilan

```javascript
import { Message } from './proto/message_pb.js';

class BinaryWebSocket {
  constructor(ws) {
    this.ws = ws;
    this.ws.binaryType = 'arraybuffer';
  }

  send(message) {
    const bytes = message.serializeBinary();
    this.ws.send(bytes);
  }

  onMessage(callback) {
    this.ws.onmessage = (event) => {
      const bytes = new Uint8Array(event.data);
      const message = Message.deserializeBinary(bytes);
      callback(message.toObject());
    };
  }
}
```

## Real-World Case: Trading Dashboard

```javascript
class TradingWebSocket extends WebSocketManager {
  constructor(url) {
    super(url, {
      heartbeatInterval: 15000,
      maxReconnectAttempts: 20
    });

    this.subscriptions = new Set();
    this.orderBook = new Map();
    this.lastSequence = 0;
  }

  subscribeSymbol(symbol) {
    this.subscriptions.add(symbol);

    if (this.isConnected) {
      this.send('subscribe', {
        channels: ['orderbook', 'trades'],
        symbol
      });
    }
  }

  unsubscribeSymbol(symbol) {
    this.subscriptions.delete(symbol);

    if (this.isConnected) {
      this.send('unsubscribe', { symbol });
    }
  }

  // Reconnect'dan keyin subscription'larni tiklash
  onConnected() {
    this.subscriptions.forEach((symbol) => {
      this.send('subscribe', {
        channels: ['orderbook', 'trades'],
        symbol
      });
    });

    // Snapshot so'rash
    this.send('snapshot', {
      symbols: Array.from(this.subscriptions)
    });
  }

  handleOrderBookUpdate(update) {
    // Sequence check - gap bo'lsa snapshot so'rash
    if (update.sequence !== this.lastSequence + 1) {
      console.warn('Sequence gap detected, requesting snapshot');
      this.send('snapshot', { symbol: update.symbol });
      return;
    }

    this.lastSequence = update.sequence;

    // Order book yangilash
    const book = this.orderBook.get(update.symbol) || { bids: [], asks: [] };

    update.bids.forEach(([price, size]) => {
      if (size === 0) {
        book.bids = book.bids.filter((b) => b[0] !== price);
      } else {
        const index = book.bids.findIndex((b) => b[0] === price);
        if (index >= 0) {
          book.bids[index] = [price, size];
        } else {
          book.bids.push([price, size]);
          book.bids.sort((a, b) => b[0] - a[0]); // Descending
        }
      }
    });

    this.orderBook.set(update.symbol, book);
    this.emit('orderbookUpdate', { symbol: update.symbol, book });
  }
}

// Ishlatish
const trading = new TradingWebSocket('wss://trading.example.com/ws');

trading.on('connected', () => {
  trading.onConnected();
});

trading.on('orderbook', (message) => {
  trading.handleOrderBookUpdate(message.payload);
});

trading.on('orderbookUpdate', ({ symbol, book }) => {
  renderOrderBook(symbol, book);
});

trading.connect();
trading.subscribeSymbol('BTC-USDT');
```

## NOTO'G'RI vs TO'G'RI Kodlar

### 1. Connection Lifecycle

```javascript
// NOTO'G'RI: Cleanup yo'q
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = handleMessage;
}, []);

// TO'G'RI: Proper cleanup
useEffect(() => {
  const ws = new WebSocket(url);
  ws.onmessage = handleMessage;

  return () => {
    ws.close(1000, 'Component unmounted');
  };
}, []);
```

### 2. Reconnection Logic

```javascript
// NOTO'G'RI: Thundering herd
ws.onclose = () => {
  setTimeout(() => new WebSocket(url), 1000);
};

// TO'G'RI: Exponential backoff with jitter
ws.onclose = () => {
  const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
  const jitter = delay * Math.random() * 0.25;
  setTimeout(() => {
    attempts++;
    connect();
  }, delay + jitter);
};
```

### 3. Message Handling

```javascript
// NOTO'G'RI: Parse error handling yo'q
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  processData(data);
};

// TO'G'RI: Robust error handling
ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (!validateMessage(data)) {
      console.warn('Invalid message format:', data);
      return;
    }
    processData(data);
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
};
```

### 4. State Management

```javascript
// NOTO'G'RI: State race condition
ws.onopen = () => {
  isConnected = true;
  sendQueuedMessages();
};
ws.onclose = () => {
  isConnected = false;
};

// Muammo: onclose va onopen o'rtasida race condition

// TO'G'RI: State machine
const STATE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting'
};

function transition(newState) {
  const validTransitions = {
    [STATE.DISCONNECTED]: [STATE.CONNECTING],
    [STATE.CONNECTING]: [STATE.CONNECTED, STATE.DISCONNECTED],
    [STATE.CONNECTED]: [STATE.DISCONNECTED],
    [STATE.RECONNECTING]: [STATE.CONNECTING, STATE.DISCONNECTED]
  };

  if (validTransitions[currentState]?.includes(newState)) {
    currentState = newState;
    emit('stateChange', newState);
  }
}
```

### 5. Memory Leak

```javascript
// NOTO'G'RI: Event listeners to'planib qoladi
function subscribe(channel) {
  ws.addEventListener('message', (event) => {
    if (event.data.channel === channel) {
      handleChannelMessage(event.data);
    }
  });
}

// TO'G'RI: Cleanup function
function subscribe(channel) {
  const handler = (event) => {
    if (event.data.channel === channel) {
      handleChannelMessage(event.data);
    }
  };

  ws.addEventListener('message', handler);

  return () => {
    ws.removeEventListener('message', handler);
  };
}
```

## Reconnect Bug'larni Hal Qilish

### 1. Stale Closure

```javascript
// MUAMMO: reconnect qilganda eski ws instance ishlatiladi
let ws = new WebSocket(url);

function sendMessage(msg) {
  ws.send(msg); // reconnect'dan keyin eski ws
}

// YECHIM: Reference yangilash
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    // ...
  }

  send(msg) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(msg);
    }
  }
}
```

### 2. Race Condition on Reconnect

```javascript
// MUAMMO: Bir nechta reconnect bir vaqtda
ws.onclose = () => {
  setTimeout(connect, 1000);
};

// YECHIM: Flag bilan
let isReconnecting = false;

ws.onclose = () => {
  if (isReconnecting) return;
  isReconnecting = true;

  setTimeout(() => {
    connect();
    isReconnecting = false;
  }, 1000);
};

// Yoki cancel qilinadigan timeout
let reconnectTimeout = null;

ws.onclose = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  reconnectTimeout = setTimeout(connect, 1000);
};
```

### 3. Message Loss During Reconnect

```javascript
// MUAMMO: Reconnect paytida xabarlar yo'qoladi

// YECHIM: Message queue
class ReliableWebSocket {
  constructor(url) {
    this.queue = [];
    this.unacknowledged = new Map();
  }

  send(message) {
    const id = generateId();
    const envelope = { id, message, timestamp: Date.now() };

    if (this.isConnected) {
      this.ws.send(JSON.stringify(envelope));
      this.unacknowledged.set(id, envelope);
    } else {
      this.queue.push(envelope);
    }
  }

  onConnect() {
    // Unacknowledged xabarlarni qayta yuborish
    this.unacknowledged.forEach((envelope) => {
      this.ws.send(JSON.stringify(envelope));
    });

    // Queue'dagi xabarlarni yuborish
    while (this.queue.length > 0) {
      const envelope = this.queue.shift();
      this.ws.send(JSON.stringify(envelope));
      this.unacknowledged.set(envelope.id, envelope);
    }
  }

  onAck(id) {
    this.unacknowledged.delete(id);
  }
}
```

### 4. Subscription State Loss

```javascript
// MUAMMO: Reconnect'dan keyin subscription'lar yo'qoladi

// YECHIM: Subscription tracking
class SubscriptionManager {
  constructor(ws) {
    this.ws = ws;
    this.subscriptions = new Map();

    this.ws.on('connected', () => this.resubscribeAll());
  }

  subscribe(channel, options = {}) {
    this.subscriptions.set(channel, options);

    if (this.ws.isConnected) {
      this.ws.send('subscribe', { channel, ...options });
    }
  }

  unsubscribe(channel) {
    this.subscriptions.delete(channel);

    if (this.ws.isConnected) {
      this.ws.send('unsubscribe', { channel });
    }
  }

  resubscribeAll() {
    this.subscriptions.forEach((options, channel) => {
      this.ws.send('subscribe', { channel, ...options });
    });
  }
}
```

## Vue.js bilan Integration

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useWebSocket(url, options = {}) {
  const data = ref(null);
  const error = ref(null);
  const state = ref('disconnected');

  let ws = null;
  let reconnectAttempts = 0;
  const maxAttempts = options.maxAttempts || 10;

  function connect() {
    state.value = 'connecting';
    ws = new WebSocket(url);

    ws.onopen = () => {
      state.value = 'connected';
      reconnectAttempts = 0;
      options.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        data.value = JSON.parse(event.data);
        options.onMessage?.(data.value);
      } catch (e) {
        error.value = e;
      }
    };

    ws.onerror = (e) => {
      error.value = e;
      options.onError?.(e);
    };

    ws.onclose = (event) => {
      if (event.code !== 1000 && reconnectAttempts < maxAttempts) {
        state.value = 'reconnecting';
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, delay);
      } else {
        state.value = 'disconnected';
      }
    };
  }

  function send(message) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  function close() {
    ws?.close(1000, 'User initiated');
  }

  onMounted(connect);
  onUnmounted(close);

  return {
    data,
    error,
    state,
    send,
    close,
    reconnect: connect
  };
}
```

### Component'da Ishlatish

```vue
<script setup>
import { useWebSocket } from '@/composables/useWebSocket';

const { data, state, send } = useWebSocket('wss://api.example.com/ws', {
  onMessage: (msg) => {
    if (msg.type === 'notification') {
      showNotification(msg.payload);
    }
  }
});

function sendMessage() {
  send({ type: 'chat', text: message.value });
}
</script>

<template>
  <div>
    <div :class="['status', state]">{{ state }}</div>
    <div v-if="data">{{ data }}</div>
    <button @click="sendMessage">Send</button>
  </div>
</template>
```

## Interview Savollari

### 1. WebSocket va HTTP farqi nima?

**Javob:**
- **Protocol:** HTTP - request/response, WebSocket - full-duplex
- **Connection:** HTTP - har so'rov uchun yangi (HTTP/1.1 keep-alive bilan ham), WebSocket - doimiy
- **Overhead:** HTTP - har so'rovda headers, WebSocket - 2 byte frame header
- **Direction:** HTTP - client-initiated, WebSocket - bidirectional
- **Use case:** HTTP - REST API, WebSocket - realtime (chat, gaming, trading)

### 2. WebSocket handshake jarayonini tushuntiring

**Javob:**
1. Client HTTP Upgrade so'rovi yuboradi (`Upgrade: websocket`)
2. `Sec-WebSocket-Key` header - base64 encoded random key
3. Server 101 Switching Protocols bilan javob beradi
4. Server `Sec-WebSocket-Accept` yuboradi (Key + GUID ning SHA-1 hash, base64)
5. Connection WebSocket protokoliga o'tadi

### 3. Reconnection strategiyasini qanday implement qilasiz?

**Javob:**
```javascript
// Exponential backoff with jitter
function getReconnectDelay(attempt) {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = exponentialDelay * Math.random() * 0.25;
  return exponentialDelay + jitter;
}
```

**Nima uchun jitter:**
- Thundering herd muammosini oldini olish
- Barcha clientlar bir vaqtda reconnect qilmasligi uchun
- Server load distribution

### 4. WebSocket connection'ni qanday scale qilasiz?

**Javob:**
1. **Sticky Sessions:** Load balancer client'ni bir xil server'ga yo'naltiradi
2. **Redis Pub/Sub:** Server'lar o'rtasida message broadcast
3. **Shared State:** Connection state Redis/Memcached'da
4. **Horizontal Scaling:** Kubernetes + HPA

```
Client → Load Balancer → Server 1 ←→ Redis ←→ Server 2
                              ↑                   ↑
                              └───────────────────┘
```

### 5. WebSocket security qanday ta'minlanadi?

**Javob:**
1. **WSS (WebSocket Secure):** TLS encryption
2. **Origin validation:** `Sec-WebSocket-Origin` header tekshirish
3. **Authentication:**
   - Token in connection URL
   - First message'da auth
   - Cookie-based
4. **Rate limiting:** Message frequency limit
5. **Input validation:** Server-side message validation
6. **CSRF protection:** Origin checking

## Xulosa

WebSocket - bu realtime ilovalar uchun eng samarali texnologiya. Production'da ishlatishda quyidagilarga e'tibor bering:

1. **Robust reconnection** - exponential backoff + jitter
2. **State management** - connection state machine
3. **Message reliability** - acknowledgments, queue
4. **Proper cleanup** - memory leak oldini olish
5. **Monitoring** - connection metrics, latency tracking

Keyingi bo'lim: [Server-Sent Events](./02-sse.md)
