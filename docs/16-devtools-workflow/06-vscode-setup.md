# VS Code Setup

## Kirish

> [!IMPORTANT]
> **Nima uchun muhim?**  
> Dasturchining kuchi u foydalanayotgan asbobning o'tkirligi bilan o'lchanadi. Agar siz kuniga 8 soat VS Code da ishlasangiz-u, lekin hamma fayllarni qo'lda topib, kodlarni qo'lda tekislab (formatlab), xatolarni faqat brauzerda (console.log) izlasangiz — siz vaqtingizning 50% ni bekorga sarflayapsiz. Professional sozlamalar, hotkeylar va to'g'ri tanlangan kengaytmalar (Extensions) sizning kod yozish tezligingizni 3 barobarga oshirishi mumkin.

> [!NOTE]
> **Real-hayot analogiyasi: "Poyga Mashinasi (F1)"**  
> VS Code'ni shunchaki yuklab olib o'rnatish — bu ko'chadagi oddiy "Jiguli" sotib olishga o'xshaydi. Yuradi, manzilga yetkazadi, lekin sekin.  
> VS Code ni ESlint, Prettier, GitLens va Debugger bilan to'g'ri sozlash — bu oddiy mashinani Formmula-1 poyga bolidiga aylantirishdir. Tezlik, qulaylik va monitoring asboblari sizga chempion bo'lish (kodingiz xatosiz va tez yozilishi) imkonini beradi.

Visual Studio Code (VS Code) - bu Microsoft tomonidan yaratilgan bepul, open-source kod muharriri. Extensibility, performance va feature'lar jihatidan eng mashhur IDE'lardan biri. Bu bo'limda VS Code'ni professional darajada sozlash va samarali ishlatishni o'rganamiz.
## Essential Extensions

### JavaScript/TypeScript Development

```json
// Recommended extensions for JavaScript/TypeScript
{
  "recommendations": [
    // Language Support
    "ms-vscode.vscode-typescript-next",     // TypeScript nightly
    "vue.volar",                             // Vue 3 support
    "bradlc.vscode-tailwindcss",            // Tailwind CSS IntelliSense

    // Linting & Formatting
    "dbaeumer.vscode-eslint",               // ESLint
    "esbenp.prettier-vscode",               // Prettier
    "stylelint.vscode-stylelint",           // Stylelint

    // Git
    "eamodio.gitlens",                      // Git supercharged
    "mhutchie.git-graph",                   // Git visualization

    // Productivity
    "christian-kohler.path-intellisense",   // Path autocomplete
    "christian-kohler.npm-intellisense",    // npm autocomplete
    "formulahendry.auto-rename-tag",        // Auto rename HTML tags
    "formulahendry.auto-close-tag",         // Auto close HTML tags
    "naumovs.color-highlight",              // Color highlight
    "usernamehw.errorlens",                 // Inline error display
    "streetsidesoftware.code-spell-checker", // Spell check

    // Testing
    "orta.vscode-jest",                     // Jest
    "ZixuanChen.vitest-explorer",          // Vitest

    // AI
    "github.copilot",                       // GitHub Copilot
    "github.copilot-chat",                  // Copilot Chat

    // Themes & Icons
    "PKief.material-icon-theme",            // Material icons
    "zhuangtongfa.material-theme",         // One Dark Pro

    // Utilities
    "wayou.vscode-todo-highlight",          // TODO highlight
    "gruntfuggly.todo-tree",               // TODO tree
    "mikestead.dotenv",                     // .env syntax
    "EditorConfig.EditorConfig",            // EditorConfig
    "yoavbls.pretty-ts-errors"             // Better TS errors
  ]
}
```

### Extension Pack yaratish

```json
// package.json for extension pack
{
  "name": "my-extension-pack",
  "displayName": "My Extension Pack",
  "version": "1.0.0",
  "publisher": "my-username",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Extension Packs"],
  "extensionPack": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "vue.volar"
  ]
}
```

## Settings Configuration

### settings.json (User Settings)

```json
{
  // ==================== EDITOR ====================
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  "editor.fontLigatures": true,
  "editor.lineHeight": 1.6,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.wordWrapColumn": 120,
  "editor.rulers": [80, 120],
  "editor.renderWhitespace": "boundary",
  "editor.minimap.enabled": false,
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.smoothScrolling": true,
  "editor.linkedEditing": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.guides.indentation": true,
  "editor.inlineSuggest.enabled": true,
  "editor.suggestSelection": "first",
  "editor.quickSuggestions": {
    "strings": true,
    "comments": false,
    "other": true
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.stickyScroll.enabled": true,
  "editor.accessibilitySupport": "off",
  "editor.unicodeHighlight.nonBasicASCII": false,

  // ==================== FILES ====================
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.nuxt": true,
    "**/.next": true,
    "**/dist": true,
    "**/.turbo": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true
  },
  "files.associations": {
    "*.css": "tailwindcss",
    ".env*": "dotenv"
  },

  // ==================== SEARCH ====================
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/*.lock": true,
    "**/pnpm-lock.yaml": true
  },
  "search.useIgnoreFiles": true,
  "search.quickOpen.includeSymbols": true,

  // ==================== TERMINAL ====================
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.fontFamily": "'JetBrains Mono', monospace",
  "terminal.integrated.cursorBlinking": true,
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.defaultProfile.linux": "zsh",
  "terminal.integrated.scrollback": 10000,
  "terminal.integrated.enableMultiLinePasteWarning": "never",
  "terminal.integrated.env.osx": {
    "FIG_NEW_SESSION": "1"
  },

  // ==================== WORKBENCH ====================
  "workbench.colorTheme": "One Dark Pro Darker",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.startupEditor": "none",
  "workbench.editor.enablePreview": false,
  "workbench.editor.tabCloseButton": "right",
  "workbench.activityBar.location": "top",
  "workbench.sideBar.location": "left",
  "workbench.tree.indent": 16,
  "workbench.tree.renderIndentGuides": "always",
  "workbench.editor.labelFormat": "short",
  "workbench.panel.defaultLocation": "bottom",

  // ==================== EXPLORER ====================
  "explorer.confirmDelete": false,
  "explorer.confirmDragAndDrop": false,
  "explorer.compactFolders": false,
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "package.json": "package-lock.json, pnpm-lock.yaml, yarn.lock, .npmrc, .yarnrc*, .pnpmfile.cjs",
    "tsconfig.json": "tsconfig.*.json",
    ".eslintrc*": ".eslintignore, .prettierrc*, .prettier.config.*, .editorconfig",
    "vite.config.*": "vitest.config.*, playwright.config.*",
    "*.ts": "$(capture).test.ts, $(capture).spec.ts",
    "*.vue": "$(capture).spec.ts, $(capture).test.ts, $(capture).stories.ts"
  },

  // ==================== GIT ====================
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.autofetch": true,
  "git.autoStash": true,
  "git.openRepositoryInParentFolders": "always",
  "git.defaultCloneDirectory": "~/Projects",

  // ==================== ESLINT ====================
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html"
  ],
  "eslint.codeActionsOnSave.mode": "problems",
  "eslint.format.enable": false,

  // ==================== PRETTIER ====================
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  },

  // ==================== TYPESCRIPT ====================
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.inlayHints.enumMemberValues.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": false,

  // ==================== VUE (VOLAR) ====================
  "vue.inlayHints.inlineHandlerLeading": true,
  "vue.inlayHints.missingProps": true,

  // ==================== TAILWIND CSS ====================
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.includeLanguages": {
    "vue": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],

  // ==================== GITLENS ====================
  "gitlens.codeLens.enabled": false,
  "gitlens.currentLine.enabled": true,
  "gitlens.hovers.currentLine.over": "line",

  // ==================== ERROR LENS ====================
  "errorLens.enabledDiagnosticLevels": ["error", "warning"],
  "errorLens.exclude": ["**/*.md"],
  "errorLens.delay": 500,

  // ==================== TODO HIGHLIGHT ====================
  "todohighlight.keywords": [
    { "text": "TODO:", "color": "#fff", "backgroundColor": "#ffbd2a" },
    { "text": "FIXME:", "color": "#fff", "backgroundColor": "#f06292" },
    { "text": "HACK:", "color": "#fff", "backgroundColor": "#ab47bc" },
    { "text": "NOTE:", "color": "#fff", "backgroundColor": "#00bcd4" },
    { "text": "BUG:", "color": "#fff", "backgroundColor": "#e53935" }
  ],

  // ==================== EMMET ====================
  "emmet.includeLanguages": {
    "vue-html": "html",
    "vue": "html"
  },
  "emmet.triggerExpansionOnTab": true,

  // ==================== COPILOT ====================
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "plaintext": false
  },
  "github.copilot.editor.enableAutoCompletions": true,

  // ==================== DEBUG ====================
  "debug.console.fontSize": 13,
  "debug.console.fontFamily": "'JetBrains Mono', monospace",
  "debug.internalConsoleOptions": "openOnSessionStart",
  "debug.toolBarLocation": "docked",

  // ==================== MISC ====================
  "security.workspace.trust.untrustedFiles": "open",
  "redhat.telemetry.enabled": false,
  "window.titleBarStyle": "custom",
  "window.commandCenter": true,
  "zenMode.fullScreen": false,
  "breadcrumbs.enabled": true,
  "diffEditor.ignoreTrimWhitespace": false,
  "update.mode": "manual"
}
```

### Workspace Settings

```json
// .vscode/settings.json (project-specific)
{
  // Project-specific formatters
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // TypeScript config
  "typescript.tsdk": "node_modules/typescript/lib",

  // ESLint config
  "eslint.workingDirectories": [
    "packages/frontend",
    "packages/backend"
  ],

  // Tailwind config
  "tailwindCSS.configPath": "./tailwind.config.ts",

  // Debug
  "debug.javascript.autoAttachFilter": "smart",

  // Search exclude
  "search.exclude": {
    "**/dist": true,
    "**/coverage": true
  },

  // File associations
  "files.associations": {
    "*.json": "jsonc"
  }
}
```

## Keybindings

### keybindings.json

```json
// Keyboard Shortcuts (keybindings.json)
[
  // ==================== NAVIGATION ====================
  {
    "key": "ctrl+p",
    "command": "workbench.action.quickOpen"
  },
  {
    "key": "ctrl+shift+p",
    "command": "workbench.action.showCommands"
  },
  {
    "key": "ctrl+shift+e",
    "command": "workbench.view.explorer"
  },
  {
    "key": "ctrl+shift+g",
    "command": "workbench.view.scm"
  },
  {
    "key": "ctrl+`",
    "command": "workbench.action.terminal.toggleTerminal"
  },
  {
    "key": "ctrl+b",
    "command": "workbench.action.toggleSidebarVisibility"
  },

  // ==================== EDITING ====================
  // Duplicate line
  {
    "key": "ctrl+shift+d",
    "command": "editor.action.copyLinesDownAction",
    "when": "editorTextFocus && !editorReadonly"
  },
  // Delete line
  {
    "key": "ctrl+shift+k",
    "command": "editor.action.deleteLines",
    "when": "editorTextFocus && !editorReadonly"
  },
  // Move line up/down
  {
    "key": "alt+up",
    "command": "editor.action.moveLinesUpAction",
    "when": "editorTextFocus && !editorReadonly"
  },
  {
    "key": "alt+down",
    "command": "editor.action.moveLinesDownAction",
    "when": "editorTextFocus && !editorReadonly"
  },
  // Multi-cursor
  {
    "key": "ctrl+d",
    "command": "editor.action.addSelectionToNextFindMatch",
    "when": "editorFocus"
  },
  {
    "key": "ctrl+shift+l",
    "command": "editor.action.selectHighlights",
    "when": "editorFocus"
  },
  // Comment
  {
    "key": "ctrl+/",
    "command": "editor.action.commentLine",
    "when": "editorTextFocus && !editorReadonly"
  },
  // Format
  {
    "key": "shift+alt+f",
    "command": "editor.action.formatDocument",
    "when": "editorHasDocumentFormattingProvider && editorTextFocus && !editorReadonly"
  },

  // ==================== CODE ACTIONS ====================
  // Go to definition
  {
    "key": "f12",
    "command": "editor.action.revealDefinition",
    "when": "editorHasDefinitionProvider && editorTextFocus"
  },
  // Go to type definition
  {
    "key": "ctrl+f12",
    "command": "editor.action.goToTypeDefinition",
    "when": "editorHasTypeDefinitionProvider && editorTextFocus"
  },
  // Find references
  {
    "key": "shift+f12",
    "command": "editor.action.goToReferences",
    "when": "editorHasReferenceProvider && editorTextFocus"
  },
  // Rename symbol
  {
    "key": "f2",
    "command": "editor.action.rename",
    "when": "editorHasRenameProvider && editorTextFocus && !editorReadonly"
  },
  // Quick fix
  {
    "key": "ctrl+.",
    "command": "editor.action.quickFix",
    "when": "editorHasCodeActionsProvider && editorTextFocus && !editorReadonly"
  },
  // Peek definition
  {
    "key": "alt+f12",
    "command": "editor.action.peekDefinition",
    "when": "editorHasDefinitionProvider && editorTextFocus"
  },

  // ==================== FILES ====================
  // New file
  {
    "key": "ctrl+n",
    "command": "workbench.action.files.newUntitledFile"
  },
  // Save
  {
    "key": "ctrl+s",
    "command": "workbench.action.files.save"
  },
  // Save all
  {
    "key": "ctrl+k s",
    "command": "workbench.action.files.saveAll"
  },
  // Close tab
  {
    "key": "ctrl+w",
    "command": "workbench.action.closeActiveEditor"
  },
  // Reopen closed tab
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.reopenClosedEditor"
  },

  // ==================== SEARCH ====================
  // Find in file
  {
    "key": "ctrl+f",
    "command": "actions.find"
  },
  // Replace in file
  {
    "key": "ctrl+h",
    "command": "editor.action.startFindReplaceAction"
  },
  // Find in files
  {
    "key": "ctrl+shift+f",
    "command": "workbench.action.findInFiles"
  },
  // Go to line
  {
    "key": "ctrl+g",
    "command": "workbench.action.gotoLine"
  },
  // Go to symbol
  {
    "key": "ctrl+shift+o",
    "command": "workbench.action.gotoSymbol"
  },

  // ==================== GIT ====================
  {
    "key": "ctrl+shift+g g",
    "command": "workbench.view.scm"
  },
  {
    "key": "ctrl+enter",
    "command": "git.commitAll",
    "when": "!inDebugMode && !terminalFocus"
  },

  // ==================== DEBUG ====================
  {
    "key": "f5",
    "command": "workbench.action.debug.start",
    "when": "!inDebugMode"
  },
  {
    "key": "f5",
    "command": "workbench.action.debug.continue",
    "when": "inDebugMode"
  },
  {
    "key": "shift+f5",
    "command": "workbench.action.debug.stop",
    "when": "inDebugMode"
  },
  {
    "key": "f9",
    "command": "editor.debug.action.toggleBreakpoint",
    "when": "editorTextFocus"
  },
  {
    "key": "f10",
    "command": "workbench.action.debug.stepOver",
    "when": "inDebugMode"
  },
  {
    "key": "f11",
    "command": "workbench.action.debug.stepInto",
    "when": "inDebugMode"
  },

  // ==================== PANELS ====================
  {
    "key": "ctrl+j",
    "command": "workbench.action.togglePanel"
  },
  {
    "key": "ctrl+shift+m",
    "command": "workbench.actions.view.problems"
  },
  {
    "key": "ctrl+shift+u",
    "command": "workbench.action.output.toggleOutput"
  },

  // ==================== CUSTOM ====================
  // Toggle word wrap
  {
    "key": "alt+z",
    "command": "editor.action.toggleWordWrap"
  },
  // Toggle minimap
  {
    "key": "ctrl+shift+m m",
    "command": "editor.action.toggleMinimap"
  },
  // Split editor
  {
    "key": "ctrl+\\",
    "command": "workbench.action.splitEditor"
  },
  // Focus editor groups
  {
    "key": "ctrl+1",
    "command": "workbench.action.focusFirstEditorGroup"
  },
  {
    "key": "ctrl+2",
    "command": "workbench.action.focusSecondEditorGroup"
  },
  // Zen mode
  {
    "key": "ctrl+k z",
    "command": "workbench.action.toggleZenMode"
  }
]
```

## Debugging Setup

### launch.json

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    // ==================== NODE.JS ====================
    {
      "name": "Node: Current File",
      "type": "node",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Node: npm start",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Node: Attach",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    },

    // ==================== TYPESCRIPT ====================
    {
      "name": "TS: Current File",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${file}"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "TS: tsx watch",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "watch", "--inspect", "${file}"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },

    // ==================== JEST ====================
    {
      "name": "Jest: Current File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}", "--runInBand", "--no-coverage"],
      "console": "integratedTerminal",
      "windows": {
        "program": "${workspaceFolder}/node_modules/jest/bin/jest"
      }
    },
    {
      "name": "Jest: All Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal"
    },

    // ==================== VITEST ====================
    {
      "name": "Vitest: Debug Tests",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": [
        "vitest",
        "run",
        "--reporter=verbose",
        "--no-coverage"
      ],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },

    // ==================== VUE/NUXT ====================
    {
      "name": "Vite: Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///./src/*": "${webRoot}/*"
      }
    },
    {
      "name": "Nuxt: Debug",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },

    // ==================== CHROME ====================
    {
      "name": "Chrome: Launch",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Chrome: Attach",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}"
    },

    // ==================== DOCKER ====================
    {
      "name": "Docker: Attach Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "restart": true
    }
  ],

  // Compound configurations
  "compounds": [
    {
      "name": "Full Stack",
      "configurations": ["Node: npm start", "Chrome: Launch"],
      "stopAll": true
    }
  ]
}
```

### tasks.json

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    // ==================== BUILD ====================
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "build:watch",
      "type": "npm",
      "script": "build:watch",
      "isBackground": true,
      "problemMatcher": ["$tsc-watch"]
    },

    // ==================== TEST ====================
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "problemMatcher": []
    },
    {
      "label": "test:watch",
      "type": "npm",
      "script": "test:watch",
      "isBackground": true,
      "problemMatcher": []
    },

    // ==================== LINT ====================
    {
      "label": "lint",
      "type": "npm",
      "script": "lint",
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "lint:fix",
      "type": "npm",
      "script": "lint:fix",
      "problemMatcher": ["$eslint-stylish"]
    },

    // ==================== DEV ====================
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^$"
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^.*starting.*$",
          "endsPattern": "^.*ready.*$"
        }
      }
    },

    // ==================== DOCKER ====================
    {
      "label": "docker:up",
      "type": "shell",
      "command": "docker compose up -d",
      "problemMatcher": []
    },
    {
      "label": "docker:down",
      "type": "shell",
      "command": "docker compose down",
      "problemMatcher": []
    },
    {
      "label": "docker:logs",
      "type": "shell",
      "command": "docker compose logs -f",
      "problemMatcher": []
    },

    // ==================== TYPECHECK ====================
    {
      "label": "typecheck",
      "type": "npm",
      "script": "typecheck",
      "problemMatcher": ["$tsc"]
    },

    // ==================== CUSTOM ====================
    {
      "label": "install",
      "type": "shell",
      "command": "pnpm install",
      "problemMatcher": []
    },
    {
      "label": "clean",
      "type": "shell",
      "command": "rm -rf node_modules dist .nuxt .next .turbo",
      "problemMatcher": []
    }
  ]
}
```

## Snippets

### javascript.json

```json
// .vscode/snippets/javascript.json
{
  // ==================== CONSOLE ====================
  "Console Log": {
    "prefix": "cl",
    "body": "console.log($1);",
    "description": "Console log"
  },
  "Console Log Variable": {
    "prefix": "clv",
    "body": "console.log('$1:', $1);",
    "description": "Console log with variable name"
  },
  "Console Log JSON": {
    "prefix": "clj",
    "body": "console.log(JSON.stringify($1, null, 2));",
    "description": "Console log JSON"
  },
  "Console Error": {
    "prefix": "ce",
    "body": "console.error($1);",
    "description": "Console error"
  },
  "Console Table": {
    "prefix": "ct",
    "body": "console.table($1);",
    "description": "Console table"
  },

  // ==================== FUNCTIONS ====================
  "Arrow Function": {
    "prefix": "af",
    "body": [
      "const $1 = ($2) => {",
      "\t$3",
      "};"
    ],
    "description": "Arrow function"
  },
  "Async Arrow Function": {
    "prefix": "aaf",
    "body": [
      "const $1 = async ($2) => {",
      "\t$3",
      "};"
    ],
    "description": "Async arrow function"
  },
  "IIFE": {
    "prefix": "iife",
    "body": [
      "(async () => {",
      "\t$1",
      "})();"
    ],
    "description": "Immediately Invoked Function Expression"
  },

  // ==================== IMPORT/EXPORT ====================
  "Import": {
    "prefix": "imp",
    "body": "import $2 from '$1';",
    "description": "Import module"
  },
  "Import Destructure": {
    "prefix": "impd",
    "body": "import { $2 } from '$1';",
    "description": "Import destructure"
  },
  "Export Default": {
    "prefix": "expd",
    "body": "export default $1;",
    "description": "Export default"
  },
  "Export Named": {
    "prefix": "expn",
    "body": "export { $1 };",
    "description": "Export named"
  },

  // ==================== ASYNC ====================
  "Try Catch": {
    "prefix": "tc",
    "body": [
      "try {",
      "\t$1",
      "} catch (error) {",
      "\tconsole.error(error);",
      "}"
    ],
    "description": "Try catch block"
  },
  "Try Catch Finally": {
    "prefix": "tcf",
    "body": [
      "try {",
      "\t$1",
      "} catch (error) {",
      "\tconsole.error(error);",
      "} finally {",
      "\t$2",
      "}"
    ],
    "description": "Try catch finally block"
  },
  "Promise": {
    "prefix": "prom",
    "body": [
      "new Promise((resolve, reject) => {",
      "\t$1",
      "});"
    ],
    "description": "Promise"
  },

  // ==================== LOOPS ====================
  "For Of": {
    "prefix": "forof",
    "body": [
      "for (const $1 of $2) {",
      "\t$3",
      "}"
    ],
    "description": "For of loop"
  },
  "For Each": {
    "prefix": "foreach",
    "body": "$1.forEach(($2) => {",
    "description": "ForEach"
  },
  "Map": {
    "prefix": "map",
    "body": "$1.map(($2) => $3)",
    "description": "Map"
  },
  "Filter": {
    "prefix": "filter",
    "body": "$1.filter(($2) => $3)",
    "description": "Filter"
  },
  "Reduce": {
    "prefix": "reduce",
    "body": "$1.reduce((acc, $2) => acc + $3, $4)",
    "description": "Reduce"
  }
}
```

### typescript.json

```json
// .vscode/snippets/typescript.json
{
  // ==================== TYPES ====================
  "Interface": {
    "prefix": "int",
    "body": [
      "interface $1 {",
      "\t$2",
      "}"
    ],
    "description": "Interface"
  },
  "Type Alias": {
    "prefix": "type",
    "body": "type $1 = $2;",
    "description": "Type alias"
  },
  "Type Function": {
    "prefix": "typefn",
    "body": "type $1 = ($2) => $3;",
    "description": "Function type"
  },
  "Generic Type": {
    "prefix": "typeg",
    "body": "type $1<T> = $2;",
    "description": "Generic type"
  },
  "Enum": {
    "prefix": "enum",
    "body": [
      "enum $1 {",
      "\t$2",
      "}"
    ],
    "description": "Enum"
  },

  // ==================== FUNCTIONS ====================
  "Typed Arrow Function": {
    "prefix": "taf",
    "body": [
      "const $1 = ($2: $3): $4 => {",
      "\t$5",
      "};"
    ],
    "description": "Typed arrow function"
  },
  "Typed Async Function": {
    "prefix": "taaf",
    "body": [
      "const $1 = async ($2: $3): Promise<$4> => {",
      "\t$5",
      "};"
    ],
    "description": "Typed async arrow function"
  },

  // ==================== ASSERTIONS ====================
  "As Type": {
    "prefix": "as",
    "body": "$1 as $2",
    "description": "Type assertion"
  },
  "Non-null Assertion": {
    "prefix": "nn",
    "body": "$1!",
    "description": "Non-null assertion"
  }
}
```

### vue.json

```json
// .vscode/snippets/vue.json
{
  // ==================== COMPONENTS ====================
  "Vue 3 Script Setup": {
    "prefix": "v3setup",
    "body": [
      "<script setup lang=\"ts\">",
      "$1",
      "</script>",
      "",
      "<template>",
      "\t<div>",
      "\t\t$2",
      "\t</div>",
      "</template>",
      "",
      "<style scoped>",
      "$3",
      "</style>"
    ],
    "description": "Vue 3 component with script setup"
  },
  "Vue 3 Component Full": {
    "prefix": "v3comp",
    "body": [
      "<script setup lang=\"ts\">",
      "interface Props {",
      "\t$1",
      "}",
      "",
      "const props = defineProps<Props>();",
      "const emit = defineEmits<{",
      "\t$2",
      "}>();",
      "</script>",
      "",
      "<template>",
      "\t<div>",
      "\t\t$3",
      "\t</div>",
      "</template>",
      "",
      "<style scoped>",
      "$4",
      "</style>"
    ],
    "description": "Vue 3 component full template"
  },

  // ==================== COMPOSITION API ====================
  "Ref": {
    "prefix": "vref",
    "body": "const $1 = ref<$2>($3);",
    "description": "Vue ref"
  },
  "Reactive": {
    "prefix": "vreactive",
    "body": [
      "const $1 = reactive({",
      "\t$2",
      "});"
    ],
    "description": "Vue reactive"
  },
  "Computed": {
    "prefix": "vcomputed",
    "body": [
      "const $1 = computed(() => {",
      "\treturn $2;",
      "});"
    ],
    "description": "Vue computed"
  },
  "Watch": {
    "prefix": "vwatch",
    "body": [
      "watch($1, ($2, $3) => {",
      "\t$4",
      "});"
    ],
    "description": "Vue watch"
  },
  "Watch Effect": {
    "prefix": "vwatcheffect",
    "body": [
      "watchEffect(() => {",
      "\t$1",
      "});"
    ],
    "description": "Vue watchEffect"
  },
  "On Mounted": {
    "prefix": "vmounted",
    "body": [
      "onMounted(() => {",
      "\t$1",
      "});"
    ],
    "description": "Vue onMounted"
  },

  // ==================== PROPS & EMITS ====================
  "Define Props": {
    "prefix": "vprops",
    "body": [
      "interface Props {",
      "\t$1",
      "}",
      "",
      "const props = defineProps<Props>();"
    ],
    "description": "Define props with TypeScript"
  },
  "Define Emits": {
    "prefix": "vemits",
    "body": [
      "const emit = defineEmits<{",
      "\t$1: [$2]",
      "}>();"
    ],
    "description": "Define emits with TypeScript"
  },
  "Define Model": {
    "prefix": "vmodel",
    "body": "const $1 = defineModel<$2>('$3');",
    "description": "Define v-model"
  },

  // ==================== COMPOSABLES ====================
  "Composable": {
    "prefix": "vcomposable",
    "body": [
      "export function use$1() {",
      "\t$2",
      "",
      "\treturn {",
      "\t\t$3",
      "\t};",
      "}"
    ],
    "description": "Vue composable"
  }
}
```

## Multi-root Workspaces

### workspace.code-workspace

```json
// my-project.code-workspace
{
  "folders": [
    {
      "name": "Frontend",
      "path": "./frontend"
    },
    {
      "name": "Backend",
      "path": "./backend"
    },
    {
      "name": "Shared",
      "path": "./packages/shared"
    },
    {
      "name": "Root",
      "path": "."
    }
  ],
  "settings": {
    // Workspace-wide settings
    "editor.formatOnSave": true,

    // Folder-specific settings
    "folders.Frontend.settings": {
      "eslint.workingDirectories": ["./frontend"]
    }
  },
  "extensions": {
    "recommendations": [
      "vue.volar",
      "dbaeumer.vscode-eslint"
    ]
  },
  "launch": {
    "configurations": [
      {
        "name": "Debug Frontend",
        "type": "chrome",
        "request": "launch",
        "url": "http://localhost:3000",
        "webRoot": "${workspaceFolder:Frontend}"
      },
      {
        "name": "Debug Backend",
        "type": "node",
        "request": "launch",
        "program": "${workspaceFolder:Backend}/src/index.ts"
      }
    ],
    "compounds": [
      {
        "name": "Full Stack",
        "configurations": ["Debug Frontend", "Debug Backend"]
      }
    ]
  },
  "tasks": {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "Build All",
        "dependsOn": ["Build Frontend", "Build Backend"],
        "dependsOrder": "parallel"
      },
      {
        "label": "Build Frontend",
        "type": "npm",
        "script": "build",
        "path": "frontend/"
      },
      {
        "label": "Build Backend",
        "type": "npm",
        "script": "build",
        "path": "backend/"
      }
    ]
  }
}
```

## Remote Development

### Dev Containers

```json
// .devcontainer/devcontainer.json
{
  "name": "Node.js Development",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  // Features
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },

  // VS Code settings
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "vue.volar"
      ],
      "settings": {
        "editor.formatOnSave": true
      }
    }
  },

  // Ports
  "forwardPorts": [3000, 5432],

  // Commands
  "postCreateCommand": "pnpm install",
  "postStartCommand": "pnpm dev",

  // Environment
  "containerEnv": {
    "NODE_ENV": "development"
  },

  // Mounts
  "mounts": [
    "source=${localEnv:HOME}/.ssh,target=/home/node/.ssh,type=bind,readonly"
  ],

  // User
  "remoteUser": "node"
}
```

### SSH Remote

```json
// ~/.ssh/config
// Host my-dev-server
//     HostName 192.168.1.100
//     User developer
//     IdentityFile ~/.ssh/id_rsa

// VS Code: Remote-SSH: Connect to Host
// Select "my-dev-server"
```

## Interview Savollari

### 1. VS Code'da debugging qanday sozlanadi?

**Javob:**
VS Code'da debugging launch.json orqali sozlanadi:

1. `.vscode/launch.json` yarating
2. Configuration qo'shing (type, request, program)
3. Breakpoint qo'ying (F9)
4. Debug boshlang (F5)

```json
{
  "type": "node",
  "request": "launch",
  "program": "${file}",
  "skipFiles": ["<node_internals>/**"]
}
```

Asosiy debug commands: F5 (start/continue), F10 (step over), F11 (step into), Shift+F5 (stop).

### 2. VS Code extensions qanday yaratiladi?

**Javob:**
VS Code extensions TypeScript/JavaScript da yoziladi:

```bash
# Generator
npm install -g yo generator-code
yo code

# Structure
my-extension/
├── package.json    # Extension manifest
├── src/
│   └── extension.ts  # Entry point
└── tsconfig.json
```

```typescript
// extension.ts
export function activate(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand('myext.hello', () => {
    vscode.window.showInformationMessage('Hello!');
  });
  context.subscriptions.push(command);
}
```

### 3. Multi-root workspace nima va qachon ishlatiladi?

**Javob:**
Multi-root workspace - bir nechta papkani bitta VS Code oynasida ochish.

**Qachon ishlatish:**
- Monorepo (frontend + backend + shared)
- Related projects
- Microservices

```json
// project.code-workspace
{
  "folders": [
    { "path": "./frontend" },
    { "path": "./backend" }
  ],
  "settings": {
    // Workspace settings
  }
}
```

Har bir folder o'z settings va tasks'ga ega bo'lishi mumkin.

### 4. Productivity uchun eng muhim VS Code features?

**Javob:**

1. **Multi-cursor** - Ctrl+D, Ctrl+Shift+L
2. **Quick Open** - Ctrl+P (files), Ctrl+Shift+O (symbols)
3. **Command Palette** - Ctrl+Shift+P
4. **Go to Definition** - F12, Ctrl+Click
5. **Rename Symbol** - F2 (refactoring)
6. **Integrated Terminal** - Ctrl+`
7. **Git Integration** - Source Control panel
8. **IntelliSense** - Autocomplete
9. **Snippets** - Custom code templates
10. **Extensions** - ESLint, Prettier, GitLens

### 5. VS Code settings qanday organize qilinadi?

**Javob:**

Settings 3 darajada:
1. **User Settings** - global, barcha projects uchun
2. **Workspace Settings** - .vscode/settings.json, project-specific
3. **Folder Settings** - multi-root workspace'da folder-specific

Priority: Folder > Workspace > User

```json
// User: General preferences
// Workspace: Project-specific (TypeScript config, ESLint paths)
// Folder: Per-folder overrides in monorepo
```

## Tips & Tricks

### 1. Useful Command Palette Commands

```
> Reload Window          # VS Code restart qilmasdan reload
> Developer: Toggle Developer Tools  # Debug VS Code
> Transform to Uppercase/Lowercase  # Text transform
> Sort Lines Ascending   # Sort selection
> Join Lines             # Combine lines
> Emmet: Wrap with Abbreviation  # HTML wrap
> Toggle Zen Mode        # Distraction-free
> Open Keyboard Shortcuts  # View all shortcuts
```

### 2. Hidden Features

```bash
# Terminal'da file ochish
code file.js          # Open file
code -d file1 file2   # Diff files
code -n               # New window
code -r .             # Reuse window
code --goto file:10:5 # Open at line:column

# Command line'dan VS Code ishlatish
code --list-extensions         # Installed extensions
code --install-extension ext   # Install extension
code --disable-extensions      # Start without extensions
```

### 3. Performance Tips

```json
{
  // Disable unused features
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "none",
  "editor.occurrencesHighlight": "off",

  // Exclude from search/watch
  "files.exclude": {
    "**/node_modules": true
  },
  "search.exclude": {
    "**/dist": true
  },

  // Disable telemetry
  "telemetry.telemetryLevel": "off"
}
```

### 4. Sync Settings

```json
// Settings Sync (built-in)
// Ctrl+Shift+P > Settings Sync: Turn On
// GitHub yoki Microsoft account bilan sync

// Sync: Configure what to sync
{
  "settingsSync.ignoredSettings": [
    "editor.fontSize"  # Don't sync
  ],
  "settingsSync.ignoredExtensions": [
    "ms-vsliveshare.vsliveshare"
  ]
}
```

### 5. Workspace Trust

```json
// Untrusted workspaces uchun
{
  "security.workspace.trust.enabled": true,
  "security.workspace.trust.startupPrompt": "once",
  "security.workspace.trust.untrustedFiles": "prompt"
}
```

## Eng Yaxshi Amaliyotlar (Best Practices)

1. **Jamoa standartlari (.vscode):** O'z kompyuteringizdagi global sozlamalar bilan birga loyiha ichida `.vscode/settings.json` va `.vscode/extensions.json` fayllarini yarating. Shunda loyihaga yangi kelgan dasturchida ham siz bilan 100% bir xil Linter va Formatter qoidalari ishlaydi (Kod urushlari tugaydi).
2. **Klaviatura Qisqartmalari (Hotkeys):** Sichqonchadan (Mouse) qanchalik kam foydalansangiz, shunchalik professional hisoblanasiz. Ayniqsa `Ctrl + P` (Fayl qidirish), `Ctrl + Shift + F` (Global qidiruv) va `Alt + Click` (Ko'p qatorli yozish) ni ko'zi yumuq holatda ham bosa olishingiz kerak.
3. **Format on Save:** Har doim `editor.formatOnSave: true` sozlamasini yoqib qo'ying. Kod yozayotganda uni tekislash haqida o'ylamang, siz Ctrl+S ni bosganingizda Prettier kodingizni o'zi chiroyli taxlab berishi kerak.

---

## Xulosa

| Bo'lim | Asosiy Vazifasi | Tavsiya etilgan qo'shimchalar (Extensions) |
|--------|-----------------|---------------------------------------------|
| **Formatting / Linting** | Kodni jamoaviy standartga keltirish, sintaksis xatolarni terish. | Prettier, ESLint, Stylelint. |
| **Git / Source Control** | Fayldagi har bir qatorni kim va qachon yozganini ko'rish. | GitLens, Git Graph. |
| **Productivity** | Qayta-qayta yoziladigan kodlarni tezlashtirish. | AI yordamchilar (Copilot/Tabnine), Path Intellisense, Snippets. |
| **Debugging** | Qatorma-qator xatolikni tutish (`console.log` o'rniga). | VS Code o'rnatilgan JavaScript Debugger. |

VS Code to'g'ri sozlangan holda productivity'ni sezilarli oshiradi. Uni faqat "matn muharriri" deb o'ylamang. O'z IDE'ingizni o'rganishga va moslashtirishga vaqt ajrating, bu vaqt sizga kelajakda minglab soat bo'lib qaytadi. Professional setup = extensions + settings + keybindings + debugging configuration.
