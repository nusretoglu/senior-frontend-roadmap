# DevTools va Workflow

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Bugungi kunda qanchalik zo'r kod yozishingizdan qat'iy nazar, agar o'sha kodni boshqalar (Jamoa) bilan to'qnashuvlarsiz birlashtira olmasangiz (Git), uni avtomatik serverga jo'nata olmasangiz (CI/CD) va dasturni barcha xodimlarning kompyuterida bir xil ishlaydigan muhitga o'ray olmasangiz (Docker), sizni qimmatbaho Senior deb hisoblashmaydi. DevTools va Workflow bu shunchaki "yordamchi vositalar" emas, bu butun boshli loyiha "Infratuzilmasi" dir.

> [!NOTE]
> **Real-hayot analogiyasi: "Oshpaz va Oshxona"**  
> Zo'r algoritmlar va Vue/React bilimlari — bu oshpazning mazali taom pishira olish mahoratidir.  
> Lekin DevTools (Git, Docker, CI/CD) — bu 100 ta odamga taom chiqarish kerak bo'lgan katta restoran oshxonasidagi Infratuzilmadir (muzlatgichlar tizimi, mahsulotlarni avtomatik konveyerdan yetkazib berish, buyurtmalarni oshpazlarga to'g'ri taqsimlash). Taomingiz qanchalik maza bo'lmasin, konveyer (Workflow) ishlamasa, restoran (Loyiha) bankrot bo'ladi.

Zamonaviy web dasturlash faqat kod yozishdan iborat emas. Professional dasturchi version control, CI/CD, containerization, package management va development environment'larni professional darajada bilishi kerak. Bu bo'lim sizni junior dan senior darajaga olib chiqadigan toollar va workflow'larni o'rgatadi.
## Bo'lim Tarkibi

### 1. [Git Advanced](./01-git-advanced.md)
- Git internals (objects, refs, HEAD)
- Branching strategiyalari (GitFlow, GitHub Flow, Trunk-based)
- Rebase vs Merge - qachon qaysi birini ishlatish
- Cherry-pick, stash, bisect
- Conflict resolution professional usullari
- Hooks va automation
- Monorepo va submodules

### 2. [CI/CD](./02-ci-cd.md)
- Continuous Integration printsiplari
- Continuous Delivery vs Continuous Deployment
- GitHub Actions chuqur
- GitLab CI/CD
- Jenkins asoslari
- Pipeline optimization
- Testing va deployment strategiyalari

### 3. [Docker Basics](./03-docker-basics.md)
- Container vs Virtual Machine
- Docker architecture
- Dockerfile yozish best practices
- Docker Compose
- Multi-stage builds
- Image optimization
- Development environment containerization

### 4. [Package Managers](./04-package-managers.md)
- npm internals
- Yarn (Classic va Berry)
- pnpm - disk space efficient
- Lockfile'lar qanday ishlaydi
- Monorepo package management
- Private registry
- Security va audit

### 5. [GitHub/GitLab](./05-github-gitlab.md)
- Pull Request best practices
- Code Review madaniyati
- Issue va Project management
- GitHub Actions vs GitLab CI
- Protected branches va rulesets
- Secrets management
- GitHub API va automation

### 6. [VS Code Setup](./06-vscode-setup.md)
- Essential extensions
- Settings optimization
- Keybindings va productivity
- Debugging setup
- Multi-root workspaces
- Remote development
- Tasks va snippets

## Ushbu Bo'limdan Nimani O'rganasiz

1. **Version Control Mastery** - Git'ni professional darajada ishlatish
2. **Automation** - CI/CD pipeline'larni sozlash va optimize qilish
3. **Containerization** - Docker bilan development va deployment
4. **Dependency Management** - Package manager'larni chuqur tushunish
5. **Collaboration** - GitHub/GitLab bilan jamoa bilan ishlash
6. **Productivity** - IDE'ni maksimal samarali ishlatish

## Kerakli Bilimlar

- JavaScript asoslari
- Command line basic operations
- Web development tushunchasi

## Real-World Ahamiyati

Bu bo'limda o'rganiladigan toollar har bir professional dasturchi uchun muhim:

```
Junior → Mid-level: Git, npm, VS Code
Mid-level → Senior: CI/CD, Docker, Advanced Git
Senior → Lead: Pipeline optimization, Monorepo, Team workflows
```

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Modern Development Workflow                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Code    │───▶│   Git    │───▶│  CI/CD   │───▶│  Deploy  │  │
│  │ (VS Code)│    │ (GitHub) │    │ (Actions)│    │ (Docker) │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │              │               │               │          │
│       ▼              ▼               ▼               ▼          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Lint    │    │   PR     │    │  Test    │    │ Monitor  │  │
│  │  Format  │    │  Review  │    │  Build   │    │  Logs    │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## O'qish Tartibi

1. Git Advanced - asos sifatida
2. Package Managers - dependency management
3. VS Code Setup - development environment
4. GitHub/GitLab - collaboration
5. CI/CD - automation
6. Docker - containerization

Har bir mavzuni ketma-ket o'rganing va amaliyot qiling. DevTools bilimi faqat o'qish bilan emas, kundalik amaliyot bilan keladi.
