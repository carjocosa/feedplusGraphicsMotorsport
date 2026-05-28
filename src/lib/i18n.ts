export const dict: Record<string, Record<'es' | 'en', string>> = {
  // ── Stage / Map ──
  'STAGE MAP':        { es: 'MAPA DE RUTA',       en: 'STAGE MAP' },
  'ELEVATION PROFILE':{ es: 'PERFIL DE ELEVACIÓN', en: 'ELEVATION PROFILE' },
  START:              { es: 'SALIDA',              en: 'START' },
  FINISH:             { es: 'META',               en: 'FINISH' },
  'No GPX data':      { es: 'Sin datos GPX',      en: 'No GPX data' },
  'Upload a GPX file to show the route':
                        { es: 'Subí un GPX para ver la ruta', en: 'Upload a GPX file to show the route' },
  pts:                { es: 'pts',                 en: 'pts' },
  km:                 { es: 'km',                  en: 'km' },

  // ── Timing / Standings ──
  'STAGE RESULTS':    { es: 'RESULTADOS DEL TRAMO', en: 'STAGE RESULTS' },
  'OVERALL STANDINGS':{ es: 'CLASIFICACIÓN GENERAL', en: 'OVERALL STANDINGS' },
  'START LIST':       { es: 'LISTA DE SALIDA',     en: 'START LIST' },
  'HEAD TO HEAD':     { es: 'CARA A CARA',         en: 'HEAD TO HEAD' },
  LEADER:             { es: 'LÍDER',               en: 'LEADER' },
  FASTEST:            { es: 'MÁS RÁPIDO',          en: 'FASTEST' },
  'ENTRANTS LIST':    { es: 'LISTA DE INSCRIPTOS', en: 'ENTRANTS LIST' },
  ENTRANTS:           { es: 'INSCRIPTOS',          en: 'ENTRANTS' },
  ALL:                { es: 'TODOS',               en: 'ALL' },
  Pos:                { es: 'Pos',                 en: 'Pos' },
  '#':                { es: '#',                   en: '#' },
  Crew:               { es: 'Tripulación',         en: 'Crew' },
  Team:               { es: 'Equipo',              en: 'Team' },
  Cat:                { es: 'Cat',                 en: 'Cat' },
  Time:               { es: 'Tiempo',              en: 'Time' },
  Diff:               { es: 'Dif',                 en: 'Diff' },
  Entries:            { es: 'Inscriptos',          en: 'Entries' },

  // ── Calendar / Labels ──
  'LIVE TIMING':      { es: 'TIEMPOS EN VIVO',    en: 'LIVE TIMING' },
  'sample points':    { es: 'puntos muestra',      en: 'sample points' },
  range:              { es: 'rango',               en: 'range' },

  // ── Weather ──
  'PARTE METEOROLÓGICO': { es: 'PARTE METEOROLÓGICO', en: 'WEATHER REPORT' },
  VIENTO:             { es: 'VIENTO',              en: 'WIND' },
  HUMEDAD:            { es: 'HUMEDAD',             en: 'HUMIDITY' },
  PRECIPITACIÓN:      { es: 'PRECIPITACIÓN',       en: 'PRECIPITATION' },
  VISIBILIDAD:        { es: 'VISIBILIDAD',         en: 'VISIBILITY' },
  PISTA:              { es: 'PISTA',               en: 'TRACK' },
  'PRÓXIMAS HORAS':   { es: 'PRÓXIMAS HORAS',     en: 'NEXT HOURS' },
  SOLEADO:            { es: 'SOLEADO',             en: 'SUNNY' },
  NUBLADO:            { es: 'NUBLADO',             en: 'CLOUDY' },
  LLUVIA:             { es: 'LLUVIA',              en: 'RAIN' },
  NIEVE:              { es: 'NIEVE',               en: 'SNOW' },
  NIEBLA:             { es: 'NIEBLA',              en: 'FOG' },

  // ── Control panel ──
  TAKE:               { es: 'ENVIAR',              en: 'TAKE' },
  CLEAR:              { es: 'LIMPIAR',             en: 'CLEAR' },
  'Clear All':        { es: 'LIMPIAR TODO',        en: 'Clear All' },
  'Copy URL':         { es: 'Copiar URL',          en: 'Copy URL' },
};

export function t(key: string, lang: 'es' | 'en'): string {
  const entry = dict[key];
  if (entry) return entry[lang];
  // Spanglish fallback for untranslated keys
  if (lang === 'es') return key;
  return key;
}

export function label(
  key: string,
  lang: 'es' | 'en',
  customLabels?: Record<string, string>,
): string {
  if (customLabels?.[key]) return customLabels[key];
  return t(key, lang);
}
