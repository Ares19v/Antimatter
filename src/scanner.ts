import fs from 'fs/promises';
import path from 'path';
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

async function getDirSize(dirPath: string): Promise<number> {
  let totalSize = 0;
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      if (file.isSymbolicLink()) continue; // Skip symlinks to avoid recursion/permission issues
      
      if (file.isDirectory()) {
        totalSize += await getDirSize(fullPath);
      } else {
        try {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        } catch (e) {
          // Skip if individual file is unreadable
        }
      }
    }
  } catch (err) {
    // Ignore permissions or missing file errors during scan
  }
  return totalSize;
}

export async function scanProject(projectPath: string): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  // Find heavy directories
  const dirPatterns = TARGET_DIRECTORIES.map(dir => `**/${dir}`);
  const dirs = await fg(dirPatterns, {
    cwd: projectPath,
    onlyDirectories: true,
    ignore: ['**/node_modules/**/node_modules', '**/node_modules/**/dist'], // Avoid deep recursion
    absolute: true,
    suppressErrors: true,
    followSymbolicLinks: false
  });

  for (const dir of dirs) {
    // Only add top-level targets
    const isInsideAnotherTarget = dirs.some(d => dir !== d && dir.startsWith(d + path.sep));
    if (isInsideAnotherTarget) continue;

    const size = await getDirSize(dir);
    results.push({
      path: dir,
      size,
      type: 'directory',
      description: path.basename(dir)
    });
  }

  // Find junk files
  const filePatterns = TARGET_FILES.map(file => `**/${file}`);
  const files = await fg(filePatterns, {
    cwd: projectPath,
    onlyFiles: true,
    absolute: true,
    suppressErrors: true,
    followSymbolicLinks: false
  });

  for (const file of files) {
    try {
      const stats = await fs.stat(file);
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
