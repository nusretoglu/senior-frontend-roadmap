import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Senior Frontend Roadmap",
  description: "JavaScript va Vue.js ekosistemasi bo'yicha chuqurlashtirilgan qo'llanma",
  lang: 'uz-UZ',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Bosh sahifa', link: '/' },
      { text: "Qo'llanma", link: '/01-core-javascript/' },
      {
        text: 'Mavzular',
        items: [
          { text: 'Core JavaScript', link: '/01-core-javascript/' },
          { text: 'Vue Ecosystem', link: '/04-vue-ecosystem/' },
          { text: 'Nuxt.js', link: '/06-nuxt/' },
          { text: 'TypeScript', link: '/14-typescript/' },
        ]
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Asosiy (Core)',
          collapsed: false,
          items: [
            {
              text: '01. Core JavaScript',
              collapsed: true,
              link: '/01-core-javascript/',
              items: [
                { text: 'Closures', link: '/01-core-javascript/01-closures' },
                { text: 'Event Loop', link: '/01-core-javascript/02-event-loop' },
                { text: 'Promises & Async', link: '/01-core-javascript/03-promises-async' },
                { text: 'Prototypes', link: '/01-core-javascript/04-prototypes' },
                { text: 'this Binding', link: '/01-core-javascript/05-this-binding' },
                { text: 'Debounce & Throttle', link: '/01-core-javascript/06-debounce-throttle' },
                { text: 'Memory Management', link: '/01-core-javascript/07-memory-management' },
              ]
            },
            {
              text: '02. Browser Internals',
              collapsed: true,
              link: '/02-browser-internals/',
              items: [
                { text: 'Rendering Pipeline', link: '/02-browser-internals/01-rendering-pipeline' },
                { text: 'Reflow & Repaint', link: '/02-browser-internals/02-reflow-repaint' },
                { text: 'DOM Lifecycle', link: '/02-browser-internals/03-dom-lifecycle' },
                { text: 'Critical Rendering Path', link: '/02-browser-internals/04-critical-rendering-path' },
                { text: 'GPU Acceleration', link: '/02-browser-internals/05-gpu-acceleration' },
              ]
            },
            {
              text: '03. HTML/CSS Advanced',
              collapsed: true,
              link: '/03-html-css-advanced/',
              items: [
                { text: 'Flexbox', link: '/03-html-css-advanced/01-flexbox' },
                { text: 'Grid', link: '/03-html-css-advanced/02-grid' },
                { text: 'Responsive Layouts', link: '/03-html-css-advanced/03-responsive-layouts' },
                { text: 'SCSS', link: '/03-html-css-advanced/04-scss' },
                { text: 'CSS Architecture', link: '/03-html-css-advanced/05-css-architecture' },
                { text: 'Animations', link: '/03-html-css-advanced/06-animations' },
                { text: 'Accessibility', link: '/03-html-css-advanced/07-accessibility' },
              ]
            },
          ]
        },
        {
          text: 'Framework',
          collapsed: false,
          items: [
            {
              text: '04. Vue Ecosystem',
              collapsed: true,
              link: '/04-vue-ecosystem/',
              items: [
                { text: 'Vue 2 vs Vue 3', link: '/04-vue-ecosystem/01-vue2-vs-vue3' },
                { text: 'Composition API', link: '/04-vue-ecosystem/02-composition-api' },
                { text: 'Options API', link: '/04-vue-ecosystem/03-options-api' },
                { text: 'Lifecycle Hooks', link: '/04-vue-ecosystem/04-lifecycle-hooks' },
                { text: 'Watchers & Computed', link: '/04-vue-ecosystem/05-watchers-computed' },
                { text: 'Refs & Reactive', link: '/04-vue-ecosystem/06-refs-reactive' },
                { text: 'Dynamic Components', link: '/04-vue-ecosystem/07-dynamic-components' },
                { text: 'Render Functions', link: '/04-vue-ecosystem/08-render-functions' },
                { text: 'Custom Directives', link: '/04-vue-ecosystem/09-custom-directives' },
                { text: 'Composables', link: '/04-vue-ecosystem/10-composables' },
                { text: 'Provide/Inject', link: '/04-vue-ecosystem/11-provide-inject' },
              ]
            },
            {
              text: '05. State Management',
              collapsed: true,
              link: '/05-state-management/',
              items: [
                { text: 'Vuex Basics', link: '/05-state-management/01-vuex-basics' },
                { text: 'Pinia Basics', link: '/05-state-management/02-pinia-basics' },
                { text: 'Global vs Local State', link: '/05-state-management/03-global-vs-local-state' },
                { text: 'Caching Strategies', link: '/05-state-management/04-caching-strategies' },
                { text: 'Reactive Patterns', link: '/05-state-management/05-reactive-patterns' },
                { text: 'Vuex vs Pinia', link: '/05-state-management/06-vuex-vs-pinia' },
              ]
            },
            {
              text: '06. Nuxt.js',
              collapsed: true,
              link: '/06-nuxt/',
              items: [
                { text: 'SSR vs SSG vs CSR', link: '/06-nuxt/01-ssr-ssg-csr' },
                { text: 'Hydration', link: '/06-nuxt/02-hydration' },
                { text: 'Middleware', link: '/06-nuxt/03-middleware' },
                { text: 'Routing', link: '/06-nuxt/04-routing' },
                { text: 'Plugins', link: '/06-nuxt/05-plugins' },
                { text: 'Modules', link: '/06-nuxt/06-modules' },
                { text: 'Deployment', link: '/06-nuxt/07-deployment' },
              ]
            },
          ]
        },
        {
          text: 'Integration & Security',
          collapsed: false,
          items: [
            {
              text: '07. API Integration',
              collapsed: true,
              link: '/07-api-integration/',
              items: [
                { text: 'REST API', link: '/07-api-integration/01-rest-api' },
                { text: 'GraphQL', link: '/07-api-integration/02-graphql' },
                { text: 'Pagination', link: '/07-api-integration/03-pagination' },
                { text: 'Caching', link: '/07-api-integration/04-caching' },
                { text: 'Retries & Interceptors', link: '/07-api-integration/05-retries-interceptors' },
                { text: 'Token Refresh', link: '/07-api-integration/06-token-refresh' },
                { text: 'Axios vs Fetch', link: '/07-api-integration/07-axios-vs-fetch' },
              ]
            },
            {
              text: '08. Auth & Security',
              collapsed: true,
              link: '/08-auth-security/',
              items: [
                { text: 'JWT', link: '/08-auth-security/01-jwt' },
                { text: 'Cookies', link: '/08-auth-security/02-cookies' },
                { text: 'LocalStorage Risks', link: '/08-auth-security/03-localstorage-risks' },
                { text: 'XSS', link: '/08-auth-security/04-xss' },
                { text: 'CSRF', link: '/08-auth-security/05-csrf' },
                { text: 'CORS', link: '/08-auth-security/06-cors' },
                { text: 'Best Practices', link: '/08-auth-security/07-best-practices' },
              ]
            },
            {
              text: '09. Real-time Systems',
              collapsed: true,
              link: '/09-realtime-systems/',
              items: [
                { text: 'WebSocket', link: '/09-realtime-systems/01-websocket' },
                { text: 'SSE', link: '/09-realtime-systems/02-sse' },
                { text: 'Polling', link: '/09-realtime-systems/03-polling' },
                { text: 'Reconnect Strategies', link: '/09-realtime-systems/04-reconnect-strategies' },
                { text: 'Presence Systems', link: '/09-realtime-systems/05-presence-systems' },
                { text: 'Chat Implementation', link: '/09-realtime-systems/06-chat-implementation' },
                { text: 'Live Notifications', link: '/09-realtime-systems/07-live-notifications' },
              ]
            },
          ]
        },
        {
          text: 'Visualization',
          collapsed: true,
          items: [
            {
              text: '10. Data Visualization',
              collapsed: true,
              link: '/10-data-visualization/',
              items: [
                { text: 'Chart.js', link: '/10-data-visualization/01-chartjs' },
                { text: 'ECharts', link: '/10-data-visualization/02-echarts' },
                { text: 'Highcharts', link: '/10-data-visualization/03-highcharts' },
                { text: 'D3.js', link: '/10-data-visualization/04-d3js' },
                { text: 'Choosing Library', link: '/10-data-visualization/05-choosing-library' },
                { text: 'Performance Tips', link: '/10-data-visualization/06-performance-tips' },
              ]
            },
            {
              text: '11. Maps & Geospatial',
              collapsed: true,
              link: '/11-maps-geospatial/',
              items: [
                { text: 'Leaflet', link: '/11-maps-geospatial/01-leaflet' },
                { text: 'Mapbox', link: '/11-maps-geospatial/02-mapbox' },
                { text: 'OpenLayers', link: '/11-maps-geospatial/03-openlayers' },
                { text: 'Markers & Clustering', link: '/11-maps-geospatial/04-markers-clustering' },
                { text: 'Polygons & Routing', link: '/11-maps-geospatial/05-polygons-routing' },
                { text: 'GeoJSON', link: '/11-maps-geospatial/06-geojson' },
              ]
            },
          ]
        },
        {
          text: 'Production',
          collapsed: false,
          items: [
            {
              text: '12. Performance',
              collapsed: true,
              link: '/12-performance/',
              items: [
                { text: 'Lazy Loading', link: '/12-performance/01-lazy-loading' },
                { text: 'Code Splitting', link: '/12-performance/02-code-splitting' },
                { text: 'Image Optimization', link: '/12-performance/03-image-optimization' },
                { text: 'Virtual Scrolling', link: '/12-performance/04-virtual-scrolling' },
                { text: 'Bundle Optimization', link: '/12-performance/05-bundle-optimization' },
                { text: 'Vite & Webpack', link: '/12-performance/06-vite-webpack' },
                { text: 'Profiling Tools', link: '/12-performance/07-profiling-tools' },
              ]
            },
            {
              text: '13. Testing',
              collapsed: true,
              link: '/13-testing/',
              items: [
                { text: 'Unit Testing', link: '/13-testing/01-unit-testing' },
                { text: 'Integration Testing', link: '/13-testing/02-integration-testing' },
                { text: 'E2E Testing', link: '/13-testing/03-e2e-testing' },
                { text: 'Vitest', link: '/13-testing/04-vitest' },
                { text: 'Cypress', link: '/13-testing/05-cypress' },
                { text: 'Playwright', link: '/13-testing/06-playwright' },
                { text: 'Testing Patterns', link: '/13-testing/07-testing-patterns' },
              ]
            },
            {
              text: '14. TypeScript',
              collapsed: true,
              link: '/14-typescript/',
              items: [
                { text: 'Basics', link: '/14-typescript/01-basics' },
                { text: 'Generics', link: '/14-typescript/02-generics' },
                { text: 'Utility Types', link: '/14-typescript/03-utility-types' },
                { text: 'Strict Mode', link: '/14-typescript/04-strict-mode' },
                { text: 'Type Guards', link: '/14-typescript/05-type-guards' },
                { text: 'Advanced Patterns', link: '/14-typescript/06-advanced-patterns' },
                { text: 'Vue + TypeScript', link: '/14-typescript/07-vue-typescript' },
              ]
            },
          ]
        },
        {
          text: 'Architecture & Tools',
          collapsed: true,
          items: [
            {
              text: '15. Architecture',
              collapsed: true,
              link: '/15-architecture/',
              items: [
                { text: 'Scalability', link: '/15-architecture/01-scalability' },
                { text: 'Reusability', link: '/15-architecture/02-reusability' },
                { text: 'Maintainability', link: '/15-architecture/03-maintainability' },
                { text: 'Component Structure', link: '/15-architecture/04-component-structure' },
                { text: 'Folder Structure', link: '/15-architecture/05-folder-structure' },
                { text: 'Design Patterns', link: '/15-architecture/06-design-patterns' },
                { text: 'Monorepo', link: '/15-architecture/07-monorepo' },
              ]
            },
            {
              text: '16. DevTools & Workflow',
              collapsed: true,
              link: '/16-devtools-workflow/',
              items: [
                { text: 'Git Advanced', link: '/16-devtools-workflow/01-git-advanced' },
                { text: 'CI/CD', link: '/16-devtools-workflow/02-ci-cd' },
                { text: 'Docker Basics', link: '/16-devtools-workflow/03-docker-basics' },
                { text: 'Package Managers', link: '/16-devtools-workflow/04-package-managers' },
                { text: 'GitHub & GitLab', link: '/16-devtools-workflow/05-github-gitlab' },
                { text: 'VS Code Setup', link: '/16-devtools-workflow/06-vscode-setup' },
              ]
            },
            {
              text: '17. Backend Basics',
              collapsed: true,
              link: '/17-backend-basics/',
              items: [
                { text: 'Databases', link: '/17-backend-basics/01-databases' },
                { text: 'SQL Basics', link: '/17-backend-basics/02-sql-basics' },
                { text: 'Caching & Redis', link: '/17-backend-basics/03-caching-redis' },
                { text: 'Queues', link: '/17-backend-basics/04-queues' },
                { text: 'Node.js Basics', link: '/17-backend-basics/05-nodejs-basics' },
                { text: 'API Design', link: '/17-backend-basics/06-api-design' },
              ]
            },
            {
              text: '18. Soft Skills',
              collapsed: true,
              link: '/18-soft-skills/',
              items: [
                { text: 'Code Review', link: '/18-soft-skills/01-code-review' },
                { text: 'Mentoring', link: '/18-soft-skills/02-mentoring' },
                { text: 'Task Breakdown', link: '/18-soft-skills/03-task-breakdown' },
                { text: 'Communication', link: '/18-soft-skills/04-communication' },
                { text: 'Architecture Discussion', link: '/18-soft-skills/05-architecture-discussion' },
                { text: 'Interview Tips', link: '/18-soft-skills/06-interview-tips' },
              ]
            },
          ]
        },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: 'Mundarija'
    },

    docFooter: {
      prev: 'Oldingi',
      next: 'Keyingi'
    },

    lastUpdated: {
      text: 'Yangilangan',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    editLink: {
      pattern: 'https://github.com/your-repo/edit/main/docs/:path',
      text: 'Tahrirlash'
    },

    footer: {
      message: "Senior Frontend Developer Roadmap",
      copyright: '2024'
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
