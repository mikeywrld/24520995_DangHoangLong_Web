import type { ColumnDef, SortState } from './types';
export const normalize = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase('en');
export function filterRows<T>(rows: T[], columns: ColumnDef<T>[], query: string): T[] {
 const q = normalize(query); return rows.filter(row => columns.some(c => normalize(row[c.accessorKey]).includes(q)));
}
export function sortRows<T>(rows: T[], sort: SortState<T> | null): T[] {
 if (!sort) return [...rows];
 return rows.map((row,index)=>({row,index})).sort((a,b)=>{
 const x=a.row[sort.key], y=b.row[sort.key];
 if (x == null && y == null) return a.index-b.index;
 if (x == null) return 1; if (y == null) return -1;
 const cmp=typeof x==='number' && typeof y==='number' ? x-y : String(x).localeCompare(String(y),'en');
 return (sort.direction==='asc' ? cmp : -cmp) || a.index-b.index;
 }).map(x=>x.row);
}
export function paginateRows<T>(rows:T[], page:number, size:number) {
 if (!Number.isInteger(size) || size<1) throw new RangeError('Page size must be a positive integer');
 const totalPages=Math.max(1, Math.ceil(rows.length/size));
 const pageIndex=Math.max(0,Math.min(Number.isFinite(page)?Math.floor(page):0,totalPages-1));
 return { rows:rows.slice(pageIndex*size,(pageIndex+1)*size),pageIndex,totalPages };
}
export function nextCell(row:number,col:number,key:string,rowCount:number,colCount:number) {
 const r=row+(key==='ArrowDown'?1:key==='ArrowUp'?-1:0);
 const c=col+(key==='ArrowRight'?1:key==='ArrowLeft'?-1:0);
 return {row:Math.max(0,Math.min(r,rowCount-1)),col:Math.max(0,Math.min(c,colCount-1))};
}
