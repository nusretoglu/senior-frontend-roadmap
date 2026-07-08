# Package Managers (npm/yarn/pnpm)

## Kirish

JavaScript ekosistemasi dunyodagi eng katta package registry'ga ega - npmjs.com'da 2+ million paket mavjud. Package manager'lar bu paketlarni install, update, va manage qilishda yordam beradi. Bu bo'limda npm, Yarn, va pnpm'ning ichki ishlash mexanizmlarini, farqlarini va professional ishlatishni o'rganamiz.

## Package Manager'lar Taqqoslash

```
┌─────────────────────────────────────────────────────────────────┐
│                   Package Manager Comparison                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  npm (Node Package Manager)                                      │
│  ├─ Default with Node.js                                        │
│  ├─ Nested node_modules (v2) → Flat (v3+)                       │
│  └─ package-lock.json                                           │
│                                                                  │
│  Yarn Classic (v1)                                               │
│  ├─ Facebook tomonidan yaratilgan                               │
│  ├─ Parallel downloads, offline cache                           │
│  └─ yarn.lock                                                    │
│                                                                  │
│  Yarn Berry (v2+)                                                │
│  ├─ Plug'n'Play (PnP) - node_modules yo'q                       │
│  ├─ Zero-installs                                                │
│  └─ .yarn/cache, .pnp.cjs                                       │
│                                                                  │
│  pnpm                                                            │
│  ├─ Content-addressable storage                                  │
│  ├─ Hard links - disk space efficient                           │
│  └─ pnpm-lock.yaml                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Feature | npm | Yarn Classic | Yarn Berry | pnpm |
|---------|-----|--------------|------------|------|
| Disk Space | Normal | Normal | Minimal | Minimal |
| Install Speed | Normal | Fast | Fast | Fastest |
| Monorepo | Workspaces | Workspaces | Workspaces | Best |
| Strictness | Loose | Loose | Strict | Strict |
| Phantom Dependencies | Yes | Yes | No | No |
| Default | Yes | No | No | No |

## npm (Node Package Manager)

### npm Internals

```
node_modules/                     # Flat structure (npm v3+)
├── express/
│   ├── package.json
│   └── index.js
├── lodash/                       # Hoisted (shared dependency)
├── body-parser/
└── .package-lock.json            # Hidden lockfile

package.json                      # Project manifest
package-lock.json                 # Exact versions lockfile
```

### Dependency Tree

```
project
├── express@4.18.2
│   ├── body-parser@1.20.2
│   │   ├── bytes@3.1.2
│   │   └── http-errors@2.0.0
│   └── cookie@0.5.0
└── lodash@4.17.21

# Hoisting:
# lodash va bytes → top level (shared)
# Conflict bo'lsa → nested
```

### npm Commands

```bash
# Initialize
npm init
npm init -y                       # defaults bilan

# Install
npm install                       # package.json'dan install
npm install express              # production dependency
npm install -D eslint            # devDependency
npm install -g typescript        # global
npm install express@4.18.0       # specific version
npm install express@^4.0.0       # semver range
npm install ./local-package      # local package
npm install git+https://github.com/user/repo.git

# Update
npm update                        # minor/patch updates
npm update express               # specific package
npm outdated                     # outdated packages ko'rish

# Remove
npm uninstall express
npm uninstall -g typescript

# Info
npm list                         # dependency tree
npm list --depth=0              # top-level only
npm info express                # package info
npm view express versions       # barcha versiyalar

# Scripts
npm run build
npm run test
npm start                        # npm run start shortcut
npm test                         # npm run test shortcut

# Cache
npm cache clean --force
npm cache verify

# Security
npm audit                        # vulnerability check
npm audit fix                    # auto fix
npm audit fix --force           # breaking changes ham
```

### package.json Deep Dive

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Project description",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.js"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "prepare": "husky",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "~4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "react": ">=17.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "optionalDependencies": {
    "fsevents": "^2.3.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "pnpm@8.15.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },
  "keywords": ["typescript", "api"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/user/repo/issues"
  },
  "homepage": "https://github.com/user/repo#readme"
}
```

### Semver (Semantic Versioning)

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes (backward compatible)
  │     └─────── New features (backward compatible)
  └───────────── Breaking changes

Ranges:
^4.18.2  → >=4.18.2 <5.0.0   (minor va patch)
~4.18.2  → >=4.18.2 <4.19.0  (patch only)
4.18.2   → exactly 4.18.2
>4.18.2  → greater than
>=4.18.2 → greater or equal
*        → any version
4.x      → any 4.x.x
4.18.x   → any 4.18.x
```

```bash
# Semver calculator
npx semver 4.18.2 -i patch   # 4.18.3
npx semver 4.18.2 -i minor   # 4.19.0
npx semver 4.18.2 -i major   # 5.0.0
npx semver 4.18.2 -i prerelease --preid=beta  # 4.18.3-beta.0
```

### Lockfile (package-lock.json)

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "my-project",
      "version": "1.0.0",
      "dependencies": {
        "express": "^4.18.2"
      }
    },
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-5/PsL6iGPdfQ/lKM1UuielYgv3BUoJfz1aUwU9vHZ+J7gyvwdQXFEBIEIaxeGf0GIcreATNyBExtalisDbuMqQ==",
      "dependencies": {
        "accepts": "~1.3.8",
        "body-parser": "1.20.1"
      },
      "engines": {
        "node": ">= 0.10.0"
      }
    }
  }
}
```

**Lockfile nima uchun kerak?**
1. **Reproducibility** - barcha muhitda bir xil versiyalar
2. **Security** - integrity hash bilan verification
3. **Speed** - dependency resolution skip qilinadi

```bash
# Lockfile bilan install (CI/CD uchun)
npm ci  # clean install, lockfile'ga qat'iy amal qiladi

# Lockfile yangilash
npm install  # lockfile yangilanadi
```

### npm Workspaces (Monorepo)

```
my-monorepo/
├── package.json
├── packages/
│   ├── shared/
│   │   └── package.json
│   ├── web/
│   │   └── package.json
│   └── api/
│       └── package.json
└── apps/
    └── mobile/
        └── package.json
```

```json
// Root package.json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "build:web": "npm run build --workspace=packages/web"
  }
}
```

```json
// packages/web/package.json
{
  "name": "@myorg/web",
  "version": "1.0.0",
  "dependencies": {
    "@myorg/shared": "workspace:*"
  }
}
```

```bash
# Workspace commands
npm install                       # barcha workspaces
npm install lodash -w packages/shared  # specific workspace
npm run build -w packages/web     # specific workspace
npm run build --workspaces        # barcha workspaces
npm run build --workspaces --if-present  # script bo'lmasa skip
```

## Yarn

### Yarn Classic (v1)

```bash
# Install
npm install -g yarn

# Basic commands (npm → yarn)
npm install        → yarn install / yarn
npm install pkg    → yarn add pkg
npm install -D pkg → yarn add -D pkg
npm uninstall pkg  → yarn remove pkg
npm run script     → yarn script
npm update         → yarn upgrade
npm outdated       → yarn outdated

# Yarn-specific
yarn why lodash              # dependency reason
yarn upgrade-interactive     # interactive upgrade
yarn info express            # package info
yarn cache clean             # cache tozalash
```

### Yarn Berry (v2+)

```bash
# Yarn Berry'ga o'tish
corepack enable
yarn set version stable

# yoki
yarn set version berry
```

#### Plug'n'Play (PnP)

```
.yarn/
├── cache/              # Zip archives
│   └── lodash-npm-4.17.21-abc123.zip
├── releases/           # Yarn binary
│   └── yarn-4.0.0.cjs
└── unplugged/          # Native modules

.pnp.cjs                # Dependency map
.pnp.loader.mjs         # ESM loader
.yarnrc.yml             # Configuration
```

```yaml
# .yarnrc.yml
nodeLinker: pnp          # pnp, node-modules, pnpm
enableGlobalCache: true
compressionLevel: 0

plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-typescript.cjs
    spec: "@yarnpkg/plugin-typescript"
```

#### Zero-Installs

```bash
# .gitignore
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions

# CI/CD'da install kerak emas!
# git clone → yarn (lockfile verify only)
```

### Yarn Workspaces

```json
// package.json
{
  "private": true,
  "workspaces": {
    "packages": [
      "packages/*",
      "apps/*"
    ],
    "nohoist": [
      "**/react-native",
      "**/react-native/**"
    ]
  }
}
```

```bash
# Workspace commands
yarn workspace @myorg/web add lodash
yarn workspace @myorg/web run build
yarn workspaces foreach run build
yarn workspaces foreach --parallel run test
yarn workspaces list --json
```

## pnpm

### pnpm Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      pnpm Architecture                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ~/.pnpm-store/                   (Global store)                │
│  └── v3/                                                         │
│      └── files/                                                  │
│          └── ab/                  (Content-addressable)         │
│              └── cdef123...       (File content hash)           │
│                                                                  │
│  project/node_modules/                                           │
│  ├── .pnpm/                       (Virtual store)               │
│  │   ├── express@4.18.2/                                        │
│  │   │   └── node_modules/                                      │
│  │   │       ├── express/        (Hard link to store)          │
│  │   │       └── body-parser/    (Symlink)                      │
│  │   └── lodash@4.17.21/                                        │
│  ├── express → .pnpm/express@4.18.2/node_modules/express        │
│  └── lodash → .pnpm/lodash@4.17.21/node_modules/lodash          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### pnpm Benefits

1. **Disk Space Efficient** - Hard links, bitta file bir marta saqlanadi
2. **Strict** - Phantom dependencies'ni oldini oladi
3. **Fast** - Parallel, cached installs
4. **Monorepo** - First-class workspace support

### pnpm Commands

```bash
# Install
npm install -g pnpm
# yoki
corepack enable
corepack prepare pnpm@latest --activate

# Basic commands
pnpm install              # dependencies install
pnpm add express          # add production dep
pnpm add -D eslint        # add dev dep
pnpm add -g typescript    # global
pnpm remove express       # remove
pnpm update               # update all
pnpm update express       # update specific

# Run
pnpm run build
pnpm build                # shorthand
pnpm test

# Info
pnpm list
pnpm list --depth=0
pnpm why lodash

# Store management
pnpm store status
pnpm store prune          # unused packages
pnpm store path           # store location

# Other
pnpm outdated
pnpm audit
pnpm dlx create-vite      # npx equivalent
```

### pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

```bash
# Workspace commands
pnpm --filter @myorg/web add lodash
pnpm --filter @myorg/web run build
pnpm --filter "./packages/**" run build
pnpm -r run build                    # recursive, all workspaces
pnpm -r --parallel run build         # parallel
pnpm -r --filter "...@myorg/web" run build  # web va dependencies
```

### .npmrc (pnpm configuration)

```ini
# .npmrc
shamefully-hoist=false
strict-peer-dependencies=true
auto-install-peers=true
resolution-mode=highest

# Registry
registry=https://registry.npmjs.org/
@myorg:registry=https://npm.pkg.github.com/

# Authentication
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Private Registry

### npm Private Registry

```bash
# .npmrc
registry=https://registry.npmjs.org/
@mycompany:registry=https://npm.mycompany.com/

# Authentication
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# Publish
npm publish --registry=https://npm.mycompany.com/
```

### GitHub Packages

```json
// package.json
{
  "name": "@myorg/my-package",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

```bash
# .npmrc
@myorg:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Publish
npm publish
```

### Verdaccio (Self-hosted)

```yaml
# docker-compose.yml
services:
  verdaccio:
    image: verdaccio/verdaccio
    ports:
      - "4873:4873"
    volumes:
      - verdaccio-storage:/verdaccio/storage
      - verdaccio-conf:/verdaccio/conf

volumes:
  verdaccio-storage:
  verdaccio-conf:
```

```bash
# Usage
npm set registry http://localhost:4873
npm adduser --registry http://localhost:4873
npm publish --registry http://localhost:4873
```

## Security va Audit

### npm audit

```bash
# Vulnerability check
npm audit

# JSON output
npm audit --json

# Auto fix
npm audit fix

# Breaking changes ham fix
npm audit fix --force

# Production only
npm audit --omit=dev
```

### Security Best Practices

```json
// package.json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "prepare": "husky install"
  },
  "overrides": {
    "vulnerable-package": "^2.0.0"
  },
  "resolutions": {
    "lodash": "^4.17.21"
  }
}
```

```bash
# Lock versions
npm shrinkwrap  # npm-shrinkwrap.json

# Check for known vulnerabilities
npx snyk test
npx socket-security scan

# License check
npx license-checker --summary
npx license-checker --failOn "GPL"
```

### Supply Chain Security

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    paths:
      - '**/package.json'
      - '**/package-lock.json'
      - '**/pnpm-lock.yaml'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: npm audit
        run: npm audit --audit-level=moderate

      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## Performance Optimization

### Install Optimization

```bash
# npm
npm ci                          # clean install (CI)
npm install --prefer-offline    # offline first
npm install --ignore-scripts    # skip postinstall

# pnpm
pnpm install --frozen-lockfile  # CI mode
pnpm install --offline          # offline only
pnpm install --prefer-offline   # offline first

# Yarn
yarn install --frozen-lockfile
yarn install --offline
```

### Caching in CI/CD

```yaml
# GitHub Actions
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'  # npm, yarn, pnpm

- name: Install dependencies
  run: pnpm install --frozen-lockfile
```

```yaml
# GitLab CI
cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - node_modules/
    - .pnpm-store/
```

### Monorepo Optimization

```bash
# pnpm - topological sort
pnpm -r --parallel run build

# Turborepo (build cache)
npx turbo run build

# Nx (affected only)
npx nx affected --target=build
```

## Real-World Workflow

### New Project Setup

```bash
# 1. Initialize
pnpm init

# 2. Add dependencies
pnpm add express cors helmet
pnpm add -D typescript @types/node @types/express

# 3. Configure
npx tsc --init

# 4. Add scripts
```

```json
// package.json
{
  "name": "my-api",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### Migration Between Package Managers

```bash
# npm → pnpm
rm -rf node_modules package-lock.json
pnpm import  # package-lock.json → pnpm-lock.yaml
pnpm install

# yarn → pnpm
rm -rf node_modules yarn.lock
pnpm import  # yarn.lock → pnpm-lock.yaml
pnpm install

# Add to package.json
{
  "packageManager": "pnpm@8.15.0"
}
```

### Package Publishing

```bash
# 1. Prepare
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

# 2. Build & test
pnpm build
pnpm test

# 3. Publish
npm publish
npm publish --access public  # scoped packages

# 4. Dry run
npm publish --dry-run
```

### Monorepo Structure

```
my-monorepo/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── packages/
│   ├── ui/
│   │   ├── package.json
│   │   └── src/
│   ├── utils/
│   │   ├── package.json
│   │   └── src/
│   └── config/
│       ├── eslint/
│       └── typescript/
├── apps/
│   ├── web/
│   │   └── package.json
│   └── api/
│       └── package.json
└── tooling/
    └── scripts/
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Interview Savollari

### 1. npm, Yarn, pnpm farqlari nima?

**Javob:**

| Feature | npm | Yarn | pnpm |
|---------|-----|------|------|
| Default | Node bilan keladi | O'rnatish kerak | O'rnatish kerak |
| node_modules | Flat | Flat | Symlinked |
| Disk usage | Ko'p | Ko'p | Kam (hard links) |
| Speed | Normal | Tez | Eng tez |
| Phantom deps | Ha | Ha | Yo'q |
| Monorepo | Workspaces | Workspaces | Best support |

**pnpm** afzalliklari:
- Hard links orqali disk tejash
- Strict dependency resolution
- Phantom dependencies oldini oladi

### 2. Phantom dependency nima?

**Javob:**
Phantom dependency - package.json'da yo'q, lekin hoisting tufayli ishlatilishi mumkin bo'lgan dependency.

```
project
├── package.json (faqat express)
└── node_modules/
    ├── express/
    └── lodash/  ← express'ning dependency'si, hoisted

// Xato kod (ishlaydi, lekin phantom dependency)
const lodash = require('lodash');  // package.json'da yo'q!
```

**Muammo:** Express yangilansa va lodash o'chirsa, kod buziladi.

**Yechim:** pnpm strict mode yoki Yarn PnP ishlatish.

### 3. Lockfile nima uchun kerak?

**Javob:**

1. **Reproducibility** - barcha muhitda (dev, CI, prod) bir xil versiyalar
2. **Security** - integrity hash bilan package verification
3. **Speed** - dependency resolution skip, faqat download

```bash
# CI/CD'da
npm ci        # lockfile'dan qat'iy install
pnpm install --frozen-lockfile
yarn install --frozen-lockfile
```

Lockfile'ni git'ga commit qilish MAJBURIY!

### 4. peerDependencies nima?

**Javob:**
peerDependencies - plugin/extension'lar uchun "host package" talab qilish.

```json
// react-tooltip package.json
{
  "peerDependencies": {
    "react": ">=17.0.0"
  }
}
```

Bu degani: "Men react bilan ishlashim uchun consumer'da react bo'lishi kerak".

```
Host project
├── react@18.2.0          ← peer satisfied
├── react-dom@18.2.0
└── react-tooltip@5.0.0   ← peerDep: react>=17
```

npm v7+ avtomatik peerDeps install qiladi.

### 5. Monorepo'da dependency hoisting qanday ishlaydi?

**Javob:**
Hoisting - shared dependencies'ni root node_modules'ga ko'tarish.

```
monorepo/
├── node_modules/
│   └── lodash/           ← hoisted (shared)
├── packages/
│   ├── a/                ← lodash@4.17.21
│   └── b/                ← lodash@4.17.21
```

**Muammolar:**
- Version conflict bo'lsa hoisting buziladi
- Phantom dependencies
- React Native ba'zi packages'ni hoist qilmaydi

**Yechim:**
```json
// Yarn
{
  "workspaces": {
    "nohoist": ["**/react-native"]
  }
}

// pnpm
// public-hoist-pattern[]=*eslint*
```

## Tips & Tricks

### 1. Useful npm Scripts

```json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "postinstall": "patch-package",
    "prepare": "husky install",
    "preversion": "npm test",
    "postversion": "git push && git push --tags",
    "clean": "rm -rf node_modules dist .turbo",
    "reinstall": "npm run clean && npm install"
  }
}
```

### 2. npx vs pnpm dlx vs yarn dlx

```bash
# One-time package execution
npx create-vite my-app
pnpm dlx create-vite my-app
yarn dlx create-vite my-app

# Specific version
npx create-vite@5.0.0 my-app

# From different registry
npx --registry=https://npm.pkg.github.com @myorg/cli
```

### 3. Dependency Overrides

```json
// npm/pnpm overrides
{
  "overrides": {
    "lodash": "^4.17.21",
    "minimist": ">=1.2.6"
  }
}

// Yarn resolutions
{
  "resolutions": {
    "lodash": "^4.17.21"
  }
}
```

### 4. Local Packages (Development)

```bash
# npm link
cd my-library
npm link
cd ../my-project
npm link my-library

# pnpm
pnpm link --global
pnpm link --global my-library

# Workspace protocol
{
  "dependencies": {
    "@myorg/shared": "workspace:*"
  }
}
```

### 5. Quick Debug Commands

```bash
# Dependency tree
npm ls --all
pnpm why lodash
yarn why lodash

# Find duplicates
npx npm-dedupe
npx depcheck  # unused dependencies

# Analyze bundle
npx vite-bundle-analyzer
npx source-map-explorer dist/main.js

# Check outdated
npm outdated
pnpm outdated
yarn upgrade-interactive
```

## Xulosa

Package manager tanlash loyiha talablariga bog'liq:

1. **npm** - default, ecosystem bilan eng yaxshi compatible
2. **Yarn** - tez, PnP bilan modern approach
3. **pnpm** - disk-efficient, strict, monorepo uchun eng yaxshi

Asosiy tushunchalar:
- Semver va lockfile muhim
- Security audit muntazam o'tkazing
- Monorepo uchun pnpm + Turborepo tavsiya
- Phantom dependencies'dan ehtiyot bo'ling
