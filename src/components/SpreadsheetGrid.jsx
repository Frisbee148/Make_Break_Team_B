import React, { useState, useEffect, useRef } from "react";
import { evaluateFormula } from "../utils/formula";

function makeEmpty(rows = 20, cols = 10) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
}

export default function SpreadsheetGrid({ cells, setCells, editable=true }) {
  const [editing, setEditing] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const rendered = (r,c) => {
    const val = cells?.[r]?.[c] ?? "";
    if (typeof val === "string" && val.startsWith("=")) {
      try {
        const out = evaluateFormula(cells, val);
        return out;
      } catch (e) {
        return "#ERR";
      }
    }
    return val;
  };

  const handleChange = (r,c,v) => {
    const copy = cells.map(row => [...row]);
    copy[r][c] = v;
    setCells(copy);
  };

  const rows = Math.max(20, cells.length || 20);
  const cols = Math.max(10, (cells[0] ? cells[0].length : 10));
  return (
    <div className="overflow-auto border bg-white">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-1 border bg-slate-100 w-10"></th>
            {Array.from({length: cols}).map((_,c)=>(
              <th key={c} className="p-1 border text-center font-medium">{String.fromCharCode(65+c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({length: rows}).map((_,r)=>(
            <tr key={r}>
              <td className="p-1 border text-center">{r+1}</td>
              {Array.from({length: cols}).map((_,c)=>(
                <td key={c} className="p-0 border">
                  {editing && editing.r===r && editing.c===c && editable ? (
                    <input
                      ref={inputRef}
                      className="w-full h-8 px-1"
                      value={cells?.[r]?.[c] ?? ""}
                      onChange={e=>handleChange(r,c,e.target.value)}
                      onBlur={()=>setEditing(null)}
                      onKeyDown={e => { if (e.key==='Enter') setEditing(null); }}
                    />
                  ) : (
                    <div
                      className="h-8 px-1 text-left cursor-text"
                      onDoubleClick={()=>editable && setEditing({r,c})}
                      onClick={()=>editable && setEditing({r,c})}
                      title={cells?.[r]?.[c] ?? ""}
                    >
                      {String(rendered(r,c))}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
