# Live Notifications

## Kirish

Live notifications - bu foydalanuvchilarga real vaqtda muhim hodisalar haqida xabar berish tizimi. Bu in-app notifications (toast, badge), push notifications va email/SMS kanallarni o'z ichiga oladi. Professional notification tizimi prioritization, grouping, delivery tracking va user preferences'ni boshqaradi.

## Notification Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Event Sources              Notification Service           Channels    │
│   ─────────────              ────────────────────           ────────    │
│                                                                          │
│  ┌───────────┐                ┌──────────────┐           ┌─────────┐   │
│  │ User      │───────────────►│              │──────────►│ In-App  │   │
│  │ Actions   │                │              │           │ (Toast) │   │
│  └───────────┘                │              │           └─────────┘   │
│                               │              │                          │
│  ┌───────────┐                │  Processor   │           ┌─────────┐   │
│  │ System    │───────────────►│  ──────────  │──────────►│  Push   │   │
│  │ Events    │                │  - Filter    │           │ (FCM)   │   │
│  └───────────┘                │  - Dedupe    │           └─────────┘   │
│                               │  - Batch     │                          │
│  ┌───────────┐                │  - Route     │           ┌─────────┐   │
│  │ External  │───────────────►│  - Priority  │──────────►│  Email  │   │
│  │ Webhooks  │                │              │           │         │   │
│  └───────────┘                │              │           └─────────┘   │
│                               │              │                          │
│  ┌───────────┐                │              │           ┌─────────┐   │
│  │ Scheduled │───────────────►│              │──────────►│   SMS   │   │
│  │ Jobs      │                │              │           │         │   │
│  └───────────┘                └──────────────┘           └─────────┘   │
│                                      │                                   │
│                                      ▼                                   │
│                               ┌──────────────┐                          │
│                               │   Database   │                          │
│                               │ (History +   │                          │
│                               │  Preferences)│                          │
│                               └──────────────┘                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Notification Types

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NOTIFICATION TYPES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  URGENCY        TYPE              EXAMPLES                              │
│  ───────        ────              ────────                              │
│                                                                          │
│  ████████████   Critical          Security alerts, payment failures,   │
│  (Immediate)                      account issues                        │
│                                                                          │
│  ████████░░░░   High              New messages, mentions,               │
│  (Real-time)                      order updates                         │
│                                                                          │
│  █████░░░░░░░   Medium            Likes, follows, comments              │
│  (Batched)                                                              │
│                                                                          │
│  ███░░░░░░░░░   Low               News digest, tips,                    │
│  (Digest)                         weekly summary                        │
│                                                                          │
│  █░░░░░░░░░░░   Silent            Analytics, sync complete              │
│  (Background)                                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Notification System

### Notification Model

```javascript
const NotificationSchema = {
  id: 'string',
  userId: 'string',
  type: 'string',                    // 'message', 'mention', 'follow', etc.
  category: 'string',                // 'social', 'transactional', 'marketing'
  priority: 'critical|high|medium|low|silent',
  title: 'string',
  body: 'string',
  data: {
    entityType: 'string',            // 'message', 'post', 'order'
    entityId: 'string',
    actionUrl: 'string',
    imageUrl: 'string',
    metadata: 'object'
  },
  channels: ['in_app', 'push', 'email', 'sms'],
  status: 'pending|sent|delivered|read|failed',
  readAt: 'timestamp|null',
  deliveredAt: 'timestamp|null',
  expiresAt: 'timestamp|null',
  groupKey: 'string|null',           // For batching similar notifications
  createdAt: 'timestamp'
};
```

### Notification Service (Server)

```javascript
class NotificationService {
  constructor(options = {}) {
    this.db = options.db;
    this.redis = options.redis;
    this.wsManager = options.wsManager;
    this.pushService = options.pushService;
    this.emailService = options.emailService;

    this.processors = new Map();
    this.defaultChannels = ['in_app'];

    this.setupProcessors();
    this.startBatchProcessor();
  }

  setupProcessors() {
    // Channel processors
    this.processors.set('in_app', new InAppProcessor(this.wsManager));
    this.processors.set('push', new PushProcessor(this.pushService));
    this.processors.set('email', new EmailProcessor(this.emailService));
    this.processors.set('sms', new SMSProcessor(this.smsService));
  }

  // Create and send notification
  async notify(userId, notification) {
    const user = await this.db.users.findById(userId);
    const preferences = await this.getUserPreferences(userId);

    // Build notification
    const notif = {
      id: this.generateId(),
      userId,
      ...notification,
      status: 'pending',
      createdAt: new Date()
    };

    // Apply user preferences
    const channels = this.filterChannels(notif, preferences);

    if (channels.length === 0) {
      // User opted out of all channels for this type
      return null;
    }

    notif.channels = channels;

    // Store notification
    await this.db.notifications.create(notif);

    // Check if should batch
    if (this.shouldBatch(notif, preferences)) {
      await this.addToBatch(notif);
      return notif;
    }

    // Send immediately
    await this.deliver(notif);

    return notif;
  }

  async deliver(notification) {
    const results = {};

    for (const channel of notification.channels) {
      const processor = this.processors.get(channel);

      if (processor) {
        try {
          results[channel] = await processor.send(notification);
        } catch (error) {
          results[channel] = { error: error.message };
        }
      }
    }

    // Update delivery status
    const allDelivered = Object.values(results).every((r) => !r.error);
    await this.db.notifications.update(notification.id, {
      status: allDelivered ? 'delivered' : 'partial',
      deliveredAt: new Date(),
      deliveryResults: results
    });

    return results;
  }

  // User preferences
  async getUserPreferences(userId) {
    const cached = await this.redis.get(`prefs:${userId}`);
    if (cached) return JSON.parse(cached);

    const prefs = await this.db.notificationPreferences.findByUser(userId);
    await this.redis.set(`prefs:${userId}`, JSON.stringify(prefs), 'EX', 3600);

    return prefs;
  }

  filterChannels(notification, preferences) {
    const { type, category, priority } = notification;
    const channels = [...notification.channels];

    // Global quiet hours
    if (preferences.quietHours && this.isQuietHours(preferences)) {
      // Only allow critical during quiet hours
      if (priority !== 'critical') {
        return priority === 'high' ? ['in_app'] : [];
      }
    }

    // Channel-specific preferences
    return channels.filter((channel) => {
      // Check if channel enabled
      if (!preferences.channels?.[channel]) return false;

      // Check type-specific setting
      const typePrefs = preferences.types?.[type];
      if (typePrefs && !typePrefs.channels?.includes(channel)) {
        return false;
      }

      // Check category settings
      const catPrefs = preferences.categories?.[category];
      if (catPrefs && !catPrefs.enabled) {
        return false;
      }

      return true;
    });
  }

  isQuietHours(preferences) {
    if (!preferences.quietHours?.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = preferences.quietHours;

    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Overnight (e.g., 22:00 - 07:00)
      return currentHour >= start || currentHour < end;
    }
  }

  // Batching
  shouldBatch(notification, preferences) {
    if (notification.priority === 'critical' || notification.priority === 'high') {
      return false;
    }

    return preferences.batching?.enabled &&
           preferences.batching?.types?.includes(notification.type);
  }

  async addToBatch(notification) {
    const batchKey = `batch:${notification.userId}:${notification.type}`;

    await this.redis.rpush(batchKey, JSON.stringify(notification));
    await this.redis.expire(batchKey, 3600); // 1 hour max
  }

  // Batch processor
  startBatchProcessor() {
    setInterval(async () => {
      await this.processBatches();
    }, 60000); // Every minute
  }

  async processBatches() {
    const keys = await this.redis.keys('batch:*');

    for (const key of keys) {
      const notifications = await this.redis.lrange(key, 0, -1);

      if (notifications.length === 0) continue;

      const parsed = notifications.map((n) => JSON.parse(n));
      const [, userId, type] = key.split(':');

      // Create summary notification
      const summary = this.createBatchSummary(parsed, type);
      await this.deliver(summary);

      // Clear batch
      await this.redis.del(key);
    }
  }

  createBatchSummary(notifications, type) {
    const count = notifications.length;
    const userId = notifications[0].userId;

    const summaries = {
      like: {
        title: 'New likes',
        body: `${count} people liked your posts`
      },
      follow: {
        title: 'New followers',
        body: `${count} people started following you`
      },
      comment: {
        title: 'New comments',
        body: `${count} new comments on your posts`
      }
    };

    const template = summaries[type] || {
      title: 'New notifications',
      body: `You have ${count} new notifications`
    };

    return {
      id: this.generateId(),
      userId,
      type: `${type}_batch`,
      category: 'social',
      priority: 'medium',
      ...template,
      data: {
        notifications: notifications.map((n) => n.id),
        count
      },
      channels: ['in_app', 'push'],
      status: 'pending',
      createdAt: new Date()
    };
  }

  // Mark as read
  async markAsRead(userId, notificationIds) {
    await this.db.notifications.updateMany(
      { id: { $in: notificationIds }, userId },
      { status: 'read', readAt: new Date() }
    );

    // Update unread count cache
    await this.updateUnreadCount(userId);

    // Notify client
    this.wsManager.sendToUser(userId, {
      type: 'notifications:read',
      ids: notificationIds
    });
  }

  async markAllAsRead(userId) {
    await this.db.notifications.updateMany(
      { userId, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );

    await this.redis.set(`unread:${userId}`, 0);

    this.wsManager.sendToUser(userId, {
      type: 'notifications:allRead'
    });
  }

  // Unread count
  async getUnreadCount(userId) {
    const cached = await this.redis.get(`unread:${userId}`);
    if (cached !== null) return parseInt(cached);

    const count = await this.db.notifications.count({
      userId,
      status: { $ne: 'read' }
    });

    await this.redis.set(`unread:${userId}`, count, 'EX', 300);
    return count;
  }

  async updateUnreadCount(userId) {
    const count = await this.db.notifications.count({
      userId,
      status: { $ne: 'read' }
    });
    await this.redis.set(`unread:${userId}`, count, 'EX', 300);

    this.wsManager.sendToUser(userId, {
      type: 'notifications:count',
      count
    });
  }

  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### In-App Processor

```javascript
class InAppProcessor {
  constructor(wsManager) {
    this.ws = wsManager;
  }

  async send(notification) {
    const { userId } = notification;

    // Send via WebSocket
    const delivered = this.ws.sendToUser(userId, {
      type: 'notification:new',
      notification: this.formatForClient(notification)
    });

    return { delivered, channel: 'in_app' };
  }

  formatForClient(notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      createdAt: notification.createdAt,
      read: notification.status === 'read'
    };
  }
}
```

### Push Processor (FCM)

```javascript
class PushProcessor {
  constructor(firebaseAdmin) {
    this.messaging = firebaseAdmin.messaging();
  }

  async send(notification) {
    const { userId, title, body, data } = notification;

    // Get user's FCM tokens
    const tokens = await this.getDeviceTokens(userId);

    if (tokens.length === 0) {
      return { delivered: false, reason: 'No device tokens' };
    }

    const message = {
      notification: {
        title,
        body
      },
      data: {
        notificationId: notification.id,
        type: notification.type,
        actionUrl: data.actionUrl || '',
        ...this.serializeData(data.metadata)
      },
      android: {
        priority: this.getPriority(notification.priority),
        notification: {
          channelId: this.getChannelId(notification.type),
          icon: 'ic_notification',
          color: '#4285F4'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: await this.getUnreadCount(userId),
            sound: this.getSound(notification.priority),
            'mutable-content': 1
          }
        }
      }
    };

    try {
      const response = await this.messaging.sendEachForMulticast({
        tokens,
        ...message
      });

      // Handle failed tokens
      const failedTokens = [];
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const errorCode = res.error?.code;
          if (errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered') {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      // Remove invalid tokens
      if (failedTokens.length > 0) {
        await this.removeInvalidTokens(userId, failedTokens);
      }

      return {
        delivered: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      return { delivered: false, error: error.message };
    }
  }

  getPriority(priority) {
    return priority === 'critical' || priority === 'high' ? 'high' : 'normal';
  }

  getChannelId(type) {
    const channels = {
      message: 'messages',
      mention: 'mentions',
      follow: 'social',
      payment: 'transactions'
    };
    return channels[type] || 'default';
  }

  getSound(priority) {
    if (priority === 'critical') return 'critical.wav';
    if (priority === 'high') return 'default';
    return null;
  }

  serializeData(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj || {})) {
      result[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    return result;
  }
}
```

## Client-Side Notification System

```javascript
class NotificationClient {
  constructor(wsManager, options = {}) {
    this.ws = wsManager;
    this.options = {
      maxToasts: 5,
      toastDuration: 5000,
      position: 'top-right',
      ...options
    };

    this.notifications = [];
    this.unreadCount = 0;
    this.toastQueue = [];
    this.activeToasts = [];
    this.eventHandlers = new Map();

    this.setupHandlers();
  }

  setupHandlers() {
    // New notification
    this.ws.on('notification:new', (data) => {
      this.handleNewNotification(data.notification);
    });

    // Unread count update
    this.ws.on('notifications:count', (data) => {
      this.unreadCount = data.count;
      this.emit('countChanged', this.unreadCount);
    });

    // Marked as read
    this.ws.on('notifications:read', (data) => {
      data.ids.forEach((id) => {
        const notif = this.notifications.find((n) => n.id === id);
        if (notif) notif.read = true;
      });
      this.emit('notificationsUpdated', this.notifications);
    });

    // Request permission on load
    this.requestPushPermission();
  }

  handleNewNotification(notification) {
    // Add to list
    this.notifications.unshift(notification);
    this.unreadCount++;

    this.emit('newNotification', notification);
    this.emit('countChanged', this.unreadCount);

    // Show toast
    if (document.visibilityState === 'visible') {
      this.showToast(notification);
    } else {
      // Browser notification
      this.showBrowserNotification(notification);
    }

    // Play sound
    this.playSound(notification.priority);
  }

  // Toast notifications
  showToast(notification) {
    const toast = {
      id: notification.id,
      notification,
      createdAt: Date.now()
    };

    if (this.activeToasts.length >= this.options.maxToasts) {
      // Queue if at max
      this.toastQueue.push(toast);
    } else {
      this.displayToast(toast);
    }
  }

  displayToast(toast) {
    this.activeToasts.push(toast);
    this.emit('toastAdded', toast);

    // Auto dismiss
    setTimeout(() => {
      this.dismissToast(toast.id);
    }, this.options.toastDuration);
  }

  dismissToast(toastId) {
    const index = this.activeToasts.findIndex((t) => t.id === toastId);

    if (index !== -1) {
      this.activeToasts.splice(index, 1);
      this.emit('toastRemoved', toastId);

      // Show queued toast
      if (this.toastQueue.length > 0) {
        const next = this.toastQueue.shift();
        this.displayToast(next);
      }
    }
  }

  // Browser notifications
  async showBrowserNotification(notification) {
    if (Notification.permission !== 'granted') return;

    const browserNotif = new Notification(notification.title, {
      body: notification.body,
      icon: notification.data?.imageUrl || '/icon.png',
      badge: '/badge.png',
      tag: notification.id,
      data: notification.data
    });

    browserNotif.onclick = () => {
      window.focus();
      this.handleNotificationClick(notification);
      browserNotif.close();
    };
  }

  async requestPushPermission() {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Sound
  playSound(priority) {
    if (priority === 'silent') return;

    const audio = new Audio(
      priority === 'critical' ? '/sounds/critical.mp3' : '/sounds/notification.mp3'
    );
    audio.volume = priority === 'critical' ? 1 : 0.5;
    audio.play().catch(() => {}); // Ignore autoplay errors
  }

  // Actions
  handleNotificationClick(notification) {
    this.markAsRead([notification.id]);

    if (notification.data?.actionUrl) {
      window.location.href = notification.data.actionUrl;
    }

    this.emit('notificationClicked', notification);
  }

  async markAsRead(ids) {
    await this.ws.send({
      type: 'notifications:read',
      ids
    });

    ids.forEach((id) => {
      const notif = this.notifications.find((n) => n.id === id);
      if (notif && !notif.read) {
        notif.read = true;
        this.unreadCount--;
      }
    });

    this.emit('notificationsUpdated', this.notifications);
    this.emit('countChanged', this.unreadCount);
  }

  async markAllAsRead() {
    await this.ws.send({
      type: 'notifications:readAll'
    });

    this.notifications.forEach((n) => (n.read = true));
    this.unreadCount = 0;

    this.emit('notificationsUpdated', this.notifications);
    this.emit('countChanged', 0);
  }

  // Load more
  async loadNotifications(options = {}) {
    const { limit = 20, before } = options;

    const response = await fetch(`/api/notifications?limit=${limit}${before ? `&before=${before}` : ''}`, {
      credentials: 'include'
    });

    const data = await response.json();

    if (before) {
      this.notifications.push(...data.notifications);
    } else {
      this.notifications = data.notifications;
      this.unreadCount = data.unreadCount;
    }

    this.emit('notificationsLoaded', this.notifications);
    return data;
  }

  // Event emitter
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event).add(handler);
    return () => this.eventHandlers.get(event).delete(handler);
  }

  emit(event, data) {
    this.eventHandlers.get(event)?.forEach((h) => h(data));
  }
}
```

## Real-World Case: E-commerce Notifications

```javascript
class EcommerceNotifications extends NotificationService {
  async notifyOrderStatusChange(orderId, newStatus) {
    const order = await this.db.orders.findById(orderId);
    const user = await this.db.users.findById(order.userId);

    const statusMessages = {
      confirmed: {
        title: 'Order Confirmed',
        body: `Your order #${order.orderNumber} has been confirmed.`,
        priority: 'high'
      },
      processing: {
        title: 'Order Processing',
        body: `Your order #${order.orderNumber} is being prepared.`,
        priority: 'medium'
      },
      shipped: {
        title: 'Order Shipped',
        body: `Your order #${order.orderNumber} is on its way! Track: ${order.trackingNumber}`,
        priority: 'high'
      },
      delivered: {
        title: 'Order Delivered',
        body: `Your order #${order.orderNumber} has been delivered.`,
        priority: 'high'
      },
      cancelled: {
        title: 'Order Cancelled',
        body: `Your order #${order.orderNumber} has been cancelled.`,
        priority: 'critical'
      }
    };

    const template = statusMessages[newStatus];
    if (!template) return;

    return this.notify(user.id, {
      type: 'order_status',
      category: 'transactional',
      ...template,
      data: {
        entityType: 'order',
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
        orderStatus: newStatus,
        trackingNumber: order.trackingNumber
      },
      channels: ['in_app', 'push', 'email']
    });
  }

  async notifyPriceDrops(userId) {
    const wishlist = await this.db.wishlist.findByUser(userId);
    const droppedItems = [];

    for (const item of wishlist) {
      const currentPrice = await this.getProductPrice(item.productId);
      if (currentPrice < item.savedPrice) {
        droppedItems.push({
          product: item,
          oldPrice: item.savedPrice,
          newPrice: currentPrice,
          dropPercent: Math.round((1 - currentPrice / item.savedPrice) * 100)
        });
      }
    }

    if (droppedItems.length === 0) return;

    if (droppedItems.length === 1) {
      const item = droppedItems[0];
      return this.notify(userId, {
        type: 'price_drop',
        category: 'marketing',
        priority: 'medium',
        title: 'Price Drop Alert',
        body: `${item.product.name} is now ${item.dropPercent}% off!`,
        data: {
          entityType: 'product',
          entityId: item.product.productId,
          actionUrl: `/products/${item.product.productId}`,
          oldPrice: item.oldPrice,
          newPrice: item.newPrice
        },
        channels: ['in_app', 'push']
      });
    }

    // Multiple items - batch
    return this.notify(userId, {
      type: 'price_drop_batch',
      category: 'marketing',
      priority: 'medium',
      title: `${droppedItems.length} Wishlist Items on Sale`,
      body: 'Items on your wishlist are now discounted!',
      data: {
        items: droppedItems.map((i) => ({
          productId: i.product.productId,
          name: i.product.name,
          dropPercent: i.dropPercent
        })),
        actionUrl: '/wishlist'
      },
      channels: ['in_app', 'push', 'email']
    });
  }

  async notifyBackInStock(productId) {
    // Find users who wanted this product
    const waitingUsers = await this.db.stockAlerts.findByProduct(productId);
    const product = await this.db.products.findById(productId);

    const notifications = waitingUsers.map((alert) =>
      this.notify(alert.userId, {
        type: 'back_in_stock',
        category: 'transactional',
        priority: 'high',
        title: 'Back in Stock!',
        body: `${product.name} is now available.`,
        data: {
          entityType: 'product',
          entityId: productId,
          actionUrl: `/products/${productId}`,
          imageUrl: product.imageUrl
        },
        channels: ['in_app', 'push', 'email']
      })
    );

    await Promise.all(notifications);

    // Clear alerts
    await this.db.stockAlerts.deleteByProduct(productId);
  }

  async notifyAbandonedCart(userId) {
    const cart = await this.db.carts.findByUser(userId);

    if (!cart || cart.items.length === 0) return;

    const totalValue = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.notify(userId, {
      type: 'abandoned_cart',
      category: 'marketing',
      priority: 'low',
      title: 'You left something behind',
      body: `Complete your purchase of ${cart.items.length} items ($${totalValue.toFixed(2)})`,
      data: {
        cartId: cart.id,
        itemCount: cart.items.length,
        totalValue,
        actionUrl: '/cart'
      },
      channels: ['push', 'email']
    });
  }
}
```

## NOTO'G'RI vs TO'G'RI Kodlar

### 1. Notification Spam

```javascript
// NOTO'G'RI: Har like uchun alohida notification
user.followers.forEach(async (follower) => {
  await notify(follower.id, { type: 'like', ... });
});

// TO'G'RI: Batching
const likesBatch = await redis.get(`likes:${postId}`);
await redis.incr(`likes:${postId}:count`);

// Batch processor (every 5 min)
const count = await redis.get(`likes:${postId}:count`);
if (count > 0) {
  await notify(postAuthor.id, {
    type: 'likes_batch',
    body: `${count} people liked your post`
  });
  await redis.del(`likes:${postId}:count`);
}
```

### 2. Toast Overflow

```javascript
// NOTO'G'RI: Cheksiz toast
function showToast(notification) {
  toasts.push(notification); // Memory leak, UI overflow
}

// TO'G'RI: Limit va queue
const MAX_TOASTS = 5;
const toastQueue = [];
const activeToasts = [];

function showToast(notification) {
  if (activeToasts.length >= MAX_TOASTS) {
    toastQueue.push(notification);
    return;
  }

  activeToasts.push(notification);

  setTimeout(() => {
    dismissToast(notification.id);
  }, 5000);
}

function dismissToast(id) {
  activeToasts = activeToasts.filter(t => t.id !== id);

  if (toastQueue.length > 0) {
    showToast(toastQueue.shift());
  }
}
```

### 3. Preferences Ignored

```javascript
// NOTO'G'RI: User preferences tekshirilmagan
async function notify(userId, notification) {
  await sendPush(userId, notification);
  await sendEmail(userId, notification);
}

// TO'G'RI: Preferences bilan
async function notify(userId, notification) {
  const prefs = await getUserPreferences(userId);

  // Quiet hours check
  if (isQuietHours(prefs) && notification.priority !== 'critical') {
    return queueForLater(notification, prefs.quietHours.end);
  }

  // Channel preferences
  for (const channel of notification.channels) {
    if (prefs.channels[channel]?.enabled) {
      await sendToChannel(channel, notification);
    }
  }
}
```

### 4. Duplicate Notifications

```javascript
// NOTO'G'RI: Duplicate notification yuboriladi
ws.on('message', (data) => {
  showNotification(data);
});

// TO'G'RI: Deduplication
const seenNotifications = new Set();

ws.on('message', (data) => {
  if (seenNotifications.has(data.id)) return;

  seenNotifications.add(data.id);
  showNotification(data);

  // Cleanup old entries
  setTimeout(() => seenNotifications.delete(data.id), 60000);
});
```

### 5. Badge Count Sync

```javascript
// NOTO'G'RI: Local count - sync muammolari
let unreadCount = 0;

function onNewNotification() {
  unreadCount++;
  updateBadge(unreadCount);
}

// TO'G'RI: Server-authoritative count
ws.on('notifications:count', (data) => {
  unreadCount = data.count;
  updateBadge(unreadCount);
});

// Also fetch on reconnect
ws.on('connected', async () => {
  const { count } = await api.getUnreadCount();
  unreadCount = count;
  updateBadge(count);
});
```

## Reconnect Bug'larni Hal Qilish

### 1. Missed Notifications

```javascript
// MUAMMO: Reconnect paytida notification'lar yo'qoladi

// YECHIM: Sync on reconnect
class NotificationSync {
  constructor(ws, lastNotificationId = null) {
    this.ws = ws;
    this.lastNotificationId = lastNotificationId;

    this.ws.on('connected', () => this.sync());
  }

  async sync() {
    const response = await this.ws.send({
      type: 'notifications:sync',
      lastNotificationId: this.lastNotificationId
    });

    // Process missed notifications
    response.missed.forEach((notification) => {
      this.handleNotification(notification);
    });

    // Update last ID
    if (response.missed.length > 0) {
      this.lastNotificationId = response.missed[0].id;
    }

    // Update unread count
    this.unreadCount = response.unreadCount;
  }

  handleNotification(notification) {
    // Don't show toast for old notifications
    notification._skipToast = true;
    this.emit('notification:new', notification);
  }
}
```

### 2. Stale Badge Count

```javascript
// MUAMMO: Offline bo'lganda badge eski qoladi

// YECHIM: Periodic sync va visibility change
class BadgeManager {
  constructor() {
    this.lastSync = 0;
    this.syncInterval = 30000;

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncIfNeeded();
      }
    });
  }

  async syncIfNeeded() {
    const now = Date.now();
    if (now - this.lastSync < this.syncInterval) return;

    this.lastSync = now;
    const { count } = await api.getUnreadCount();
    this.updateBadge(count);
  }

  updateBadge(count) {
    // Update UI
    document.getElementById('notification-badge').textContent = count;

    // Update favicon
    this.updateFaviconBadge(count);

    // Update title
    document.title = count > 0 ? `(${count}) ${this.baseTitle}` : this.baseTitle;
  }

  updateFaviconBadge(count) {
    if (count === 0) {
      // Reset to original favicon
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Draw original favicon
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 32, 32);

      // Draw badge
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw count
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(count > 99 ? '99+' : count, 24, 12);

      // Update favicon
      const link = document.querySelector("link[rel~='icon']");
      link.href = canvas.toDataURL();
    };
    img.src = '/favicon.png';
  }
}
```

## Vue.js Notification Component

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import { TransitionGroup } from 'vue';

const {
  notifications,
  unreadCount,
  toasts,
  markAsRead,
  markAllAsRead,
  dismissToast,
  loadMore
} = useNotifications();

const isOpen = ref(false);
const isLoading = ref(false);

async function handleLoadMore() {
  isLoading.value = true;
  await loadMore();
  isLoading.value = false;
}

function handleNotificationClick(notification) {
  if (!notification.read) {
    markAsRead([notification.id]);
  }

  if (notification.data?.actionUrl) {
    isOpen.value = false;
    // Router navigation or window.location
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
</script>

<template>
  <div class="notification-system">
    <!-- Toast Container -->
    <div class="toast-container" :class="position">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.notification.priority"
          @click="handleNotificationClick(toast.notification)"
        >
          <div class="toast-content">
            <strong>{{ toast.notification.title }}</strong>
            <p>{{ toast.notification.body }}</p>
          </div>
          <button class="toast-close" @click.stop="dismissToast(toast.id)">
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Notification Bell -->
    <div class="notification-bell" @click="isOpen = !isOpen">
      <BellIcon />
      <span v-if="unreadCount > 0" class="badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="notification-dropdown">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="mark-all-read"
          >
            Mark all as read
          </button>
        </div>

        <div class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div v-if="notification.data?.imageUrl" class="notification-image">
              <img :src="notification.data.imageUrl" alt="" />
            </div>
            <div class="notification-content">
              <strong>{{ notification.title }}</strong>
              <p>{{ notification.body }}</p>
              <span class="notification-time">
                {{ formatTime(notification.createdAt) }}
              </span>
            </div>
            <div v-if="!notification.read" class="unread-dot"></div>
          </div>

          <div v-if="notifications.length === 0" class="empty-state">
            No notifications yet
          </div>

          <button
            v-if="notifications.length >= 20"
            @click="handleLoadMore"
            :disabled="isLoading"
            class="load-more"
          >
            {{ isLoading ? 'Loading...' : 'Load more' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
}

.toast-container.top-right {
  top: 16px;
  right: 16px;
}

.toast {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
}

.toast:hover {
  transform: translateX(-4px);
}

.toast.critical {
  border-left: 4px solid #ef4444;
}

.toast.high {
  border-left: 4px solid #f59e0b;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-bell {
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #ef4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #f0f9ff;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
```

## Interview Savollari

### 1. Push notification va in-app notification farqi?

**Javob:**

| Xususiyat | Push | In-App |
|-----------|------|--------|
| Delivery | Device OS orqali | WebSocket/SSE |
| Reach | App yopiq bo'lsa ham | Faqat app ochiq |
| Reliability | OS queueing | Connection kerak |
| Rich content | Cheklangan | To'liq HTML/CSS |
| Permissions | OS permission kerak | Yo'q |

### 2. Notification batching qanday ishlaydi?

**Javob:**
1. Low-priority notifications queue'ga qo'shiladi
2. Time-based yoki count-based trigger
3. Summary notification yaratiladi
4. Single push/email yuboriladi

```javascript
// Queue
await redis.rpush(`batch:${userId}:likes`, notificationId);

// Process (cron every 5 min)
const count = await redis.llen(`batch:${userId}:likes`);
if (count > 0) {
  await notify(userId, {
    title: `${count} new likes`,
    type: 'batch'
  });
  await redis.del(`batch:${userId}:likes`);
}
```

### 3. Quiet hours qanday implement qilinadi?

**Javob:**
```javascript
function shouldDeliver(notification, preferences) {
  if (notification.priority === 'critical') {
    return true; // Critical always delivers
  }

  if (!preferences.quietHours?.enabled) {
    return true;
  }

  const hour = new Date().getHours();
  const { start, end } = preferences.quietHours;

  // Check if in quiet hours
  if (start < end) {
    return hour < start || hour >= end;
  } else {
    // Overnight (22-07)
    return hour < start && hour >= end;
  }
}
```

### 4. Notification preferences qanday strukturada saqlanadi?

**Javob:**
```javascript
const userPreferences = {
  channels: {
    in_app: { enabled: true },
    push: { enabled: true },
    email: { enabled: true, frequency: 'instant' }, // instant/daily/weekly
    sms: { enabled: false }
  },
  categories: {
    social: { enabled: true },
    marketing: { enabled: false },
    transactional: { enabled: true }
  },
  types: {
    message: { channels: ['in_app', 'push'], sound: true },
    like: { channels: ['in_app'], sound: false },
    follow: { channels: ['in_app', 'push'], sound: true }
  },
  quietHours: {
    enabled: true,
    start: 22, // 10 PM
    end: 7     // 7 AM
  }
};
```

### 5. FCM token management qanday qilinadi?

**Javob:**
1. Login'da token olish va server'ga yuborish
2. Token refresh'ni handle qilish
3. Logout'da token o'chirish
4. Invalid token'larni cleanup qilish

```javascript
// Client
const token = await messaging.getToken();
await api.registerDeviceToken(token);

messaging.onTokenRefresh(async () => {
  const newToken = await messaging.getToken();
  await api.updateDeviceToken(newToken);
});

// Server - cleanup invalid tokens
response.responses.forEach((res, idx) => {
  if (res.error?.code === 'messaging/registration-token-not-registered') {
    removeToken(tokens[idx]);
  }
});
```

## Xulosa

Professional notification tizimi quyidagilarni talab qiladi:

1. **Multi-channel delivery** - in-app, push, email, SMS
2. **User preferences** - channels, types, quiet hours
3. **Batching** - spam prevention
4. **Priority system** - critical vs low
5. **Delivery tracking** - sent, delivered, read
6. **Reconnect handling** - sync missed notifications

Notification UX - user engagement uchun kritik.

---

## Bo'lim Yakunlandi

Bu bo'limda realtime tizimlarning barcha asosiy komponentlari ko'rib chiqildi:

1. **WebSocket** - full-duplex communication
2. **SSE** - server-to-client streaming
3. **Polling** - fallback strategy
4. **Reconnect Strategies** - reliability
5. **Presence Systems** - online tracking
6. **Chat Implementation** - messaging
7. **Live Notifications** - user alerts

Har bir mavzu production-ready kod misollari, real-world case'lar va interview savollari bilan to'ldirilgan.
