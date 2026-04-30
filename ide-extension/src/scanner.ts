import * as vscode from 'vscode';
import * as path from 'path';
import fg from 'fast-glob';

export interface ScanResult {
  path: string;
  size: number;
  type: 'directory' | 'file';
  description: string;
}

const TARGET_DIRECTORIES = [
  'node_modules',
  'dist',
  'build',
  '.next',
  '__pycache__',
  '.pytest_cache',
  'coverage'
];

const TARGET_FILES = [
  '.DS_Store',
  'Thumbs.db',
  'npm-debug.log',
  'yarn-error.log'
];

async function getDirSize(dirUri: vscode.Uri): Promise<number> {
  let totalSize = 0;
  try {
    const entries = await vscode.workspace.fs.readDirectory(dirUri);
    for (const [name, type] of entries) {
      const fullUri = vscode.Uri.joinPath(dirUri, name);
      if (type === vscode.FileType.SymbolicLink) continue; // Skip symlinks
      
      if (type === vscode.FileType.Directory) {
        totalSize += await getDirSize(fullUri);
      } else if (type === vscode.FileType.File) {
        try {
          const stats = await vscode.workspace.fs.stat(fullUri);
          totalSize += stats.size;
        } catch (e) {
          // Skip if unreadable
        }
      }
    }
  } catch (err) {
    // Ignore permissions errors
  }
  return totalSize;
}

export async function scanProject(projectPath: string, progress: vscode.Progress<{ message?: string; increment?: number }>): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  progress.report({ message: 'Searching for heavy directories...', increment: 10 });
  const dirPatterns = TARGET_DIRECTORIES.map(dir => `**/${dir}`);
  const dirs = await fg(dirPatterns, {
    cwd: projectPath,
    onlyDirectories: true,
    ignore: ['**/node_modules/**/node_modules', '**/node_modules/**/dist'],
    absolute: true,
    suppressErrors: true,
    followSymbolicLinks: false
  });

  let dirProgress = 10;
  const dirStep = dirs.length > 0 ? 40 / dirs.length : 40;

  for (const dir of dirs) {
    // Only add top-level targets
    const isInsideAnotherTarget = dirs.some(d => dir !== d && dir.startsWith(d + path.sep));
    if (isInsideAnotherTarget) continue;

    progress.report({ message: `Calculating size of ${path.basename(dir)}...`, increment: dirStep });
    const dirUri = vscode.Uri.file(dir);
    const size = await getDirSize(dirUri);
    results.push({
      path: dir,
      size,
      type: 'directory',
      description: path.basename(dir)
    });
  }

  progress.report({ message: 'Searching for system junk...', increment: 10 });
  const filePatterns = TARGET_FILES.map(file => `**/${file}`);
  const files = await fg(filePatterns, {
    cwd: projectPath,
    onlyFiles: true,
    absolute: true,
    suppressErrors: true,
    followSymbolicLinks: false
  });

  const fileStep = files.length > 0 ? 40 / files.length : 40;
  for (const file of files) {
    try {
      progress.report({ message: `Checking file ${path.basename(file)}...`, increment: fileStep });
      const stats = await vscode.workspace.fs.stat(vscode.Uri.file(file));
      results.push({
        path: file,
        size: stats.size,
        type: 'file',
        description: path.basename(file)
      });
    } catch (e) {
      // Ignore
    }
  }

  return results;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
