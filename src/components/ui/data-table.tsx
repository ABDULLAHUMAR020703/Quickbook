'use client'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  className?: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ columns, data, loading, emptyMessage = 'No data found', rowKey, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full data-table">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  !col.align && 'text-left',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-sm text-slate-700',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className
                  )}
                >
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TableActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  )
}

export function TableAction({
  label, onClick, color = 'indigo'
}: { label: string; onClick: () => void; color?: 'indigo' | 'green' | 'red' | 'amber' }) {
  const colors = {
    indigo: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50',
    green:  'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50',
    red:    'text-red-500 hover:text-red-700 hover:bg-red-50',
    amber:  'text-amber-600 hover:text-amber-800 hover:bg-amber-50',
  }
  return (
    <button
      onClick={onClick}
      className={cn('text-xs font-semibold px-2 py-1 rounded-md transition-colors', colors[color])}
    >
      {label}
    </button>
  )
}
