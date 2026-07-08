# Chat Implementation

## Kirish

Real-time chat - bu realtime tizimlarning eng keng tarqalgan use case'laridan biri. Professional chat tizimi message delivery, read receipts, typing indicators, offline queueing va optimistic UI'ni o'z ichiga oladi.

## Chat Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHAT ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────┐        ┌──────────────┐        ┌────────────┐           │
│  │  Client A  │◄──────►│   WebSocket  │◄──────►│  Client B  │           │
│  └────────────┘        │    Server    │        └────────────┘           │
│                        └──────┬───────┘                                  │
│                               │                                          │
│                               ▼                                          │
│                        ┌──────────────┐                                  │
│                        │    Redis     │                                  │
│                        │   Pub/Sub    │                                  │
│                        └──────┬───────┘                                  │
│                               │                                          │
│              ┌────────────────┼────────────────┐                        │
│              │                │                │                         │
│              ▼                ▼                ▼                         │
│       ┌──────────┐     ┌──────────┐     ┌──────────┐                   │
│       │PostgreSQL│     │   S3     │     │   Push   │                   │
│       │ Messages │     │  Files   │     │ Service  │                   │
│       └──────────┘     └──────────┘     └──────────┘                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Message Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MESSAGE LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Sender                  Server                 Receiver                │
│                                                                          │
│   ┌─────────────┐                                                       │
│   │  Composing  │                                                       │
│   └──────┬──────┘                                                       │
│          │ send()                                                       │
│          ▼                                                               │
│   ┌─────────────┐                                                       │
│   │   Sending   │ ───────► receive ───────┐                             │
│   │  (pending)  │                         │                             │
│   └──────┬──────┘                         │                             │
│          │ ack                            ▼                             │
│          ▼                         ┌─────────────┐                      │
│   ┌─────────────┐                  │   Store     │                      │
│   │    Sent     │ ◄─────────────── │             │                      │
│   │  (1 check)  │                  └──────┬──────┘                      │
│   └──────┬──────┘                         │ deliver                     │
│          │ delivered                      ▼                             │
│          ▼                         ┌─────────────┐                      │
│   ┌─────────────┐                  │  Delivered  │                      │
│   │  Delivered  │                  │  (inbox)    │                      │
│   │ (2 checks)  │                  └──────┬──────┘                      │
│   └──────┬──────┘                         │ read                        │
│          │ read                           ▼                             │
│          ▼                         ┌─────────────┐                      │
│   ┌─────────────┐                  │    Read     │                      │
│   │    Read     │                  │             │                      │
│   │ (blue/seen) │                  └─────────────┘                      │
│   └─────────────┘                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Chat Implementation

### Message Model

```javascript
// Message structure
const MessageSchema = {
  id: 'string',           // Unique message ID
  conversationId: 'string',
  senderId: 'string',
  type: 'text|image|file|audio|video|system',
  content: {
    text: 'string',
    attachments: [{
      id: 'string',
      type: 'string',
      url: 'string',
      thumbnail: 'string',
      size: 'number',
      name: 'string'
    }],
    replyTo: 'messageId',
    mentions: ['userId'],
    reactions: {
      '👍': ['userId'],
      '❤️': ['userId']
    }
  },
  status: 'pending|sent|delivered|read|failed',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  deletedAt: 'timestamp|null',
  editedAt: 'timestamp|null',
  readBy: [{ userId: 'string', readAt: 'timestamp' }]
};
```

### Chat Client

```javascript
class ChatClient {
  constructor(wsManager, options = {}) {
    this.ws = wsManager;
    this.options = {
      maxRetries: 3,
      retryDelay: 1000,
      messageTimeout: 10000,
      ...options
    };

    this.conversations = new Map();
    this.pendingMessages = new Map();
    this.messageQueue = [];
    this.typingTrackers = new Map();

    this.setupHandlers();
  }

  setupHandlers() {
    // Incoming messages
    this.ws.on('message:new', (data) => this.handleNewMessage(data));
    this.ws.on('message:delivered', (data) => this.handleDelivered(data));
    this.ws.on('message:read', (data) => this.handleRead(data));
    this.ws.on('message:updated', (data) => this.handleUpdated(data));
    this.ws.on('message:deleted', (data) => this.handleDeleted(data));
    this.ws.on('message:reaction', (data) => this.handleReaction(data));

    // Typing
    this.ws.on('typing:start', (data) => this.handleTypingStart(data));
    this.ws.on('typing:stop', (data) => this.handleTypingStop(data));

    // Connection state
    this.ws.on('connected', () => this.flushMessageQueue());
    this.ws.on('reconnected', () => this.syncMessages());
  }

  // Send message with optimistic update
  async sendMessage(conversationId, content, options = {}) {
    const message = {
      id: this.generateId(),
      conversationId,
      senderId: this.currentUserId,
      type: options.type || 'text',
      content,
      status: 'pending',
      createdAt: Date.now(),
      replyTo: options.replyTo || null
    };

    // Optimistic update
    this.addMessageToConversation(conversationId, message);
    this.emit('message:sent', message);

    try {
      const result = await this.sendWithRetry(message);
      this.updateMessageStatus(message.id, 'sent', result.serverId);
      return result;
    } catch (error) {
      this.updateMessageStatus(message.id, 'failed', null, error);
      throw error;
    }
  }

  async sendWithRetry(message, attempt = 0) {
    if (!this.ws.isConnected) {
      this.messageQueue.push(message);
      return { queued: true, localId: message.id };
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingMessages.delete(message.id);

        if (attempt < this.options.maxRetries) {
          resolve(this.sendWithRetry(message, attempt + 1));
        } else {
          reject(new Error('Message send timeout'));
        }
      }, this.options.messageTimeout);

      this.pendingMessages.set(message.id, {
        message,
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        timeout
      });

      this.ws.send({
        type: 'message:send',
        ...message
      });
    });
  }

  // Handle server acknowledgment
  handleMessageAck(data) {
    const pending = this.pendingMessages.get(data.localId);
    if (pending) {
      this.pendingMessages.delete(data.localId);
      pending.resolve({
        serverId: data.serverId,
        timestamp: data.timestamp
      });
    }
  }

  // Handle incoming message
  handleNewMessage(data) {
    const message = {
      ...data,
      status: 'delivered'
    };

    this.addMessageToConversation(data.conversationId, message);
    this.emit('message:received', message);

    // Auto mark as delivered
    this.ws.send({
      type: 'message:delivered',
      messageId: message.id,
      conversationId: message.conversationId
    });
  }

  // Mark messages as read
  markAsRead(conversationId, messageIds) {
    this.ws.send({
      type: 'message:read',
      conversationId,
      messageIds,
      readAt: Date.now()
    });

    // Optimistic update
    messageIds.forEach((id) => {
      this.updateMessageStatus(id, 'read');
    });
  }

  // Read receipts handler
  handleRead(data) {
    const { messageIds, userId, readAt } = data;

    messageIds.forEach((id) => {
      const message = this.findMessage(id);
      if (message) {
        if (!message.readBy) message.readBy = [];
        message.readBy.push({ userId, readAt });
        this.emit('message:readReceipt', { messageId: id, userId, readAt });
      }
    });
  }

  // Edit message
  async editMessage(messageId, newContent) {
    const message = this.findMessage(messageId);

    if (!message || message.senderId !== this.currentUserId) {
      throw new Error('Cannot edit this message');
    }

    // Optimistic update
    const oldContent = message.content;
    message.content = newContent;
    message.editedAt = Date.now();
    this.emit('message:updated', message);

    try {
      await this.ws.send({
        type: 'message:edit',
        messageId,
        content: newContent
      });
    } catch (error) {
      // Rollback
      message.content = oldContent;
      message.editedAt = null;
      this.emit('message:updated', message);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId, forEveryone = false) {
    const message = this.findMessage(messageId);

    if (!message) return;

    // Optimistic update
    if (forEveryone) {
      message.deletedAt = Date.now();
      message.content = { text: 'This message was deleted' };
    } else {
      message.hiddenFor = message.hiddenFor || [];
      message.hiddenFor.push(this.currentUserId);
    }

    this.emit('message:deleted', { messageId, forEveryone });

    await this.ws.send({
      type: 'message:delete',
      messageId,
      forEveryone
    });
  }

  // Reactions
  async addReaction(messageId, emoji) {
    const message = this.findMessage(messageId);
    if (!message) return;

    // Optimistic update
    if (!message.content.reactions) {
      message.content.reactions = {};
    }
    if (!message.content.reactions[emoji]) {
      message.content.reactions[emoji] = [];
    }
    message.content.reactions[emoji].push(this.currentUserId);
    this.emit('message:reaction', { messageId, emoji, userId: this.currentUserId });

    await this.ws.send({
      type: 'message:react',
      messageId,
      emoji
    });
  }

  // Typing indicator
  startTyping(conversationId) {
    if (!this.typingTrackers.has(conversationId)) {
      this.typingTrackers.set(conversationId, {
        isTyping: false,
        timeout: null
      });
    }

    const tracker = this.typingTrackers.get(conversationId);

    if (!tracker.isTyping) {
      tracker.isTyping = true;
      this.ws.send({
        type: 'typing:start',
        conversationId
      });
    }

    clearTimeout(tracker.timeout);
    tracker.timeout = setTimeout(() => {
      this.stopTyping(conversationId);
    }, 3000);
  }

  stopTyping(conversationId) {
    const tracker = this.typingTrackers.get(conversationId);

    if (tracker && tracker.isTyping) {
      tracker.isTyping = false;
      clearTimeout(tracker.timeout);

      this.ws.send({
        type: 'typing:stop',
        conversationId
      });
    }
  }

  // Message sync after reconnect
  async syncMessages() {
    const lastMessageIds = new Map();

    this.conversations.forEach((conv, convId) => {
      if (conv.messages.length > 0) {
        const lastMsg = conv.messages[conv.messages.length - 1];
        lastMessageIds.set(convId, lastMsg.id);
      }
    });

    const response = await this.ws.send({
      type: 'message:sync',
      lastMessages: Object.fromEntries(lastMessageIds)
    });

    // Apply missed messages
    response.messages.forEach((msg) => {
      this.handleNewMessage(msg);
    });
  }

  // Flush queued messages
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendWithRetry(message);
    }
  }

  // Conversation helpers
  addMessageToConversation(conversationId, message) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        id: conversationId,
        messages: [],
        unreadCount: 0
      });
    }

    const conv = this.conversations.get(conversationId);

    // Check for duplicate
    if (!conv.messages.find((m) => m.id === message.id)) {
      conv.messages.push(message);
      conv.messages.sort((a, b) => a.createdAt - b.createdAt);

      if (message.senderId !== this.currentUserId && message.status !== 'read') {
        conv.unreadCount++;
      }
    }
  }

  updateMessageStatus(messageId, status, serverId = null, error = null) {
    for (const conv of this.conversations.values()) {
      const message = conv.messages.find((m) => m.id === messageId);
      if (message) {
        message.status = status;
        if (serverId) message.serverId = serverId;
        if (error) message.error = error;
        this.emit('message:statusChanged', { messageId, status, error });
        break;
      }
    }
  }

  findMessage(messageId) {
    for (const conv of this.conversations.values()) {
      const message = conv.messages.find((m) => m.id === messageId);
      if (message) return message;
    }
    return null;
  }

  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event emitter
  listeners = new Map();
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.listeners.get(event).delete(handler);
  }
  emit(event, data) {
    this.listeners.get(event)?.forEach((h) => h(data));
  }
}
```

### Server-Side (Node.js)

```javascript
class ChatServer {
  constructor(wss, db, redis) {
    this.wss = wss;
    this.db = db;
    this.redis = redis;
    this.userConnections = new Map();

    this.setupSubscriptions();
  }

  setupSubscriptions() {
    // Redis pub/sub for multi-server
    this.redis.subscribe('chat:messages');
    this.redis.on('message', (channel, message) => {
      if (channel === 'chat:messages') {
        const data = JSON.parse(message);
        this.deliverMessage(data);
      }
    });
  }

  handleConnection(ws, userId) {
    ws.userId = userId;

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(ws);

    // Deliver pending messages
    this.deliverPendingMessages(userId);
  }

  handleDisconnect(ws) {
    const { userId } = ws;
    if (userId) {
      this.userConnections.get(userId)?.delete(ws);
    }
  }

  async handleMessage(ws, data) {
    switch (data.type) {
      case 'message:send':
        await this.processNewMessage(ws, data);
        break;
      case 'message:delivered':
        await this.markDelivered(data);
        break;
      case 'message:read':
        await this.markRead(ws.userId, data);
        break;
      case 'message:edit':
        await this.editMessage(ws.userId, data);
        break;
      case 'message:delete':
        await this.deleteMessage(ws.userId, data);
        break;
      case 'message:react':
        await this.addReaction(ws.userId, data);
        break;
      case 'typing:start':
      case 'typing:stop':
        await this.handleTyping(ws.userId, data);
        break;
    }
  }

  async processNewMessage(ws, data) {
    const { id: localId, conversationId, content, type, replyTo } = data;

    // Validate conversation access
    const hasAccess = await this.checkConversationAccess(ws.userId, conversationId);
    if (!hasAccess) {
      ws.send(JSON.stringify({
        type: 'message:error',
        localId,
        error: 'Access denied'
      }));
      return;
    }

    // Create message
    const message = {
      id: this.generateId(),
      localId,
      conversationId,
      senderId: ws.userId,
      type,
      content: this.sanitizeContent(content),
      replyTo,
      status: 'sent',
      createdAt: new Date()
    };

    // Store in database
    await this.db.messages.create(message);

    // Update conversation
    await this.db.conversations.update(conversationId, {
      lastMessageId: message.id,
      lastMessageAt: message.createdAt
    });

    // Send acknowledgment to sender
    ws.send(JSON.stringify({
      type: 'message:ack',
      localId,
      serverId: message.id,
      timestamp: message.createdAt.getTime()
    }));

    // Get recipients
    const recipients = await this.getConversationMembers(conversationId);

    // Publish to Redis for multi-server delivery
    await this.redis.publish('chat:messages', JSON.stringify({
      ...message,
      recipients: recipients.filter((id) => id !== ws.userId)
    }));

    // Send push notifications to offline users
    const offlineRecipients = recipients.filter((userId) =>
      !this.userConnections.has(userId) || this.userConnections.get(userId).size === 0
    );

    if (offlineRecipients.length > 0) {
      await this.sendPushNotifications(offlineRecipients, message);
    }
  }

  async deliverMessage(message) {
    const { recipients, ...messageData } = message;

    for (const userId of recipients) {
      const connections = this.userConnections.get(userId);

      if (connections && connections.size > 0) {
        // User online - deliver directly
        connections.forEach((ws) => {
          ws.send(JSON.stringify({
            type: 'message:new',
            ...messageData
          }));
        });
      } else {
        // User offline - store for later delivery
        await this.storePendingMessage(userId, messageData);
      }
    }
  }

  async deliverPendingMessages(userId) {
    const pending = await this.db.pendingMessages.findByUserId(userId);

    const connections = this.userConnections.get(userId);
    if (!connections) return;

    for (const message of pending) {
      connections.forEach((ws) => {
        ws.send(JSON.stringify({
          type: 'message:new',
          ...message
        }));
      });
    }

    // Clear pending
    await this.db.pendingMessages.deleteByUserId(userId);
  }

  async markDelivered(data) {
    const { messageId, conversationId } = data;

    await this.db.messages.update(messageId, {
      status: 'delivered',
      deliveredAt: new Date()
    });

    // Notify sender
    const message = await this.db.messages.findById(messageId);
    this.sendToUser(message.senderId, {
      type: 'message:delivered',
      messageId,
      conversationId
    });
  }

  async markRead(userId, data) {
    const { messageIds, conversationId, readAt } = data;

    // Update read status
    await this.db.messageReads.createMany(
      messageIds.map((messageId) => ({
        messageId,
        userId,
        readAt: new Date(readAt)
      }))
    );

    // Notify senders
    const messages = await this.db.messages.findByIds(messageIds);
    const senderIds = [...new Set(messages.map((m) => m.senderId))];

    senderIds.forEach((senderId) => {
      if (senderId !== userId) {
        this.sendToUser(senderId, {
          type: 'message:read',
          messageIds,
          conversationId,
          userId,
          readAt
        });
      }
    });
  }

  async handleTyping(userId, data) {
    const { conversationId, type } = data;

    const recipients = await this.getConversationMembers(conversationId);

    recipients.forEach((recipientId) => {
      if (recipientId !== userId) {
        this.sendToUser(recipientId, {
          type,
          conversationId,
          userId
        });
      }
    });
  }

  sendToUser(userId, message) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.forEach((ws) => {
        ws.send(JSON.stringify(message));
      });
    }
  }

  sanitizeContent(content) {
    // XSS prevention, profanity filter, etc.
    return {
      ...content,
      text: this.sanitizeText(content.text)
    };
  }

  sanitizeText(text) {
    // Basic XSS prevention
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async checkConversationAccess(userId, conversationId) {
    const member = await this.db.conversationMembers.findOne({
      conversationId,
      userId
    });
    return !!member;
  }

  async getConversationMembers(conversationId) {
    const members = await this.db.conversationMembers.findByConversation(conversationId);
    return members.map((m) => m.userId);
  }
}
```

## Real-World Case: WhatsApp-like Chat

```javascript
class WhatsAppChat extends ChatClient {
  constructor(wsManager) {
    super(wsManager);

    this.mediaUploader = new MediaUploader();
    this.encryptor = new EndToEndEncryption();
  }

  // Send image with thumbnail
  async sendImage(conversationId, file) {
    // Generate thumbnail
    const thumbnail = await this.generateThumbnail(file);

    // Upload media
    const [mediaUrl, thumbnailUrl] = await Promise.all([
      this.mediaUploader.upload(file),
      this.mediaUploader.upload(thumbnail)
    ]);

    return this.sendMessage(conversationId, {
      text: '',
      attachments: [{
        type: 'image',
        url: mediaUrl,
        thumbnail: thumbnailUrl,
        size: file.size,
        dimensions: await this.getImageDimensions(file)
      }]
    }, { type: 'image' });
  }

  // Voice message
  async sendVoiceMessage(conversationId, audioBlob, duration) {
    const waveform = await this.generateWaveform(audioBlob);
    const url = await this.mediaUploader.upload(audioBlob);

    return this.sendMessage(conversationId, {
      text: '',
      attachments: [{
        type: 'audio',
        url,
        duration,
        waveform
      }]
    }, { type: 'audio' });
  }

  // Forward message
  async forwardMessage(messageId, targetConversationIds) {
    const original = this.findMessage(messageId);
    if (!original) throw new Error('Message not found');

    const results = await Promise.all(
      targetConversationIds.map((convId) =>
        this.sendMessage(convId, {
          ...original.content,
          forwardedFrom: {
            messageId: original.id,
            senderName: original.senderName
          }
        })
      )
    );

    return results;
  }

  // Disappearing messages
  async enableDisappearingMessages(conversationId, duration) {
    await this.ws.send({
      type: 'conversation:settings',
      conversationId,
      settings: {
        disappearingMessages: duration // 24h, 7d, 90d
      }
    });
  }

  // Broadcast list
  async sendBroadcast(broadcastId, content) {
    const members = await this.getBroadcastMembers(broadcastId);

    return Promise.all(
      members.map((userId) => {
        // Find or create 1:1 conversation
        const convId = this.getDirectConversation(userId);
        return this.sendMessage(convId, {
          ...content,
          isBroadcast: true
        });
      })
    );
  }

  // Message search
  async searchMessages(query, options = {}) {
    const { conversationId, type, dateRange } = options;

    return this.ws.send({
      type: 'message:search',
      query,
      conversationId,
      messageType: type,
      dateRange
    });
  }

  // Star message
  async starMessage(messageId) {
    await this.ws.send({
      type: 'message:star',
      messageId
    });

    const message = this.findMessage(messageId);
    if (message) {
      message.starred = true;
      this.emit('message:starred', { messageId });
    }
  }

  generateThumbnail(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxSize = 100;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', 0.6);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  }
}
```

## NOTO'G'RI vs TO'G'RI Kodlar

### 1. Optimistic Update

```javascript
// NOTO'G'RI: Server javobini kutish
async function sendMessage(text) {
  showLoader();
  const result = await api.sendMessage(text);
  hideLoader();
  addMessageToUI(result);
}

// TO'G'RI: Optimistic update
async function sendMessage(text) {
  const tempId = generateId();
  const message = {
    id: tempId,
    text,
    status: 'pending'
  };

  // Darhol UI'ga qo'shish
  addMessageToUI(message);

  try {
    const result = await api.sendMessage(text);
    updateMessageStatus(tempId, 'sent', result.id);
  } catch {
    updateMessageStatus(tempId, 'failed');
  }
}
```

### 2. Message Queue

```javascript
// NOTO'G'RI: Offline xabarlar yo'qoladi
function sendMessage(text) {
  ws.send({ type: 'message', text }); // Offline bo'lsa xato
}

// TO'G'RI: Queue bilan
const messageQueue = [];

function sendMessage(text) {
  const message = { type: 'message', text, id: generateId() };

  if (ws.isConnected) {
    ws.send(message);
  } else {
    messageQueue.push(message);
    updateMessageStatus(message.id, 'queued');
  }
}

ws.on('connected', () => {
  while (messageQueue.length > 0) {
    ws.send(messageQueue.shift());
  }
});
```

### 3. Read Receipts

```javascript
// NOTO'G'RI: Har xabar uchun alohida request
messages.forEach(msg => {
  ws.send({ type: 'read', messageId: msg.id }); // N ta request
});

// TO'G'RI: Batch
const unreadIds = messages
  .filter(m => m.status !== 'read' && m.senderId !== currentUserId)
  .map(m => m.id);

if (unreadIds.length > 0) {
  ws.send({
    type: 'message:read',
    messageIds: unreadIds,
    readAt: Date.now()
  });
}
```

### 4. Message Deduplication

```javascript
// NOTO'G'RI: Duplicate message qo'shiladi
function handleNewMessage(message) {
  conversation.messages.push(message);
}

// TO'G'RI: Deduplication
function handleNewMessage(message) {
  const exists = conversation.messages.find(m =>
    m.id === message.id || m.localId === message.localId
  );

  if (!exists) {
    conversation.messages.push(message);
    conversation.messages.sort((a, b) => a.createdAt - b.createdAt);
  }
}
```

### 5. Scroll Position

```javascript
// NOTO'G'RI: Yangi xabar scroll buzadi
function handleNewMessage(message) {
  addMessage(message);
  scrollToBottom(); // User o'qiyotgan joydan ko'chiradi
}

// TO'G'RI: Smart scroll
function handleNewMessage(message) {
  const wasAtBottom = isScrolledToBottom();
  const isOwnMessage = message.senderId === currentUserId;

  addMessage(message);

  // Faqat pastda bo'lsa yoki o'z xabari bo'lsa scroll
  if (wasAtBottom || isOwnMessage) {
    scrollToBottom({ behavior: 'smooth' });
  } else {
    showNewMessageIndicator();
  }
}

function isScrolledToBottom() {
  const { scrollTop, scrollHeight, clientHeight } = container;
  return scrollHeight - scrollTop - clientHeight < 100;
}
```

## Reconnect Bug'larni Hal Qilish

### 1. Message Sync Gap

```javascript
// MUAMMO: Reconnect'da xabarlar yo'qoladi

// YECHIM: LastMessageId bilan sync
async function syncOnReconnect() {
  const conversationsToSync = [];

  conversations.forEach((conv, convId) => {
    if (conv.messages.length > 0) {
      conversationsToSync.push({
        conversationId: convId,
        lastMessageId: conv.messages[conv.messages.length - 1].id,
        lastMessageTime: conv.messages[conv.messages.length - 1].createdAt
      });
    }
  });

  const response = await ws.send({
    type: 'sync:messages',
    conversations: conversationsToSync
  });

  // Apply missed messages
  response.missedMessages.forEach(msg => {
    handleNewMessage(msg);
  });

  // Apply status updates
  response.statusUpdates.forEach(update => {
    updateMessageStatus(update.messageId, update.status);
  });
}
```

### 2. Pending Message Recovery

```javascript
// MUAMMO: Pending xabarlar reconnect'da stuck qoladi

// YECHIM: Reconnect'da qayta yuborish
class PendingMessageManager {
  constructor() {
    this.pending = new Map();
    this.maxAge = 3600000; // 1 hour
  }

  add(message) {
    this.pending.set(message.id, {
      message,
      createdAt: Date.now(),
      retries: 0
    });
  }

  remove(messageId) {
    this.pending.delete(messageId);
  }

  onReconnect(ws) {
    const now = Date.now();

    this.pending.forEach((item, id) => {
      // Eski xabarlarni o'chirish
      if (now - item.createdAt > this.maxAge) {
        this.remove(id);
        updateMessageStatus(id, 'expired');
        return;
      }

      // Qayta yuborish
      item.retries++;
      ws.send({
        type: 'message:send',
        ...item.message,
        isRetry: true,
        retryCount: item.retries
      });
    });
  }
}
```

### 3. Typing State Reset

```javascript
// MUAMMO: Reconnect'da typing indicator stuck qoladi

// YECHIM: Reconnect'da reset
const typingUsers = new Map();

ws.on('disconnected', () => {
  // Clear all typing states
  typingUsers.clear();
  updateTypingUI();
});

ws.on('connected', () => {
  // Re-subscribe to typing events
  ws.send({
    type: 'typing:subscribe',
    conversationIds: Array.from(openConversations)
  });
});
```

## Vue.js Chat Component

```vue
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatClient } from '@/composables/useChatClient';

const props = defineProps({
  conversationId: String
});

const {
  messages,
  sendMessage,
  markAsRead,
  startTyping,
  stopTyping,
  typingUsers,
  connectionState
} = useChatClient(props.conversationId);

const inputText = ref('');
const messagesContainer = ref(null);
const isAtBottom = ref(true);

// Auto-scroll on new messages
watch(
  () => messages.value.length,
  async () => {
    if (isAtBottom.value) {
      await nextTick();
      scrollToBottom();
    }
  }
);

// Scroll handling
function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 100;

  // Mark visible messages as read
  markVisibleMessagesAsRead();
}

function scrollToBottom(behavior = 'smooth') {
  messagesContainer.value?.scrollTo({
    top: messagesContainer.value.scrollHeight,
    behavior
  });
}

// Mark messages as read when visible
function markVisibleMessagesAsRead() {
  const container = messagesContainer.value;
  if (!container) return;

  const unreadMessages = messages.value.filter(
    (m) => m.status !== 'read' && m.senderId !== currentUserId
  );

  const visibleUnread = unreadMessages.filter((m) => {
    const el = document.getElementById(`message-${m.id}`);
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
  });

  if (visibleUnread.length > 0) {
    markAsRead(visibleUnread.map((m) => m.id));
  }
}

// Send message
async function handleSend() {
  if (!inputText.value.trim()) return;

  const text = inputText.value;
  inputText.value = '';
  stopTyping();

  await sendMessage({ text });
}

// Typing indicator
let typingTimeout;

function onInput() {
  startTyping();

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(stopTyping, 3000);
}

// Message grouping
const groupedMessages = computed(() => {
  const groups = [];
  let currentGroup = null;

  messages.value.forEach((msg) => {
    const msgDate = new Date(msg.createdAt).toDateString();
    const prevDate = currentGroup?.date;

    if (msgDate !== prevDate) {
      currentGroup = { date: msgDate, messages: [] };
      groups.push(currentGroup);
    }

    // Group consecutive messages from same sender
    const lastMsg = currentGroup.messages[currentGroup.messages.length - 1];
    const isSameSender = lastMsg?.senderId === msg.senderId;
    const isCloseTime = lastMsg && msg.createdAt - lastMsg.createdAt < 60000;

    if (isSameSender && isCloseTime) {
      lastMsg.grouped = lastMsg.grouped || [lastMsg];
      lastMsg.grouped.push(msg);
    } else {
      currentGroup.messages.push(msg);
    }
  });

  return groups;
});

// Typing indicator text
const typingText = computed(() => {
  const users = typingUsers.value;
  if (users.length === 0) return null;
  if (users.length === 1) return `${users[0].name} is typing...`;
  if (users.length === 2) return `${users[0].name} and ${users[1].name} are typing...`;
  return `${users[0].name} and ${users.length - 1} others are typing...`;
});
</script>

<template>
  <div class="chat-container">
    <!-- Connection status -->
    <div v-if="connectionState !== 'connected'" class="connection-banner">
      {{ connectionState === 'reconnecting' ? 'Reconnecting...' : 'Offline' }}
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="messages-container"
      @scroll="onScroll"
    >
      <div v-for="group in groupedMessages" :key="group.date" class="message-group">
        <div class="date-divider">{{ group.date }}</div>

        <div
          v-for="message in group.messages"
          :key="message.id"
          :id="`message-${message.id}`"
          :class="['message', { own: message.senderId === currentUserId }]"
        >
          <div class="message-content">
            {{ message.content.text }}
          </div>

          <div class="message-meta">
            <span class="time">
              {{ formatTime(message.createdAt) }}
            </span>
            <span v-if="message.senderId === currentUserId" class="status">
              <CheckIcon v-if="message.status === 'sent'" />
              <CheckDoubleIcon v-if="message.status === 'delivered'" />
              <CheckDoubleIcon v-if="message.status === 'read'" class="read" />
              <ClockIcon v-if="message.status === 'pending'" />
              <ErrorIcon v-if="message.status === 'failed'" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Typing indicator -->
    <div v-if="typingText" class="typing-indicator">
      {{ typingText }}
    </div>

    <!-- Input -->
    <div class="input-container">
      <input
        v-model="inputText"
        @input="onInput"
        @keydown.enter="handleSend"
        placeholder="Type a message..."
      />
      <button @click="handleSend" :disabled="!inputText.trim()">
        Send
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  max-width: 70%;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f0f0f0;
}

.message.own {
  margin-left: auto;
  background: #dcf8c6;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #888;
}

.status.read {
  color: #4fc3f7;
}

.typing-indicator {
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
}

.input-container {
  display: flex;
  padding: 12px;
  border-top: 1px solid #eee;
}
</style>
```

## Interview Savollari

### 1. Optimistic update nima va chat'da qanday ishlatiladi?

**Javob:**
Optimistic update - server javobini kutmasdan UI'ni darhol yangilash.

```javascript
// 1. Darhol UI'ga qo'shish (pending status)
addMessage({ id: tempId, text, status: 'pending' });

// 2. Server'ga yuborish
const result = await sendToServer(message);

// 3. Status yangilash
updateStatus(tempId, 'sent', result.serverId);
```

**Afzalliklari:**
- Instant feedback
- Better UX (lagless feel)
- Works offline (with queue)

### 2. Message delivery confirmation qanday ishlaydi?

**Javob:**
1. **Sent (1 check):** Server message'ni qabul qildi va saqladi
2. **Delivered (2 checks):** Recipient device'ga yetdi
3. **Read (blue/seen):** Recipient ko'rdi

```javascript
// Server ack - sent
ws.on('message:ack', (data) => {
  updateStatus(data.localId, 'sent');
});

// Recipient device ack - delivered
ws.on('message:delivered', (data) => {
  updateStatus(data.messageId, 'delivered');
});

// User read - read
ws.on('message:read', (data) => {
  updateStatus(data.messageId, 'read');
});
```

### 3. Offline message queueing qanday implement qilinadi?

**Javob:**
1. Message queue local'da saqlanadi
2. Online bo'lganda queue flush qilinadi
3. Server idempotent (duplicate handle qiladi)

```javascript
const queue = [];

function send(message) {
  if (online) {
    ws.send(message);
  } else {
    queue.push(message);
    showPendingUI(message);
  }
}

ws.on('connected', () => {
  queue.forEach(msg => ws.send(msg));
  queue.length = 0;
});
```

### 4. Read receipts ni efficient qanday qilish mumkin?

**Javob:**
1. **Batch:** Ko'p message ID'larni bitta request'da
2. **Debounce:** Tez-tez yubormaslik
3. **Visibility-based:** Faqat ko'ringan message'lar

```javascript
// Batch + debounce
const pendingReadIds = new Set();

function markAsRead(messageId) {
  pendingReadIds.add(messageId);
  debouncedSendReadReceipts();
}

const debouncedSendReadReceipts = debounce(() => {
  ws.send({
    type: 'message:read',
    messageIds: [...pendingReadIds]
  });
  pendingReadIds.clear();
}, 500);
```

### 5. Chat'da duplicate message qanday oldini olinadi?

**Javob:**
1. **Client-side ID:** Har message'ga unique local ID
2. **Server idempotency:** Local ID bo'yicha tekshirish
3. **Deduplication on receive:** UI'ga qo'shishdan oldin tekshirish

```javascript
// Client
const localId = generateUUID();
send({ localId, text });

// Server
if (await messageExists(localId)) {
  return existingMessage;
}
await createMessage({ localId, ... });

// Client receive
function handleMessage(msg) {
  if (!messages.find(m => m.id === msg.id)) {
    messages.push(msg);
  }
}
```

## Xulosa

Professional chat tizimi quyidagilarni o'z ichiga oladi:

1. **Optimistic updates** - instant feedback
2. **Message queue** - offline support
3. **Delivery/read receipts** - status tracking
4. **Typing indicators** - presence awareness
5. **Sync mechanism** - reconnect handling
6. **Deduplication** - data integrity

Production chat tizimi murakkab state management va reliability talab qiladi.

Keyingi bo'lim: [Live Notifications](./07-live-notifications.md)
