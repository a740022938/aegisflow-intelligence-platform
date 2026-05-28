import React, { useEffect, useState, useCallback, useRef } from 'react';
import { PageShell, SectionCard, EmptyState, StatsGrid } from '../components/ui';

interface StorageFile {
  id: string; original_name: string; stored_path: string;
  size_bytes: number; mime_type: string; checksum: string; created_at: string;
}

const API = '/api/storage';

async function get<T = any>(url: string): Promise<T> { const r = await fetch(url); return r.json(); }

export default function ObjectStoragePage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await get<{ ok: boolean; files: StorageFile[]; count: number }>(`${API}/files`);
      if (res.ok) setFiles(res.files || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    setError('');
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const reader = new FileReader();
        const content = await new Promise<string>((resolve) => {
          reader.onload = () => { const b64 = (reader.result as string).split(',')[1]; resolve(b64 || ''); };
          reader.readAsDataURL(file);
        });
        await fetch(`${API}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ original_name: file.name, mime_type: file.type, content_base64: content }),
        });
      }
      loadFiles();
    } catch (e: any) { setError(e.message); }
    finally { setUploading(false); setDragOver(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确认删除此文件？')) return;
    setDeleting(id);
    setError('');
    try {
      await fetch(`${API}/files/${id}`, { method: 'DELETE' });
      loadFiles();
    } catch (e: any) { setError(e.message); }
    finally { setDeleting(null); }
  };

  const handleDownload = (file: StorageFile) => {
    window.open(`${API}/files/${file.id}/download`, '_blank');
  };

  const totalSize = files.reduce((s, f) => s + (f.size_bytes || 0), 0);
  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : b < 1073741824 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1073741824).toFixed(2)} GB`;

  return (
    <PageShell title="对象存储" subtitle="文件上传、下载、管理" maturity="lab">
      {error && (
        <div style={{ padding: '10px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <StatsGrid items={[
        { label: '文件数', value: files.length },
        { label: '总容量', value: fmtSize(totalSize), color: 'var(--primary)' },
      ]} />

      {/* Drag & Drop Upload Zone */}
      <div
        style={{
          marginTop: 16, padding: '32px 24px',
          border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 12, textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'var(--primary-light)' : 'var(--bg-surface)',
          transition: 'all 0.2s',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
      >
        <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.6 }}>
          {uploading ? '...' : dragOver ? 'Drop here' : 'Click or drag files here'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {uploading ? 'Uploading...' : '支持拖拽上传或点击选择文件'}
        </div>
      </div>

      {/* File List */}
      <SectionCard title={`文件列表 (${files.length})`} style={{ marginTop: 16 }}>
        {loading ? <EmptyState title="加载中..." /> : files.length === 0 ? (
          <EmptyState title="暂无文件" description="上传文件开始使用对象存储。" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>文件名</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>大小</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>类型</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Checksum</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>上传时间</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.original_name}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {fmtSize(f.size_bytes)}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: 11 }}>
                      {f.mime_type?.split('/')[0] || '-'}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                      {f.checksum?.slice(0, 8) || '-'}
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: 11 }}>
                      {new Date(f.created_at).toLocaleString('zh-CN')}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="ui-btn" style={{ fontSize: 11, padding: '3px 10px' }} onClick={() => handleDownload(f)}>
                          Download
                        </button>
                        <button className="ui-btn" style={{ fontSize: 11, padding: '3px 10px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          onClick={() => handleDelete(f.id)}
                          disabled={deleting === f.id}>
                          {deleting === f.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
