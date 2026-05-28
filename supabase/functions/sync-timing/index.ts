// Scrapes a public live timing page (Race Monitor, Z-Round, Cronotec, etc.)
// No external API keys needed — uses direct fetch + HTML table extraction.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface TimingRow {
  position: number;
  carNumber: string;
  driverName: string;
  coDriverName?: string;
  team?: string;
  lap?: number;
  gap?: string;
  interval?: string;
  lastLap?: string;
  bestLap?: string;
  time?: string;
  diff?: string;
  pitStops?: number;
  status?: string;
}

// Try to parse a table row into a timing entry
const parseTableRow = (cells: string[], i: number): TimingRow | null => {
  const clean = (v: string) => v.trim().replace(/[\u00A0]/g, ' ');
  const toNum = (v: string): number | null => {
    const s = clean(v).replace(',', '.').replace(/[^0-9.\-]/g, '');
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // Skip header rows
  const hasNumber = cells.some(c => /^\d+$/.test(clean(c)));
  if (!hasNumber) return null;

  // Try to identify columns by content patterns
  const findCarNumber = (): string => {
    // Look for short numeric strings (1-4 digits) that could be car numbers
    for (const c of cells) {
      const s = clean(c);
      if (/^\d{1,4}$/.test(s)) return s;
    }
    return '';
  };

  const findPosition = (): number => {
    // First cell is often position
    const first = toNum(cells[0]);
    if (first !== null && first > 0 && first <= cells.length) return first;
    // Or look for sequential numbers
    for (const c of cells) {
      const n = toNum(c);
      if (n !== null && n > 0 && n <= 200) return n;
    }
    return i + 1;
  };

  const findTime = (): string => {
    // Look for mm:ss.s or mm:ss.sss patterns
    for (const c of cells) {
      const s = clean(c);
      if (/^\d{1,2}:\d{2}(\.\d+)?$/.test(s)) return s;
    }
    return '';
  };

  const findGap = (): string => {
    for (const c of cells) {
      const s = clean(c);
      if (/^[+L]\d/.test(s) || /^\+\d/.test(s) || /^1L$/.test(s) || /^2L$/.test(s)) return s;
    }
    return '';
  };

  const findBestLap = (): string => {
    for (const c of cells) {
      const s = clean(c);
      if (/^\d{1,2}:\d{2}(\.\d{1,3})?$/.test(s)) return s;
    }
    return '';
  };

  const carNumber = findCarNumber();
  if (!carNumber) return null;

  return {
    position: findPosition(),
    carNumber,
    driverName: cells.find(c => clean(c).length > 3 && !/^\d/.test(clean(c)) && !/[:+]/.test(clean(c)))?.trim() || '',
    time: findTime(),
    gap: findGap(),
    bestLap: findBestLap(),
  };
};

// Extract timing data from HTML
const extractFromHTML = (html: string, hint: string): TimingRow[] => {
  const rows: TimingRow[] = [];

  // Extract all table rows
  const tableRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const rowContent = tableMatch[1];
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      // Strip HTML tags from cell content
      const text = cellMatch[1].replace(/<[^>]*>/g, '').trim();
      if (text) cells.push(text);
    }

    if (cells.length >= 3) {
      const parsed = parseTableRow(cells, rows.length);
      if (parsed && parsed.driverName) {
        rows.push(parsed);
      }
    }
  }

  return rows;
};

// Try to parse as JSON directly
const tryParseJSON = (text: string): TimingRow[] | null => {
  try {
    const data = JSON.parse(text);

    // Direct array of timing rows
    if (Array.isArray(data)) {
      return data.map((row, i) => ({
        position: row.position ?? row.Pos ?? row.pos ?? i + 1,
        carNumber: String(row.carNumber ?? row.CarNo ?? row.car_number ?? row.number ?? ''),
        driverName: String(row.driverName ?? row.Driver ?? row.driver ?? row.name ?? ''),
        coDriverName: row.coDriverName ?? row.CoDriver ?? row.codriver ?? undefined,
        team: row.team ?? row.Team ?? row.entrant ?? undefined,
        lap: row.lap ?? row.Lap ?? undefined,
        gap: row.gap ?? row.Gap ?? row.diff ?? undefined,
        interval: row.interval ?? row.Interval ?? undefined,
        lastLap: row.lastLap ?? row.LastLap ?? row.last_lap ?? undefined,
        bestLap: row.bestLap ?? row.BestLap ?? row.best_lap ?? undefined,
        time: row.time ?? row.Time ?? row.totalTime ?? row.total_time ?? undefined,
        diff: row.diff ?? row.Diff ?? undefined,
        pitStops: row.pitStops ?? row.PitStops ?? undefined,
        status: row.status ?? row.Status ?? undefined,
      })).filter(r => r.carNumber || r.driverName);
    }

    // Nested object with rows array
    if (data.rows && Array.isArray(data.rows)) {
      return tryParseJSON(JSON.stringify(data.rows));
    }

    // Nested object with data array
    if (data.data && Array.isArray(data.data)) {
      return tryParseJSON(JSON.stringify(data.data));
    }

    // Nested object with results array
    if (data.results && Array.isArray(data.results)) {
      return tryParseJSON(JSON.stringify(data.results));
    }

    // Nested object with timing array
    if (data.timing && Array.isArray(data.timing)) {
      return tryParseJSON(JSON.stringify(data.timing));
    }

    return null;
  } catch {
    return null;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const url: string | undefined = body?.url;
    const hint: string | undefined = body?.hint;

    if (!url || !/^https?:\/\//.test(url)) {
      return new Response(
        JSON.stringify({ error: 'Provide a valid http(s) url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch the URL directly
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RallyStream/1.0)',
        'Accept': 'text/html,application/json,*/*',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();

    // Try JSON first
    const jsonRows = tryParseJSON(text);
    if (jsonRows && jsonRows.length > 0) {
      return new Response(
        JSON.stringify({ success: true, rows: jsonRows, source: 'json' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Try HTML table extraction
    const htmlRows = extractFromHTML(text, hint || '');
    if (htmlRows.length > 0) {
      return new Response(
        JSON.stringify({ success: true, rows: htmlRows, source: 'html' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'No timing data found. The page may use JavaScript to load data, or the format is not recognized.',
      }),
      { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('sync-timing error', err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
