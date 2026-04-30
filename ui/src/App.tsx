import { useState } from 'react';
import { Search, Loader2, Folder, File, CheckSquare, Square, Zap } from 'lucide-react';

interface ScanItem {
  path: string;
  size: number;
  type: 'directory' | 'file';
  description: string;
}

interface ScanResults {
  buildCaches: ScanItem[];
  pythonCaches: ScanItem[];
  systemJunk: ScanItem[];
  logs: ScanItem[];
  other: ScanItem[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ICONS = {
  buildCaches: <Folder className="text-cyan-400" size={20} />,
  pythonCaches: <Folder className="text-cyan-300" size={20} />,
  systemJunk: <File className="text-gray-400" size={20} />,
  logs: <File className="text-cyan-200" size={20} />,
  other: <File className="text-white" size={20} />
};

const LABELS = {
  buildCaches: 'Build & Node Caches',
  pythonCaches: 'Python Environment',
  systemJunk: 'System Junk Files',
  logs: 'Error Logs',
  other: 'Other Heavy Items'
};

export default function App() {
  const [targetDir, setTargetDir] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [purging, setPurging] = useState(false);
  const [freedSpace, setFreedSpace] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!targetDir.trim()) {
      setError('Please enter a directory path to scan.');
      return;
    }
    setLoading(true);
    setResults(null);
    setFreedSpace(null);
    setError(null);
    setSelectedPaths(new Set());
    try {
      const res = await fetch('http://localhost:4000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDir })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Make sure the backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (path: string) => {
    const newSet = new Set(selectedPaths);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setSelectedPaths(newSet);
  };

  const handlePurge = async () => {
    if (selectedPaths.size === 0) return;
    setPurging(true);
    setError(null);
    try {
      const paths = Array.from(selectedPaths);
      const res = await fetch('http://localhost:4000/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purge failed');
      
      let totalFreed = 0;
      Object.values(results || {}).flat().forEach(item => {
        if (data.deletedPaths.includes(item.path)) {
          totalFreed += item.size;
        }
      });
      
      setFreedSpace(totalFreed);
      setResults(null);
      setSelectedPaths(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purge failed. Check permissions.');
    } finally {
      setPurging(false);
    }
  };

  const renderGroup = (key: keyof ScanResults, items: ScanItem[]) => {
    if (!items || items.length === 0) return null;
    
    const groupSize = items.reduce((acc, curr) => acc + curr.size, 0);
    const allSelected = items.every(item => selectedPaths.has(item.path));

    const toggleGroup = () => {
      const newSet = new Set(selectedPaths);
      if (allSelected) {
        items.forEach(item => newSet.delete(item.path));
      } else {
        items.forEach(item => newSet.add(item.path));
      }
      setSelectedPaths(newSet);
    };

    return (
      <div className="result-group" key={key}>
        <div className="group-header" onClick={toggleGroup}>
          <div className="group-title">
            {ICONS[key]}
            <span>{LABELS[key]}</span>
            <span className="group-badge">{items.length} items</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{formatBytes(groupSize)}</span>
            {allSelected ? <CheckSquare size={20} color="var(--accent-cyan)" /> : <Square size={20} color="var(--text-secondary)" />}
          </div>
        </div>
        <div className="item-list">
          {items.map(item => (
            <div className="item-row" key={item.path} onClick={() => toggleSelection(item.path)}>
              <input 
                type="checkbox" 
                className="item-checkbox" 
                checked={selectedPaths.has(item.path)} 
                readOnly 
              />
              <div className="item-info">
                <span className="item-name">{item.description}</span>
                <span className="item-path">{item.path}</span>
              </div>
              <span className="item-size">{formatBytes(item.size)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="background-container">
        <div className="background-overlay"></div>
      </div>
      <div className="app-container">
        <h1>ANTIMATTER</h1>
        <p className="subtitle">Project Cleaning & Optimization Utility</p>

        <div className="glass-panel">
          <div className="input-group">
            <input 
              type="text" 
              value={targetDir} 
              onChange={(e) => setTargetDir(e.target.value)}
              placeholder="Enter absolute directory path..."
              spellCheck="false"
            />
            <button className="primary" onClick={handleScan} disabled={loading || purging}>
              {loading ? <Loader2 className="spinner" /> : <Search />}
              {loading ? 'Scanning...' : 'Scan System'}
            </button>
          </div>

          {error && !loading && (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 80, 80, 0.1)', borderRadius: '12px', border: '1px solid rgba(255,80,80,0.4)' }}>
              <p style={{ margin: 0, color: '#ff6b6b' }}>⚠ {error}</p>
            </div>
          )}

          {freedSpace !== null && !loading && (
            <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '12px', border: '1px solid var(--accent-cyan)' }}>
              <h2 className="glow-text" style={{ margin: 0, color: 'var(--accent-cyan)' }}>
                ✨ Successfully reclaimed {formatBytes(freedSpace)} of space! ✨
              </h2>
            </div>
          )}

          {results && !loading && (
            <>
              <div className="results-grid">
                {renderGroup('buildCaches', results.buildCaches)}
                {renderGroup('pythonCaches', results.pythonCaches)}
                {renderGroup('systemJunk', results.systemJunk)}
                {renderGroup('logs', results.logs)}
                {renderGroup('other', results.other)}
              </div>

              {selectedPaths.size > 0 && (
                <button className="danger" onClick={handlePurge} disabled={purging}>
                  {purging ? <Loader2 className="spinner" size={24} /> : <Zap size={24} />}
                  {purging ? 'Purging Antimatter...' : `PURGE ANTIMATTER (${selectedPaths.size} items)`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
