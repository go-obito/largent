export function parseCsvRows(csv: string): string[][] {
  if (!csv.trim()) throw new Error("The CSV file is empty.");

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unfinished quoted field.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("The CSV must contain a header and at least one transaction row.");

  const columnCount = rows[0].length;
  if (columnCount < 3 || rows.slice(1).some((values) => values.length > columnCount)) {
    throw new Error("The CSV contains unreadable rows or too few columns.");
  }

  return rows.map((values) => Array.from({ length: columnCount }, (_, index) => values[index] ?? ""));
}

export function parseCsvDate(value: string): string | null {
  const input = value.trim();
  let year: number;
  let month: number;
  let day: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input);

  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else {
    const slash = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(input);
    if (!slash) return null;
    const first = Number(slash[1]);
    const second = Number(slash[2]);
    year = Number(slash[3]);
    if (first > 12) {
      day = first;
      month = second;
    } else if (second > 12) {
      month = first;
      day = second;
    } else {
      month = first;
      day = second;
    }
  }

  const parsed = new Date(Date.UTC(year, month - 1, day, 12));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
  return parsed.toISOString();
}