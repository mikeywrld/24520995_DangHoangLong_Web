export interface ColumnDef<T> { header: string; accessorKey: keyof T; sortable?: boolean }
export interface DataGridProps<T> { data: T[]; columns: ColumnDef<T>[]; ariaLabel: string; onRowSelect?: (item: T) => void; getRowId: (item: T) => string; }
export interface SortState<T> { key: keyof T; direction: 'asc' | 'desc' }
