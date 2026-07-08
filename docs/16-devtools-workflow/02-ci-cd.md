# CI/CD (Continuous Integration / Continuous Delivery)

## Kirish

CI/CD - bu zamonaviy dasturiy ta'minot ishlab chiqarishning asosiy amaliyoti. Kod yozilgandan production'ga yetib borishgacha bo'lgan jarayonni avtomatlashtiradi, xatolarni erta aniqlaydi va deployment'ni tez va xavfsiz qiladi.

## CI/CD Asoslari

### Continuous Integration (CI)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Continuous Integration                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Developer 1 ──┐                                                │
│                │     ┌──────────┐     ┌──────────┐              │
│  Developer 2 ──┼────▶│   Git    │────▶│    CI    │              │
│                │     │  Server  │     │  Server  │              │
│  Developer 3 ──┘     └──────────┘     └──────────┘              │
│                                            │                     │
│                           ┌────────────────┼────────────────┐   │
│                           │                │                │   │
│                           ▼                ▼                ▼   │
│                      ┌────────┐      ┌────────┐      ┌────────┐ │
│                      │  Lint  │      │  Test  │      │ Build  │ │
│                      └────────┘      └────────┘      └────────┘ │
│                                            │                     │
│                                            ▼                     │
│                                     ┌────────────┐              │
│                                     │  Feedback  │              │
│                                     └────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**CI Printsiplari:**
1. Kod har kuni (yoki har bir commit'da) integrate qilinadi
2. Automated build va test
3. Build buzilsa - darhol fix
4. Fast feedback loop

### Continuous Delivery vs Continuous Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Continuous Delivery:                                            │
│  Code → Build → Test → [Manual Approval] → Deploy                │
│                              ▲                                   │
│                              │                                   │
│                         Human decides                            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Continuous Deployment:                                          │
│  Code → Build → Test → Deploy (Automatic)                        │
│                              ▲                                   │
│                              │                                   │
│                         No human needed                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## GitHub Actions

### Asosiy Tushunchalar

```yaml
# .github/workflows/ci.yml

name: CI Pipeline          # Workflow nomi

on:                        # Trigger events
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'    # Har kuni yarim tunda
  workflow_dispatch:        # Manual trigger

env:                       # Global environment variables
  NODE_VERSION: '20'

jobs:                      # Jobs ro'yxati
  test:
    runs-on: ubuntu-latest # Runner
    steps:                 # Job steps
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
      - run: npm test
```

### Complete CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ==================== LINT ====================
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  # ==================== TEST ====================
  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint

    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  # ==================== E2E ====================
  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: lint

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb

      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  # ==================== BUILD ====================
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [test, e2e]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 1

  # ==================== DOCKER ====================
  docker:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    permissions:
      contents: read
      packages: write

    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ==================== DEPLOY ====================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: docker
    environment:
      name: staging
      url: https://staging.example.com

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying ${{ needs.docker.outputs.image-tag }} to staging"
          # kubectl, docker-compose, yoki boshqa deploy command

      - name: Health check
        run: |
          sleep 30
          curl -f https://staging.example.com/health || exit 1

      - name: Run smoke tests
        run: |
          npm run test:smoke -- --base-url https://staging.example.com

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production"
          # Production deployment commands

      - name: Notify team
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployed to production: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Matrix Strategy

```yaml
jobs:
  test:
    strategy:
      fail-fast: false  # Bitta fail bo'lsa ham boshqalar davom etsin
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
        include:
          - os: ubuntu-latest
            node: 22
            experimental: true
        exclude:
          - os: windows-latest
            node: 18

    runs-on: ${{ matrix.os }}
    continue-on-error: ${{ matrix.experimental || false }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```

### Reusable Workflows

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      url:
        required: true
        type: string
    secrets:
      deploy-token:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
      url: ${{ inputs.url }}

    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.deploy-token }}
```

```yaml
# .github/workflows/main.yml
name: Main Pipeline

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      url: https://staging.example.com
    secrets:
      deploy-token: ${{ secrets.STAGING_TOKEN }}

  deploy-production:
    needs: deploy-staging
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
      url: https://example.com
    secrets:
      deploy-token: ${{ secrets.PROD_TOKEN }}
```

### Composite Actions

```yaml
# .github/actions/setup-project/action.yml
name: Setup Project
description: Setup Node.js and install dependencies

inputs:
  node-version:
    description: Node.js version
    required: false
    default: '20'

runs:
  using: composite
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci
      shell: bash

    - name: Cache Playwright browsers
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

```yaml
# Ishlatish
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-project
        with:
          node-version: '20'
      - run: npm test
```

## GitLab CI/CD

### Asosiy Konfiguratsiya

```yaml
# .gitlab-ci.yml

stages:
  - lint
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  DOCKER_DRIVER: overlay2

default:
  image: node:${NODE_VERSION}
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - .npm/

# ==================== TEMPLATES ====================
.node-template: &node-template
  before_script:
    - npm ci --cache .npm --prefer-offline

# ==================== LINT ====================
lint:
  stage: lint
  <<: *node-template
  script:
    - npm run lint
    - npm run format:check
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ==================== TEST ====================
test:unit:
  stage: test
  <<: *node-template
  script:
    - npm run test:coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
      junit: junit.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

test:e2e:
  stage: test
  <<: *node-template
  services:
    - postgres:15
  variables:
    POSTGRES_DB: test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql://test:test@postgres:5432/test
  script:
    - npx playwright install --with-deps chromium
    - npm run test:e2e
  artifacts:
    when: on_failure
    paths:
      - playwright-report/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ==================== BUILD ====================
build:
  stage: build
  <<: *node-template
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 day
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

build:docker:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ==================== DEPLOY ====================
deploy:staging:
  stage: deploy
  image: alpine:latest
  environment:
    name: staging
    url: https://staging.example.com
  before_script:
    - apk add --no-cache curl
  script:
    - echo "Deploying to staging..."
    - curl -X POST $STAGING_DEPLOY_WEBHOOK
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy:production:
  stage: deploy
  image: alpine:latest
  environment:
    name: production
    url: https://example.com
  before_script:
    - apk add --no-cache curl
  script:
    - echo "Deploying to production..."
    - curl -X POST $PROD_DEPLOY_WEBHOOK
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
  needs:
    - deploy:staging
```

### GitLab-specific Features

```yaml
# Include templates
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml
  - local: .gitlab/ci/deploy.yml
  - project: 'my-group/my-project'
    file: '/templates/.gitlab-ci-template.yml'

# Parent-child pipelines
trigger:child:
  stage: deploy
  trigger:
    include: .gitlab/ci/child-pipeline.yml
    strategy: depend

# Dynamic child pipeline
generate-pipeline:
  stage: build
  script:
    - generate-ci-config > generated-config.yml
  artifacts:
    paths:
      - generated-config.yml

run-generated:
  stage: deploy
  trigger:
    include:
      - artifact: generated-config.yml
        job: generate-pipeline
```

## Jenkins

### Jenkinsfile (Declarative Pipeline)

```groovy
// Jenkinsfile

pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_NAME = 'myapp'
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    tools {
        nodejs "${NODE_VERSION}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint & Test') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:coverage'
                    }
                    post {
                        always {
                            junit 'junit.xml'
                            publishCoverage adapters: [coberturaAdapter('coverage/cobertura-coverage.xml')]
                        }
                    }
                }
                stage('E2E Tests') {
                    steps {
                        sh 'npm run test:e2e'
                    }
                    post {
                        failure {
                            archiveArtifacts artifacts: 'playwright-report/**/*'
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-credentials') {
                        def image = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh staging'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message 'Deploy to production?'
                ok 'Deploy'
            }
            steps {
                sh './deploy.sh production'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            slackSend channel: '#deployments',
                      color: 'good',
                      message: "Build succeeded: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        failure {
            slackSend channel: '#deployments',
                      color: 'danger',
                      message: "Build failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
    }
}
```

### Shared Libraries

```groovy
// vars/standardPipeline.groovy

def call(Map config = [:]) {
    pipeline {
        agent any

        stages {
            stage('Build') {
                steps {
                    script {
                        if (config.buildCommand) {
                            sh config.buildCommand
                        } else {
                            sh 'npm ci && npm run build'
                        }
                    }
                }
            }

            stage('Test') {
                steps {
                    sh 'npm test'
                }
            }

            stage('Deploy') {
                when {
                    expression { config.deployEnabled ?: false }
                }
                steps {
                    sh "deploy.sh ${config.environment ?: 'staging'}"
                }
            }
        }
    }
}
```

```groovy
// Jenkinsfile
@Library('my-shared-library') _

standardPipeline(
    buildCommand: 'npm ci && npm run build:prod',
    deployEnabled: true,
    environment: 'production'
)
```

## Pipeline Optimization

### Caching Strategies

```yaml
# GitHub Actions
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# GitLab CI
cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
    - .npm/
  policy: pull-push  # pull, push, pull-push
```

### Parallel Execution

```yaml
# GitHub Actions - Matrix
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npm run test -- --shard=${{ matrix.shard }}/4

# GitLab CI - Parallel
test:
  parallel: 4
  script:
    - npm run test -- --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

### Conditional Execution

```yaml
# GitHub Actions
jobs:
  deploy:
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      !contains(github.event.head_commit.message, '[skip ci]')

# Path-based triggers
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### Artifact Management

```yaml
# GitHub Actions
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7
    compression-level: 9

- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

## Testing Strategies

### Test Pyramid in CI

```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit
    # Fast, run first

  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      db:
        image: postgres:15
    steps:
      - run: npm run test:integration

  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e
    # Slow, run last
```

### Test Reporting

```yaml
- name: Run tests
  run: npm test -- --reporter=junit --outputFile=junit.xml

- name: Test Report
  uses: dorny/test-reporter@v1
  if: success() || failure()
  with:
    name: Jest Tests
    path: junit.xml
    reporter: jest-junit

- name: Coverage Report
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

## Deployment Strategies

### Blue-Green Deployment

```yaml
deploy:
  steps:
    - name: Deploy to Green
      run: |
        kubectl apply -f k8s/green-deployment.yaml
        kubectl wait --for=condition=ready pod -l version=green

    - name: Health Check Green
      run: |
        curl -f https://green.example.com/health

    - name: Switch Traffic
      run: |
        kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

    - name: Cleanup Blue
      run: |
        kubectl delete deployment myapp-blue
```

### Canary Deployment

```yaml
deploy-canary:
  steps:
    - name: Deploy Canary (10%)
      run: |
        kubectl apply -f k8s/canary-deployment.yaml
        kubectl scale deployment myapp-canary --replicas=1
        kubectl scale deployment myapp-stable --replicas=9

    - name: Monitor Canary
      run: |
        sleep 300  # 5 minutes
        ./check-metrics.sh canary

    - name: Promote or Rollback
      run: |
        if ./check-metrics.sh canary; then
          kubectl scale deployment myapp-canary --replicas=10
          kubectl delete deployment myapp-stable
        else
          kubectl delete deployment myapp-canary
        fi
```

### Rolling Update

```yaml
# Kubernetes
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
```

## Security in CI/CD

### Secrets Management

```yaml
# GitHub Actions - Secrets
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    run: ./deploy.sh

# Environment-specific secrets
jobs:
  deploy:
    environment: production
    steps:
      - env:
          API_KEY: ${{ secrets.PROD_API_KEY }}  # Production secret
```

### Security Scanning

```yaml
security-scan:
  steps:
    - name: Run Snyk
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

    - name: Run Trivy
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        severity: 'CRITICAL,HIGH'

    - name: CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

### SAST va DAST

```yaml
# Static Analysis (SAST)
sast:
  steps:
    - name: Semgrep
      uses: returntocorp/semgrep-action@v1
      with:
        config: p/owasp-top-ten

# Dynamic Analysis (DAST)
dast:
  needs: deploy-staging
  steps:
    - name: OWASP ZAP Scan
      uses: zaproxy/action-full-scan@v0.10.0
      with:
        target: 'https://staging.example.com'
```

## Real-World Workflow

### Complete Production Pipeline

```yaml
name: Production Pipeline

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Quality Gates
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # Security
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Dependency audit
        run: npm audit --audit-level=high
      - name: Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Build & Push
  build:
    needs: [quality, security]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - name: Get version
        id: version
        run: |
          if [[ $GITHUB_REF == refs/tags/* ]]; then
            echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT
          else
            echo "version=sha-${GITHUB_SHA::8}" >> $GITHUB_OUTPUT
          fi

      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.version.outputs.version }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy Staging
  staging:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - name: Deploy
        run: |
          echo "Deploying version ${{ needs.build.outputs.version }}"
          # deployment commands

  # Integration Tests on Staging
  integration:
    needs: staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          BASE_URL: https://staging.example.com

  # Deploy Production (manual approval for tags)
  production:
    needs: [build, integration]
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Deploy
        run: |
          echo "Deploying version ${{ needs.build.outputs.version }} to production"

      - name: Verify deployment
        run: |
          sleep 60
          curl -f https://example.com/health

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

## Interview Savollari

### 1. CI va CD farqi nima?

**Javob:**
- **CI (Continuous Integration)** - developerlar kodini tez-tez (kuniga bir necha marta) umumiy repository'ga integrate qilish. Har bir integrate qilishda avtomatik build va test o'tkaziladi.

- **CD** ikkita ma'noga ega:
  - **Continuous Delivery** - kod har doim production'ga deploy qilishga tayyor holda, lekin deploy manual
  - **Continuous Deployment** - har bir o'zgarish avtomatik production'ga deploy bo'ladi

```
CI: Code → Build → Test → Validated code
CD (Delivery): ... → Staging → [Manual] → Production
CD (Deployment): ... → Staging → Production (Auto)
```

### 2. Pipeline'ni qanday optimize qilish mumkin?

**Javob:**

1. **Caching** - dependencies, build artifacts, Docker layers
2. **Parallelization** - mustaqil job'larni parallel ishlatish
3. **Incremental builds** - faqat o'zgargan qismlarni build qilish
4. **Test sharding** - testlarni parallel runner'larga bo'lish
5. **Conditional execution** - kerak bo'lgandagina job'larni run qilish
6. **Resource optimization** - to'g'ri runner size tanlash

```yaml
# Misol
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ hashFiles('package-lock.json') }}
      - run: npm test -- --shard=${{ matrix.shard }}/4
```

### 3. Blue-Green va Canary deployment farqi?

**Javob:**

**Blue-Green:**
- Ikki bir xil environment (Blue - current, Green - new)
- Green'ga deploy, test, keyin traffic'ni to'liq switch
- Rollback tez - Blue'ga qaytish
- Resurs ko'p kerak (2x)

**Canary:**
- Yangi versiyani kichik foiz traffic'ga (5-10%)
- Metrics monitoring
- Muammo bo'lmasa foizni oshirish
- Resurs kam, lekin monitoring murakkab

### 4. Secrets'ni CI/CD'da qanday xavfsiz saqlash kerak?

**Javob:**

1. **Hech qachon kodda yoki repo'da saqlmaslik**
2. **CI/CD platformaning secret management'i** - GitHub Secrets, GitLab CI Variables
3. **External secret managers** - HashiCorp Vault, AWS Secrets Manager
4. **Environment-specific secrets** - staging va production uchun alohida
5. **Audit logging** - kim qachon ishlatganini tracking
6. **Rotation policy** - muntazam secret'larni yangilash

```yaml
# To'g'ri
env:
  API_KEY: ${{ secrets.API_KEY }}

# Xato
env:
  API_KEY: "hardcoded-secret"
```

### 5. Pipeline failure'da qanday debug qilasiz?

**Javob:**

1. **Logs analysis** - CI platformadagi logs'ni ko'rish
2. **Local reproduction** - bir xil environment'da lokal run
3. **Artifacts** - test reports, screenshots, logs'ni artifact sifatida saqlash
4. **SSH access** - ba'zi platform'lar runner'ga SSH beradi
5. **Step-by-step debugging** - alohida step'larni test qilish
6. **Environment comparison** - lokal vs CI environment farqi

```yaml
# Debug uchun artifacts
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: debug-info
    path: |
      logs/
      screenshots/
      test-results/
```

## Tips & Tricks

### 1. Fast Feedback

```yaml
# Eng tez testlarni birinchi
jobs:
  quick-check:  # 30 seconds
    steps:
      - run: npm run lint
      - run: npm run typecheck

  unit-test:  # 2 minutes
    needs: quick-check
    steps:
      - run: npm test

  e2e-test:  # 10 minutes
    needs: unit-test
    steps:
      - run: npm run test:e2e
```

### 2. PR Comments

```yaml
- name: Comment test results
  uses: actions/github-script@v7
  if: github.event_name == 'pull_request'
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '## Test Results\n\nAll tests passed!'
      })
```

### 3. Branch Protection

```yaml
# Required status checks
# GitHub Settings → Branches → Branch protection rules
required_status_checks:
  strict: true
  contexts:
    - lint
    - test
    - build
```

### 4. Auto-merge Dependabot

```yaml
name: Dependabot auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - uses: dependabot/fetch-metadata@v2
        id: metadata
      - if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --merge "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 5. Notification Integration

```yaml
- name: Slack Notification
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "${{ job.status == 'success' && ':white_check_mark:' || ':x:' }} *${{ github.workflow }}* - ${{ job.status }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Xulosa

CI/CD - bu zamonaviy dasturiy ta'minot ishlab chiqarishning muhim qismi. Asosiy tushunchalar:

1. **Automation** - manual process'larni minimizatsiya qiling
2. **Fast Feedback** - xatolarni tez toping
3. **Consistency** - har safar bir xil natija
4. **Security** - secrets va scanning
5. **Monitoring** - pipeline va deployment metrics

Yaxshi CI/CD pipeline - bu ishonchli, tez va xavfsiz deployment'lar kafolatchi.
