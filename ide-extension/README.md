# 🌌 Antimatter: Project Cleaner

**A state-of-the-art native project cleaner for Antigravity IDE and VS Code.**

Antimatter is a high-performance, precision tool designed to instantly reclaim gigabytes of disk space by identifying and purging heavy cache directories, orphaned builds, and system junk directly from your IDE.

---

## 🚀 Features

- **Blazing Fast Scans**: Utilizes hyper-optimized, non-blocking glob patterns to traverse massively nested directories (like `node_modules`) in milliseconds.
- **Native UI Integration**: Built entirely on native IDE QuickPick menus and Progress APIs for a seamless, distraction-free experience.
- **Secure Purge**: Uses the secure IDE file system API (`vscode.workspace.fs`) to delete files, ensuring your workspace explorer updates synchronously and safely without locking up the host system.
- **Contextual Execution**: Right-click any folder in your explorer and select *Antimatter: Clean Project* to restrict the purge domain.
- **Zero Configuration**: Automatically targets known heavyweights like `__pycache__`, `node_modules`, `.next`, `dist`, `.pytest_cache`, and `coverage`.

## 🛠️ Usage

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Type **`Antimatter: Clean Project`**.
3. Watch the scanner instantly aggregate your heavy caches.
4. Select the directories you wish to purge from the QuickPick menu.
5. Reclaim your disk space.

## 💎 Aesthetics & Design

Antimatter is part of a larger Tri-Platform software suite featuring a pure Cyan, minimalist aesthetic. The IDE extension brings the power of the Antimatter engine directly into your workflow while maintaining extreme structural rigidity and performance.

---

**Developer:** Devansh Tyagi
**Version:** 1.0.0
