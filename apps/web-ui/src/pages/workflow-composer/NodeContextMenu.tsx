import React from 'react';
import './NodeContextMenu.css';

export interface NodeContextAction {
  key: string;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

interface NodeContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  title?: string;
  actions: NodeContextAction[];
  onClose: () => void;
}

export default function NodeContextMenu({ isOpen, position, title, actions, onClose }: NodeContextMenuProps) {
  if (!isOpen) return null;

  const menuWidth = 220;
  const x = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const y = Math.min(position.y, window.innerHeight - 260);

  return (
    <div className="node-ctx-overlay" onClick={onClose}>
      <div className="node-ctx-menu" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
        {title ? <div className="node-ctx-title">{title}</div> : null}
        <div className="node-ctx-list">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`node-ctx-item ${a.danger ? 'danger' : ''}`}
              onClick={() => {
                a.onClick();
                onClose();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
