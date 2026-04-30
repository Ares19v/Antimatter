<div align="center">

```
   ▄████████ ███▄▄▄▄       ███    ▄█   ▄▄▄▄███▄▄▄▄      ▄████████    ▄████████    ▄████████    ▄████████
  ███    ███ ███▀▀▀██▄  ▀█████████▄ ███ ▄██▀▀▀███▀▀▀██▄   ███    ███   ███    ███   ███    ███   ███    ███
  ███    ███ ███   ███     ▀███▀▀██ ███▌███   ███   ███   ███    ███   ███    ███   ███    █▀    ███    ███
  ███    ███ ███   ███      ███   ▀ ███▌███   ███   ███   ███    ███  ▄███▄▄▄▄██▀  ▄███▄▄▄      ▄███▄▄▄▄██▀
▀███████████ ███   ███      ███     ███▌███   ███   ███ ▀███████████ ▀▀███▀▀▀▀▀   ▀▀███▀▀▀     ▀▀███▀▀▀▀▀
  ███    ███ ███   ███      ███     ███ ███   ███   ███   ███    ███ ▀███████████   ███    █▄  ▀███████████
  ███    ███ ███   ███      ███     ███ ███   ███   ███   ███    ███   ███    ███   ███    ███   ███    ███
  ███    █▀   ▀█   █▀      ████▄   █▀   ▀█   ███   █▀    ███    █▀    ███    ███   ██████████   ███    ███
```

**A high-performance, Tri-Platform project cleaning suite.**  
*CLI · Local Web App · IDE Extension — powered by a single TypeScript engine.*

[![CI](https://github.com/Ares19v/Antimatter/actions/workflows/ci.yml/badge.svg)](https://github.com/Ares19v/Antimatter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](LICENSE)
[![Node: 20+](https://img.shields.io/badge/Node.js-20%2B-cyan)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/Built%20With-TypeScript-cyan)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-cyan)]()

</div>

---

## Overview

Modern project directories silently accumulate hundreds of megabytes — sometimes gigabytes — of orphaned `node_modules`, stale build artifacts, Python caches, and system junk. **Antimatter** is a precision-engineered cleaning suite built to solve this at scale.

Unlike a basic rm -rf script, Antimatter ships as three distinct, fully-featured interfaces driven by a single core TypeScript scanning engine. Whether you prefer a terminal, a visual dashboard, or never leaving your editor, there's an Antimatter interface for that workflow.

---

## Platform Architecture

Antimatter is the only project cleaner that offers **three completely separate, production-grade interfaces** over one shared engine:

```
                    ┌─────────────────────────────────────────┐
                    │           ANTIMATTER CORE ENGINE          │
                    │    scanner.ts  ·  cleaner.ts  ·  types   │
                    └──────────┬──────────┬──────────┬─────────┘
                               │          │          │
                    ┌──────────▼──┐  ┌────▼───┐  ┌──▼──────────┐
                    │  CLI (Node) │  │  REST  │  │ IDE Extension│
                    │  commander  │  │ Express│  │  vscode API  │
                    └─────────────┘  └────┬───┘  └─────────────┘
                                          │
                                   ┌──────▼──────┐
                                   │  React GUI   │
                                   │  Vite  +  TS │
                                   └─────────────┘
```

### 1 · Power-User CLI
> *Zero dependencies on the GUI. Runs anywhere. Installs globally.*

A fully interactive terminal workflow built with `commander` and `@inquirer/prompts`. The scanner uses `fast-glob` with symlink protection and permission-error suppression so it never crashes on restricted system directories.

```bash
$ antimatter

   ▄████████ ███▄▄▄▄  ...
  ┌─────────────────────────────────────────────┐
  │   Project Cleaning & Optimization Utility    │
  │   v1.0.0  ·  MIT License  ·  @DevanshTyagi  │
  └─────────────────────────────────────────────┘

? Enter the path of the project you want to clean: ./KropCut
? Found project: KropCut. Scan this folder? Yes

  ⠋ Digging through files...
  ✔ Scan complete! Found 8 items · 1.24 GB recoverable
```

### 2 · Cinematic Web GUI
> *Full visual dashboard. Runs locally. No cloud, no tracking.*

A React + Vite frontend backed by an Express REST API. Features group-level categorization (Build Caches, Python Environments, Error Logs, System Junk), individual or batch selection, and real-time purge reporting.

| Feature | Detail |
|---|---|
| Scan API | `POST /api/scan` — scans, sizes, and categorizes results |
| Clean API | `POST /api/clean` — batch deletion with per-item error reporting |
| Security | Path traversal protection, system directory blocklist |
| UI | Glassmorphism design, animated deep-space CSS background |

### 3 · Native IDE Extension
> *Zero friction. Right-click any folder and it just works.*

A VS Code / Antigravity IDE extension that integrates Antimatter directly into your editor. Built entirely on native IDE APIs — no external UI frameworks, no webviews.

| Feature | Detail |
|---|---|
| Command | `Antimatter: Clean Project` via `Ctrl+Shift+P` |
| Context Menu | Right-click any folder → Clean with Antimatter |
| File API | Uses `vscode.workspace.fs` (safe, tracked by IDE) |
| Progress | Native notification progress bars during scan + purge |
| Confirmation | Modal warning with exact byte count before deletion |

---

## Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org)
- npm

### Option A — One-click Install (Windows)
```
Double-click INSTALL.bat
```
This automatically installs all dependencies for the CLI, Web GUI, and IDE Extension.

### Option B — Manual Setup

```bash
# Clone
git clone https://github.com/Ares19v/Antimatter.git
cd Antimatter

# Install CLI + Backend
npm install
npm run build

# Install Web GUI
cd ui && npm install && cd ..

# Install IDE Extension
cd ide-extension && npm install && npm run package && cd ..
```

### Running Each Platform

| Platform | Command |
|---|---|
| CLI (terminal) | `antimatter` |
| Web GUI (Windows) | `Run_Project.bat` |
| IDE Extension | Right-click `ide-extension/antimatter-ide-1.0.0.vsix` → Install Extension VSIX |

---

## What Gets Cleaned

| Category | Targets |
|---|---|
| **Build & Node Caches** | `node_modules/`, `dist/`, `build/`, `.next/` |
| **Python Environment** | `__pycache__/`, `.pytest_cache/`, `coverage/` |
| **System Junk** | `.DS_Store`, `Thumbs.db`, `desktop.ini` |
| **Error Logs** | `npm-debug.log`, `yarn-error.log` |

---

## Security

The REST API backend implements the following hardening:
- **Type validation** on all inputs
- **Path traversal protection** — rejects requests targeting Windows/Unix system roots
- **Directory existence check** before scanning begins
- **Symlink skipping** in the recursive size calculator to prevent infinite loops

---

## Tech Stack

| Layer | Technology |
|---|---|
| CLI | TypeScript, Commander, Inquirer, Chalk, Ora, fast-glob |
| Backend | Node.js, Express, TypeScript |
| Frontend | React 18, Vite, TypeScript, Lucide Icons |
| IDE Extension | VS Code Extension API, Webpack, TypeScript |
| CI/CD | GitHub Actions (3 parallel jobs) |

---

## CI/CD

Three parallel GitHub Actions jobs run on every push to `main`:

```
CI Pipeline
├── build-cli      → npm install → tsc (TypeScript compile)
├── build-ui       → npm install → eslint → vite build
└── build-extension → npm install → webpack (production bundle)
```

---

## License

[MIT](LICENSE) © 2026 Devansh Tyagi
