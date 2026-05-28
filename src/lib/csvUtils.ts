export interface CsvParseOptions {
  hasHeader?: boolean;
  delimiter?: string;
}

export function parseCsv(text: string, options: CsvParseOptions = {}): Record<string, string>[] {
  const { hasHeader = false, delimiter = ',' } = options;
  const lines = text.trim().split('\n').map(l => l.split(delimiter).map(s => s.trim()));

  if (lines.length === 0) return [];

  if (hasHeader) {
    const headers = lines[0];
    return lines.slice(1).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
  }

  return lines.map(row => {
    const obj: Record<string, string> = {};
    row.forEach((val, i) => { obj[`col${i}`] = val; });
    return obj;
  });
}

export function parseCsvToArray<T>(text: string, mapper: (row: string[], index: number) => T): T[] {
  const lines = text.trim().split('\n').map(l => l.split(',').map(s => s.trim()));
  return lines.map((row, i) => mapper(row, i));
}
