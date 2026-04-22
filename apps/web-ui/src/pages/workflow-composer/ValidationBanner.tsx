// ============================================================
// ValidationBanner.tsx — 校验结果 Banner
// ============================================================
import React from 'react';
import type { ValidationResult } from './workflowValidator';

interface ValidationBannerProps {
  result: ValidationResult;
}

const ValidationBanner: React.FC<ValidationBannerProps> = ({ result }) => {
  if (result.errors.length === 0 && result.warnings.length === 0) {
    return (
      <div className="wf-validation-banner wf-validation-banner--success">
        <span className="wf-validation-icon">✅</span>
        <span className="wf-validation-text">
          校验通过 · 画布结构正常
        </span>
      </div>
    );
  }

  return (
    <div className="wf-validation-banner-container">
      {/* 错误 */}
      {result.errors.length > 0 && (
        <div className="wf-validation-banner wf-validation-banner--error">
          <div className="wf-validation-header">
            <span className="wf-validation-icon">❌</span>
            <span className="wf-validation-text">
              校验失败 · {result.errors.length} 个错误
            </span>
          </div>
          <ul className="wf-validation-list">
            {result.errors.map((err, i) => (
              <li key={i} className="wf-validation-item">
                <span className="wf-validation-code">[{err.code}]</span>{' '}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 警告 */}
      {result.warnings.length > 0 && (
        <div className="wf-validation-banner wf-validation-banner--warning">
          <div className="wf-validation-header">
            <span className="wf-validation-icon">⚠️</span>
            <span className="wf-validation-text">
              警告 · {result.warnings.length} 个警告
            </span>
          </div>
          <ul className="wf-validation-list">
            {result.warnings.map((warn, i) => (
              <li key={i} className="wf-validation-item">
                <span className="wf-validation-code">[{warn.code}]</span>{' '}
                {warn.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationBanner;
