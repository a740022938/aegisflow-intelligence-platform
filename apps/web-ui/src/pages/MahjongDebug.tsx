import React, { useCallback, useEffect, useState } from 'react';

interface PredictResult {
  success: boolean;
  input_count: number;
  output_dir: string;
  preview_images: string[];
  detections_summary: Record<string, number>;
  predictions?: Array<{ class_name: string; confidence: number; bbox: number[] }>;
  error?: string;
}

interface PredictHistory {
  id: string;
  image_dir: string;
  model_path: string;
  conf: number;
  iou: number;
  input_count: number;
  success: boolean;
  created_at: string;
}

const STORAGE_KEY = 'agi_mahjong_presets';
const HISTORY_KEY = 'agi_mahjong_history';

function loadPresets(): { imageDir: string; modelPath: string; outputDir: string; conf: number; iou: number }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function savePresets(presets: any[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(presets)); } catch {}
}

function loadHistory(): PredictHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(entry: PredictHistory) {
  try {
    const hist = loadHistory().slice(0, 19);
    hist.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  } catch {}
}

const MahjongDebug: React.FC = () => {
  const [imageDir, setImageDir] = useState('');
  const [modelPath, setModelPath] = useState('');
  const [outputDir, setOutputDir] = useState('');
  const [conf, setConf] = useState(0.25);
  const [iou, setIou] = useState(0.45);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [log, setLog] = useState('');
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [presets, setPresets] = useState(loadPresets);
  const [history, setHistory] = useState(loadHistory);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setApiOk(!!d.ok))
      .catch(() => setApiOk(false));
  }, []);

  const appendLog = useCallback((msg: string) => {
    setLog(prev => prev + msg + '\n');
  }, []);

  const handlePredict = async () => {
    setPredicting(true);
    setResult(null);
    setLog('');
    appendLog('Submitting prediction request...');

    try {
      const res = await fetch('/api/vision/mahjong/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_dir: imageDir, model_path: modelPath, conf, iou, output_dir: outputDir }),
      });
      const data: PredictResult = await res.json();
      setResult(data);

      if (data.success) {
        appendLog(`Done. Input: ${data.input_count} images`);
        appendLog(`Output dir: ${data.output_dir}`);
        appendLog(`Preview images: ${data.preview_images.length}`);
        if (data.detections_summary) {
          appendLog('Detections: ' + JSON.stringify(data.detections_summary));
        }
        saveHistory({
          id: Date.now().toString(36),
          image_dir: imageDir,
          model_path: modelPath,
          conf, iou,
          input_count: data.input_count,
          success: true,
          created_at: new Date().toISOString(),
        });
        setHistory(loadHistory());
      } else {
        appendLog('Predict failed: ' + (data.error || 'unknown error'));
      }
    } catch (err: any) {
      appendLog('Request error: ' + (err.message || String(err)));
    } finally {
      setPredicting(false);
    }
  };

  const saveAsPreset = () => {
    const p = { imageDir, modelPath, outputDir, conf, iou };
    const updated = [...presets, p];
    setPresets(updated);
    savePresets(updated);
  };

  const applyPreset = (p: typeof presets[0]) => {
    setImageDir(p.imageDir);
    setModelPath(p.modelPath);
    setOutputDir(p.outputDir);
    setConf(p.conf);
    setIou(p.iou);
  };

  const clearAll = () => {
    setResult(null);
    setLog('');
  };

  return (
    <div className="page-container" style={{ padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Mahjong Vision Debug Console
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            YOLO detect + classify — real screenshot prediction preview
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: apiOk === true ? 'var(--success)' : apiOk === false ? 'var(--danger)' : 'var(--text-muted)',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {apiOk === true ? 'API Online' : apiOk === false ? 'API Offline' : 'Checking...'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Left Panel - Input */}
        <div style={{ flex: '0 0 420px', minWidth: 320 }}>
          <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Input Config</h3>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>Image Directory</label>
              <input type="text" value={imageDir} onChange={e => setImageDir(e.target.value)} placeholder="e.g. E:\data\mahjong\screenshots" style={inputStyle()} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>Model Path</label>
              <input type="text" value={modelPath} onChange={e => setModelPath(e.target.value)} placeholder="e.g. workers/python-worker/yolov8n.pt" style={inputStyle()} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>Conf: {conf.toFixed(2)}</label>
                <input type="range" min="0" max="1" step="0.05" value={conf} onChange={e => setConf(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>IoU: {iou.toFixed(2)}</label>
                <input type="range" min="0" max="1" step="0.05" value={iou} onChange={e => setIou(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>Output Directory</label>
              <input type="text" value={outputDir} onChange={e => setOutputDir(e.target.value)} placeholder="e.g. E:\data\mahjong\output" style={inputStyle()} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handlePredict} disabled={predicting} style={primaryBtn(!!predicting)}>
                {predicting ? 'Predicting...' : 'Run Predict'}
              </button>
              <button onClick={saveAsPreset} style={secondaryBtn()} title="Save as preset">Save Preset</button>
              <button onClick={clearAll} style={secondaryBtn()}>Clear</button>
            </div>
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Presets ({presets.length})</h3>
              {presets.map((p, i) => (
                <div key={i} onClick={() => applyPreset(p)} style={{ padding: '6px 8px', marginBottom: 4, borderRadius: 4, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  {p.imageDir || '(empty)'} | conf={p.conf} iou={p.iou}
                </div>
              ))}
            </div>
          )}

          {/* History */}
          <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => setShowHistory(!showHistory)}>
              History ({history.length}) {showHistory ? '[-]' : '[+]'}
            </h3>
            {showHistory && history.length > 0 && history.slice(0, 10).map((h, i) => (
              <div key={h.id} onClick={() => applyPreset({ imageDir: h.image_dir, modelPath: h.model_path, outputDir: '', conf: h.conf, iou: h.iou })} style={{ padding: '6px 8px', marginBottom: 3, borderRadius: 4, cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                {h.image_dir?.slice(0, 40) || '(none)'} — {h.input_count} imgs — {h.conf}/{h.iou}
              </div>
            ))}
            {showHistory && history.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No history. Run a prediction to see it here.</div>
            )}
          </div>

          {/* Log */}
          <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Run Log</h3>
            <pre style={{ margin: 0, padding: 8, fontSize: 12, lineHeight: 1.5, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, minHeight: 60, maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
              {log || 'Awaiting action...'}
            </pre>
          </div>

          {result && !result.success && result.error && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
              Error: {result.error}
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {result && result.success ? (
            <>
              {/* Stats */}
              <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div style={{ padding: 8, borderRadius: 6, background: 'var(--bg)', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Input</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{result.input_count}</div>
                  </div>
                  <div style={{ padding: 8, borderRadius: 6, background: 'var(--bg)', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Output</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{result.preview_images.length}</div>
                  </div>
                  <div style={{ padding: 8, borderRadius: 6, background: 'var(--bg)', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>Done</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                  Output: {result.output_dir}
                </div>
              </div>

              {/* Detection Summary */}
              {result.detections_summary && Object.keys(result.detections_summary).length > 0 && (
                <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: 16 }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Detections</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {Object.entries(result.detections_summary).map(([cls, count]) => (
                      <span key={cls} style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        {cls}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Previews */}
              <div style={{ padding: 16, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Preview ({result.preview_images.length})
                </h3>
                {result.preview_images.map((img, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Result #{i + 1}</div>
                    <img src={img} alt={`Result ${i + 1}`} style={{ width: '100%', maxWidth: 640, borderRadius: 6, border: '1px solid var(--border)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                ))}
                {result.preview_images.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No preview images generated</div>
                )}
              </div>
            </>
          ) : !result && !predicting && (
            <div style={{ padding: 40, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Configure parameters on the left and click Run Predict to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function inputStyle(): React.CSSProperties {
  return { width: '100%', padding: '6px 8px', fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', boxSizing: 'border-box' };
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return { padding: '8px 16px', fontSize: 13, fontWeight: 600, background: disabled ? 'var(--bg-secondary)' : 'var(--accent)', color: disabled ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer' };
}

function secondaryBtn(): React.CSSProperties {
  return { padding: '8px 12px', fontSize: 12, fontWeight: 500, background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer' };
}

export default MahjongDebug;
