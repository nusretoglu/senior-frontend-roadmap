# Reconnect Strategies

## Kirish

Real-time ilovalar uchun connection'lar uzilishi muqarrar. Network instability, server restart, mobile network switch - bularning barchasi reconnection strategiyasini talab qiladi. Professional darajadagi reconnection - bu faqat qayta ulanish emas, balki user experience va server stability'ni hisobga olgan holda murakkab state machine.

## Connection State Machine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONNECTION STATE MACHINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         ┌──────────────┐                                │
│                         │ DISCONNECTED │◄───────────────────────────┐   │
│                         └──────┬───────┘                            │   │
│                                │                                    │   │
│                           connect()                                 │   │
│                                │                                    │   │
│                                ▼                                    │   │
│                         ┌──────────────┐                            │   │
│              ┌─────────►│  CONNECTING  │◄────────┐                  │   │
│              │          └──────┬───────┘         │                  │   │
│              │                 │                 │                  │   │
│              │          success/failure      timeout                │   │
│              │                 │                 │                  │   │
│              │    ┌────────────┴────────────┐    │                  │   │
│              │    │                         │    │                  │   │
│              │    ▼                         ▼    │                  │   │
│              │ ┌─────────┐         ┌─────────────┴──┐               │   │
│              │ │CONNECTED│         │  RECONNECTING  │───────────────┤   │
│              │ └────┬────┘         └────────────────┘               │   │
│              │      │                      ▲                        │   │
│              │   error/                    │                        │   │
│              │   close                     │                        │   │
│              │      │                      │                        │   │
│              │      └──────────────────────┘                        │   │
│              │                                                      │   │
│              │                                  max retries         │   │
│              │                                      │               │   │
│              │                                      ▼               │   │
│              │                              ┌──────────────┐        │   │
│              └──────────────────────────────│    FAILED    │────────┘   │
│                       manual retry          └──────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Exponential Backoff

### Asosiy Formula

```
delay = min(baseDelay * (multiplier ^ attempt), maxDelay)
```

### Implementation

```javascript
class ExponentialBackoff {
  constructor(options = {}) {
    this.options = {
      baseDelay: 1000,       // 1 second
      maxDelay: 30000,       // 30 seconds
      multiplier: 2,
      maxAttempts: 10,
      ...options
    };

    this.attempt = 0;
  }

  getNextDelay() {
    const delay = Math.min(
      this.options.baseDelay * Math.pow(this.options.multiplier, this.attempt),
      this.options.maxDelay
    );

    this.attempt++;
    return delay;
  }

  reset() {
    this.attempt = 0;
  }

  canRetry() {
    return this.attempt < this.options.maxAttempts;
  }

  // Decorator delay'ni kechiktirish uchun
  async wait() {
    const delay = this.getNextDelay();
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// Ishlatish
const backoff = new ExponentialBackoff();

async function connectWithBackoff() {
  while (backoff.canRetry()) {
    try {
      await connect();
      backoff.reset();
      return;
    } catch (error) {
      console.log(`Attempt ${backoff.attempt} failed`);
      await backoff.wait();
    }
  }
  throw new Error('Max reconnection attempts reached');
}
```

## Jitter (Randomization)

### Nima Uchun Kerak?

Jitter'siz barcha client'lar bir vaqtda reconnect qiladi (Thundering Herd):

```
Server restart qilindi
    │
    ▼
Time 0:  Client1, Client2, Client3, Client4, Client5 → Server OVERLOAD
Time 1s: Client1, Client2, Client3, Client4, Client5 → Server OVERLOAD
Time 2s: Client1, Client2, Client3, Client4, Client5 → Server OVERLOAD
```

Jitter bilan:

```
Server restart qilindi
    │
    ▼
Time 0.0s: Client3 → OK
Time 0.2s: Client1 → OK
Time 0.5s: Client5 → OK
Time 0.8s: Client2 → OK
Time 1.1s: Client4 → OK
```

### Jitter Strategiyalari

```javascript
class JitteredBackoff extends ExponentialBackoff {
  // Full Jitter: [0, calculatedDelay]
  getFullJitter() {
    const baseDelay = super.getNextDelay();
    return Math.random() * baseDelay;
  }

  // Equal Jitter: delay/2 + random(0, delay/2)
  getEqualJitter() {
    const baseDelay = super.getNextDelay();
    return (baseDelay / 2) + (Math.random() * baseDelay / 2);
  }

  // Decorrelated Jitter: min(maxDelay, random(baseDelay, previousDelay * 3))
  decorrelatedJitter = null;

  getDecorrelatedJitter() {
    if (this.decorrelatedJitter === null) {
      this.decorrelatedJitter = this.options.baseDelay;
    }

    this.decorrelatedJitter = Math.min(
      this.options.maxDelay,
      this.options.baseDelay + Math.random() * (this.decorrelatedJitter * 3 - this.options.baseDelay)
    );

    return this.decorrelatedJitter;
  }

  // Default: Equal Jitter (best balance)
  getNextDelay() {
    return this.getEqualJitter();
  }
}
```

### Jitter Comparison

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      JITTER STRATEGIES COMPARISON                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  No Jitter          Full Jitter        Equal Jitter      Decorrelated   │
│  ─────────          ───────────        ────────────      ────────────   │
│                                                                          │
│  [delay]            [0, delay]         [d/2, d]          [base, 3*prev] │
│                                                                          │
│  Predictable        Very spread        Balanced          Best spread    │
│  Thundering herd    Some too fast      Good distribution No correlation │
│                                                                          │
│  Use: Testing       Use: High scale    Use: Default      Use: AWS-style │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Production-Ready Reconnection Manager

```javascript
class ReconnectionManager {
  constructor(options = {}) {
    this.options = {
      baseDelay: 1000,
      maxDelay: 30000,
      multiplier: 2,
      maxAttempts: 15,
      jitterType: 'equal', // 'none', 'full', 'equal', 'decorrelated'
      resetOnSuccess: true,
      onlineOnly: true,
      ...options
    };

    this.state = 'disconnected';
    this.attempt = 0;
    this.decorrelatedDelay = this.options.baseDelay;
    this.scheduledReconnect = null;
    this.eventHandlers = new Map();

    // Network status monitoring
    if (this.options.onlineOnly) {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  // State transitions
  setState(newState) {
    const validTransitions = {
      disconnected: ['connecting'],
      connecting: ['connected', 'reconnecting', 'failed'],
      connected: ['reconnecting', 'disconnected'],
      reconnecting: ['connecting', 'failed', 'disconnected'],
      failed: ['connecting', 'disconnected']
    };

    if (!validTransitions[this.state]?.includes(newState)) {
      console.warn(`Invalid transition: ${this.state} -> ${newState}`);
      return false;
    }

    const previousState = this.state;
    this.state = newState;
    this.emit('stateChange', { from: previousState, to: newState });

    return true;
  }

  // Delay calculation
  calculateDelay() {
    const baseDelay = Math.min(
      this.options.baseDelay * Math.pow(this.options.multiplier, this.attempt),
      this.options.maxDelay
    );

    switch (this.options.jitterType) {
      case 'full':
        return Math.random() * baseDelay;

      case 'equal':
        return (baseDelay / 2) + (Math.random() * baseDelay / 2);

      case 'decorrelated':
        this.decorrelatedDelay = Math.min(
          this.options.maxDelay,
          this.options.baseDelay +
            Math.random() * (this.decorrelatedDelay * 3 - this.options.baseDelay)
        );
        return this.decorrelatedDelay;

      default:
        return baseDelay;
    }
  }

  // Schedule reconnection
  scheduleReconnect(connectFn) {
    if (this.state === 'failed' || this.state === 'connected') {
      return;
    }

    if (!navigator.onLine && this.options.onlineOnly) {
      this.emit('waitingForNetwork');
      return;
    }

    if (this.attempt >= this.options.maxAttempts) {
      this.setState('failed');
      this.emit('maxAttemptsReached', { attempts: this.attempt });
      return;
    }

    this.setState('reconnecting');

    const delay = this.calculateDelay();
    this.attempt++;

    this.emit('reconnectScheduled', {
      attempt: this.attempt,
      delay,
      maxAttempts: this.options.maxAttempts
    });

    this.scheduledReconnect = setTimeout(() => {
      this.setState('connecting');
      this.emit('reconnecting', { attempt: this.attempt });
      connectFn();
    }, delay);
  }

  // Cancel scheduled reconnection
  cancelScheduled() {
    if (this.scheduledReconnect) {
      clearTimeout(this.scheduledReconnect);
      this.scheduledReconnect = null;
    }
  }

  // Connection success
  onSuccess() {
    this.cancelScheduled();
    this.setState('connected');

    if (this.options.resetOnSuccess) {
      this.attempt = 0;
      this.decorrelatedDelay = this.options.baseDelay;
    }

    this.emit('connected');
  }

  // Connection failure
  onFailure(error, connectFn) {
    this.emit('connectionFailed', { error, attempt: this.attempt });
    this.scheduleReconnect(connectFn);
  }

  // Manual disconnect
  disconnect() {
    this.cancelScheduled();
    this.attempt = 0;
    this.setState('disconnected');
    this.emit('disconnected');
  }

  // Network handlers
  handleOnline() {
    this.emit('networkOnline');

    if (this.state === 'reconnecting') {
      // Network qaytdi - darhol retry
      this.cancelScheduled();
      this.emit('reconnectNow');
    }
  }

  handleOffline() {
    this.emit('networkOffline');

    if (this.state === 'reconnecting') {
      this.cancelScheduled();
    }
  }

  // Event emitter
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  emit(event, data) {
    this.eventHandlers.get(event)?.forEach((handler) => handler(data));
  }

  // Stats
  getStats() {
    return {
      state: this.state,
      attempt: this.attempt,
      maxAttempts: this.options.maxAttempts,
      nextDelay: this.attempt < this.options.maxAttempts ? this.calculateDelay() : null,
      isOnline: navigator.onLine
    };
  }
}
```

## WebSocket bilan Integration

```javascript
class ReliableWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.ws = null;
    this.messageQueue = [];
    this.pendingAcks = new Map();
    this.subscriptions = new Set();

    this.reconnectManager = new ReconnectionManager({
      maxAttempts: 15,
      jitterType: 'equal',
      ...options.reconnect
    });

    this.setupReconnectHandlers();
  }

  setupReconnectHandlers() {
    this.reconnectManager.on('stateChange', ({ from, to }) => {
      this.emit('connectionStateChange', { from, to });
      this.updateUI(to);
    });

    this.reconnectManager.on('reconnectScheduled', ({ attempt, delay, maxAttempts }) => {
      console.log(`Reconnect scheduled: attempt ${attempt}/${maxAttempts} in ${delay}ms`);
    });

    this.reconnectManager.on('reconnecting', () => {
      this.connect();
    });

    this.reconnectManager.on('maxAttemptsReached', () => {
      this.emit('connectionFailed');
      this.showErrorUI();
    });

    this.reconnectManager.on('networkOnline', () => {
      if (this.reconnectManager.state === 'reconnecting') {
        this.connect();
      }
    });
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.reconnectManager.onFailure(error, () => this.connect());
    }
  }

  setupWebSocketHandlers() {
    this.ws.onopen = () => {
      this.reconnectManager.onSuccess();
      this.resubscribe();
      this.flushMessageQueue();
    };

    this.ws.onclose = (event) => {
      // Normal closure
      if (event.code === 1000) {
        this.reconnectManager.disconnect();
        return;
      }

      // Abnormal closure - reconnect
      this.reconnectManager.onFailure(
        new Error(`WebSocket closed: ${event.code}`),
        () => this.connect()
      );
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };
  }

  // Subscription recovery
  subscribe(channel) {
    this.subscriptions.add(channel);

    if (this.isConnected) {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  }

  resubscribe() {
    this.subscriptions.forEach((channel) => {
      this.ws.send(JSON.stringify({ type: 'subscribe', channel }));
    });
  }

  // Message queue
  send(message) {
    const envelope = {
      id: this.generateId(),
      ...message,
      timestamp: Date.now()
    };

    if (this.isConnected) {
      this.ws.send(JSON.stringify(envelope));
      this.pendingAcks.set(envelope.id, envelope);
    } else {
      this.messageQueue.push(envelope);
    }

    return envelope.id;
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
      this.pendingAcks.set(message.id, message);
    }

    // Re-send unacknowledged messages
    this.pendingAcks.forEach((message) => {
      this.ws.send(JSON.stringify({ ...message, resend: true }));
    });
  }

  handleMessage(message) {
    if (message.type === 'ack') {
      this.pendingAcks.delete(message.id);
      return;
    }

    this.emit('message', message);
  }

  disconnect() {
    this.reconnectManager.disconnect();
    this.ws?.close(1000, 'Client disconnect');
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState() {
    return this.reconnectManager.state;
  }

  // UI helpers
  updateUI(state) {
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
      indicator.className = `connection-status ${state}`;
      indicator.textContent = this.getStateText(state);
    }
  }

  getStateText(state) {
    const texts = {
      disconnected: 'Offline',
      connecting: 'Connecting...',
      connected: 'Connected',
      reconnecting: 'Reconnecting...',
      failed: 'Connection Failed'
    };
    return texts[state] || state;
  }

  showErrorUI() {
    const retryButton = document.getElementById('retry-connection');
    if (retryButton) {
      retryButton.style.display = 'block';
      retryButton.onclick = () => {
        this.reconnectManager.attempt = 0;
        this.connect();
      };
    }
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event emitter methods
  eventHandlers = new Map();

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    this.eventHandlers.get(event)?.delete(handler);
  }

  emit(event, data) {
    this.eventHandlers.get(event)?.forEach((handler) => handler(data));
  }
}
```

## Real-World Case: Trading Platform

```javascript
class TradingConnection {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.lastSequence = 0;
    this.orderBook = new Map();
    this.pendingOrders = new Map();

    this.reconnectManager = new ReconnectionManager({
      baseDelay: 500,       // Trading - tez reconnect
      maxDelay: 10000,      // Max 10 sec
      maxAttempts: 50,      // Ko'p retry
      jitterType: 'decorrelated'
    });

    this.reconnectManager.on('connected', () => {
      this.requestSnapshot();
    });
  }

  connect() {
    this.ws = new WebSocket(this.config.url);

    this.ws.onopen = () => {
      this.reconnectManager.onSuccess();
      this.authenticate();
    };

    this.ws.onclose = (event) => {
      // Trading platform - har doim reconnect
      this.reconnectManager.onFailure(
        new Error(`Connection lost: ${event.code}`),
        () => this.connect()
      );
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };
  }

  authenticate() {
    this.send({
      type: 'auth',
      token: this.config.apiKey,
      timestamp: Date.now()
    });
  }

  requestSnapshot() {
    // Reconnect'dan keyin to'liq snapshot so'rash
    this.send({
      type: 'snapshot',
      symbols: Array.from(this.orderBook.keys()),
      lastSequence: this.lastSequence
    });
  }

  handleMessage(message) {
    switch (message.type) {
      case 'auth_success':
        this.subscribeToMarkets();
        break;

      case 'snapshot':
        this.processSnapshot(message);
        break;

      case 'update':
        this.processUpdate(message);
        break;

      case 'order_ack':
        this.handleOrderAck(message);
        break;

      case 'order_reject':
        this.handleOrderReject(message);
        break;
    }
  }

  processUpdate(update) {
    // Sequence gap detection
    if (update.sequence !== this.lastSequence + 1) {
      console.warn('Sequence gap detected, requesting snapshot');
      this.requestSnapshot();
      return;
    }

    this.lastSequence = update.sequence;
    this.applyUpdate(update);
  }

  // Order placement with retry
  async placeOrder(order) {
    const orderId = this.generateOrderId();
    const orderMessage = {
      type: 'order',
      orderId,
      ...order,
      timestamp: Date.now()
    };

    this.pendingOrders.set(orderId, {
      order: orderMessage,
      retries: 0,
      maxRetries: 3
    });

    return new Promise((resolve, reject) => {
      this.pendingOrders.get(orderId).resolve = resolve;
      this.pendingOrders.get(orderId).reject = reject;

      this.sendOrder(orderId);
    });
  }

  sendOrder(orderId) {
    const pending = this.pendingOrders.get(orderId);
    if (!pending) return;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Wait for connection
      setTimeout(() => this.sendOrder(orderId), 100);
      return;
    }

    this.send(pending.order);

    // Timeout - resend if no ack
    setTimeout(() => {
      const stillPending = this.pendingOrders.get(orderId);
      if (stillPending && stillPending.retries < stillPending.maxRetries) {
        stillPending.retries++;
        console.log(`Order ${orderId} retry ${stillPending.retries}`);
        this.sendOrder(orderId);
      } else if (stillPending) {
        stillPending.reject(new Error('Order timeout'));
        this.pendingOrders.delete(orderId);
      }
    }, 5000);
  }

  handleOrderAck(message) {
    const pending = this.pendingOrders.get(message.orderId);
    if (pending) {
      pending.resolve(message);
      this.pendingOrders.delete(message.orderId);
    }
  }

  handleOrderReject(message) {
    const pending = this.pendingOrders.get(message.orderId);
    if (pending) {
      pending.reject(new Error(message.reason));
      this.pendingOrders.delete(message.orderId);
    }
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  generateOrderId() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
}
```

## NOTO'G'RI vs TO'G'RI Kodlar

### 1. Immediate Reconnect

```javascript
// NOTO'G'RI: Darhol reconnect - server overload
ws.onclose = () => {
  new WebSocket(url);
};

// TO'G'RI: Backoff bilan
ws.onclose = () => {
  const delay = calculateBackoffDelay(attempts);
  setTimeout(() => {
    attempts++;
    connect();
  }, delay);
};
```

### 2. Fixed Delay

```javascript
// NOTO'G'RI: Fixed delay - thundering herd
ws.onclose = () => {
  setTimeout(connect, 5000);
};

// TO'G'RI: Jitter bilan
ws.onclose = () => {
  const baseDelay = 5000;
  const jitter = baseDelay * Math.random() * 0.25;
  setTimeout(connect, baseDelay + jitter);
};
```

### 3. Infinite Retry

```javascript
// NOTO'G'RI: Cheksiz retry - battery drain, server spam
function connect() {
  try {
    ws = new WebSocket(url);
  } catch {
    setTimeout(connect, 1000);
  }
}

// TO'G'RI: Max attempts
function connect() {
  if (attempts >= maxAttempts) {
    showRetryButton();
    return;
  }

  try {
    ws = new WebSocket(url);
  } catch {
    attempts++;
    setTimeout(connect, calculateDelay(attempts));
  }
}
```

### 4. State Loss

```javascript
// NOTO'G'RI: Reconnect'da state yo'qoladi
ws.onclose = () => {
  ws = new WebSocket(url);
};

// TO'G'RI: State recovery
ws.onclose = () => {
  ws = new WebSocket(url);
  ws.onopen = () => {
    // Subscription'larni tiklash
    subscriptions.forEach(sub => ws.send(JSON.stringify(sub)));

    // Pending message'larni yuborish
    messageQueue.forEach(msg => ws.send(JSON.stringify(msg)));

    // Snapshot so'rash
    ws.send(JSON.stringify({ type: 'snapshot', lastId }));
  };
};
```

### 5. Network Awareness

```javascript
// NOTO'G'RI: Network status'ni ignore qilish
function scheduleReconnect() {
  setTimeout(connect, delay);
}

// TO'G'RI: Network-aware
function scheduleReconnect() {
  if (!navigator.onLine) {
    // Network qaytishini kutish
    window.addEventListener('online', connect, { once: true });
    return;
  }
  setTimeout(connect, delay);
}
```

## Reconnect Bug'larni Hal Qilish

### 1. Connection Race Condition

```javascript
// MUAMMO: Bir nechta WebSocket instance
let ws;
function connect() {
  ws = new WebSocket(url); // Oldingi ws hali ochiq bo'lishi mumkin
}

// YECHIM: Yagona instance ta'minlash
class SingletonConnection {
  static instance = null;
  static connectionId = 0;

  static connect(url) {
    const myId = ++this.connectionId;

    // Oldingi connection'ni yopish
    if (this.instance) {
      this.instance.close();
    }

    const ws = new WebSocket(url);

    ws.onopen = () => {
      // Boshqa connection boshlangandimi?
      if (myId !== this.connectionId) {
        ws.close();
        return;
      }
      this.instance = ws;
    };

    return ws;
  }
}
```

### 2. Stale Closure

```javascript
// MUAMMO: Reconnect'da eski handler
let messageHandler = (msg) => console.log(msg);

ws.onmessage = messageHandler;
ws.onclose = () => {
  ws = new WebSocket(url);
  ws.onmessage = messageHandler; // Eski closure
};

// Muammo: messageHandler o'zgargan bo'lsa eski qiymat ishlatiladi

// YECHIM: Reference saqlamaslik
class WebSocketClient {
  handleMessage(event) {
    // Har doim joriy context
    this.emit('message', event.data);
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = (e) => this.handleMessage(e);
  }
}
```

### 3. Authentication on Reconnect

```javascript
// MUAMMO: Reconnect'da auth expire bo'lgan
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token })); // Token eskirgan
};

// YECHIM: Token refresh before reconnect
async function connect() {
  // Token yangilash
  if (isTokenExpired(token)) {
    token = await refreshToken();
  }

  ws = new WebSocket(url);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'auth', token }));
  };
}
```

### 4. Message Ordering

```javascript
// MUAMMO: Reconnect paytida xabarlar tartib buziladi

// YECHIM: Sequence number va reordering
class OrderedConnection {
  constructor() {
    this.lastReceivedSeq = 0;
    this.pendingMessages = [];
  }

  handleMessage(message) {
    // Gap bormi?
    if (message.seq > this.lastReceivedSeq + 1) {
      // Buffer qilish
      this.pendingMessages.push(message);
      this.pendingMessages.sort((a, b) => a.seq - b.seq);

      // Snapshot so'rash
      if (this.pendingMessages.length > 10) {
        this.requestSnapshot(this.lastReceivedSeq);
      }
      return;
    }

    // Normal processing
    this.processMessage(message);
    this.lastReceivedSeq = message.seq;

    // Pending message'larni tekshirish
    this.processPending();
  }

  processPending() {
    while (this.pendingMessages.length > 0) {
      if (this.pendingMessages[0].seq === this.lastReceivedSeq + 1) {
        const msg = this.pendingMessages.shift();
        this.processMessage(msg);
        this.lastReceivedSeq = msg.seq;
      } else {
        break;
      }
    }
  }
}
```

## Vue.js Composable

```javascript
// composables/useReconnectingWebSocket.js
import { ref, onMounted, onUnmounted, computed } from 'vue';

export function useReconnectingWebSocket(url, options = {}) {
  const data = ref(null);
  const error = ref(null);
  const state = ref('disconnected');
  const reconnectAttempt = ref(0);

  const {
    maxAttempts = 10,
    baseDelay = 1000,
    maxDelay = 30000,
    protocols = []
  } = options;

  let ws = null;
  let reconnectTimer = null;
  const subscriptions = new Set();
  const messageQueue = [];

  function calculateDelay() {
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, reconnectAttempt.value),
      maxDelay
    );
    const jitter = exponentialDelay * Math.random() * 0.25;
    return exponentialDelay + jitter;
  }

  function connect() {
    if (state.value === 'connecting' || state.value === 'connected') {
      return;
    }

    state.value = 'connecting';

    try {
      ws = new WebSocket(url, protocols);

      ws.onopen = () => {
        state.value = 'connected';
        reconnectAttempt.value = 0;
        error.value = null;

        // Restore subscriptions
        subscriptions.forEach((sub) => {
          ws.send(JSON.stringify({ type: 'subscribe', ...sub }));
        });

        // Flush message queue
        while (messageQueue.length > 0) {
          ws.send(messageQueue.shift());
        }
      };

      ws.onmessage = (event) => {
        try {
          data.value = JSON.parse(event.data);
        } catch {
          data.value = event.data;
        }
      };

      ws.onclose = (event) => {
        state.value = 'disconnected';

        if (event.code !== 1000) {
          scheduleReconnect();
        }
      };

      ws.onerror = (err) => {
        error.value = err;
      };
    } catch (err) {
      error.value = err;
      scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    if (reconnectAttempt.value >= maxAttempts) {
      state.value = 'failed';
      return;
    }

    state.value = 'reconnecting';
    const delay = calculateDelay();
    reconnectAttempt.value++;

    reconnectTimer = setTimeout(connect, delay);
  }

  function send(message) {
    const messageStr = typeof message === 'string'
      ? message
      : JSON.stringify(message);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    } else {
      messageQueue.push(messageStr);
    }
  }

  function subscribe(channel, options = {}) {
    const sub = { channel, ...options };
    subscriptions.add(sub);

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', ...sub }));
    }

    return () => {
      subscriptions.delete(sub);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
      }
    };
  }

  function close() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    ws?.close(1000, 'User initiated');
    state.value = 'disconnected';
  }

  function retry() {
    reconnectAttempt.value = 0;
    connect();
  }

  const isConnected = computed(() => state.value === 'connected');
  const canRetry = computed(() => state.value === 'failed');

  onMounted(() => {
    // Network event'larni tinglash
    window.addEventListener('online', () => {
      if (state.value === 'reconnecting' || state.value === 'failed') {
        retry();
      }
    });

    connect();
  });

  onUnmounted(() => {
    close();
  });

  return {
    data,
    error,
    state,
    reconnectAttempt,
    isConnected,
    canRetry,
    send,
    subscribe,
    close,
    retry
  };
}
```

### Component'da Ishlatish

```vue
<script setup>
import { useReconnectingWebSocket } from '@/composables/useReconnectingWebSocket';

const {
  data,
  state,
  reconnectAttempt,
  isConnected,
  canRetry,
  send,
  subscribe,
  retry
} = useReconnectingWebSocket('wss://api.example.com/ws', {
  maxAttempts: 15
});

// Subscribe to channel
const unsubscribe = subscribe('notifications');

function sendMessage() {
  send({ type: 'message', text: 'Hello!' });
}
</script>

<template>
  <div class="connection-panel">
    <div :class="['status', state]">
      <span v-if="state === 'connected'">Connected</span>
      <span v-else-if="state === 'reconnecting'">
        Reconnecting ({{ reconnectAttempt }})...
      </span>
      <span v-else-if="state === 'failed'">Connection Failed</span>
      <span v-else>{{ state }}</span>
    </div>

    <button
      v-if="canRetry"
      @click="retry"
      class="retry-btn"
    >
      Retry Connection
    </button>

    <div v-if="data" class="data">
      {{ data }}
    </div>
  </div>
</template>

<style scoped>
.status {
  padding: 8px 16px;
  border-radius: 4px;
}

.status.connected { background: #d4edda; color: #155724; }
.status.reconnecting { background: #fff3cd; color: #856404; }
.status.failed { background: #f8d7da; color: #721c24; }
</style>
```

## Interview Savollari

### 1. Exponential backoff nima va nima uchun kerak?

**Javob:**
Exponential backoff - har muvaffaqiyatsiz urinishda kutish vaqtini eksponensial ravishda oshirish strategiyasi.

```
Attempt 1: 1s
Attempt 2: 2s
Attempt 3: 4s
Attempt 4: 8s
...
```

**Nima uchun kerak:**
1. Server overload'dan himoya
2. Network recovery uchun vaqt
3. Resource efficiency
4. Cascading failure oldini olish

### 2. Jitter nima va qanday turları bor?

**Javob:**
Jitter - delay'ga random komponent qo'shish. Thundering herd muammosini hal qiladi.

**Turlari:**
1. **Full Jitter:** `random(0, delay)` - eng katta spread
2. **Equal Jitter:** `delay/2 + random(0, delay/2)` - balanced
3. **Decorrelated:** `random(base, prev*3)` - oldingi delay'ga bog'liq emas

### 3. Reconnect paytida state'ni qanday saqlab qolasiz?

**Javob:**
1. **Subscription tracking:** Set/Map'da subscription'larni saqlash
2. **Message queue:** Offline xabarlarni queue qilish
3. **Last sequence ID:** Server'dan snapshot so'rash
4. **Pending acknowledgments:** Tasdiqlanmagan xabarlarni qayta yuborish

### 4. Connection state machine qanday ishlaydi?

**Javob:**
```javascript
const validTransitions = {
  disconnected: ['connecting'],
  connecting: ['connected', 'reconnecting', 'failed'],
  connected: ['reconnecting', 'disconnected'],
  reconnecting: ['connecting', 'failed', 'disconnected'],
  failed: ['connecting', 'disconnected']
};

// Invalid transition'larni prevent qilish
function setState(newState) {
  if (!validTransitions[currentState].includes(newState)) {
    throw new Error(`Invalid transition: ${currentState} -> ${newState}`);
  }
  currentState = newState;
}
```

### 5. Network offline bo'lganda qanday handle qilasiz?

**Javob:**
```javascript
// Network monitoring
window.addEventListener('offline', () => {
  // Reconnect to'xtatish
  clearTimeout(reconnectTimer);
  state = 'waiting_for_network';
});

window.addEventListener('online', () => {
  // Darhol reconnect
  state = 'connecting';
  connect();
});

// Request qilishdan oldin tekshirish
if (!navigator.onLine) {
  queueMessage(message);
  return;
}
```

## Xulosa

Professional reconnection strategiyasi quyidagilarni o'z ichiga oladi:

1. **Exponential backoff** - server himoyasi
2. **Jitter** - thundering herd prevention
3. **State machine** - predictable behavior
4. **State recovery** - subscription/message restoration
5. **Network awareness** - online/offline handling
6. **Max attempts** - infinite loop prevention

Production'da reconnection muhim reliability komponenti hisoblanadi.

Keyingi bo'lim: [Presence Systems](./05-presence-systems.md)
