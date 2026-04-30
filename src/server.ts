import express from 'express';
import cors from 'cors';
import { scanProject } from './scanner';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scan', async (req, res) => {
  try {
    const { targetDir } = req.body;
    if (!targetDir || typeof targetDir !== 'string') {
      return res.status(400).json({ error: 'targetDir must be a non-empty string' });
    }

    // Security: Reject obviously dangerous paths (system roots, etc.)
    const resolvedPath = path.resolve(targetDir);
    const systemRoots = ['C:\\Windows', 'C:\\Program Files', '/usr', '/bin', '/etc', '/sys'];
    const isDangerous = systemRoots.some(root => resolvedPath.toLowerCase().startsWith(root.toLowerCase()));
    if (isDangerous) {
      return res.status(403).json({ error: 'Scanning system directories is not permitted.' });
    }

    // Verify the path exists
    try {
      await fs.access(resolvedPath);
    } catch {
      return res.status(404).json({ error: `Directory not found: ${resolvedPath}` });
    }
    const results = await scanProject(resolvedPath);

    // Group the results
    const grouped = {
      buildCaches: results.filter(r => ['node_modules', 'dist', 'build', '.next'].includes(r.description)),
      pythonCaches: results.filter(r => ['__pycache__', '.pytest_cache'].includes(r.description)),
      systemJunk: results.filter(r => ['.DS_Store', 'Thumbs.db'].includes(r.description)),
      logs: results.filter(r => r.description.endsWith('.log')),
      other: results.filter(r => !['node_modules', 'dist', 'build', '.next', '__pycache__', '.pytest_cache', '.DS_Store', 'Thumbs.db'].includes(r.description) && !r.description.endsWith('.log'))
    };

    res.json({ results: grouped, totalFound: results.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clean', async (req, res) => {
  try {
    const { paths } = req.body;
    if (!paths || !Array.isArray(paths)) {
      return res.status(400).json({ error: 'paths array is required' });
    }

    const deletedPaths = [];
    const failedPaths = [];

    for (const itemPath of paths) {
      try {
        await fs.rm(itemPath, { recursive: true, force: true });
        deletedPaths.push(itemPath);
      } catch (err: any) {
        failedPaths.push({ path: itemPath, error: err.message });
      }
    }

    res.json({ deletedPaths, failedPaths });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
