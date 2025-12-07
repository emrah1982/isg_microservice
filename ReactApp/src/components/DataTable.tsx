import React from 'react';

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keySelector: (row: T) => string | number;
  emptyText?: string;
}

export function DataTable<T>({ columns, data, keySelector, emptyText = 'Kayıt yok' }: DataTableProps<T>) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div style={{ padding: 12, color: '#666' }}>{emptyText}</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keySelector(row)}>
              {columns.map((c) => (
                <td key={String(c.key)} style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>
                  {c.render ? c.render(row) : String((row as any)[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
