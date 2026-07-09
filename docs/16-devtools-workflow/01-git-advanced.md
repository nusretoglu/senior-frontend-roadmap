# Git Advanced

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Junior dasturchilar Git'ni shunchaki `add`, `commit`, `push` deb o'ylashadi. Lekin haqiqiy loyihada birdaniga 5 ta dasturchi bitta faylga o'zgartirish kiritganda, konfliktlar yuzaga kelganda yoki noto'g'ri yozilgan kodni production'dan tezkor qaytarib olish (Revert) kerak bo'lganda nima qilasiz? Senior mutaxassislar Git'ning "orqa fonida" nima ishlashini (Trees, Blobs, Hashes) va GitFlow, Rebase, Cherry-Pick kabi murakkab ssenariylarni to'liq nazorat qila oladigan muhandislar hisoblanadi.

> [!NOTE]
> **Real-hayot analogiyasi: "Zamon va Makon bo'ylab sayohat"**  
> Git — bu sizning kodingiz uchun yaratilgan "Vaqt Mashinasi".  
> **Commit:** Vaqtning aynan shu soniyasidagi kodingizning 3D "Surati" (Snapshot).  
> **Branch (Shox):** Asosiy hayot yo'lidan ajralib chiqqan Muqobil (Parallel) Koinot. Siz u koinotda hamma narsani buza olasiz, lekin asosiy koinot (Main branch) zararlanmaydi.  
> **Merge:** Koinotlarni qayta bitta qilib birlashtirish.

Git - bu distributed version control system bo'lib, har bir developer'ning kompyuterida repository'ning to'liq tarixi saqlanadi. Bu bo'limda Git'ning ichki ishlash mexanizmlarini, professional branching strategiyalarini va murakkab vaziyatlarni hal qilishni o'rganamiz.
## Git Internals

### Git Objects

Git 4 xil object turini saqlaydi:

```
┌─────────────────────────────────────────────────────────────┐
│                      Git Object Types                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐         │
│  │  Blob  │   │  Tree  │   │ Commit │   │  Tag   │         │
│  │ (file) │   │ (dir)  │   │        │   │        │         │
│  └────────┘   └────────┘   └────────┘   └────────┘         │
│      │            │            │            │               │
│      ▼            ▼            ▼            ▼               │
│   Content     Directory    Snapshot     Named              │
│   of file     structure    + metadata   reference          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```bash
# Object'larni ko'rish
git cat-file -t <hash>    # object type
git cat-file -p <hash>    # object content
git cat-file -s <hash>    # object size

# Barcha object'larni sanash
git count-objects -v

# Object qanday saqlanganini ko'rish
ls .git/objects/
```

### SHA-1 Hash

Har bir object SHA-1 hash bilan identifikatsiya qilinadi:

```javascript
// Git hash qanday yaratiladi (conceptual)
const crypto = require('crypto');

function gitHash(type, content) {
  const header = `${type} ${content.length}\0`;
  const store = header + content;
  return crypto.createHash('sha1').update(store).digest('hex');
}

// Misol
const blobContent = 'Hello, Git!';
const hash = gitHash('blob', blobContent);
// hash: "5dd01c177f5d7d1be5346a5bc18a569a7410c2ef"
```

```bash
# Hash'ni qo'lda hisoblash
echo -n "Hello, Git!" | git hash-object --stdin
```

### References (Refs)

```
.git/
├── HEAD                 # Current branch pointer
├── refs/
│   ├── heads/          # Local branches
│   │   ├── main
│   │   └── feature/auth
│   ├── remotes/        # Remote tracking branches
│   │   └── origin/
│   │       ├── main
│   │       └── develop
│   └── tags/           # Tags
│       └── v1.0.0
└── packed-refs         # Optimized refs storage
```

```bash
# HEAD nimaga ishora qilmoqda
cat .git/HEAD
# ref: refs/heads/main

# Branch nimaga ishora qilmoqda
cat .git/refs/heads/main
# a1b2c3d4e5f6... (commit hash)

# Symbolic ref yaratish
git symbolic-ref HEAD refs/heads/feature
```

## Branching Strategiyalari

### 1. GitFlow

```
┌─────────────────────────────────────────────────────────────────┐
│                          GitFlow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  main      ●─────────────────●─────────────────●                │
│            │                 │                 │                 │
│  release   │     ●───────────●                 │                 │
│            │     │                             │                 │
│  develop   ●─────●─────●─────●─────●───────────●                │
│            │           │     │     │                             │
│  feature   │     ●─────●     │     │                             │
│            │                 │     │                             │
│  hotfix    │                 │     ●─────────────●              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# GitFlow o'rnatish
git flow init

# Feature boshlash
git flow feature start user-auth
# ... kod yozish ...
git flow feature finish user-auth

# Release boshlash
git flow release start 1.0.0
# ... testing, bug fixes ...
git flow release finish 1.0.0

# Hotfix
git flow hotfix start critical-bug
# ... fix ...
git flow hotfix finish critical-bug
```

**Qachon ishlatish:**
- Scheduled releases bo'lgan loyihalarda
- QA team bor bo'lganda
- Multiple versions support kerak bo'lganda

### 2. GitHub Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Flow                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  main      ●─────●─────●─────●─────●─────●─────●                │
│            │     │     │     │     │     │     │                 │
│  feature   │     ●─────●     │     │     │     │                │
│            │                 │     │     │     │                 │
│  feature   │                 ●─────●─────●     │                │
│            │                             │     │                 │
│  fix       │                             │     ●─────●          │
│                                                                  │
│  ★ Har bir PR → Review → Merge → Deploy                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Yangi feature
git checkout -b feature/new-dashboard
# ... kod yozish ...
git push -u origin feature/new-dashboard
# PR ochish, review, merge

# main har doim deployable holda
```

**Qachon ishlatish:**
- Continuous deployment
- Kichik-o'rta jamoalar
- Web applications

### 3. Trunk-Based Development

```
┌─────────────────────────────────────────────────────────────────┐
│                   Trunk-Based Development                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  main      ●─●─●─●─●─●─●─●─●─●─●─●─●─●─●                        │
│            │   │   │   │   │                                     │
│  short     ●───●   │   │   │                                    │
│  lived         ●───●   │   │                                    │
│  branches          ●───●   │                                    │
│                        ●───●                                    │
│                                                                  │
│  ★ Branches 1-2 kundan oshmasin                                 │
│  ★ Feature flags bilan incomplete features                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Qisqa branch
git checkout -b fix/button-color
# ... tez fix ...
git push origin fix/button-color
# Darhol PR va merge

# Feature flag bilan incomplete feature
# config/features.js
export const FEATURES = {
  NEW_DASHBOARD: process.env.ENABLE_NEW_DASHBOARD === 'true'
};
```

**Qachon ishlatish:**
- Katta jamoalar (Google, Facebook)
- High-frequency deployment
- Mature CI/CD pipeline

## Rebase vs Merge

### Merge

```bash
# Fast-forward merge (linear history bo'lganda)
git checkout main
git merge feature --ff-only

# No fast-forward (merge commit yaratish)
git checkout main
git merge feature --no-ff

# Squash merge (barcha commitlarni bitta qilish)
git checkout main
git merge feature --squash
git commit -m "feat: add user authentication"
```

```
Before merge:
main:     A───B───C
               \
feature:        D───E───F

After --no-ff merge:
main:     A───B───C───────M
               \         /
feature:        D───E───F

After squash merge:
main:     A───B───C───DEF (single commit)
```

### Rebase

```bash
# Feature branch'ni main'ga rebase qilish
git checkout feature
git rebase main

# Interactive rebase (commitlarni edit qilish)
git rebase -i HEAD~5

# Rebase davomida conflict bo'lsa
git add .
git rebase --continue
# yoki bekor qilish
git rebase --abort
```

```
Before rebase:
main:     A───B───C
               \
feature:        D───E───F

After rebase:
main:     A───B───C
                   \
feature:            D'──E'──F'
```

### Interactive Rebase Commands

```bash
git rebase -i HEAD~4

# Editor'da:
pick a1b2c3d feat: add login form
squash d4e5f6g feat: add validation       # Oldingi bilan birlashtirish
reword g7h8i9j feat: add auth service     # Commit message o'zgartirish
drop j0k1l2m debug: console.log           # Commit'ni o'chirish
fixup m3n4o5p fix: typo                   # squash, lekin message saqlanmaydi
edit p6q7r8s feat: add logout             # Commit'ni to'xtatib edit qilish
```

### Qachon qaysi birini ishlatish

| Vaziyat | Tavsiya |
|---------|---------|
| Public branch (main, develop) | Merge |
| Feature branch → main | Squash merge yoki Rebase + merge |
| Local cleanup | Interactive rebase |
| Shared feature branch | Merge (rebase xavfli) |
| Pull latest from main | Rebase (linear history) |

```bash
# Professional workflow
git checkout feature
git fetch origin
git rebase origin/main
# Conflict'larni hal qilish
git push --force-with-lease  # safer than --force
```

## Cherry-pick

Bitta yoki bir necha commit'ni boshqa branch'ga ko'chirish:

```bash
# Bitta commit
git cherry-pick a1b2c3d

# Bir necha commit
git cherry-pick a1b2c3d e4f5g6h

# Range of commits (a dan b gacha, a kiritilmaydi)
git cherry-pick a1b2c3d..e4f5g6h

# Range of commits (a ham kiritiladi)
git cherry-pick a1b2c3d^..e4f5g6h

# Commit qilmasdan (faqat changes)
git cherry-pick -n a1b2c3d

# Conflict bo'lsa
git cherry-pick --continue
git cherry-pick --abort
```

**Real-world case:**
```bash
# Hotfix'ni production'dan develop'ga olish
git checkout develop
git cherry-pick abc123  # hotfix commit

# Feature'dan faqat kerakli commit'larni olish
git checkout main
git cherry-pick def456 ghi789
```

## Stash

```bash
# Asosiy stash
git stash                    # Stash with default message
git stash push -m "WIP: auth" # Stash with message
git stash list               # Barcha stash'larni ko'rish
git stash pop                # Apply va delete
git stash apply              # Faqat apply
git stash drop stash@{0}     # Delete specific stash
git stash clear              # Barcha stash'larni o'chirish

# Selective stash
git stash push -p            # Interactive (har bir change'ni tanlash)
git stash push -- file.js    # Faqat specific file

# Stash'dan branch yaratish
git stash branch new-feature stash@{0}

# Stash'ni ko'rish
git stash show stash@{0}     # Summary
git stash show -p stash@{0}  # Full diff
```

**Real workflow:**
```bash
# Urgent bug keldi, lekin feature ustida ishlayapman
git stash push -m "WIP: user dashboard"
git checkout -b hotfix/critical-bug
# ... fix ...
git checkout feature/dashboard
git stash pop
```

## Git Bisect

Bug qaysi commit'da paydo bo'lganini topish:

```bash
# Bisect boshlash
git bisect start

# Hozirgi holat bad
git bisect bad

# Ma'lum commit good edi
git bisect good v1.0.0

# Git o'rtadagi commit'ga checkout qiladi
# Test qiling va natijani ayting:
git bisect good  # yoki
git bisect bad

# Topilgandan keyin
git bisect reset
```

**Automated bisect:**
```bash
# Test script bilan
git bisect start HEAD v1.0.0
git bisect run npm test

# Custom script bilan
git bisect run ./test-bug.sh
```

```bash
#!/bin/bash
# test-bug.sh
npm run build
if grep -r "buggy-code" dist/; then
  exit 1  # bad
else
  exit 0  # good
fi
```

## Conflict Resolution

### Conflict Types

```
<<<<<<< HEAD
const name = 'main version';
=======
const name = 'feature version';
>>>>>>> feature
```

### Resolution Strategies

```bash
# Theirs yoki ours ni qabul qilish
git checkout --ours file.js    # main versiyasini olish
git checkout --theirs file.js  # feature versiyasini olish

# Merge tool ishlatish
git mergetool

# Abort
git merge --abort
git rebase --abort
```

### VS Code bilan conflict resolution

```json
// settings.json
{
  "git.mergeEditor": true,
  "merge-conflict.autoNavigateNextConflict.enabled": true
}
```

### Complex conflict pattern

```bash
# Recursive strategiya bilan
git merge -X patience feature  # Better diff algorithm
git merge -X ignore-space-change feature  # Whitespace ignore

# Rerere (Reuse Recorded Resolution)
git config rerere.enabled true
# Keyingi safar bir xil conflict avtomatik hal bo'ladi
```

## Git Hooks

```
.git/hooks/
├── pre-commit       # Commit oldidan
├── prepare-commit-msg
├── commit-msg       # Commit message validation
├── post-commit
├── pre-push         # Push oldidan
├── pre-rebase
└── post-merge
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Lint check
npm run lint
if [ $? -ne 0 ]; then
  echo "Lint failed. Fix errors before committing."
  exit 1
fi

# Test
npm run test:unit
if [ $? -ne 0 ]; then
  echo "Tests failed. Fix tests before committing."
  exit 1
fi

# Large file check
MAX_SIZE=500000  # 500KB
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ $size -gt $MAX_SIZE ]; then
      echo "Error: $file is too large ($size bytes)"
      exit 1
    fi
  fi
done
```

### Commit-msg Hook (Conventional Commits)

```bash
#!/bin/sh
# .git/hooks/commit-msg

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "Invalid commit message format."
  echo "Example: feat(auth): add login functionality"
  echo "Types: feat, fix, docs, style, refactor, test, chore"
  exit 1
fi
```

### Husky bilan Hooks

```bash
# O'rnatish
npm install husky --save-dev
npx husky init

# Pre-commit hook
echo "npm run lint && npm run test" > .husky/pre-commit
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

## Monorepo va Submodules

### Git Submodules

```bash
# Submodule qo'shish
git submodule add https://github.com/org/shared-lib.git libs/shared

# Clone with submodules
git clone --recurse-submodules https://github.com/org/main-repo.git

# Mavjud repo'da submodules olish
git submodule update --init --recursive

# Submodule yangilash
cd libs/shared
git pull origin main
cd ../..
git add libs/shared
git commit -m "chore: update shared lib"

# Barcha submodule'larni yangilash
git submodule update --remote
```

### .gitmodules

```ini
[submodule "libs/shared"]
    path = libs/shared
    url = https://github.com/org/shared-lib.git
    branch = main
```

### Submodule Muammolari va Yechimlar

```bash
# Detached HEAD fix
cd libs/shared
git checkout main

# Submodule o'chirish
git submodule deinit libs/shared
git rm libs/shared
rm -rf .git/modules/libs/shared
```

### Monorepo Alternatives

| Tool | Use Case |
|------|----------|
| Git Submodules | External dependencies |
| Lerna | JavaScript monorepo |
| Nx | Full-featured monorepo |
| Turborepo | Fast builds |
| pnpm workspaces | Package management |

## Advanced Git Commands

### Reflog (Safety Net)

```bash
# Barcha HEAD harakatlarini ko'rish
git reflog

# Specific branch reflog
git reflog show feature

# O'chirilgan branch'ni qaytarish
git checkout -b recovered-branch HEAD@{5}

# Hard reset'dan qaytish
git reset --hard HEAD@{2}
```

### Worktrees

```bash
# Yangi worktree yaratish
git worktree add ../project-hotfix hotfix/bug-123

# Worktree'larni ko'rish
git worktree list

# Worktree o'chirish
git worktree remove ../project-hotfix

# Prune stale worktrees
git worktree prune
```

**Real workflow:**
```bash
# Main branch'da ishlayapman, urgent hotfix kerak
git worktree add ../hotfix main
cd ../hotfix
git checkout -b hotfix/critical
# ... fix ...
git push origin hotfix/critical
# PR merge
cd ../main-project
git worktree remove ../hotfix
```

### Blame va Log

```bash
# Kim qachon yozgan
git blame file.js
git blame -L 10,20 file.js  # Specific lines

# Ignore whitespace
git blame -w file.js

# Log with graph
git log --oneline --graph --all

# Search in commits
git log -S "searchTerm"     # Code change
git log --grep="feat:"      # Commit message
git log --author="John"     # By author
git log --since="2024-01-01"

# File history
git log --follow -- file.js  # Renamed files ham
git log -p -- file.js        # With diff
```

### Clean va GC

```bash
# Untracked files ko'rish
git clean -n

# Untracked files o'chirish
git clean -f
git clean -fd  # directories ham
git clean -fX  # faqat ignored files
git clean -fx  # ignored + untracked

# Garbage collection
git gc
git gc --aggressive --prune=now
```

## Real-World Workflow

### Feature Development

```bash
# 1. Latest main olish
git checkout main
git pull origin main

# 2. Feature branch
git checkout -b feature/user-dashboard

# 3. Regular commits
git add .
git commit -m "feat(dashboard): add user stats component"

# 4. Push va PR
git push -u origin feature/user-dashboard

# 5. Review'dan keyin main yangilangan bo'lsa
git fetch origin
git rebase origin/main

# 6. Force push (rebase'dan keyin)
git push --force-with-lease

# 7. Merge (GitHub/GitLab UI orqali)
```

### Hotfix Workflow

```bash
# 1. Production'dan branch
git checkout main
git pull origin main
git checkout -b hotfix/payment-bug

# 2. Fix
git add .
git commit -m "fix(payment): handle null card number"

# 3. Test locally
npm test

# 4. Push va emergency PR
git push -u origin hotfix/payment-bug

# 5. Fast merge va deploy

# 6. Develop'ga ham merge
git checkout develop
git merge hotfix/payment-bug
git push origin develop
```

## Interview Savollari

### 1. Git rebase va merge farqi nima? Qachon qaysi birini ishlatish kerak?

**Javob:**
- **Merge** yangi "merge commit" yaratadi va ikkala branch tarixini saqlaydi. Public branch'larda ishlatiladi.
- **Rebase** commit'larni qayta yozadi va linear tarix yaratadi. Local branch'larni main bilan sync qilishda ishlatiladi.

```bash
# Merge - tarix saqlanadi
git merge feature  # M commit yaratiladi

# Rebase - linear tarix
git rebase main  # commitlar qayta yoziladi
```

Rebase public branch'larda ishlatilmasligi kerak chunki boshqa developerlar'ning ishini buzadi.

### 2. Git HEAD, working directory va staging area nima?

**Javob:**
- **Working Directory** - fayllarning hozirgi holati diskda
- **Staging Area (Index)** - keyingi commit'ga kiritiladigan o'zgarishlar
- **HEAD** - hozirgi branch'ning oxirgi commit'iga pointer

```bash
# Working directory → Staging
git add file.js

# Staging → Repository
git commit -m "message"

# HEAD o'zgartirish
git checkout branch-name
```

### 3. git reset --soft, --mixed, --hard farqi?

**Javob:**

```bash
git reset --soft HEAD~1   # Commit bekor, staging saqlanadi
git reset --mixed HEAD~1  # Commit bekor, staging tozalanadi (default)
git reset --hard HEAD~1   # Hammasi bekor, working directory ham
```

| Flag | HEAD | Staging | Working Dir |
|------|------|---------|-------------|
| --soft | O'zgaradi | Saqlanadi | Saqlanadi |
| --mixed | O'zgaradi | Tozalanadi | Saqlanadi |
| --hard | O'zgaradi | Tozalanadi | Tozalanadi |

### 4. Git conflict qanday hal qilinadi?

**Javob:**
1. Conflict bo'lgan fayllarni topish: `git status`
2. Fayllarni ochib, `<<<<<<<`, `=======`, `>>>>>>>` marker'larni topish
3. Kerakli kodni qoldirish, marker'larni o'chirish
4. `git add` bilan staging'ga qo'shish
5. `git commit` yoki `git rebase --continue`

```bash
# Agar theirs yoki ours kerak bo'lsa
git checkout --ours file.js
git checkout --theirs file.js
```

### 5. Git stash nima va qachon ishlatiladi?

**Javob:**
Stash - bu uncommitted changes'ni vaqtincha saqlash. Ishlatiladi:
- Branch almashtirishda uncommitted changes bo'lganda
- Urgent bug fix kerak bo'lganda
- Experiment qilmoqchi bo'lganda

```bash
git stash push -m "WIP: feature"
# ... boshqa ish ...
git stash pop  # qaytarish
```

## Tips & Tricks

### 1. Useful Aliases

```bash
# ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    lg = log --oneline --graph --all --decorate
    undo = reset --soft HEAD~1
    amend = commit --amend --no-edit
    wip = !git add -A && git commit -m 'WIP'
    unwip = reset HEAD~1
    cleanup = !git branch --merged | grep -v main | xargs git branch -d
```

### 2. Global .gitignore

```bash
# Setup
git config --global core.excludesFile ~/.gitignore_global

# ~/.gitignore_global
.DS_Store
Thumbs.db
*.swp
.idea/
.vscode/
node_modules/
*.log
```

### 3. Git Performance

```bash
# Large repo optimization
git config core.preloadIndex true
git config core.fscache true
git config gc.auto 256

# Shallow clone (CI/CD uchun)
git clone --depth 1 https://github.com/repo.git

# Sparse checkout
git sparse-checkout init
git sparse-checkout set src/ tests/
```

### 4. Commit Message Template

```bash
# ~/.gitmessage
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, test, chore
# Scope: component or file affected
# Subject: imperative mood, no period
# Body: what and why, not how
# Footer: BREAKING CHANGE, Closes #issue

git config --global commit.template ~/.gitmessage
```

### 5. Quick Reference

```bash
# Oxirgi commit'ni o'zgartirish
git commit --amend

# Specific file'ni oldingi versiyaga qaytarish
git checkout HEAD~1 -- file.js

# Branch'larni solishtirish
git diff main..feature

# Kimdir nima qilgan
git shortlog -sn

# Tag yaratish
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Remote URL o'zgartirish
git remote set-url origin new-url

# Credential cache
git config --global credential.helper cache
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Commit xabarlari (Commit Messages):** Commit xabarlarini "Bug fixed" yoki "Updated" deb yozmang. Jamoaviy kelishuvga asoslangan (Conventional Commits) standartda yozing: `fix(auth): prevent memory leak on login`. Shunda kelajakda changelog'lar (qilingan ishlar ro'yxati) avtomatik yasalishi osonlashadi.
2. **Kichik va Mantiqiy Commitlar:** Hech qachon 50 ta faylni bitta commit ichiga qamrab olmang. Bir mantiqiy o'zgarish = Bir Commit (Atomik commitlar). Agar revert qilish (ortga qaytarish) kerak bo'lsa, bitta mantiqiy funksiyaning o'zini toza ajratib olish mumkin bo'lsin.
3. **Pull Request (PR) madaniyati:** Master (yoki Main) branch ga to'g'ridan to'g'ri push qilish — bu jinoyat. Har doim yangi shox (Branch) oching va o'zgarishlaringizni PR orqali boshqalarga tekshirish uchun (Code Review) bering.

---

## Xulosa

| Tushuncha | Nima u? | Foydasi / O'rni |
|-----------|---------|-----------------|
| **Branching Strategy** | Loyiha a'zolari kodni qanday tartibda birlashtirish qoidalari. | GitFlow (Murakkab enterprise), GitHub Flow (Tezkor SaaS), Trunk-Based (Continuous Integration). |
| **Merge vs Rebase** | Koinotlarni birlashtirish usullari. Merge yangi commit ochadi, Rebase esa tarixni "silliqlaydi" (lineer qiladi). | Ochiq manbali (Open Source) loyihalarda asosan Rebase (toza tarix) ishlatiladi. |
| **Cherry-Pick** | Boshqa parallel koinotdagi faqatgina BITTTA commit (surat) ni o'zimga olib kelish. | Hotfix qilinganda, uni qolgan hamma joylarga nusxalashda zo'r. |
| **Reflog** | Vaqt mashinasining Black Box'i (Qora qutisi). Barcha qilingan o'zgarishlar tarixi. | Kodingizni butunlay xato o'chirib yuborsangiz ham, reflog orqali qayta tiklash mumkin. |

Git - bu juda kuchli tool va uni professional darajada bilish har bir developer uchun muhim. Asosiy tushunchalar: Internals, Branching, Rebase, Hooks. Amaliyot qiling, xatolardan qo'rqmang - Git'da deyarli hamma narsani reflog orqali qaytarish mumkin!
