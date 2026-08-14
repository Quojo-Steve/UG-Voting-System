import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  className = '',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3 sm:px-6 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50/70 transition-colors">
              {columns.map((col, cIdx) => (
                <td key={cIdx} className={`px-4 py-3.5 sm:px-6 whitespace-nowrap ${col.className || ''}`}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? (row[col.accessorKey] as unknown as React.ReactNode)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
