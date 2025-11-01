import React, { useEffect, useState, useContext } from "react";
import AuthProvider, { AuthContext } from "./components/AuthContext";
import Login from "./components/Login";
import Toolbar from "./components/Toolbar";
import SpreadsheetGrid from "./components/SpreadsheetGrid";
import { v4 as uuidv4 } from "uuid";
import { saveSheet, getSheetOnce, subscribeSheet } from "./firebase";
import Papa from "papaparse";

function useQuery() {
  return new URLSearchParams(window.location.search);
}

function AppInner() {
  const { user } = useContext(AuthContext);
  const q = useQuery();
  const urlSheet = q.get("sheet");
  const [sheetId, setSheetId] = useState(urlSheet || localStorage.getItem("lastSheet") || uuidv4());
  const [cells, setCells] = useState(Array.from({length:20}, ()=>Array.from({length:10}, ()=>"")));
  const [meta, setMeta] = useState({name: "Untitled", public: false, owner: null});

  useEffect(()=>{
    localStorage.setItem("lastSheet", sheetId);
    let unsub;
    getSheetOnce(sheetId).then(data=>{
      if (data?.cells) setCells(data.cells);
      if (data?.meta) setMeta(data.meta);
    });
    unsub = subscribeSheet(sheetId, data=>{
      if (!data) return;
      if (data.cells) setCells(data.cells);
      if (data.meta) setMeta(data.meta);
    });
    return ()=>{ if (unsub) unsub(); }
  }, [sheetId]);

  useEffect(()=>{
    if (user && !meta.owner) {
      setMeta(prev => ({...prev, owner: user.uid}));
    }
  }, [user]);

  const newSheet = ()=>{
    const id = uuidv4();
    setSheetId(id);
    setCells(Array.from({length:20}, ()=>Array.from({length:10}, ()=>"")));
    setMeta({name: "Untitled", public: false, owner: user?.uid ?? null});
    window.history.replaceState(null, "", `?sheet=${id}`);
  };

  const save = async ()=>{
    await saveSheet(sheetId, { cells, meta: { ...meta, owner: user?.uid ?? meta.owner }});
    alert("Saved");
  };

  const share = async ()=>{
    const link = `${window.location.origin}${window.location.pathname}?sheet=${sheetId}`;
    await saveSheet(sheetId, { meta: { ...meta, public: true, owner: user?.uid ?? meta.owner }});
    navigator.clipboard.writeText(link);
    alert("Share link copied to clipboard:\n" + link);
  };

  const exportCSV = ()=>{
    const out = cells.map(row => row.map(cell => (cell===null ? "" : String(cell))).join(",")).join("\n");
    const blob = new Blob([out], {type: "text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${meta.name || "sheet"}.csv`;
    a.click();
  };

  const importCSV = (e)=>{
    const f = e.target.files[0];
    if (!f) return;
    Papa.parse(f, {
      complete: (res) => {
        const newCells = res.data.map(r => r.concat());
        const cols = Math.max(...newCells.map(r => r.length));
        const normalized = newCells.map(r => {
          while (r.length < cols) r.push("");
          return r;
        });
        setCells(normalized);
      }
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mini Spreadsheet</h1>
        {/* <div className="flex items-center space-x-4">
          <Login />
        </div> */}
      </div>

      <Toolbar
        onNew={newSheet}
        onSave={save}
        onExportCSV={exportCSV}
        sheetId={sheetId}
        onShare={share}
        onImportCSV={importCSV}
      />

      <div className="mt-4">
        <SpreadsheetGrid cells={cells} setCells={setCells} editable={true} />
      </div>

      <div className="mt-3 text-sm text-slate-600">
        <div>Owner: {meta.owner ?? "—"}</div>
        <div>Public: {meta.public ? "Yes" : "No"}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
