// Client-side timing scraper — no edge functions needed.
// Returns RAW rows with original field names from the source,
// so the user can map them in the UI.

/**
 * Split a combined "Driver • CoDriver" or "Driver &bull; CoDriver" field
 * into separate driverName and coDriverName fields.
 */
const splitCrewField = (value: string): { driverName: string; coDriverName: string } | null => {
  // Try HTML entity
  const bullHtml = value.split('&bull;');
  if (bullHtml.length === 2) {
    return { driverName: bullHtml[0].trim(), coDriverName: bullHtml[1].trim() };
  }
  // Try unicode bullet
  const bullUni = value.split('•');
  if (bullUni.length === 2) {
    return { driverName: bullUni[0].trim(), coDriverName: bullUni[1].trim() };
  }
  // Try dash separator
  const dash = value.split(' - ');
  if (dash.length === 2 && dash[0].trim().length > 0 && dash[1].trim().length > 0) {
    return { driverName: dash[0].trim(), coDriverName: dash[1].trim() };
  }
  // Try slash separator
  const slash = value.split(' / ');
  if (slash.length === 2 && slash[0].trim().length > 0 && slash[1].trim().length > 0) {
    return { driverName: slash[0].trim(), coDriverName: slash[1].trim() };
  }
  return null;
};

/**
 * Process raw rows: detect combined crew fields and split them.
 */
const processRows = (rows: Record<string, unknown>[]): Record<string, unknown>[] => {
  return rows.map(row => {
    const newRow = { ...row };
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && /(&bull;|•)/.test(value)) {
        const split = splitCrewField(value);
        if (split) {
          newRow.driverName = split.driverName;
          newRow.coDriverName = split.coDriverName;
          // Keep original field too for reference
          newRow[`_original_${key}`] = value;
        }
      }
    }
    return newRow;
  });
};

/**
 * Try to parse text as JSON and return raw rows with ORIGINAL field names.
 */
export const tryParseJSON = (text: string): Record<string, unknown>[] | null => {
  try {
    const data = JSON.parse(text);

    const extractArray = (obj: unknown): unknown[] | null => {
      if (Array.isArray(obj)) return obj;
      if (obj && typeof obj === 'object') {
        // Try common keys that contain row arrays
        for (const key of ['rows', 'data', 'results', 'timing', 'entries', 'standings', 'standingsList', 'stageResults', 'overallStandings', 'competitors', 'drivers']) {
          if ((obj as Record<string, unknown>)[key] && Array.isArray((obj as Record<string, unknown>)[key])) {
            return (obj as Record<string, unknown>)[key] as unknown[];
          }
        }
        // Try first array value in object
        for (const val of Object.values(obj as Record<string, unknown>)) {
          if (Array.isArray(val)) return val;
        }
      }
      return null;
    };

    const arr = extractArray(data);
    if (!arr || arr.length === 0) return null;

    // Check if items are objects (timing rows) or primitives
    if (typeof arr[0] !== 'object' || arr[0] === null) return null;

    const raw = arr.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item as Record<string, unknown>;
      }
      return {};
    }).filter(r => Object.keys(r).length > 0);

    return processRows(raw);
  } catch {
    return null;
  }
};

/**
 * Extract timing data from HTML tables.
 * Returns rows with column names from <th> headers, or col_0, col_1, etc.
 */
export const extractFromHTML = (html: string): Record<string, unknown>[] => {
  const rows: Record<string, unknown>[] = [];

  // First, try to find header row to get column names
  const headerRegex = /<t[hH][^>]*>([\s\S]*?)<\/t[hH]>/g;
  const headers: string[] = [];
  let headerMatch;
  while ((headerMatch = headerRegex.exec(html)) !== null) {
    const text = headerMatch[1].replace(/<[^>]*>/g, '').trim();
    if (text) headers.push(text);
  }

  // Extract table rows
  const tableRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const rowContent = tableMatch[1];
    const cellRegex = /<t[dD][^>]*>([\s\S]*?)<\/t[dD]>/gi;
    const cells: string[] = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const text = cellMatch[1].replace(/<[^>]*>/g, '').trim();
      if (text) cells.push(text);
    }

    if (cells.length >= 2) {
      const row: Record<string, unknown> = {};
      cells.forEach((cell, i) => {
        const colName = headers[i] || `col_${i}`;
        row[colName] = cell;
      });
      rows.push(row);
    }
  }

  return processRows(rows);
};

/**
 * Main entry point: fetch URL and parse timing data.
 * Returns raw rows with original field names for UI mapping.
 */
export const fetchTiming = async (url: string): Promise<Record<string, unknown>[]> => {
  // Try direct fetch first
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'text/html,application/json,*/*' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();

    // Try JSON first
    const jsonRows = tryParseJSON(text);
    if (jsonRows && jsonRows.length > 0) return jsonRows;

    // Try HTML
    const htmlRows = extractFromHTML(text);
    if (htmlRows.length > 0) return htmlRows;
  } catch {
    // If direct fetch fails (CORS), try with a public CORS proxy
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      const proxyData = await res.json();

      if (proxyData?.contents) {
        const text = proxyData.contents;

        const jsonRows = tryParseJSON(text);
        if (jsonRows && jsonRows.length > 0) return jsonRows;

        const htmlRows = extractFromHTML(text);
        if (htmlRows.length > 0) return htmlRows;
      }
    } catch {
      // Proxy also failed
    }
  }

  throw new Error('No timing data found. The page may use JavaScript to load data dynamically.');
};

/**
 * Convert a Google Sheets published HTML URL to CSV URL.
 * pubhtml → pub?output=csv
 */
const toCsvUrl = (url: string): string | null => {
  if (!url.includes('docs.google.com/spreadsheets') && !url.includes('pubhtml')) return null;
  return url.replace(/\/pubhtml.*/, '/pub?output=csv');
};

/**
 * Parse CSV text into rows with headers.
 * Auto-detects the header row (useful for Google Sheets where row 1-2 may be title/description).
 */
const parseCSV = (text: string): Record<string, unknown>[] => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  // Simple CSV parser (handles quoted fields)
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Auto-detect header row: find the row with the most non-empty cells
  // that looks like headers (short text, not all numeric)
  let headerIdx = 0;
  let headerScore = -1;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const cells = parseLine(lines[i]);
    const nonEmpty = cells.filter(c => c.trim()).length;
    const hasNumbers = cells.some(c => /^\d+$/.test(c.trim()));
    const score = nonEmpty - (hasNumbers ? 2 : 0);
    if (score > headerScore) {
      headerScore = score;
      headerIdx = i;
    }
  }

  const headers = parseLine(lines[headerIdx]);
  const rows: Record<string, unknown>[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length < 2) continue;
    const row: Record<string, unknown> = {};
    headers.forEach((h, j) => {
      row[h] = cells[j] || '';
    });
    rows.push(row);
  }

  return processRows(rows);
};

/**
 * Fetch entries from a Google Sheets published URL.
 * Converts to CSV for reliable parsing.
 */
export const fetchEntries = async (url: string): Promise<Record<string, unknown>[]> => {
  const csvUrl = toCsvUrl(url);
  if (!csvUrl) {
    // Try as regular URL
    return fetchTiming(url);
  }

  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length > 0) return rows;
  } catch {
    // Fallback to CORS proxy
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(csvUrl)}`;
      const res = await fetch(proxyUrl);
      const proxyData = await res.json();
      if (proxyData?.contents) {
        const rows = parseCSV(proxyData.contents);
        if (rows.length > 0) return rows;
      }
    } catch {
      // Proxy also failed
    }
  }

  throw new Error('No entries found. Check the Google Sheets URL is publicly accessible.');
};

/**
 * Map raw scraped entry to Entry interface fields.
 * Returns the mapping of source fields → target fields.
 */
export const ENTRY_FIELDS = [
  { key: 'carNumber', label: 'Nº' },
  { key: 'driverName', label: 'Piloto' },
  { key: 'coDriverName', label: 'Copiloto' },
  { key: 'driverCountry', label: 'País Piloto' },
  { key: 'coDriverCountry', label: 'País Copiloto' },
  { key: 'team', label: 'Equipo' },
  { key: 'car', label: 'Auto' },
  { key: 'category', label: 'Categoría' },
];
