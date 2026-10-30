import React from 'react';
import {createRoot} from 'react-dom/client';
import {DataGrid} from './DataGrid';
import {students} from './students';
import type {Student} from './students';
import type {ColumnDef} from './types';
import './style.css';
const columns:ColumnDef<Student>[]=[{header:'Student ID',accessorKey:'id',sortable:true},{header:'Full name',accessorKey:'name',sortable:true},{header:'Email',accessorKey:'email'},{header:'Class',accessorKey:'className',sortable:true},{header:'GPA',accessorKey:'gpa',sortable:true}];
createRoot(document.getElementById('root')!).render(<React.StrictMode><header className="topbar"><a href="#main">Campus / Records</a><span>LAB 02 · HOMEWORK 01</span></header><main id="main"><div className="intro"><p className="eyebrow">ACCESSIBLE DATA GRID</p><h1>Student directory</h1><p>Explore, sort and select student records with your mouse or keyboard.</p></div><div className="card"><DataGrid data={students} columns={columns} ariaLabel="Student directory" getRowId={s=>s.id}/></div><footer>Dang Hoang Long · 24520995 <span>60 synthetic records · React + TypeScript</span></footer></main></React.StrictMode>);
