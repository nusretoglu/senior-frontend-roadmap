# GitHub va GitLab

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Kod yozish — ishingizning faqat 30% ni tashkil qiladi. Qolgan 70% vaqt Jamoa bo'lib o'sha kodni boshqarish, boshqalar yozgan kodni xatosini tekshirish (Code Review), xatolarni qayd etish (Issues) va o'zgarishlarni xavfsiz birlashtirish (Pull Requests) ga ketadi. GitHub va GitLab shunchaki fayllarni onlayn saqlovchi joy emas, u butun boshli loyihaning yuragi, dasturchilarning ijtimoiy tarmog'i va CI/CD ishga tushadigan markaziy serverdir.

> [!NOTE]
> **Real-hayot analogiyasi: "Google Docs vs Word"**  
> O'zingiz kompyuterda `.docx` faylida matn yozishingiz (Bu faqat Git bilan mahalliy ishlash). Siz u matnni birovga jo'natsangiz, u ham o'zgartirsa fayllar chalkashib ketadi.  
> **GitHub / GitLab** — bu xuddi "Google Docs" ga o'xshaydi. 10 kishi bir vaqtda bitta faylga kiradi, kim qayerini o'zgartirganini hamma ko'radi, kimnidir o'zgartirishiga izoh (Comment) yozish mumkin va agar matn yoqmasa bitta tugma bilan eski holatiga qaytarish mumkin. Bularsiz o'rtacha kattalikdagi loyihani ham boshqarib bo'lmaydi.

GitHub va GitLab - bu Git repository hosting platformalari bo'lib, jamoa bilan ishlash, code review, CI/CD, va project management uchun keng qo'llaniladi. Bu bo'limda professional darajada Pull Request, Code Review, Issue management, va platform-specific xususiyatlarni o'rganamiz.
## GitHub vs GitLab

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub vs GitLab                              │
├───────────────────────────────┬─────────────────────────────────┤
│           GitHub              │           GitLab                 │
├───────────────────────────────┼─────────────────────────────────┤
│ Pull Request                  │ Merge Request                    │
│ GitHub Actions                │ GitLab CI/CD                     │
│ GitHub Projects               │ GitLab Boards                    │
│ GitHub Packages               │ GitLab Package Registry          │
│ Dependabot                    │ Dependency Scanning              │
│ GitHub Copilot                │ GitLab Duo                       │
│ GitHub Codespaces             │ GitLab Remote Development        │
│ SaaS primarily                │ Self-hosted + SaaS               │
├───────────────────────────────┼─────────────────────────────────┤
│ + Largest community           │ + All-in-one DevOps              │
│ + Open source home            │ + Self-hosted free               │
│ + GitHub Actions ecosystem    │ + Built-in CI/CD                 │
│ - Limited free CI             │ - Smaller ecosystem              │
└───────────────────────────────┴─────────────────────────────────┘
```

## Pull Request (GitHub) / Merge Request (GitLab)

### PR/MR Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pull Request Lifecycle                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Create Branch                                                │
│     │                                                            │
│     ▼                                                            │
│  2. Make Changes & Commit                                        │
│     │                                                            │
│     ▼                                                            │
│  3. Push to Remote                                               │
│     │                                                            │
│     ▼                                                            │
│  4. Open Pull Request ◄────────────────┐                        │
│     │                                   │                        │
│     ▼                                   │                        │
│  5. CI/CD Checks ──────────────────────►│ (if failed)           │
│     │                                   │                        │
│     ▼                                   │                        │
│  6. Code Review ───────────────────────►│ (if changes needed)   │
│     │                                   │                        │
│     ▼                                                            │
│  7. Approval(s)                                                  │
│     │                                                            │
│     ▼                                                            │
│  8. Merge                                                        │
│     │                                                            │
│     ▼                                                            │
│  9. Delete Branch (optional)                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Professional PR Template

```markdown
<!-- .github/pull_request_template.md -->

## Summary

<!-- Qisqa tavsif: nima o'zgartirildi va nima uchun -->

## Type of Change

- [ ] Bug fix (backward compatible)
- [ ] New feature (backward compatible)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Changes

<!-- Detailed list of changes -->

- Added X component
- Updated Y logic
- Fixed Z bug

## Screenshots/Videos

<!-- UI changes uchun -->

| Before | After |
|--------|-------|
| img    | img   |

## Testing

<!-- Qanday test qilindi -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

### Test Instructions

1. Checkout this branch
2. Run `npm install`
3. Run `npm test`
4. Verify X works correctly

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Breaking changes documented

## Related Issues

Closes #123
Related to #456

## Deployment Notes

<!-- Production'ga deploy qilishda e'tibor berish kerak bo'lgan narsalar -->
```

### PR Description Best Practices

```markdown
## Good PR Description Example

### Summary
Add user authentication with JWT tokens. This enables secure API access
and session management for the mobile app.

### Why
- Users need to securely access their data
- Mobile app requires token-based auth
- Replaces legacy session-based auth

### What
- JWT token generation and validation
- Refresh token rotation
- Password hashing with bcrypt
- Rate limiting on auth endpoints

### How to Test
1. Start the server: `npm run dev`
2. Register: `POST /auth/register` with email/password
3. Login: `POST /auth/login`
4. Use returned token in Authorization header
5. Verify refresh token rotation works

### Breaking Changes
- `/api/v1/session` endpoints removed
- All API requests now require Bearer token

### Migration
```sql
ALTER TABLE users ADD COLUMN refresh_token VARCHAR(255);
```
```

## Code Review

### Code Review Checklist

```markdown
## Code Review Checklist

### Correctness
- [ ] Does the code do what it's supposed to do?
- [ ] Are edge cases handled?
- [ ] Are error conditions handled properly?
- [ ] Is the logic correct?

### Security
- [ ] No hardcoded secrets/credentials
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Proper authentication/authorization

### Performance
- [ ] No unnecessary loops or computations
- [ ] Efficient database queries (no N+1)
- [ ] Proper caching where needed
- [ ] No memory leaks

### Code Quality
- [ ] Code is readable and self-documenting
- [ ] Functions are small and focused
- [ ] DRY principle followed
- [ ] Naming is clear and consistent
- [ ] No commented-out code

### Testing
- [ ] Tests cover the changes
- [ ] Tests are meaningful (not just for coverage)
- [ ] Edge cases are tested

### Documentation
- [ ] Public APIs documented
- [ ] Complex logic has comments
- [ ] README updated if needed
```

### Review Comments Examples

```markdown
## Constructive Feedback Examples

### Good Comments
```javascript
// Suggestion: Consider using early return for cleaner code
// Instead of:
if (user) {
  if (user.isActive) {
    // ... long logic
  }
}
// Consider:
if (!user || !user.isActive) return;
// ... cleaner logic
```

### Question format
```javascript
// Question: Is there a reason we're not using the existing
// `validateEmail` utility here? It handles edge cases like
// unicode characters.
const isValid = email.includes('@');
```

### Praise
```javascript
// Nice! This is a clean solution for handling the race condition.
// The debounce pattern here is exactly what we needed.
```

### Blocking issue
```javascript
// 🚫 Security: This exposes user passwords in the response.
// We should never return sensitive data. Please remove
// the password field from the response object.
return { ...user, password }; // ← Remove password
```
```

### CODEOWNERS

```bash
# .github/CODEOWNERS

# Default owners
* @team-lead @senior-dev

# Frontend
/src/components/ @frontend-team
/src/pages/ @frontend-team
*.css @frontend-team
*.scss @frontend-team

# Backend
/src/api/ @backend-team
/src/services/ @backend-team
/src/database/ @backend-team @dba-team

# Infrastructure
/infra/ @devops-team
/.github/ @devops-team
Dockerfile @devops-team
docker-compose*.yml @devops-team

# Sensitive files
/src/auth/ @security-team @team-lead
/.env.example @security-team

# Documentation
/docs/ @tech-writer
*.md @tech-writer
```

## Branch Protection

### GitHub Branch Protection Rules

```yaml
# Settings → Branches → Branch protection rules

main:
  # Require pull request
  require_pull_request_reviews:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    require_last_push_approval: true

  # Status checks
  require_status_checks:
    strict: true  # Branch must be up to date
    contexts:
      - "CI / lint"
      - "CI / test"
      - "CI / build"
      - "security / snyk"

  # Other protections
  require_conversation_resolution: true
  require_signed_commits: true
  require_linear_history: true  # No merge commits
  enforce_admins: true
  allow_force_pushes: false
  allow_deletions: false

  # Restrictions
  restrictions:
    users: []
    teams:
      - maintainers
```

### Rulesets (GitHub)

```yaml
# Settings → Rules → Rulesets

name: Production Protection
target: branch
bypass:
  - role: admin
    mode: always

conditions:
  ref_name:
    include:
      - refs/heads/main
      - refs/heads/release/*

rules:
  - type: pull_request
    parameters:
      required_approving_review_count: 2
      dismiss_stale_reviews_on_push: true
      require_code_owner_review: true
      require_last_push_approval: true

  - type: required_status_checks
    parameters:
      strict_required_status_checks_policy: true
      required_status_checks:
        - context: "CI / test"
          integration_id: 12345
        - context: "CI / build"
          integration_id: 12345

  - type: required_signatures

  - type: non_fast_forward
```

## GitHub Actions Integration

### PR Validation Workflow

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]

concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  # PR comment with build preview
  preview:
    name: Deploy Preview
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to preview
        id: deploy
        run: |
          # Deploy to preview environment
          echo "url=https://preview-${{ github.event.pull_request.number }}.example.com" >> $GITHUB_OUTPUT

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🚀 Preview Deployed!\n\n**URL:** ${{ steps.deploy.outputs.url }}\n\n*Expires in 24 hours*`
            })
```

### Auto-labeling

```yaml
# .github/workflows/labeler.yml
name: Labeler

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/labeler@v5
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

```yaml
# .github/labeler.yml
frontend:
  - 'src/components/**'
  - 'src/pages/**'
  - '**/*.css'
  - '**/*.scss'

backend:
  - 'src/api/**'
  - 'src/services/**'
  - 'src/database/**'

documentation:
  - '**/*.md'
  - 'docs/**'

dependencies:
  - 'package.json'
  - 'package-lock.json'
  - 'pnpm-lock.yaml'

ci:
  - '.github/**'
  - 'Dockerfile'
  - 'docker-compose*.yml'

size/S:
  - changed-files:
      - any-glob-to-any-file: '**/*'
        count: {less-than: 10}

size/M:
  - changed-files:
      - any-glob-to-any-file: '**/*'
        count: {greater-than-or-equal-to: 10, less-than: 50}

size/L:
  - changed-files:
      - any-glob-to-any-file: '**/*'
        count: {greater-than-or-equal-to: 50}
```

## Issue Management

### Issue Templates

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug to help us improve
title: "[Bug]: "
labels: ["bug", "triage"]
assignees:
  - octocat

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: When I click the submit button, nothing happens...
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: If applicable, add screenshots

  - type: dropdown
    id: browsers
    attributes:
      label: Browser
      description: What browser are you using?
      multiple: true
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Other

  - type: input
    id: version
    attributes:
      label: Version
      description: What version of the software are you running?
      placeholder: v1.2.3

  - type: checkboxes
    id: terms
    attributes:
      label: Checklist
      options:
        - label: I have searched for existing issues
          required: true
        - label: I have provided all requested information
          required: true
```

```yaml
# .github/ISSUE_TEMPLATE/feature_request.yml
name: Feature Request
description: Suggest a new feature
title: "[Feature]: "
labels: ["enhancement"]

body:
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem does this feature solve?
      placeholder: I'm frustrated when...
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe your proposed solution
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Any alternative solutions you've considered?

  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Any other context or screenshots
```

### GitHub Projects

```yaml
# Project automation with GitHub Actions
# .github/workflows/project-automation.yml
name: Project Automation

on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, ready_for_review, review_requested]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/orgs/myorg/projects/1
          github-token: ${{ secrets.PROJECT_TOKEN }}
          labeled: bug, enhancement
          label-operator: OR
```

## GitHub CLI (gh)

```bash
# Installation
# macOS: brew install gh
# Windows: winget install GitHub.cli

# Authentication
gh auth login

# Repository
gh repo create my-project --public
gh repo clone owner/repo
gh repo fork owner/repo
gh repo view --web

# Pull Requests
gh pr create --title "Add feature" --body "Description"
gh pr create --fill  # Title/body from commits
gh pr create --draft
gh pr list
gh pr list --state=open --author=@me
gh pr view 123
gh pr view 123 --web
gh pr checkout 123
gh pr merge 123 --squash --delete-branch
gh pr review 123 --approve
gh pr review 123 --request-changes --body "Please fix X"

# Issues
gh issue create --title "Bug" --body "Description"
gh issue list
gh issue view 123
gh issue close 123
gh issue reopen 123

# Workflow
gh workflow list
gh workflow view ci.yml
gh workflow run ci.yml
gh run list
gh run view 12345
gh run watch 12345

# API
gh api repos/owner/repo/pulls
gh api repos/owner/repo/issues --jq '.[].title'
gh api graphql -f query='{ viewer { login } }'

# Extensions
gh extension install dlvhdr/gh-dash
gh extension install seachicken/gh-poi
```

## GitLab Specific Features

### GitLab Merge Request

```yaml
# .gitlab/merge_request_templates/Default.md
## Summary

<!-- What does this MR do? -->

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines

## Related Issues

Closes #

## Screenshots

<!-- If applicable -->
```

### GitLab CI/CD Integration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - review
  - deploy

# Automatic review app
review:
  stage: review
  script:
    - deploy-review-app
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://$CI_COMMIT_REF_SLUG.example.com
    on_stop: stop-review
    auto_stop_in: 1 week
  rules:
    - if: $CI_MERGE_REQUEST_ID

stop-review:
  stage: review
  script:
    - delete-review-app
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    action: stop
  rules:
    - if: $CI_MERGE_REQUEST_ID
      when: manual

# MR pipeline
test:
  stage: test
  script:
    - npm test
  rules:
    - if: $CI_MERGE_REQUEST_ID
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
```

### GitLab Review Apps

```yaml
# Review app with Docker
review:
  stage: review
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t review-$CI_COMMIT_REF_SLUG .
    - docker run -d -p 80:80 --name review-$CI_COMMIT_REF_SLUG review-$CI_COMMIT_REF_SLUG
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: http://$CI_COMMIT_REF_SLUG.review.example.com
    on_stop: stop-review
  rules:
    - if: $CI_MERGE_REQUEST_ID
```

## Secrets Management

### GitHub Secrets

```yaml
# Repository Settings → Secrets and variables → Actions

# Usage in workflow
jobs:
  deploy:
    env:
      API_KEY: ${{ secrets.API_KEY }}
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    steps:
      - run: deploy --token=$API_KEY

# Environment secrets
jobs:
  deploy-prod:
    environment: production  # Production-specific secrets
    steps:
      - env:
          PROD_KEY: ${{ secrets.PROD_API_KEY }}
```

### GitLab CI Variables

```yaml
# Settings → CI/CD → Variables

# Usage
deploy:
  script:
    - deploy --token=$API_KEY
  variables:
    API_KEY: $API_KEY  # From CI/CD variables
```

### Best Practices

```yaml
# 1. Use environment-specific secrets
jobs:
  deploy:
    environment: production
    steps:
      - env:
          DB_URL: ${{ secrets.PROD_DB_URL }}

# 2. Rotate secrets regularly
# 3. Use OIDC for cloud providers
jobs:
  deploy:
    permissions:
      id-token: write
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456:role/deploy
          aws-region: us-east-1

# 4. Audit secret usage
# GitHub: Settings → Logs → Security events
```

## Automation

### Dependabot (GitHub)

```yaml
# .github/dependabot.yml
version: 2
updates:
  # npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tashkent"
    open-pull-requests-limit: 10
    reviewers:
      - "team-lead"
    labels:
      - "dependencies"
      - "automerge"
    groups:
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
      production-dependencies:
        dependency-type: "production"
    ignore:
      - dependency-name: "lodash"
        versions: ["5.x"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci"

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Auto-merge Dependabot

```yaml
# .github/workflows/dependabot-automerge.yml
name: Dependabot auto-merge

on: pull_request

permissions:
  contents: write
  pull-requests: write

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge minor development updates
        if: |
          steps.metadata.outputs.update-type == 'version-update:semver-minor' &&
          steps.metadata.outputs.dependency-type == 'direct:development'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Release Automation

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest --strip header

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') }}
          generate_release_notes: false
```

## Real-World Workflow

### Complete Team Workflow

```bash
# 1. Issue yaratish
gh issue create --title "Add user profile page" --body "..."

# 2. Branch yaratish
git checkout -b feature/user-profile

# 3. Kod yozish va commit
git add .
git commit -m "feat(profile): add user profile component"

# 4. Push
git push -u origin feature/user-profile

# 5. PR yaratish
gh pr create --fill --reviewer @team-lead

# 6. CI tekshiruvlari o'tadi
# 7. Code review
gh pr review 123 --approve

# 8. Merge
gh pr merge 123 --squash --delete-branch

# 9. Release (tag bilan)
git tag v1.2.0
git push origin v1.2.0
# Release workflow avtomatik ishga tushadi
```

### Protected Main Branch Workflow

```yaml
# Branch protection + CI
# 1. Direct push to main → BLOCKED
# 2. PR without reviews → Cannot merge
# 3. PR with failing CI → Cannot merge
# 4. PR with all checks → Can merge

# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

# All 3 jobs must pass for merge
```

## Interview Savollari

### 1. Pull Request va Merge Request farqi nima?

**Javob:**
Texnik jihatdan farqi yo'q - ikkalasi ham bir xil funksiyani bajaradi:
- **Pull Request** - GitHub terminologiyasi
- **Merge Request** - GitLab terminologiyasi

Ikkalasi ham:
- Kod o'zgarishlarini review qilish
- CI/CD tekshiruvlari
- Diskussiya va feedback
- Branch'ni merge qilish

### 2. Code review'da nimaga e'tibor berasiz?

**Javob:**

1. **Correctness** - Kod to'g'ri ishlayaptimi?
2. **Security** - Xavfsizlik muammolari yo'qmi?
3. **Performance** - Samaradorlik muammolari yo'qmi?
4. **Readability** - Kod o'qishga osonmi?
5. **Testing** - Testlar yetarlimi?
6. **Architecture** - Dizayn to'g'ri tanlanganmi?

```markdown
Yaxshi review comment:
- Muammoni aniq ko'rsatadi
- Yechim taklif qiladi
- Konstruktiv ohangda yoziladi
- Blocking vs non-blocking farqlaydi
```

### 3. Branch protection nima uchun kerak?

**Javob:**
Branch protection production branch'larni himoya qiladi:

1. **Direct push oldini olish** - faqat PR orqali
2. **Required reviews** - kamida X ta approval kerak
3. **Status checks** - CI o'tishi kerak
4. **Signed commits** - commit'lar signed bo'lishi kerak
5. **Linear history** - rebase-only merge

Bu production stability va code quality kafolatlaydi.

### 4. Monorepo vs Polyrepo qachon ishlatish kerak?

**Javob:**

**Monorepo:**
- Tight coupling bo'lgan projects
- Shared code ko'p
- Atomic changes kerak
- Google, Facebook, Microsoft ishlatadi

**Polyrepo:**
- Independent teams
- Different lifecycles
- Clear boundaries
- Microservices

```
Monorepo:
my-company/
├── apps/
│   ├── web/
│   └── api/
└── packages/
    └── shared/

Polyrepo:
my-company-web/
my-company-api/
my-company-shared/
```

### 5. GitHub Actions vs GitLab CI farqi?

**Javob:**

| Feature | GitHub Actions | GitLab CI |
|---------|---------------|-----------|
| Config | YAML (multiple files) | YAML (single file) |
| Runners | GitHub-hosted + self-hosted | GitLab runners |
| Marketplace | Extensive | Limited |
| Caching | Good | Better |
| Artifacts | 90 days | Configurable |
| Pricing | Free tier limited | Better free tier |

GitHub Actions - ecosystem katta, marketplace boy.
GitLab CI - all-in-one, self-hosted uchun yaxshi.

## Tips & Tricks

### 1. Useful gh CLI Aliases

```bash
# ~/.config/gh/config.yml
aliases:
  prc: pr create --fill
  prv: pr view --web
  prl: pr list --author=@me
  prm: pr merge --squash --delete-branch
  iss: issue list --assignee=@me
  mypr: pr list --author=@me --state=open
```

### 2. PR Shortcuts

```bash
# Quick PR creation
gh pr create --fill

# PR from issue
gh pr create --fill --title "Fixes #123"

# Draft PR
gh pr create --draft --fill

# PR to different base
gh pr create --base develop --fill
```

### 3. Review Workflow

```bash
# View all PRs needing review
gh pr list --search "is:open review-requested:@me"

# Quick approve
gh pr review 123 --approve

# Request changes
gh pr review 123 --request-changes --body "Please fix X"

# Batch review
for pr in $(gh pr list --json number -q '.[].number'); do
  gh pr view $pr
done
```

### 4. Issue Templates Config

```yaml
# .github/ISSUE_TEMPLATE/config.yml
blank_issues_enabled: false
contact_links:
  - name: Community Support
    url: https://github.com/org/repo/discussions
    about: Please ask questions here
  - name: Security Issues
    url: https://org.com/security
    about: Report security vulnerabilities here
```

### 5. Auto-assign Reviewers

```yaml
# .github/workflows/auto-assign.yml
name: Auto Assign

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: kentaro-m/auto-assign-action@v1.2.6
        with:
          configuration-path: '.github/auto-assign.yml'
```

```yaml
# .github/auto-assign.yml
addReviewers: true
addAssignees: author
numberOfReviewers: 2
reviewers:
  - reviewer1
  - reviewer2
  - reviewer3
reviewGroups:
  frontend:
    - frontend-dev-1
    - frontend-dev-2
  backend:
    - backend-dev-1
    - backend-dev-2
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Pull Request (PR) yozish qoidalari:** PR ochganda shunchaki "Done" yoki "Fixed bug" deb yozmang. Jamoaga tushunarli bo'lishi uchun quyidagilarni yozing: Qaysi Issue ga tegishli? Nima o'zgardi? Qanday qilib test qilish kerak? (PR Template ishlating).
2. **Branch Protection Rules (Oltin qoida):** Main (master) branch ga aslo to'g'ridan to'g'ri kod yozishga ruxsat bermang. Sozlamalardan quyidagilarni yoqing: `Require pull request reviews before merging` (Kamida 1 kishi review qilishi shart), `Require status checks to pass` (CI/CD testlaridan o'tishi shart).
3. **Draft PR'lardan foydalaning:** Kodingizni to'liq tugatmasdan turib ham, u ustida ishlayotganingizni jamoaga ko'rsatish va erta fikr (Feedback) olish uchun PR ni `Draft` holatida oching.

---

## Xulosa

| Xususiyat | GitHub (Microsoft) | GitLab (Mustaqil / Open Core) |
|-----------|--------------------|-------------------------------|
| **Asosiy Foks** | Ochiq kodli (Open Source) hamjamiyat, Social Coding. | Enterprise korxonalar, All-in-One DevOps platforma. |
| **Kodni Birlashtirish** | Pull Request (PR) | Merge Request (MR) |
| **Avtomatlashtirish** | GitHub Actions | GitLab CI/CD (O'zining yechimi juda kuchli) |
| **O'z serveriga o'rnatish** | Faqat juda qimmat Enterprise versiyada (GitHub Enterprise). | O'z serveringizga bepul (Community Edition) o'rnatishingiz mumkin. Davlat sirlari/Banklar uchun ideal. |

GitHub va GitLab professional dasturchilar uchun kundalik qurol. Faqat Git buyruqlarini bilish yetarli emas, PR/MR madaniyati, Branchlarni himoyalash va Code Review da konstruktiv qatnashish qobiliyatlari sizni o'rtamiyona dasturchidan haqiqiy Jamoaviy o'yinchi (Team Player) darajasiga ko'taradi. Professional workflow = Protected branches + Required reviews + CI checks + Automated releases.
