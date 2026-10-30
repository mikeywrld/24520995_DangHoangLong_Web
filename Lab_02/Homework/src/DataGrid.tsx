import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { DataGridProps, SortState } from './types';
import { filterRows, sortRows, paginateRows, nextCell } from './model';
export function DataGrid<T>({data,columns,ariaLabel,getRowId,onRowSelect}:DataGridProps<T>) {
 const uid=useId();
 const [query,setQuery]=useState(''),[sort,setSort]=useState<SortState<T>|null>(null);
 const [page,setPage]=useState(0),[size,setSize]=useState(10),[selected,setSelected]=useState<string|null>(null);
 const [active,setActive]=useState({id:'@header',col:0});
 const table=useRef<HTMLTableElement>(null), focusInside=useRef(false);
 const filtered=filterRows(data,columns,query), sorted=sortRows(filtered,sort);
 const paging=paginateRows(sorted,page,size), visible=paging.rows;
 const validId=active.id==='@header'||visible.some(x=>getRowId(x)===active.id)?active.id:'@header';
 const validCol=Math.min(active.col,Math.max(0,columns.length-1));
 useLayoutEffect(()=>{
  if (active.id!==validId || active.col!==validCol) {
   setActive({id:validId,col:validCol});
   if(focusInside.current) table.current?.querySelector<HTMLElement>(`[data-r="0"][data-c="${validCol}"]`)?.focus();
  }
 },[active.id,active.col,validId,validCol]);
 const choose=(item:T,toggle=false)=>{const id=getRowId(item); const next=toggle&&selected===id?null:id;setSelected(next);if(next!==null)onRowSelect?.(item);};
 const keydown=(e:KeyboardEvent<HTMLElement>,r:number,c:number,item?:T)=>{
  if(e.key.startsWith('Arrow')){
   e.preventDefault();const target=nextCell(r,c,e.key,visible.length+1,columns.length);
   table.current?.querySelector<HTMLElement>(`[data-r="${target.row}"][data-c="${target.col}"]`)?.focus();
  } else if(item && (e.key==='Enter'||e.key===' ')){e.preventDefault();choose(item,e.key===' ');}
 };
 const attrs=(r:number,c:number,id:string)=>({
  'data-r':r,'data-c':c, tabIndex:validId===id&&validCol===c?0:-1,
  onFocus:()=>{focusInside.current=true;setActive({id,col:c});},
 });
 const selectedExists=selected!==null&&data.some(x=>getRowId(x)===selected);
 return <section aria-label="Student records controls">
  <div className="toolbar"><div className="search"><label htmlFor={`${uid}-search`}>Search records</label><input id={`${uid}-search`} type="search" placeholder="Search ID, name, email, class or GPA" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} /></div><div><label htmlFor={`${uid}-size`}>Rows per page</label><select id={`${uid}-size`} value={size} onChange={e=>{setSize(Number(e.target.value));setPage(0);}}>{[10,20,50].map(n=><option key={n}>{n}</option>)}</select></div></div>
  <div className="summary"><p role="status">{filtered.length} results · {selectedExists?`Selected: ${selected}`:'No row selected'}</p><span className="badge">Single-row selection</span></div>
  <p id={`${uid}-help`} className="help">Use arrow keys to move. Enter selects a row; Space toggles it. In a column header, Enter or Space sorts. Tab leaves the grid.</p>
  <div className="table-wrap"><table ref={table} role="grid" aria-label={ariaLabel} aria-describedby={`${uid}-help`} aria-rowcount={filtered.length+1} aria-colcount={columns.length} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))focusInside.current=false;}}>
   <thead><tr role="row" aria-rowindex={1}>{columns.map((column,c)=><th key={String(column.accessorKey)} role="columnheader" scope="col" aria-sort={sort?.key===column.accessorKey?(sort.direction==='asc'?'ascending':'descending'):undefined}>
    {column.sortable?<button {...attrs(0,c,'@header')} onKeyDown={e=>keydown(e,0,c)} onClick={()=>{setSort({key:column.accessorKey,direction:sort?.key===column.accessorKey&&sort.direction==='asc'?'desc':'asc'});setPage(0);}}>{column.header}<span aria-hidden="true"> {sort?.key===column.accessorKey?(sort.direction==='asc'?'↑':'↓'):'↕'}</span></button>:<span {...attrs(0,c,'@header')} onKeyDown={e=>keydown(e,0,c)}>{column.header}</span>}
   </th>)}</tr></thead>
   <tbody>{visible.map((item,r)=>{const id=getRowId(item);return <tr key={id} role="row" aria-rowindex={paging.pageIndex*size+r+2} aria-selected={selected===id} className={selected===id?'selected':''}>{columns.map((column,c)=><td role="gridcell" key={String(column.accessorKey)} {...attrs(r+1,c,id)} onKeyDown={e=>keydown(e,r+1,c,item)} onClick={e=>{e.currentTarget.focus();choose(item);}}>{c===0&&selected===id&&<span aria-hidden="true">✓ </span>}{String(item[column.accessorKey]??'—')}</td>)}</tr>;})}</tbody>
  </table>{visible.length===0&&<div className="empty"><strong>No matching records</strong><p>Try another keyword or clear your search.</p><button onClick={()=>{setQuery('');setPage(0);document.getElementById(`${uid}-search`)?.focus();}}>Clear search</button></div>}</div>
  <div className="pagination"><p>{filtered.length?`${paging.pageIndex*size+1}–${Math.min((paging.pageIndex+1)*size,filtered.length)} of ${filtered.length} records`:'0 records'}</p><nav aria-label="Table pagination"><button disabled={paging.pageIndex===0} onClick={e=>{setPage(paging.pageIndex-1);if(paging.pageIndex===1)e.currentTarget.parentElement?.focus();}}>Previous</button><span tabIndex={-1} ref={el=>{if(el?.parentElement)el.parentElement.tabIndex=-1;}}>Page {paging.pageIndex+1} of {paging.totalPages}</span><button disabled={!filtered.length||paging.pageIndex===paging.totalPages-1} onClick={e=>{setPage(paging.pageIndex+1);if(paging.pageIndex===paging.totalPages-2)e.currentTarget.parentElement?.focus();}}>Next</button></nav></div>
 </section>;
}
