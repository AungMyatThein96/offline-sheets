(() => {
  const STORAGE_KEY = "offline-sheets-v1";
  const DEFAULT_ROWS = 30;
  const DEFAULT_COLS = 12;
  let data = [];
  let selected = { row: 0, col: 0 };

  const table = document.getElementById("sheet");
  const status = document.getElementById("saveStatus");
  const cellRef = document.getElementById("cellRef");
  const cellValue = document.getElementById("cellValue");

  function columnName(n) {
    let result = "";
    while (n >= 0) {
      result = String.fromCharCode((n % 26) + 65) + result;
      n = Math.floor(n / 26) - 1;
    }
    return result;
  }
  function ensureSize(rows, cols) {
    while (data.length < rows) data.push([]);
    data = data.map(row => {
      while (row.length < cols) row.push("");
      return row;
    });
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      status.textContent = "Saved locally";
    } catch (err) {
      status.textContent = "Save failed";
      console.error(err);
    }
  }
  function load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      data = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(data)) data = [];
    } catch {
      data = [];
    }
    ensureSize(Math.max(DEFAULT_ROWS, data.length), Math.max(DEFAULT_COLS, ...data.map(r => r.length), 0));
  }
  function render() {
    const rows = data.length;
    const cols = Math.max(DEFAULT_COLS, ...data.map(r => r.length), 0);
    ensureSize(rows, cols);
    table.replaceChildren();
    const head = document.createElement("tr");
    const corner = document.createElement("th");
    corner.textContent = "#";
    head.appendChild(corner);
    for (let c = 0; c < cols; c++) {
      const th = document.createElement("th");
      th.textContent = columnName(c);
      head.appendChild(th);
    }
    table.appendChild(head);

    for (let r = 0; r < rows; r++) {
      const tr = document.createElement("tr");
      const rowHead = document.createElement("td");
      rowHead.className = "rowhead";
      rowHead.textContent = String(r + 1);
      tr.appendChild(rowHead);
      for (let c = 0; c < cols; c++) {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.value = data[r][c] ?? "";
        input.setAttribute("aria-label", `${columnName(c)}${r + 1}`);
        input.addEventListener("focus", () => {
          selected = { row: r, col: c };
          syncFormulaBar();
        });
        input.addEventListener("input", () => {
          data[r][c] = input.value;
          status.textContent = "Unsaved changes";
          save();
          cellValue.value = input.value;
        });
        input.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            const next = table.querySelector(`input[aria-label="${columnName(c)}${r + 2}"]`);
            if (next) next.focus();
          }
        });
        td.appendChild(input);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    syncFormulaBar();
  }
  function syncFormulaBar() {
    cellRef.value = `${columnName(selected.col)}${selected.row + 1}`;
    cellValue.value = data[selected.row]?.[selected.col] ?? "";
  }
  function applyCell() {
    ensureSize(selected.row + 1, selected.col + 1);
    data[selected.row][selected.col] = cellValue.value;
    save();
    render();
    const target = table.querySelector(`input[aria-label="${cellRef.value}"]`);
    if (target) target.focus();
  }
  function csvEscape(value) {
    const s = String(value ?? "");
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  function exportCsv() {
    const csv = data.map(row => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "offline-sheets.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function parseCsv(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (quoted) {
        if (ch === '"' && next === '"') { field += '"'; i++; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"' && field === "") quoted = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
      else field += ch;
    }
    if (field.length || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
    return rows;
  }

  document.getElementById("addRow").addEventListener("click", () => {
    data.push(Array(Math.max(DEFAULT_COLS, ...data.map(r => r.length), 0)).fill(""));
    save(); render();
  });
  document.getElementById("addCol").addEventListener("click", () => {
    data.forEach(row => row.push(""));
    save(); render();
  });
  document.getElementById("exportCsv").addEventListener("click", exportCsv);
  document.getElementById("applyValue").addEventListener("click", applyCell);
  cellValue.addEventListener("keydown", e => { if (e.key === "Enter") applyCell(); });
  document.getElementById("importCsv").addEventListener("change", async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const imported = parseCsv(await file.text());
      if (!imported.length) throw new Error("CSV file is empty");
      data = imported;
      ensureSize(Math.max(DEFAULT_ROWS, data.length), Math.max(DEFAULT_COLS, ...data.map(r => r.length), 0));
      selected = { row: 0, col: 0 };
      save(); render();
      status.textContent = "CSV imported";
    } catch (error) {
      alert("Could not import CSV: " + error.message);
    } finally {
      event.target.value = "";
    }
  });
  document.getElementById("clearSheet").addEventListener("click", () => {
    if (!confirm("Clear all cells on this device? Export a CSV backup first if needed.")) return;
    data = Array.from({ length: DEFAULT_ROWS }, () => Array(DEFAULT_COLS).fill(""));
    selected = { row: 0, col: 0 };
    save(); render();
  });

  load();
  render();
})();