const colToIndex = col => {
  let res = 0;
  for (let i = 0; i < col.length; i++) {
    res = res * 26 + (col.charCodeAt(i) - 64);
  }
  return res - 1;
};
const parseAddress = addr => {
  const m = addr.match(/^([A-Z]+)(\d+)$/i);
  if (!m) return null;
  const col = m[1].toUpperCase();
  const row = parseInt(m[2], 10) - 1;
  return { r: row, c: colToIndex(col) };
};
const getCellValue = (cells, address) => {
  const p = parseAddress(address);
  if (!p) return null;
  if (!cells[p.r] || cells[p.r][p.c] === undefined) return "";
  const v = cells[p.r][p.c];
  if (typeof v === "string" && v.startsWith("=")) {
    return evaluateFormula(cells, v);
  }
  return v === "" ? 0 : isNaN(Number(v)) ? v : Number(v);
};
const expandRange = (cells, rangeStr) => {
  const parts = rangeStr.split(":");
  if (parts.length === 1) return [parts[0]];
  const a = parseAddress(parts[0]);
  const b = parseAddress(parts[1]);
  if (!a || !b) return [];
  const res = [];
  for (let r = Math.min(a.r, b.r); r <= Math.max(a.r, b.r); r++) {
    for (let c = Math.min(a.c, b.c); c <= Math.max(a.c, b.c); c++) {
      const col = indexToCol(c);
      res.push(`${col}${r + 1}`);
    }
  }
  return res;
};
const indexToCol = idx => {
  let n = idx + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
};

export function evaluateFormula(cells, formula) {
  if (!formula || formula[0] !== "=") return formula;
  const body = formula.slice(1).trim();
  const fn = body.split("(")[0].toUpperCase();
  const argsRaw = body.substring(body.indexOf("(") + 1, body.lastIndexOf(")"));
  const args = argsRaw.split(",").map(s => s.trim()).filter(Boolean);

  if (fn === "SUM" || fn === "AVERAGE" || fn === "COUNT") {
    let values = [];
    args.forEach(a => {
      if (a.includes(":")) {
        const cellsList = expandRange(cells, a);
        cellsList.forEach(addr => {
          const val = getCellValue(cells, addr);
          if (!isNaN(Number(val))) values.push(Number(val));
        });
      } else {
        const val = getCellValue(cells, a);
        if (!isNaN(Number(val))) values.push(Number(val));
      }
    });
    if (fn === "SUM") return values.reduce((s, x) => s + x, 0);
    if (fn === "AVERAGE") return values.length ? values.reduce((s, x) => s + x, 0) / values.length : 0;
    if (fn === "COUNT") return values.length;
  }

  if (fn === "IF") {
    const cond = args[0];
    const trueVal = args[1] ?? "";
    const falseVal = args[2] ?? "";
    const condEval = cond.replace(/([A-Z]+\d+)/g, m => JSON.stringify(getCellValue(cells, m)));
    try {
      if (eval(condEval)) return isFormulaLike(trueVal) ? evaluateFormula(cells, trueVal) : trueVal;
      else return isFormulaLike(falseVal) ? evaluateFormula(cells, falseVal) : falseVal;
    } catch (e) {
      return falseVal;
    }
  }

  return body;
}

function isFormulaLike(s) {
  return typeof s === "string" && s.startsWith("=");
}
