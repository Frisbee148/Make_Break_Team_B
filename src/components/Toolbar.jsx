import React from "react";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";

export default function Toolbar({
  onNew,
  onSave,
  onExportCSV,
  sheetId,
  onShare,
  onImportCSV
}) {
  return (
    <div className="flex items-center justify-between bg-white p-3 shadow-sm rounded">
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={onNew}>New Sheet</button>
        {/* <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={onSave}>Save</button> */}
        <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={onExportCSV}>Export CSV</button>
        <label className="px-3 py-1 bg-gray-200 rounded cursor-pointer">
          Import CSV
          <input type="file" accept=".csv" className="hidden" onChange={onImportCSV} />
        </label>
        {/* <button className="px-3 py-1 bg-yellow-500 text-white rounded" onClick={onShare}>Share</button> */}
      </div>
      <div className="text-sm text-slate-600">Sheet ID: <span className="font-mono">{sheetId}</span></div>
    </div>
  );
}
