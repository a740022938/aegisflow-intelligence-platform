import React, { useState, useEffect, useCallback } from 'react';
import PageShell from '../components/ui/PageShell';

interface TreeNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
}

interface FileContent {
  ok: boolean;
  path: string;
  name: string;
  size: number;
  size_formatted: string;
  modified_at?: string;
  binary?: boolean;
  content: string;
  truncated?: boolean;
}

interface Shortcut {
  id: string;
  name: string;
  path: string;
  icon: string;
  position: number;
}

const SECT_STYLE: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)',
  borderRadius: 8, overflow: 'hidden',
};

function btnStyle(primary?: boolean): React.CSSProperties {
  return {
    padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500,
    fontFamily: 'inherit', background: primary ? 'var(--primary)' : 'var(--bg-surface)',
    color: primary ? '#fff' : 'var(--text-secondary)', border: primary ? 'none' : '1px solid var(--border)',
  };
}

function inputStyle(): React.CSSProperties {
  return {
    padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)',
    background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: 13,
    width: '100%', boxSizing: 'border-box', outline: 'none',
  };
}

function modalOverlay(): React.CSSProperties {
  return {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
  };
}

function modalContent(): React.CSSProperties {
  return {
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 24, minWidth: 380, maxWidth: 480,
  };
}

const ICON_MAP: Record<string, string> = {
  folder: '\uD83D\uDCC1',
  database: '\uD83D\uDCC0',
  file: '\uD83D\uDCC4',
  code: '\uD83D\uDCBB',
};

export default function Workspace() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [currentPath, setCurrentPath] = useState('E:\\AIP');
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [showShortcutModal, setShowShortcutModal] = useState(false);
  const [showMkdirModal, setShowMkdirModal] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutPath, setNewShortcutPath] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShortcuts = useCallback(async () => {
    try {
      const res = await fetch('/api/workspace/shortcuts');
      const d = await res.json();
      setShortcuts(d.shortcuts || []);
    } catch {}
  }, []);

  const fetchTree = useCallback(async (p: string) => {
    setTreeLoading(true);
    setTreeError(null);
    try {
      const res = await fetch(`/api/workspace/tree?path=${encodeURIComponent(p)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setTree(d.children || []);
    } catch (e: any) {
      setTreeError(e?.message ?? String(e));
      setTree([]);
    } finally {
      setTreeLoading(false);
    }
  }, []);

  const fetchFile = useCallback(async (p: string) => {
    setFileLoading(true);
    setFileError(null);
    setSelectedFile(p);
    try {
      const res = await fetch(`/api/workspace/file?path=${encodeURIComponent(p)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setFileContent(d);
    } catch (e: any) {
      setFileError(e?.message ?? String(e));
      setFileContent(null);
    } finally {
      setFileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortcuts();
    fetchTree(currentPath);
  }, [currentPath, fetchShortcuts, fetchTree]);

  const navigateTo = (p: string) => {
    setCurrentPath(p);
    setSelectedFile(null);
    setFileContent(null);
  };

  const handleItemClick = (node: TreeNode) => {
    if (node.type === 'directory') {
      navigateTo(node.path);
    } else {
      fetchFile(node.path);
    }
  };

  const goUp = () => {
    const parent = currentPath.split('\\').slice(0, -1).join('\\') || 'E:\\';
    navigateTo(parent);
  };

  const addShortcut = async () => {
    if (!newShortcutName || !newShortcutPath) return;
    setActionLoading(true);
    try {
      await fetch('/api/workspace/shortcut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShortcutName, path: newShortcutPath, icon: 'folder' }),
      });
      setShowShortcutModal(false);
      setNewShortcutName('');
      setNewShortcutPath('');
      fetchShortcuts();
    } finally {
      setActionLoading(false);
    }
  };

  const createDir = async () => {
    if (!newDirName) return;
    setActionLoading(true);
    try {
      await fetch('/api/workspace/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent: currentPath, name: newDirName }),
      });
      setShowMkdirModal(false);
      setNewDirName('');
      fetchTree(currentPath);
    } finally {
      setActionLoading(false);
    }
  };

  const removeShortcut = async (id: string) => {
    try {
      await fetch(`/api/workspace/shortcut/${id}`, { method: 'DELETE' });
      fetchShortcuts();
    } catch {}
  };

  const currentName = currentPath.split('\\').pop() || currentPath;
  const isFile = !!selectedFile;

  return (
    <PageShell title="Workspace" subtitle="File browser, quick links, and file preview" maturity="preview">
      {/* Quick Links Bar */}
      <div style={{
        ...SECT_STYLE, marginBottom: 16, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: 4, whiteSpace: 'nowrap' }}>
          Quick Links:
        </span>
        {shortcuts.map(s => (
          <button key={s.id} onClick={() => navigateTo(s.path)} title={s.path} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500,
            fontFamily: 'inherit', background: 'var(--bg-app)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 14 }}>{ICON_MAP[s.icon] || ICON_MAP.folder}</span>
            {s.name}
            <span onClick={(e) => { e.stopPropagation(); removeShortcut(s.id); }}
              style={{ marginLeft: 4, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, cursor: 'pointer' }}>&times;</span>
          </button>
        ))}
        <button onClick={() => setShowShortcutModal(true)} style={{
          padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500,
          fontFamily: 'inherit', background: 'transparent', color: 'var(--primary)',
          border: '1px dashed var(--primary)',
        }}>+ Add</button>
      </div>

      {/* Split panel */}
      <div style={{ display: 'grid', gridTemplateColumns: isFile ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Left: File tree */}
        <div style={SECT_STYLE}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={goUp} disabled={currentPath === 'E:\\'} style={{
                padding: '2px 8px', background: 'var(--bg-app)', border: '1px solid var(--border)',
                borderRadius: 4, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14,
              }}>&uarr;</button>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {currentPath}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setShowMkdirModal(true)} style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                fontFamily: 'inherit', background: 'var(--bg-app)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>+ Dir</button>
              <button onClick={() => fetchTree(currentPath)} style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                fontFamily: 'inherit', background: 'var(--bg-app)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>&#8635;</button>
            </div>
          </div>

          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {treeLoading && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                <span className="spinner" style={{ display: 'inline-block', marginRight: 8 }} />
                Loading...
              </div>
            )}

            {treeError && (
              <div style={{ padding: 16, color: 'var(--danger)', fontSize: 12 }}>
                Error: {treeError}
              </div>
            )}

            {!treeLoading && !treeError && tree.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Empty directory.
              </div>
            )}

            {!treeLoading && !treeError && tree.map((node, i) => (
              <div key={i} onClick={() => handleItemClick(node)} style={{
                padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: selectedFile === node.path ? 'var(--primary-light)' : 'transparent',
              }}>
                <span style={{ fontSize: 16 }}>
                  {node.type === 'directory' ? ICON_MAP.folder : ICON_MAP.file}
                </span>
                <span style={{
                  fontSize: 12, color: node.type === 'directory' ? 'var(--primary)' : 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {node.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: File preview */}
        {isFile && (
          <div style={SECT_STYLE}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {selectedFile?.split('\\').pop() || 'File Preview'}
              </span>
              <button onClick={() => { setSelectedFile(null); setFileContent(null); }} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
              }}>&times;</button>
            </div>

            <div style={{ padding: 16, maxHeight: '60vh', overflowY: 'auto' }}>
              {fileLoading && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>
                  <span className="spinner" style={{ display: 'inline-block', marginRight: 8 }} /> Loading...
                </div>
              )}

              {fileError && (
                <div style={{ color: 'var(--danger)', fontSize: 12, padding: 12 }}>
                  Error: {fileError}
                </div>
              )}

              {fileContent && !fileLoading && (
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Size: {fileContent.size_formatted}</span>
                    {fileContent.modified_at && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Modified: {new Date(fileContent.modified_at).toLocaleString('zh-CN')}
                      </span>
                    )}
                    {fileContent.binary && (
                      <span style={{
                        padding: '1px 6px', borderRadius: 4, fontSize: 10,
                        background: 'var(--warning-light)', color: 'var(--warning)',
                      }}>BINARY</span>
                    )}
                    {fileContent.truncated && (
                      <span style={{
                        padding: '1px 6px', borderRadius: 4, fontSize: 10,
                        background: 'var(--info-light)', color: 'var(--info)',
                      }}>TRUNCATED</span>
                    )}
                  </div>
                  <pre style={{
                    margin: 0, padding: 12, background: 'var(--bg-app)',
                    borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)', overflowX: 'auto',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    border: '1px solid var(--border)', maxHeight: '48vh', overflowY: 'auto',
                  }}>
                    {fileContent.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Shortcut Modal */}
      {showShortcutModal && (
        <div style={modalOverlay()} onClick={(e) => { if (e.target === e.currentTarget) setShowShortcutModal(false); }}>
          <div style={modalContent()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Add Quick Link</div>
              <button onClick={() => setShowShortcutModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Name</label>
                <input style={inputStyle()} value={newShortcutName} onChange={e => setNewShortcutName(e.target.value)} placeholder="e.g. Axiom" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Path</label>
                <input style={inputStyle()} value={newShortcutPath} onChange={e => setNewShortcutPath(e.target.value)} placeholder="e.g. E:\Axiom" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowShortcutModal(false)} style={btnStyle()}>Cancel</button>
              <button onClick={addShortcut} disabled={actionLoading || !newShortcutName || !newShortcutPath} style={btnStyle(true)}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Directory Modal */}
      {showMkdirModal && (
        <div style={modalOverlay()} onClick={(e) => { if (e.target === e.currentTarget) setShowMkdirModal(false); }}>
          <div style={modalContent()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Create Directory</div>
              <button onClick={() => setShowMkdirModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>&times;</button>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Directory Name</label>
              <input style={inputStyle()} value={newDirName} onChange={e => setNewDirName(e.target.value)} placeholder="e.g. my_folder" />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              Creating in: <code style={{ color: 'var(--primary)' }}>{currentPath}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowMkdirModal(false)} style={btnStyle()}>Cancel</button>
              <button onClick={createDir} disabled={actionLoading || !newDirName} style={btnStyle(true)}>Create</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
