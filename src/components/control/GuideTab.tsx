import { useState } from 'react';
import FeedLogo from '@/components/ui/FeedLogo';
import { useRallyStore } from '@/store/rallyStore';

const sections = [
  {
    title: '¿Cómo funciona el sistema?',
    content: `Feed+ Motorsport es un sistema de gráficas en vivo para broadcast. El panel de Control envía datos y comandos a través de un canal de broadcast (BroadcastChannel + Supabase Realtime). La ventana de Output recibe esos comandos y renderiza las gráficas superpuestas.

Cada sesión tiene un Room ID único que vincula una ventana de Control con una o más ventanas de Output. Para conectar OBS, agregá la URL de Output como fuente Browser Source (1920×1080).`,
  },
  {
    title: '¿Cómo conecto Output a OBS?',
    content: `1. Abrí la ventana de Output desde el botón "Output" del panel de Control.
2. En OBS, agregá una fuente "Browser Source" nueva.
3. Ingresá la URL que copiaste con el botón "Copy URL" (incluye el parámetro ?room=...).
4. Configurá el ancho en 1920 y el alto en 1080.
5. Ajustá la frecuencia de actualización a 30 fps o 60 fps.

PWA: También podés abrir Output desde un navegador en otro dispositivo (tablet, celular) y agregarlo como Browser Source en OBS de ese equipo.`,
  },
  {
    title: 'Gráficas disponibles — Rally',
    content: [
      ['Rally Intro', 'Pantalla de apertura full-screen con nombre del evento, edición, locación, fechas, estadísticas e itinerario. Variante Board disponible como card centrada.'],
      ['Stage Presentation', 'Presentación de cada especial con número, nombre, distancia, superficie, hora de salida y récord. Variante Board disponible. Incluye toggle de mini-mapa.'],
      ['Stage Weather', 'Clima del tramo con condición, temperatura, viento, humedad, visibilidad, estado de pista y pronóstico por hora.'],
      ['Crew Lower Third', 'Barra inferior con nombre del piloto, copiloto, equipo y número de auto. Soporta layout horizontal y vertical (torre).'],
      ['Stage Lower Third', 'Barra inferior con número y nombre de la especial, superficie y distancia.'],
      ['Interview Lower Third', 'Barra inferior para entrevistas con nombre y rol.'],
      ['VS Lower Third', 'Comparativa lado a lado entre dos tripulaciones.'],
      ['Scorebug', 'Barra superior con nombre del evento, número de especial, nombre y reloj.'],
      ['Stage Results', 'Tabla de resultados de la especial con posiciones, nombres, tiempos y diferencias.'],
      ['Overall Standings', 'Clasificación general acumulada por suma de tiempos de todas las especiales.'],
      ['Head to Head', 'Comparativa cara a cara entre dos pilotos.'],
      ['Start List', 'Lista de largada con órden de salida.'],
      ['Entries List', 'Lista completa de inscriptos con paginación.'],
      ['Stage Map', 'Mapa del recorrido con trazado GPX, animación de progreso y perfil de elevación.'],
      ['Elevation Profile', 'Perfil de elevación del tramo con datos GPX.'],
      ['Countdown', 'Cuenta regresiva configurable por hora exacta de comienzo.'],
      ['Sponsor Crawl', 'Rotación de sponsors en barra inferior.'],
    ],
  },
  {
    title: 'Gráficas disponibles — Circuito',
    content: [
      ['Circuit Scorebug', 'Barra superior con serie, ronda, circuito, sesión y contador de vueltas.'],
      ['Start Grid', 'Parrilla de largada con posiciones, tiempos de clasificación y diferencias.'],
      ['Live Timing', 'Tabla de tiempos en vivo con vueltas, mejores tiempos, gaps y paradas en pits.'],
      ['Driver Lap Lower Third', 'Barra inferior con datos del piloto en vuelta actual, sector y tiempos.'],
      ['Race Flag', 'Badge compacto de bandera con animación de dos fases: placa de evento → mensaje de bandera.'],
      ['Pit Tracker', 'Tracker de paradas en pits con tiempos y cambio de posición.'],
      ['Podium', 'Podio completo con los 3 primeros, tiempos y mejores vueltas.'],
      ['Final Results', 'Resultados finales de la carrera.'],
    ],
  },
  {
    title: '¿Qué significa cada botón?',
    content: [
      ['TAKE', 'Envía la gráfica al Output. Si la gráfica es full-screen (Rally Intro, Stage Presentation, Stage Weather, Podium), limpia automáticamente todas las demás. Si pertenece a un grupo de conflicto, limpia las del mismo grupo.'],
      ['CLEAR', 'Oculta la gráfica del Output. La gráfica deja de mostrarse pero los datos se conservan en el panel de Control.'],
      ['Clear All', 'Limpia TODAS las gráficas del Output de una sola vez. Aparece solo cuando hay al menos una gráfica en vivo.'],
      ['PRESENTAR', 'En la pestaña Intro / Stages, envía la Stage Presentation directamente. El botón ⛅+ PRESENTAR envía primero el clima y luego la presentación.'],
      ['Full / Board', 'Toggle de variante visual para Stage Presentation y Rally Intro. Full = pantalla completa. Board = card centrada con fondo semitransparente.'],
    ],
  },
  {
    title: 'Pestañas del panel de Control',
    content: [
      ['Importar', 'Importación de datos desde GPX, CSV, JSON, Google Sheets o URLs de sincronización de tiempos.'],
      ['Inscritos', 'Gestión de pilotos/inscriptos con importación desde Google Sheets.'],
      ['Intro / Stages', 'Configuración del rally: datos generales, especiales, presentación, clima. Cada especial es colapsable con acceso rápido a CLEAR y PRESENTAR.'],
      ['Crews', 'Datos de tripulaciones para lower thirds, incluyendo el modo VS (dos tripulaciones lado a lado).'],
      ['Timing', 'Datos de tiempos, resultados de especial, clasificación general, head-to-head, lista de largada y lista de inscriptos. Control de paginación y auto-cycle.'],
      ['Branding', 'Logo del evento, sponsors, cuenta regresiva.'],
      ['Map / Context', 'Carga de archivos GPX para mapa de etapa y perfil de elevación.'],
      ['Style Editor', 'Editor completo de estilo visual: colores, tipografía, esquinas, velocidad de animación, opacidad, presets visuales, layouts por gráfica, etiquetas personalizadas e idioma.'],
    ],
  },
  {
    title: 'Conflictos entre gráficas',
    content: `El sistema maneja grupos de conflicto para evitar que dos gráficas se superpongan en la misma zona de la pantalla:

- Grupo 1 (barra superior): scorebug, circuit scorebug, weather, stage results, overall standings, start list, start grid, pit tracker, final results, race flag.
- Grupo 2 (full-screen): rally intro, stage presentation, stage weather, podium.
- Grupo 3 (central): head to head, countdown.

Cuando hacés TAKE de una gráfica, el sistema automáticamente limpia las demás del mismo grupo. Las gráficas full-screen también limpian todo lo demás.`,
  },
  {
    title: 'Paginación y auto-cycle',
    content: `En la pestaña Timing, los paneles de Stage Results, Overall Standings, Start List y Entries List tienen control de paginación. Podés configurar el tamaño de página (10, 15, 20 o 30 filas) y activar el auto-cycle para que cambie de página automáticamente cada N segundos.

El auto-cycle está desactivado por defecto. Al activarlo, las páginas avanzan solas en el Output. Usá los botones ← y → para navegación manual.`,
  },
  {
    title: 'Layouts y posiciones',
    content: `Cada gráfica tiene una posición y tamaño configurables en Style Editor > Layout. Podés:

- Arrastrar la gráfica dentro del preview para cambiar su posición.
- Ajustar X, Y, ancho, alto, opacidad y escala manualmente.
- Resetear la posición al valor por defecto.
- Guardar y cargar presets de layout completos.

Los cambios de layout se transmiten en vivo al Output.`,
  },
  {
    title: 'Etiquetas personalizadas e idioma',
    content: `En Style Editor > Language podés cambiar entre Español e Inglés para el texto de las gráficas en pantalla.

En Custom Labels podés sobrescribir cualquier texto individualmente. Si una etiqueta no tiene traducción, se usa el término en inglés (Spanglish fallback).`,
  },
  {
    title: 'Preguntas frecuentes',
    content: [
      ['El Output se ve en blanco / no se conecta', 'Verificá que la URL del Browser Source incluya el mismo Room ID que el panel de Control. Refrescá la fuente en OBS. Asegurate de que Output esté abierto.'],
      ['Las gráficas no aparecen en pantalla', 'Primero hacé TAKE de la gráfica deseada desde el panel de Control. La ventana de Output debe estar abierta y conectada con el mismo Room ID.'],
      ['Los cambios de estilo no se ven en Output', 'Los cambios se transmiten automáticamente vía UPDATE_SETTINGS. Si no se reflejan, refrescá la ventana de Output o la fuente de OBS.'],
      ['¿Puedo tener múltiples Outputs?', 'Sí. Podés abrir varias ventanas de Output con el mismo Room ID (en diferentes pestañas o dispositivos). Todas reciben los mismos comandos.'],
      ['¿Cómo comparto datos entre PC y laptop?', 'Usá el mismo Room ID en ambas. El sistema usa BroadcastChannel (mismo origen) y Supabase Realtime (entre dispositivos). Asegurate de tener conexión a internet para el Realtime.'],
      ['¿Los datos se guardan?', 'Los datos persisten en el panel de Control mientras la pestaña esté abierta. Al recargar la página se pierden los datos no guardados en el estado por defecto. Los layouts pueden guardarse en presets de localStorage.'],
    ],
  },
  {
    title: 'Atajos y tips',
    content: [
      ['Usá ⛅+ PRESENTAR', 'El botón combinado envía clima + presentación con 250ms de delay, ideal para transiciones rápidas.'],
      ['Auto-cycle en timing', 'Activá el auto-cycle para que las tablas de resultados avancen solas durante la transmisión.'],
      ['Múltiples outputs', 'Abrí Output en una pestaña separada y también en un celular/tablet como respaldo.'],
      ['Colapsables', 'Las secciones en Style Editor y las especiales en Intro / Stages son colapsables. Hacé clic en el header para expandir/colapsar.'],
      ['Variante Board', 'Usá Board cuando necesitás mostrar la presentación de la especial SIN cubrir toda la pantalla — ideal cuando tenés cámara en vivo de fondo.'],
    ],
  },
];

const Chevron = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <path d="M6 9L12 15L18 9" />
  </svg>
);

const GuideTab = () => {
  const { settings } = useRallyStore();
  const [openSection, setOpenSection] = useState<number | null>(null);
  const p = settings.primaryColor;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#EAEAEA] pb-4">
        <h2 className="text-sm font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>
          Guía de uso · FAQ
        </h2>
        <p className="text-[11px] text-[#787774] mt-1">
          Todo lo que necesitás saber para operar Feed+ Motorsport.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => {
          const isOpen = openSection === i;

          return (
            <div key={i} className="border border-[#EAEAEA] bg-white rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenSection(isOpen ? null : i)}
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#F9F9F8] transition-colors text-left"
              >
                <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#2F3437' }}>
                  {section.title}
                </span>
                <Chevron open={isOpen} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#EAEAEA] pt-3">
                  {Array.isArray(section.content) ? (
                    <div className="space-y-3">
                      {section.content.map((row, ri) => {
                        if (Array.isArray(row)) {
                          const [term, desc] = row;
                          return (
                            <div key={ri} className="flex items-start gap-3">
                              <span
                                className="text-[10px] font-bold tracking-wider uppercase whitespace-nowrap px-2 py-0.5 mt-0.5 shrink-0"
                                style={{ background: `${p}14`, color: p }}
                              >
                                {term}
                              </span>
                              <span className="text-[12px] text-[#5F5F5F] leading-relaxed">{desc}</span>
                            </div>
                          );
                        }
                        return (
                          <p key={ri} className="text-[12px] text-[#5F5F5F] leading-relaxed">{row}</p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#5F5F5F] leading-relaxed">{section.content}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#EAEAEA] pt-4 text-center">
        <p className="text-[10px] text-[#A0A0A0]">
          <FeedLogo size="sm" /> <span className="text-[10px] text-[#A0A0A0]">· v2.0</span>
        </p>
      </div>
    </div>
  );
};

export default GuideTab;
