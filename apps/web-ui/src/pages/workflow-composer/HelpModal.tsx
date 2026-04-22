// HelpModal.tsx — P6: 快捷键帮助面板
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { category: '通用', items: [
    { key: 'Ctrl + A', desc: '全选节点' },
    { key: 'Ctrl + Z', desc: '撤销' },
    { key: 'Ctrl + Y', desc: '重做' },
    { key: 'Ctrl + S', desc: '保存草稿' },
    { key: 'Ctrl + D', desc: '快速复制选中节点' },
    { key: 'Delete / Backspace', desc: '删除选中节点' },
    { key: 'Escape', desc: '取消选中 / 关闭面板' },
    { key: 'Ctrl + Enter', desc: '编译工作流' },
  ]},
  { category: '画布操作', items: [
    { key: '鼠标滚轮', desc: '缩放画布' },
    { key: '鼠标拖拽空白处', desc: '平移画布' },
    { key: 'Shift + 点击节点', desc: '追加选中' },
    { key: 'Ctrl + 点击节点', desc: '切换选中' },
    { key: '方向键', desc: '微移选中节点 (1px)' },
    { key: 'Shift + 方向键', desc: '快速移动节点 (10px)' },
    { key: 'Ctrl + 框选', desc: '追加到框选' },
  ]},
  { category: '对齐（选中多个节点后右键菜单）', items: [
    { key: '左对齐', desc: '将节点左边缘对齐' },
    { key: '右对齐', desc: '将节点右边缘对齐' },
    { key: '上对齐', desc: '将节点上边缘对齐' },
    { key: '底对齐', desc: '将节点下边缘对齐' },
    { key: '水平等距分布', desc: '水平方向等距排列' },
    { key: '垂直等距分布', desc: '垂直方向等距排列' },
  ]},
  { category: '运行控制', items: [
    { key: 'Dry-Run', desc: '验证工作流（不真实执行）' },
    { key: '运行', desc: '创建并启动工作流任务' },
    { key: '⏸ ⏹ ▶（底部状态栏）', desc: '暂停 / 取消 / 恢复运行' },
  ]},
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className='help-modal-overlay' onClick={onClose}>
      <div className='help-modal' onClick={e => e.stopPropagation()}>
        <div className='help-modal-header'>
          <h3>⌨️ 快捷键与操作指南</h3>
          <button className='help-modal-close' onClick={onClose}>✕</button>
        </div>
        <div className='help-modal-body'>
          {SHORTCUTS.map(group => (
            <div key={group.category} className='help-category'>
              <h4>{group.category}</h4>
              <table className='help-table'>
                <tbody>
                  {group.items.map(item => (
                    <tr key={item.key}>
                      <td className='help-key'>{item.key}</td>
                      <td className='help-desc'>{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
