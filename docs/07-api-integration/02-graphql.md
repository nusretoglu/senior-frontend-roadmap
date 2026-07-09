# GraphQL

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> REST ajoyib, lekin u har doim bir xil ma'lumot qolipini qaytaradi. Masalan, sizga faqat foydalanuvchining ismi kerak bo'lsa ham, REST butun boshli foydalanuvchi profilini (yoshi, manzili, paroli) yuklab keladi (Over-fetching). Yoki foydalanuvchi va uning postlarini olish uchun 2 xil API ga zapros yuborish kerak bo'ladi (Under-fetching). GraphQL shu ikkita katta muammoni hal qiladi va frontend dasturchiga faqat o'ziga kerakli ma'lumotni so'rash imkoniyatini beradi.

> [!NOTE]
> **Real-hayot analogiyasi: "Set menyu vs Shved stoli (Buffet)"**  
> **REST (Set menyu):** Restoranga borasiz va 1-raqamli menyuni buyurasiz. Sizga sho'rva, ikkinchi ovqat va salat olib kelishadi. Siz faqat salat yemoqchi bo'lsangiz ham, barini olasiz va pulini to'laysiz (Over-fetching).
> **GraphQL (Shved stoli):** Likopchani olib, faqatgina o'zingiz yemoqchi bo'lgan narsadan ozgina solib olasiz. Xohlasangiz sho'rvani o'zi, xohlasangiz faqat shirinlik. Aynan o'zingiz so'ragan narsa keladi.

GraphQL - Facebook tomonidan 2012-yilda ichki ishlatish uchun yaratilgan va 2015-yilda open-source qilingan query language va runtime. REST'dan farqli o'laroq, client o'zi qaysi data kerakligini aniq belgilaydi.

## REST vs GraphQL: Asosiy Farqlar

```mermaid
graph TD
    subgraph REST API
        R_Client[Client] -->|GET /users| R_Users[Users Endpoint]
        R_Client -->|GET /posts| R_Posts[Posts Endpoint]
        R_Users -.-> |Full User Data| R_Client
        R_Posts -.-> |Full Posts Data| R_Client
    end

    subgraph GraphQL API
        G_Client[Client] -->|query { users, posts }| G_Endpoint[Bitta /graphql Endpoint]
        G_Endpoint -.-> |Faqat so'ralgan Data| G_Client
    end
    
    style REST API fill:#ffebee,stroke:#c62828
    style GraphQL API fill:#e8f5e9,stroke:#2e7d32
```

### Over-fetching Muammosi

```javascript
// REST - kerakdan ortiq data keladi
GET /api/users/123

Response: {
  id: 123,
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  address: { ... },
  preferences: { ... },
  created_at: "2024-01-01",
  updated_at: "2024-01-15",
  last_login: "2024-01-14",
  avatar_url: "...",
  // ... 20 ta boshqa field
}

// Lekin bizga faqat name va email kerak edi

// GraphQL - aniq kerakli field'lar
query {
  user(id: 123) {
    name
    email
  }
}

Response: {
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Under-fetching Muammosi

```javascript
// REST - bir necha request kerak
// 1. User ma'lumotlari
const user = await fetch('/api/users/123');
// 2. User'ning posts'lari
const posts = await fetch('/api/users/123/posts');
// 3. Har bir post uchun comments
const comments = await Promise.all(
  posts.map(p => fetch(`/api/posts/${p.id}/comments`))
);

// GraphQL - bitta request
query {
  user(id: 123) {
    name
    posts {
      title
      comments {
        text
        author {
          name
        }
      }
    }
  }
}
```

## GraphQL Asoslari

### Schema Definition Language (SDL)

```graphql
# Type definitions
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  published: Boolean!
}

type Comment {
  id: ID!
  text: String!
  author: User!
  post: Post!
}

# Custom scalar
scalar DateTime

# Enum
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

# Input type (mutations uchun)
input CreatePostInput {
  title: String!
  content: String!
  status: PostStatus = DRAFT
}

# Query - read operations
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(status: PostStatus): [Post!]!
}

# Mutation - write operations
type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

# Subscription - real-time
type Subscription {
  postCreated: Post!
  commentAdded(postId: ID!): Comment!
}
```

### Query

```javascript
// Basic query
const GET_USER = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

// Fetch with variables
async function getUser(id) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GET_USER,
      variables: { id },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new GraphQLError(errors);
  }

  return data.user;
}

// Complex query with fragments
const GET_USER_WITH_POSTS = `
  fragment UserFields on User {
    id
    name
    email
    avatar
  }

  fragment PostFields on Post {
    id
    title
    excerpt
    createdAt
  }

  query GetUserWithPosts($id: ID!, $postsLimit: Int = 10) {
    user(id: $id) {
      ...UserFields
      posts(limit: $postsLimit, orderBy: CREATED_AT_DESC) {
        ...PostFields
        comments(limit: 3) {
          id
          text
          author {
            ...UserFields
          }
        }
      }
    }
  }
`;
```

### Mutation

```javascript
// Create
const CREATE_POST = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

async function createPost(postData) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: CREATE_POST,
      variables: {
        input: {
          title: postData.title,
          content: postData.content,
          status: 'DRAFT',
        },
      },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new GraphQLError(errors);
  }

  return data.createPost;
}

// Update with optimistic response
const UPDATE_POST = `
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      content
      updatedAt
    }
  }
`;

// Delete
const DELETE_POST = `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      success
      message
    }
  }
`;
```

### Subscription

```javascript
// WebSocket-based subscription
import { createClient } from 'graphql-ws';

const client = createClient({
  url: 'wss://api.example.com/graphql',
  connectionParams: {
    authToken: getAuthToken(),
  },
});

// Subscribe to new comments
const COMMENT_SUBSCRIPTION = `
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      text
      author {
        id
        name
        avatar
      }
      createdAt
    }
  }
`;

function subscribeToComments(postId, onComment) {
  return client.subscribe(
    {
      query: COMMENT_SUBSCRIPTION,
      variables: { postId },
    },
    {
      next: ({ data }) => {
        if (data?.commentAdded) {
          onComment(data.commentAdded);
        }
      },
      error: (err) => {
        console.error('Subscription error:', err);
      },
      complete: () => {
        console.log('Subscription complete');
      },
    }
  );
}

// Usage
const unsubscribe = subscribeToComments('post_123', (comment) => {
  console.log('New comment:', comment);
  addCommentToUI(comment);
});

// Cleanup
window.addEventListener('beforeunload', unsubscribe);
```

## Apollo Client Integration

### Setup

```javascript
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  split
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP link (queries, mutations)
const httpLink = new HttpLink({
  uri: '/graphql',
});

// WebSocket link (subscriptions)
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'wss://api.example.com/graphql',
    connectionParams: {
      authToken: getAuthToken(),
    },
  })
);

// Auth link
const authLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {
      authorization: `Bearer ${getAuthToken()}`,
    },
  });
  return forward(operation);
});

// Split link - subscription vs query/mutation
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            // Merge paginated results
            keyArgs: ['status'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
});
```

### React Integration

```javascript
import { ApolloProvider, useQuery, useMutation, useSubscription } from '@apollo/client';
import { gql } from '@apollo/client';

// Query hook
const GET_POSTS = gql`
  query GetPosts($status: PostStatus, $limit: Int, $cursor: String) {
    posts(status: $status, first: $limit, after: $cursor) {
      edges {
        node {
          id
          title
          excerpt
          author {
            name
            avatar
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function PostList() {
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: { status: 'PUBLISHED', limit: 10 },
    notifyOnNetworkStatusChange: true,
  });

  if (loading && !data) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  const { edges, pageInfo } = data.posts;

  const loadMore = () => {
    if (!pageInfo.hasNextPage) return;

    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
      },
    });
  };

  return (
    <div>
      {edges.map(({ node: post }) => (
        <PostCard key={post.id} post={post} />
      ))}

      {pageInfo.hasNextPage && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// Mutation hook
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
    }
  }
`;

function CreatePostForm() {
  const [createPost, { loading, error }] = useMutation(CREATE_POST, {
    // Cache update
    update(cache, { data: { createPost } }) {
      cache.modify({
        fields: {
          posts(existingPosts = []) {
            const newPostRef = cache.writeFragment({
              data: createPost,
              fragment: gql`
                fragment NewPost on Post {
                  id
                  title
                  content
                }
              `,
            });
            return [newPostRef, ...existingPosts];
          },
        },
      });
    },
    // Optimistic response
    optimisticResponse: {
      createPost: {
        __typename: 'Post',
        id: 'temp-id',
        title: formData.title,
        content: formData.content,
      },
    },
    onCompleted: () => {
      showSuccess('Post created!');
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = async (formData) => {
    await createPost({
      variables: { input: formData },
    });
  };

  return <Form onSubmit={handleSubmit} loading={loading} error={error} />;
}

// Subscription hook
const COMMENT_ADDED = gql`
  subscription OnCommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      text
      author {
        name
        avatar
      }
    }
  }
`;

function PostComments({ postId }) {
  const { data: subscriptionData } = useSubscription(COMMENT_ADDED, {
    variables: { postId },
    onData: ({ data }) => {
      // New comment received
      const newComment = data.data.commentAdded;
      addToCommentsCache(newComment);
    },
  });

  // ...
}
```

## Caching Strategies

### Normalized Cache

```javascript
// Apollo automatically normalizes by __typename and id
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      // Custom key field
      keyFields: ['email'], // default: ['id']
    },
    Post: {
      fields: {
        // Field-level policies
        isLiked: {
          read(_, { readField }) {
            const likes = readField('likes') || [];
            const currentUserId = getCurrentUserId();
            return likes.some(like => like.userId === currentUserId);
          },
        },
        formattedDate: {
          read(_, { readField }) {
            const createdAt = readField('createdAt');
            return formatDate(createdAt);
          },
        },
      },
    },
  },
});

// Cache normalized storage
// {
//   'User:123': { __typename: 'User', id: '123', name: 'John' },
//   'Post:456': { __typename: 'Post', id: '456', title: '...', author: { __ref: 'User:123' } },
// }
```

### Cache Updates After Mutations

```javascript
// 1. Automatic update (same ID, same fields)
const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id  # Same ID - avtomatik update
      title
      content
    }
  }
`;

// 2. Manual cache update (adding/removing)
const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`;

const [deletePost] = useMutation(DELETE_POST, {
  update(cache, { data: { deletePost } }) {
    // Remove from cache
    cache.evict({ id: cache.identify(deletePost) });
    cache.gc(); // Garbage collection
  },
});

// 3. RefetchQueries
const [createPost] = useMutation(CREATE_POST, {
  refetchQueries: [
    { query: GET_POSTS, variables: { status: 'PUBLISHED' } },
    'GetUserPosts', // Query name
  ],
  awaitRefetchQueries: true,
});
```

## Error Handling

### GraphQL Error Types

```javascript
// GraphQL response structure
{
  "data": { ... },  // Partial data (nullable fields)
  "errors": [
    {
      "message": "User not found",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "exception": {
          "stacktrace": [...]
        }
      }
    }
  ]
}

// Error handling
class GraphQLClientError extends Error {
  constructor(errors) {
    super(errors[0]?.message || 'GraphQL Error');
    this.name = 'GraphQLClientError';
    this.errors = errors;
  }

  getCode() {
    return this.errors[0]?.extensions?.code;
  }

  isNotFound() {
    return this.getCode() === 'NOT_FOUND';
  }

  isUnauthorized() {
    return this.getCode() === 'UNAUTHORIZED';
  }

  getFieldErrors() {
    return this.errors.filter(e => e.extensions?.code === 'VALIDATION_ERROR');
  }
}

// Apollo error handling
import { ApolloError } from '@apollo/client';

function handleApolloError(error) {
  if (error instanceof ApolloError) {
    // GraphQL errors
    if (error.graphQLErrors.length > 0) {
      error.graphQLErrors.forEach(({ message, extensions }) => {
        switch (extensions?.code) {
          case 'UNAUTHORIZED':
            redirectToLogin();
            break;
          case 'FORBIDDEN':
            showError('Permission denied');
            break;
          case 'VALIDATION_ERROR':
            showValidationErrors(extensions.validationErrors);
            break;
          default:
            showError(message);
        }
      });
    }

    // Network error
    if (error.networkError) {
      showError('Network error. Please check your connection.');
    }
  }
}
```

### Error Link

```javascript
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions?.code) {
        case 'UNAUTHENTICATED':
          // Token expired - refresh and retry
          return fromPromise(
            refreshToken().then(() => {
              // Update headers with new token
              operation.setContext({
                headers: {
                  ...operation.getContext().headers,
                  authorization: `Bearer ${getNewToken()}`,
                },
              });
            })
          ).flatMap(() => forward(operation));

        default:
          console.error(`[GraphQL error]: ${err.message}`);
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Offline support
    if (!navigator.onLine) {
      queueOperation(operation);
    }
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});
```

## Real-World Case: Social Media Feed

```javascript
// Complete social media feed implementation
const FEED_QUERY = gql`
  query GetFeed($cursor: String, $limit: Int = 20) {
    feed(after: $cursor, first: $limit) {
      edges {
        node {
          id
          ... on Post {
            content
            mediaUrls
            author {
              id
              name
              avatar
              isFollowed
            }
            likesCount
            commentsCount
            isLiked
            createdAt
          }
          ... on SharedPost {
            originalPost {
              id
              content
              author {
                name
              }
            }
            sharedBy {
              name
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      likesCount
      isLiked
    }
  }
`;

const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      id
      likesCount
      isLiked
    }
  }
`;

const NEW_FEED_ITEM = gql`
  subscription OnNewFeedItem {
    newFeedItem {
      id
      ... on Post {
        content
        author {
          name
          avatar
        }
        createdAt
      }
    }
  }
`;

function SocialFeed() {
  const { data, loading, fetchMore, subscribeToMore } = useQuery(FEED_QUERY);

  // Real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: NEW_FEED_ITEM,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newItem = subscriptionData.data.newFeedItem;

        // Duplicate check
        const exists = prev.feed.edges.some(
          edge => edge.node.id === newItem.id
        );
        if (exists) return prev;

        return {
          ...prev,
          feed: {
            ...prev.feed,
            edges: [
              { node: newItem, cursor: newItem.id },
              ...prev.feed.edges,
            ],
          },
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  // Like functionality
  const [likePost] = useMutation(LIKE_POST, {
    optimisticResponse: ({ postId }) => ({
      likePost: {
        __typename: 'Post',
        id: postId,
        likesCount: getLikesCount(postId) + 1,
        isLiked: true,
      },
    }),
  });

  const [unlikePost] = useMutation(UNLIKE_POST, {
    optimisticResponse: ({ postId }) => ({
      unlikePost: {
        __typename: 'Post',
        id: postId,
        likesCount: getLikesCount(postId) - 1,
        isLiked: false,
      },
    }),
  });

  const handleLike = (post) => {
    if (post.isLiked) {
      unlikePost({ variables: { postId: post.id } });
    } else {
      likePost({ variables: { postId: post.id } });
    }
  };

  // Infinite scroll
  const loadMore = () => {
    if (!data?.feed.pageInfo.hasNextPage) return;

    fetchMore({
      variables: {
        cursor: data.feed.pageInfo.endCursor,
      },
    });
  };

  return (
    <InfiniteScroll
      dataLength={data?.feed.edges.length || 0}
      next={loadMore}
      hasMore={data?.feed.pageInfo.hasNextPage}
      loader={<FeedSkeleton />}
    >
      {data?.feed.edges.map(({ node: item }) => (
        <FeedItem
          key={item.id}
          item={item}
          onLike={() => handleLike(item)}
        />
      ))}
    </InfiniteScroll>
  );
}
```

## Interview Savollari

### 1. GraphQL vs REST: qachon qaysi birini tanlash kerak?

**Javob:**

**GraphQL tanlang:**
- Complex, nested data relationships
- Mobile apps (network bandwidth muhim)
- Rapid frontend iteration (backend o'zgartirmasdan)
- Real-time features kerak (subscriptions)
- Ko'p turli client'lar (web, mobile, TV)

**REST tanlang:**
- Simple CRUD operations
- Caching muhim (HTTP caching bepul)
- Team GraphQL bilmaydi
- Microservices (har bir service o'z API'si)
- File upload/download

```javascript
// GraphQL - complex nested query
query {
  user(id: 1) {
    posts {
      comments {
        author { name }
      }
    }
  }
}
// 1 request

// REST - multiple requests
GET /users/1
GET /users/1/posts
GET /posts/1/comments
GET /posts/2/comments
// N+1 problem
```

### 2. N+1 muammosi GraphQL'da qanday hal qilinadi?

**Javob:** DataLoader pattern - batching va caching.

```javascript
// ❌ N+1 problem
// Query: { users { posts { title } } }
// 1 query for users + N queries for posts

// ✅ DataLoader solution
import DataLoader from 'dataloader';

const postLoader = new DataLoader(async (userIds) => {
  // Batch: 1 query for all users' posts
  const posts = await db.posts.findMany({
    where: { authorId: { in: userIds } },
  });

  // Map posts to users
  return userIds.map(id =>
    posts.filter(post => post.authorId === id)
  );
});

// Resolver
const resolvers = {
  User: {
    posts: (user) => postLoader.load(user.id),
  },
};
```

### 3. Optimistic UI nima va qanday implement qilinadi?

**Javob:** Server response kutmasdan UI'ni darhol yangilash, keyin real response bilan sync qilish.

```javascript
const [addTodo] = useMutation(ADD_TODO, {
  optimisticResponse: {
    addTodo: {
      __typename: 'Todo',
      id: 'temp-' + Date.now(),
      text: inputValue,
      completed: false,
    },
  },
  update(cache, { data: { addTodo } }) {
    cache.modify({
      fields: {
        todos(existingTodos = []) {
          const newTodoRef = cache.writeFragment({
            data: addTodo,
            fragment: gql`
              fragment NewTodo on Todo {
                id
                text
                completed
              }
            `,
          });
          return [...existingTodos, newTodoRef];
        },
      },
    });
  },
});

// UI immediately shows new todo
// If server fails, Apollo rolls back automatically
```

### 4. Fragment nima va nima uchun ishlatiladi?

**Javob:** Reusable query bo'laklari - DRY principle.

```javascript
// ❌ Takrorlanuvchi fields
const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      author {
        id
        name
        avatar
        email
      }
    }
  }
`;

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
      author {
        id
        name
        avatar
        email
      }
    }
  }
`;

// ✅ Fragment bilan
const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    avatar
    email
  }
`;

const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    title
    content
    author {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;
```

### 5. Persisted Queries nima?

**Javob:** Query'larni hash bilan saqlash - security va performance.

```javascript
// Traditional - full query yuboriladi
POST /graphql
{
  "query": "query GetUser($id: ID!) { user(id: $id) { name email } }",
  "variables": { "id": "123" }
}

// Persisted - faqat hash yuboriladi
POST /graphql
{
  "extensions": {
    "persistedQuery": {
      "sha256Hash": "abc123..."
    }
  },
  "variables": { "id": "123" }
}

// Benefits:
// 1. Smaller payload
// 2. No arbitrary queries (security)
// 3. Better caching (CDN)

// Apollo Client setup
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';

const link = createPersistedQueryLink({ sha256 });
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Faqat keraklisini so'rang**: Qulay bo'lishi uchun har doim `...UserFields` deb barcha narsani so'ravermang. Qaysi komponentga aynan qaysi qator (field) kerak bo'lsa o'shanigina query qiling.
2. **Fragmentlardan foydalaning**: UI komponentlarga qarab ma'lumot so'rang. Har bir Vue komponenti o'ziga kerakli GraphQL fragmentini define qilishi va ota komponent bu fragmentlarni birlashtirib (compose qilib) query yuborishi afzal.
3. **Optimistic UI yarating**: Mutatsiyalar yuborilayotgan paytda, server javobini kutmasdan UI ni birdan yangilab qo'ying (Apollo'ning `optimisticResponse` opsiyasi orqali).
4. **Caching imkoniyatlaridan foydalaning**: GraphQL Apollo Client yoki Urql kabi kuchli kesh xotira tizimiga ega. Har bir ma'lumotning o'z identifikatori (masalan `User:123`) bor. Keshni ehtiyotkorlik bilan boshqaring.

---

## Xulosa

| Tushuncha | Vazifasi | REST dagi analogi |
|-----------|----------|-------------------|
| **Query** | Ma'lumotlarni o'qib olish | `GET` request |
| **Mutation** | Yangi yaratish, o'zgartirish, o'chirish | `POST`, `PUT`, `DELETE` |
| **Subscription**| Real-vaqtda ma'lumotlarni eshitib turish | WebSockets yoki Server-Sent Events |
| **Fragment** | Query'ni qayta ishlatiladigan bo'laklarga bo'lish | - (Yo'q) |
| **Apollo Client**| Ma'lumot tortish, keshlash va boshqarish | Axios + React Query / SWR |

GraphQL - murakkab data requirements bo'lgan ilovalar uchun kuchli tool. Apollo Client bilan birga real-time updates, optimistic UI, va intelligent caching mumkin. Lekin har doim REST'dan yaxshiroq degani emas - foydalanuvchiga nima kerak bo'lsa shunga qarab tanlash kerak (oddiy blog uchun REST qulayroq).

**Keyingi qadam:** [03-pagination.md](./03-pagination.md) - katta data to'plamlarini samarali yuklash strategiyalari.
