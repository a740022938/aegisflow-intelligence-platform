import React from 'react';

export interface InfoRow { label: string; value?: React.ReactNode; }
// Allow both object {label, value} and tuple [label, value] for flexibility
export type InfoRowValue = [string, React.ReactNode?];
export interface InfoTableProps {
  rows: (InfoRow | InfoRowValue | undefined)[];
  className?: string;
}

function normalizeRow(row: InfoRow | InfoRowValue | undefined): InfoRow | null {
  if (!row) return null;
  if (Array.isArray(row)) {
    return { label: String(row[0]), value: row[1] };
  }
  return row as InfoRow;
}

export default function InfoTable({ rows, className = '' }: InfoTableProps) {
  const normalized = rows.map(normalizeRow).filter((r): r is InfoRow => r !== null);
  if (normalized.length === 0) return null;
  return (
    <table className={`ui-info-table ${className}`}>
      <tbody>
        {normalized.map((row, i) => (
          <tr key={i}>
            <td className="ui-info-label">{row.label}</td>
            <td className="ui-info-value">{row.value ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
