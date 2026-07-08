# Pagination

## Kirish

Pagination - katta data to'plamlarini kichik, boshqariladigan bo'laklarga bo'lish. Millionlab yozuvlarni bir vaqtda yuklash imkonsiz, shuning uchun to'g'ri pagination strategiyasi critical ahamiyatga ega.

## Pagination Turlari

### 1. Offset-based (Traditional)

Eng oddiy va keng tarqalgan usul. SQL OFFSET/LIMIT ga asoslangan.

```javascript
// Backend response format
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "page": 2,
    "limit": 20,
    "totalPages": 50
  }
}

// Frontend implementation
class OffsetPagination {
  constructor(fetchFn, limit = 20) {
    this.fetchFn = fetchFn;
    this.limit = limit;
    this.currentPage = 1;
    this.totalPages = 0;
    this.items = [];
  }

  async loadPage(page) {
    const offset = (page - 1) * this.limit;

    const response = await this.fetchFn({
      offset,
      limit: this.limit,
    });

    this.items = response.data;
    this.currentPage = page;
    this.totalPages = response.pagination.totalPages;

    return this.items;
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      return this.loadPage(this.currentPage + 1);
    }
    return this.items;
  }

  async prevPage() {
    if (this.currentPage > 1) {
      return this.loadPage(this.currentPage - 1);
    }
    return this.items;
  }

  async goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      return this.loadPage(page);
    }
    throw new Error('Invalid page number');
  }
}

// API call
async function fetchUsers({ offset, limit }) {
  const params = new URLSearchParams({ offset, limit });
  const response = await fetch(`/api/users?${params}`);
  return response.json();
}

// Usage
const pagination = new OffsetPagination(fetchUsers, 20);
await pagination.loadPage(1);
await pagination.nextPage();
await pagination.goToPage(5);
```

**Muammolari:**

```javascript
// 1. Performance - katta offset sekin
// SELECT * FROM users OFFSET 999980 LIMIT 20;
// Database 999,980 qator skip qilishi kerak

// 2. Data consistency - real-time muammo
// Page 1 yuklanmoqda: [1, 2, 3, 4, 5]
// Yangi item qo'shildi (id: 0)
// Page 2 yuklanmoqda: [5, 6, 7, 8, 9] <- 5 duplicate!

// 3. Delete holatida
// Page 1 yuklanmoqda: [1, 2, 3, 4, 5]
// Item 3 o'chirildi
// Page 2 yuklanmoqda: [7, 8, 9, 10, 11] <- 6 skip bo'ldi!
```

### 2. Cursor-based (Keyset)

Muayyan field (odatda id yoki timestamp) asosida keyingi sahifani aniqlash.

```javascript
// Backend response format
{
  "data": [...],
  "pageInfo": {
    "hasNextPage": true,
    "hasPreviousPage": false,
    "startCursor": "eyJpZCI6MTB9",  // base64("{"id":10}")
    "endCursor": "eyJpZCI6MjB9"
  }
}

// Frontend implementation
class CursorPagination {
  constructor(fetchFn, limit = 20) {
    this.fetchFn = fetchFn;
    this.limit = limit;
    this.items = [];
    this.cursors = {
      start: null,
      end: null,
      hasNext: true,
      hasPrev: false,
    };
  }

  async loadInitial() {
    const response = await this.fetchFn({
      first: this.limit,
    });

    this.items = response.data;
    this.updateCursors(response.pageInfo);

    return this.items;
  }

  async loadNext() {
    if (!this.cursors.hasNext) return this.items;

    const response = await this.fetchFn({
      first: this.limit,
      after: this.cursors.end,
    });

    this.items = response.data;
    this.updateCursors(response.pageInfo);

    return this.items;
  }

  async loadPrevious() {
    if (!this.cursors.hasPrev) return this.items;

    const response = await this.fetchFn({
      last: this.limit,
      before: this.cursors.start,
    });

    this.items = response.data;
    this.updateCursors(response.pageInfo);

    return this.items;
  }

  updateCursors(pageInfo) {
    this.cursors = {
      start: pageInfo.startCursor,
      end: pageInfo.endCursor,
      hasNext: pageInfo.hasNextPage,
      hasPrev: pageInfo.hasPreviousPage,
    };
  }
}

// API call
async function fetchPosts({ first, last, after, before }) {
  const params = new URLSearchParams();
  if (first) params.append('first', first);
  if (last) params.append('last', last);
  if (after) params.append('after', after);
  if (before) params.append('before', before);

  const response = await fetch(`/api/posts?${params}`);
  return response.json();
}

// Cursor encoding/decoding
function encodeCursor(data) {
  return btoa(JSON.stringify(data));
}

function decodeCursor(cursor) {
  return JSON.parse(atob(cursor));
}

// Usage
const pagination = new CursorPagination(fetchPosts, 20);
await pagination.loadInitial();
await pagination.loadNext();
```

**Afzalliklari:**
- O'zgarmayotgan natijalar (data consistency)
- Katta dataset'larda tez (index ishlatadi)
- Real-time data bilan yaxshi ishlaydi

**Kamchiliklari:**
- "Page 5" ga o'tish imkonsiz
- Murakkabroq implementation

### 3. Seek Method (Time-based)

Timestamp yoki ID asosida seek qilish.

```javascript
// API format
// GET /api/messages?since_id=12345&limit=20
// GET /api/messages?until_id=12300&limit=20

class SeekPagination {
  constructor(fetchFn, limit = 20) {
    this.fetchFn = fetchFn;
    this.limit = limit;
    this.items = [];
    this.newestId = null;
    this.oldestId = null;
    this.hasMore = true;
  }

  async loadInitial() {
    const response = await this.fetchFn({ limit: this.limit });
    this.processResponse(response);
    return this.items;
  }

  async loadNewer() {
    if (!this.newestId) return this.items;

    const response = await this.fetchFn({
      since_id: this.newestId,
      limit: this.limit,
    });

    // Prepend new items
    this.items = [...response.data, ...this.items];
    if (response.data.length > 0) {
      this.newestId = response.data[0].id;
    }

    return this.items;
  }

  async loadOlder() {
    if (!this.hasMore || !this.oldestId) return this.items;

    const response = await this.fetchFn({
      until_id: this.oldestId,
      limit: this.limit,
    });

    // Append old items
    this.items = [...this.items, ...response.data];
    this.hasMore = response.data.length === this.limit;

    if (response.data.length > 0) {
      this.oldestId = response.data[response.data.length - 1].id;
    }

    return this.items;
  }

  processResponse(response) {
    this.items = response.data;
    this.hasMore = response.data.length === this.limit;

    if (response.data.length > 0) {
      this.newestId = response.data[0].id;
      this.oldestId = response.data[response.data.length - 1].id;
    }
  }
}

// Twitter-style API
async function fetchMessages({ since_id, until_id, limit }) {
  const params = new URLSearchParams({ limit });
  if (since_id) params.append('since_id', since_id);
  if (until_id) params.append('until_id', until_id);

  const response = await fetch(`/api/messages?${params}`);
  return response.json();
}
```

## Infinite Scroll Implementation

### React + Intersection Observer

```javascript
import { useState, useEffect, useRef, useCallback } from 'react';

// Custom hook
function useInfiniteScroll(fetchFn, options = {}) {
  const { threshold = 0.5, rootMargin = '100px' } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);

  const observerRef = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await fetchFn({ cursor, limit: 20 });

      setItems(prev => [...prev, ...response.data]);
      setCursor(response.pageInfo.endCursor);
      setHasMore(response.pageInfo.hasNextPage);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fetchFn, cursor, hasMore]);

  // Intersection Observer setup
  const lastItemRef = useCallback((node) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, loadMore, threshold, rootMargin]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    lastItemRef,
    refresh: () => {
      setItems([]);
      setCursor(null);
      setHasMore(true);
      loadingRef.current = false;
      loadMore();
    },
  };
}

// Usage
function ProductList() {
  const {
    items,
    loading,
    error,
    hasMore,
    lastItemRef,
    refresh,
  } = useInfiniteScroll(fetchProducts);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {items.map((product, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={product.id}
            ref={isLast ? lastItemRef : null}
          >
            <ProductCard product={product} />
          </div>
        );
      })}

      {loading && <LoadingSpinner />}

      {!hasMore && items.length > 0 && (
        <p className="end-message">No more products</p>
      )}
    </div>
  );
}
```

### Vue 3 Composition API

```javascript
import { ref, onMounted, onUnmounted, watch } from 'vue';

export function useInfiniteScroll(fetchFn, options = {}) {
  const { threshold = 0.5, rootMargin = '100px' } = options;

  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const hasMore = ref(true);
  const cursor = ref(null);
  const sentinelRef = ref(null);

  let observer = null;

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return;

    loading.value = true;

    try {
      const response = await fetchFn({
        cursor: cursor.value,
        limit: 20,
      });

      items.value = [...items.value, ...response.data];
      cursor.value = response.pageInfo.endCursor;
      hasMore.value = response.pageInfo.hasNextPage;
      error.value = null;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const setupObserver = () => {
    if (!sentinelRef.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore.value && !loading.value) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinelRef.value);
  };

  const refresh = () => {
    items.value = [];
    cursor.value = null;
    hasMore.value = true;
    error.value = null;
    loadMore();
  };

  watch(sentinelRef, (newVal) => {
    if (newVal) {
      setupObserver();
    }
  });

  onMounted(() => {
    loadMore();
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return {
    items,
    loading,
    error,
    hasMore,
    sentinelRef,
    refresh,
  };
}

// Usage in component
// <template>
//   <div>
//     <ProductCard v-for="product in items" :key="product.id" :product="product" />
//     <div ref="sentinelRef" />
//     <LoadingSpinner v-if="loading" />
//   </div>
// </template>
```

## Virtual Scrolling

Millionlab element ko'rsatish uchun - faqat ko'rinadigan element'lar DOM'da.

```javascript
// React Virtualized / React Window
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

function VirtualizedList({
  items,
  hasMore,
  loadMore,
  itemHeight = 50
}) {
  const itemCount = hasMore ? items.length + 1 : items.length;

  const isItemLoaded = (index) => !hasMore || index < items.length;

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style}>
          <RowSkeleton />
        </div>
      );
    }

    const item = items[index];
    return (
      <div style={style}>
        <ItemCard item={item} />
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMore}
      threshold={10}
    >
      {({ onItemsRendered, ref }) => (
        <List
          ref={ref}
          height={600}
          itemCount={itemCount}
          itemSize={itemHeight}
          width="100%"
          onItemsRendered={onItemsRendered}
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
}

// Variable size list
import { VariableSizeList as List } from 'react-window';

function DynamicHeightList({ items }) {
  const listRef = useRef(null);
  const rowHeights = useRef({});

  const getRowHeight = (index) => {
    return rowHeights.current[index] || 100; // default height
  };

  const setRowHeight = (index, size) => {
    rowHeights.current[index] = size;
    listRef.current?.resetAfterIndex(index);
  };

  const Row = ({ index, style }) => {
    const rowRef = useRef(null);

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight);
      }
    }, [index]);

    return (
      <div style={style}>
        <div ref={rowRef}>
          <ItemCard item={items[index]} />
        </div>
      </div>
    );
  };

  return (
    <List
      ref={listRef}
      height={600}
      itemCount={items.length}
      itemSize={getRowHeight}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## Error Handling Patterns

```javascript
class PaginationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'PaginationError';
    this.details = details;
  }
}

// Robust pagination with error handling
function usePaginationWithRetry(fetchFn, options = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  const [state, setState] = useState({
    items: [],
    loading: false,
    error: null,
    hasMore: true,
    cursor: null,
    retryCount: 0,
  });

  const loadMore = async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetchFn({
          cursor: state.cursor,
          limit: 20,
        });

        setState(prev => ({
          ...prev,
          items: [...prev.items, ...response.data],
          cursor: response.pageInfo.endCursor,
          hasMore: response.pageInfo.hasNextPage,
          loading: false,
          retryCount: 0,
        }));

        return;
      } catch (error) {
        lastError = error;

        // Network error - retry
        if (error.name === 'TypeError' || error.status >= 500) {
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
            continue;
          }
        }

        // Client error - don't retry
        break;
      }
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: new PaginationError(
        'Failed to load more items',
        { originalError: lastError }
      ),
    }));
  };

  const retry = () => {
    setState(prev => ({ ...prev, error: null }));
    loadMore();
  };

  return { ...state, loadMore, retry };
}

// Partial failure handling
async function loadPageWithPartialRetry(cursor, limit) {
  try {
    const response = await fetch(`/api/items?cursor=${cursor}&limit=${limit}`);

    if (!response.ok) {
      // Try smaller page size
      if (limit > 5) {
        return loadPageWithPartialRetry(cursor, Math.floor(limit / 2));
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    throw new PaginationError('Failed to load page', {
      cursor,
      limit,
      originalError: error,
    });
  }
}
```

## Real-World Case: E-commerce Product Listing

```javascript
// Complete product listing with filters, sorting, and pagination
function useProductListing(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState({ field: 'relevance', order: 'desc' });
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    cursor: null,
    hasMore: true,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Reset when filters/sort change
  useEffect(() => {
    setProducts([]);
    setPagination({ cursor: null, hasMore: true, total: 0 });
    loadProducts(true);
  }, [filters, sort]);

  const loadProducts = async (isInitial = false) => {
    if (loading || (!isInitial && !pagination.hasMore)) return;

    setLoading(true);
    if (isInitial) setInitialLoading(true);

    try {
      const params = new URLSearchParams({
        limit: 24,
        sort_by: sort.field,
        sort_order: sort.order,
      });

      if (pagination.cursor && !isInitial) {
        params.append('cursor', pagination.cursor);
      }

      // Add filters
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('min_price', filters.minPrice);
      if (filters.maxPrice) params.append('max_price', filters.maxPrice);
      if (filters.brands?.length) {
        filters.brands.forEach(b => params.append('brands[]', b));
      }
      if (filters.inStock) params.append('in_stock', 'true');

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      setProducts(prev => isInitial ? data.products : [...prev, ...data.products]);
      setPagination({
        cursor: data.pageInfo.endCursor,
        hasMore: data.pageInfo.hasNextPage,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(`${key}[]`, v));
      } else if (value) {
        params.append(key, value);
      }
    });

    if (sort.field !== 'relevance') {
      params.append('sort', `${sort.field}_${sort.order}`);
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [filters, sort]);

  return {
    products,
    total: pagination.total,
    hasMore: pagination.hasMore,
    loading,
    initialLoading,
    filters,
    sort,
    setFilters: (newFilters) => setFilters({ ...filters, ...newFilters }),
    setSort,
    loadMore: () => loadProducts(false),
    refresh: () => loadProducts(true),
  };
}

// Component
function ProductListingPage() {
  const {
    products,
    total,
    hasMore,
    loading,
    initialLoading,
    filters,
    sort,
    setFilters,
    setSort,
    loadMore,
  } = useProductListing({
    category: 'electronics',
  });

  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  if (initialLoading) {
    return <ProductGridSkeleton />;
  }

  return (
    <div className="product-listing">
      <aside className="filters">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
        />
      </aside>

      <main className="products">
        <div className="toolbar">
          <span>{total} products found</span>
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="sentinel" />

        {loading && <LoadingSpinner />}

        {!hasMore && products.length > 0 && (
          <p className="end-message">
            You've seen all {total} products
          </p>
        )}
      </main>
    </div>
  );
}
```

## Interview Savollari

### 1. Offset vs Cursor pagination: qachon qaysi birini tanlash kerak?

**Javob:**

**Offset pagination:**
- Admin panel, dashboard (aniq page number kerak)
- Static content (kamdan-kam o'zgaradi)
- SEO muhim (Google /products?page=2 indekslay oladi)
- Kichik dataset (<10,000 records)

**Cursor pagination:**
- Real-time data (chat, feed, notifications)
- Katta dataset (million+ records)
- Infinite scroll UX
- Mobile apps (bandwidth tejash)

```javascript
// Offset - page 1000 ga tez o'tish
GET /products?page=1000&limit=20
// Lekin database 999,980 row skip qiladi

// Cursor - har doim tez (index ishlatadi)
GET /products?after=cursor_xyz&limit=20
// WHERE id > 12345 LIMIT 20
```

### 2. Infinite scroll'da duplicate item'lar qanday oldini olinadi?

**Javob:**

```javascript
// 1. Client-side deduplication
const addItems = (newItems) => {
  setItems(prev => {
    const existingIds = new Set(prev.map(item => item.id));
    const uniqueNew = newItems.filter(item => !existingIds.has(item.id));
    return [...prev, ...uniqueNew];
  });
};

// 2. Cursor-based pagination (server-side)
// Server cursor orqali aniq pozitsiyani biladi

// 3. Version/timestamp tracking
const loadMore = async () => {
  const response = await fetch(`/api/items?after=${lastTimestamp}`);
  // Server faqat lastTimestamp dan keyingi item'larni qaytaradi
};
```

### 3. Virtual scrolling nima uchun kerak?

**Javob:** DOM node'lar soni cheklangan. 10,000 element = ~10,000 DOM node = sekin render, memory issue.

Virtual scrolling faqat ko'rinadigan element'larni render qiladi (odatda 20-50).

```javascript
// Without virtualization
// 10,000 items = 10,000 DOM nodes = ~500MB memory, laggy scroll

// With virtualization
// 10,000 items = ~30 DOM nodes = ~5MB memory, smooth scroll

// Calculation
const visibleStart = Math.floor(scrollTop / itemHeight);
const visibleEnd = Math.min(
  visibleStart + Math.ceil(containerHeight / itemHeight),
  items.length
);
// Render only items[visibleStart] to items[visibleEnd]
```

### 4. SEO uchun pagination qanday qilinadi?

**Javob:**

```html
<!-- 1. rel="next" va rel="prev" -->
<link rel="prev" href="/products?page=1" />
<link rel="canonical" href="/products?page=2" />
<link rel="next" href="/products?page=3" />

<!-- 2. Har sahifa unique content -->
<title>Products - Page 2 of 50 | Store Name</title>
<meta name="description" content="Browse products 21-40..." />

<!-- 3. View All option (kichik dataset) -->
<link rel="canonical" href="/products/all" />
```

```javascript
// Server-side rendering with pagination
export async function getServerSideProps({ query }) {
  const page = parseInt(query.page) || 1;
  const products = await fetchProducts({ page, limit: 20 });

  return {
    props: {
      products: products.data,
      pagination: {
        current: page,
        total: products.totalPages,
        hasNext: page < products.totalPages,
        hasPrev: page > 1,
      },
    },
  };
}
```

### 5. Pull-to-refresh infinite scroll bilan qanday birgalikda ishlaydi?

**Javob:**

```javascript
function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return { refreshing, handleRefresh };
}

function Feed() {
  const {
    items,
    setItems,
    cursor,
    setCursor,
    loadMore,
  } = useInfiniteScroll(fetchFeed);

  const { refreshing, handleRefresh } = usePullToRefresh(async () => {
    // Load newest items
    const response = await fetchFeed({
      since_id: items[0]?.id,
      limit: 50
    });

    // Prepend new items
    setItems(prev => [...response.data, ...prev]);

    // Or full reset
    // setItems(response.data);
    // setCursor(response.pageInfo.endCursor);
  });

  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <VirtualList items={items} onEndReached={loadMore} />
    </PullToRefresh>
  );
}
```

## Xulosa

Pagination - katta data bilan ishlashning asosiy usuli. Cursor-based pagination real-time va katta dataset'lar uchun eng yaxshi, lekin offset-based oddiyroq va SEO-friendly. Virtual scrolling million element'lar uchun zarur.

**Keyingi qadam:** [04-caching.md](./04-caching.md) - API response'larni cache qilish va stale data bilan ishlash.
