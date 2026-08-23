# Study Prep Guide: Antimatter

Welcome! This guide is a beginner-friendly, from-scratch tutorial designed to help you understand and build a high-performance project cleaning utility like **Antimatter**. You will learn how to write a shared engine in TypeScript and build three distinct interfaces (CLI, REST API/React Web App, and VS Code Extension) around it.

---

## 🗺️ System Architecture

Antimatter is structured as a modular TypeScript application:
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
                                    └─────────────┘
```

---

## 📚 Core Learning Prerequisites

To understand this project, you need:
1. **TypeScript / JavaScript Basics**: Async/await, modules, and working with Node.js.
2. **Node.js Filesystem (`fs`)**: Reading directories, calculating file/folder sizes, and deleting directories recursively.
3. **Representational State Transfer (REST) APIs**: How an Express server handles HTTP requests.
4. **React & Vite**: Basic React component structures and fetching API data.

---

## 🛠️ Step-by-Step Implementation Guide

Let's build a micro-version of a project cleaner with a shared core engine!

### Step 1: Initialize the Project
Create a directory, set up npm, and install dependencies:
```bash
mkdir mini-antimatter
cd mini-antimatter
npm init -y
npm install typescript @types/node ts-node --save-dev
npx tsc --init
```

---

### Step 2: Build the Core Scanner Engine
Create a file called `core.ts`. This acts as our shared core engine, scanning directories for target folders (like `node_modules` or `__pycache__`) and deleting them.

```typescript
import * as fs from 'fs';
import * as path from 'path';

export interface CleanableItem {
  name: string;
  fullPath: string;
  sizeBytes: number;
}

// Simple recursive size calculator
export function getFolderSize(dirPath: string): number {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (err) {
    // Suppress permission errors
  }
  return size;
}

// Recursive scanner for cleanable targets
export function scanDirectory(dirPath: string, targets: string[]): CleanableItem[] {
  const results: CleanableItem[] = [];
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        if (targets.includes(file)) {
          results.push({
            name: file,
            fullPath,
            sizeBytes: getFolderSize(fullPath),
          });
        } else {
          // Recurse into subdirectories
          results.push(...scanDirectory(fullPath, targets));
        }
      }
    }
  } catch (err) {
    // Ignore restricted files/directories
  }
  return results;
}

// Cleaner function
export function deleteFolder(dirPath: string): void {
  fs.rmSync(dirPath, { recursive: true, force: true });
}
```

---

### Step 3: Interface A — The Command Line Interface (CLI)
Create `cli.ts` to implement the CLI workflow:
```typescript
import { scanDirectory, deleteFolder } from './core';

const targetDirectory = process.argv[2] || '.';
const targetsToClean = ['node_modules', 'dist', '__pycache__'];

console.log(`Scanning folder: ${targetDirectory}...`);
const items = scanDirectory(targetDirectory, targetsToClean);

if (items.length === 0) {
  console.log("No bloated files found! Your workspace is pristine.");
} else {
  console.log(`\nFound ${items.length} cleanable items:`);
  let totalBytes = 0;
  items.forEach(item => {
    const sizeMb = (item.sizeBytes / (1024 * 1024)).toFixed(2);
    console.log(` - ${item.name} at ${item.fullPath} (${sizeMb} MB)`);
    totalBytes += item.sizeBytes;
  });
  
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
  console.log(`\nTotal Recoverable Space: ${totalMb} MB`);
  
  // In a real app, prompt the user. Here we'll just demonstrate cleaning the first one
  console.log(`Deleting first item: ${items[0].fullPath}...`);
  deleteFolder(items[0].fullPath);
  console.log("Deleted successfully!");
}
```

Run it:
```bash
npx ts-node cli.ts .
```

---

### Step 4: Interface B — The Express REST API
Create `server.ts` to handle visual web clients:
```typescript
import express from 'express';
import { scanDirectory, deleteFolder } from './core';

const app = express();
app.use(express.json());

app.post('/api/scan', (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  const items = scanDirectory(dirPath, ['node_modules', 'dist', '__pycache__']);
  res.json({ items });
});

app.post('/api/clean', (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  deleteFolder(dirPath);
  res.json({ success: true, message: `Deleted ${dirPath}` });
});

app.listen(3000, () => {
  console.log('Antimatter REST API listening on port 3000');
});
```

---

## 🔍 Key Deep Dive Topics

### 1. VS Code Extension APIs
To make a VS Code extension interface, you define a command inside `package.json` and implement it inside `extension.ts` using VS Code's module:
```typescript
import * as vscode from 'vscode';
import { scanDirectory } from './core';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('antimatter.clean', async (uri: vscode.Uri) => {
    const folderPath = uri.fsPath;
    vscode.window.showInformationMessage(`Scanning ${folderPath} with Antimatter...`);
    // Run core engine scan and show VS Code quickpick/progress elements
  });
  context.subscriptions.push(disposable);
}
```

### 2. Path Traversal Hardening
When executing file deletion via a web interface, attackers can supply paths like `C:\Windows` or `../../../`. We protect against this by verifying that the requested path is within a safe project boundary:
```typescript
const resolvedPath = path.resolve(userPath);
if (resolvedPath === 'C:\\' || resolvedPath === '/' || resolvedPath.includes('System32')) {
  throw new Error("Access Denied: Attempted system directory scan");
}
```

---

## 🎯 Verification Tasks

1. **Verify CLI Functionality**: Run the global CLI or batch batch-scripts (`INSTALL.bat` and `Run_Project.bat`) to verify that the Express server + React UI load seamlessly.
2. **Scan/Clean Dry Run**: Confirm that scanning a directory with standard caches correctly identifies them and reports their byte size accurately.
