<div align="center">
  <img src="./ui/public/blackhole.png" alt="Antimatter Logo" width="200" />
  
  # 🌌 Antimatter
  
  **A high-performance, Tri-Platform project cleaner designed to instantly reclaim gigabytes of disk space.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
  [![Platform: Tri-Platform](https://img.shields.io/badge/Platform-CLI%20%7C%20Web%20%7C%20IDE-cyan.svg)]()
  [![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-cyan.svg)]()
</div>

---

## 📖 Overview

Modern development environments accumulate massive amounts of orphaned caches, build artifacts, and system junk over time (`node_modules`, `__pycache__`, `.next`, `dist`, etc.). **Antimatter** is a precision tool built to aggressively seek out and safely purge these heavyweight directories.

Unlike standard scripts, Antimatter features a unique **Tri-Platform Architecture**, allowing you to execute cleanups from the terminal, a cinematic local web application, or natively from within your IDE.

## 🏗️ Tri-Platform Architecture

Antimatter is engineered to fit seamlessly into any developer's workflow by providing three distinct interfaces powered by a single core engine:

### 1. The Power-User CLI
A lightning-fast, interactive command-line interface built with `commander` and `@inquirer/prompts`.
- **Speed**: Utilizes hyper-optimized, non-blocking glob patterns via `fast-glob`.
- **Usage**: Simply type `antimatter` in your terminal to initiate an interactive, safe-deletion workflow.

### 2. The Cinematic Web App
A beautiful, local React GUI featuring a minimalist cyan aesthetic and a 4K looping background.
- **Visuals**: Modern glassmorphism UI built with Vite and React.
- **Backend**: Powered by a decoupled Node.js/Express server handling secure file system operations.
- **Usage**: Run `Run_GUI.bat` to instantly spin up the backend and frontend simultaneously.

### 3. The Native IDE Extension
A highly integrated VS Code / Antigravity extension that brings the power of Antimatter directly into your editor.
- **Native UI**: Built entirely on native IDE QuickPick menus and Notification Progress APIs.
- **Safety**: Bypasses raw Node.js `fs` in favor of the secure `vscode.workspace.fs` API, ensuring the IDE correctly tracks all file deletions and updates its explorer synchronously.
- **Usage**: Search `Antimatter: Clean Project` in the command palette or right-click any folder in the explorer.

## ⚡ Key Features

- **Safe Purge Mechanics**: Explicit user confirmation is required before any destructive actions are taken.
- **Deep Scanning**: Capable of traversing massively nested directory trees while automatically suppressing permission errors on protected system files.
- **Grouping Engine**: Scan results are intelligently categorized (e.g., Build Caches, Python Environments, Error Logs) for quick triage.
- **Strict Aesthetic Alignment**: The entire ecosystem strictly adheres to a minimalist, pure Cyan color palette.

## 🚀 Getting Started

To run the local suite:

```bash
# Clone the repository
git clone https://github.com/DevanshTyagi/Antimatter.git

# Install core dependencies
npm install

# Run the interactive CLI
npm start

# OR launch the Cinematic Web GUI (Windows)
./Run_GUI.bat
```

To install the IDE extension, navigate to the `ide-extension` directory, package the `.vsix` file using `vsce`, and install it via your editor's extension panel.

---

<div align="center">
  <i>Engineered for speed, safety, and aesthetics.</i>
</div>
