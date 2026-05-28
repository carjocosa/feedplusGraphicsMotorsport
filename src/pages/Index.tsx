import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedLogo from '@/components/ui/FeedLogo';

const Index = () => {
  useEffect(() => { document.title = 'Feed+ Motorsport — Broadcast Graphics  |  by Studio+'; }, []);
  const openOutput = () => {
    window.open('/output', 'feed-output', 'width=1920,height=1080');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F0F11' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
          <FeedLogo variant="light" size="xl" />

          <p
            className="text-center text-sm font-medium tracking-[0.15em] uppercase"
            style={{ color: '#8A8A9A', fontFamily: 'Inter, sans-serif', letterSpacing: '0.15em' }}
          >
            Broadcast Graphics Suite
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
            <Link
              to="/control"
              className="group relative flex flex-col items-center gap-3 px-8 py-8 overflow-hidden transition-all duration-300"
              style={{
                background: '#1A1A1E',
                border: '1px solid #2A2A2E',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.background = '#1A1A1E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.background = '#1A1A1E'; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                <path d="M4 2L20 2" /><path d="M4 6L20 6" /><path d="M4 10L20 10" /><path d="M4 14L20 14" /><rect x="2" y="16" width="20" height="6" rx="1" />
              </svg>
              <div className="text-center">
                <div className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#E8E8F0', fontFamily: 'Inter, sans-serif' }}>Control Panel</div>
                <div className="text-[10px] mt-1 tracking-wider" style={{ color: '#6A6A7A' }}>Operar gráficas en vivo</div>
              </div>
            </Link>

            <button
              onClick={openOutput}
              className="group relative flex flex-col items-center gap-3 px-8 py-8 overflow-hidden transition-all duration-300"
              style={{
                background: '#1A1A1E',
                border: '1px solid #2A2A2E',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.background = '#1A1A1E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.background = '#1A1A1E'; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><path d="M8 21H16" /><path d="M12 17V21" />
              </svg>
              <div className="text-center">
                <div className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#E8E8F0', fontFamily: 'Inter, sans-serif' }}>Output</div>
                <div className="text-[10px] mt-1 tracking-wider" style={{ color: '#6A6A7A' }}>Browser source para OBS</div>
              </div>
            </button>

            <Link
              to="/live-rally"
              className="group relative flex flex-col items-center gap-3 px-8 py-8 overflow-hidden transition-all duration-300"
              style={{
                background: '#1A1A1E',
                border: '1px solid #2A2A2E',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.background = '#1A1A1E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.background = '#1A1A1E'; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" />
                <path d="M22 4L12 14.01L9 11.01" />
              </svg>
              <div className="text-center">
                <div className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#E8E8F0', fontFamily: 'Inter, sans-serif' }}>Live Rally</div>
                <div className="text-[10px] mt-1 tracking-wider" style={{ color: '#6A6A7A' }}>Timing en vivo</div>
              </div>
            </Link>

            <Link
              to="/admin"
              className="group relative flex flex-col items-center gap-3 px-8 py-8 overflow-hidden transition-all duration-300"
              style={{
                background: '#1A1A1E',
                border: '1px solid #2A2A2E',
                borderRadius: '4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.background = '#1A1A1E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.background = '#1A1A1E'; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:scale-110">
                <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <div className="text-center">
                <div className="text-sm font-bold tracking-[0.08em] uppercase" style={{ color: '#E8E8F0', fontFamily: 'Inter, sans-serif' }}>Admin</div>
                <div className="text-[10px] mt-1 tracking-wider" style={{ color: '#6A6A7A' }}>Gestión de datos</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ background: '#FF6B0018', color: '#FF6B00', borderRadius: '2px' }}>Rally</span>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ background: '#FFB80018', color: '#FFB800', borderRadius: '2px' }}>Karting</span>
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ background: '#0EA5E918', color: '#0EA5E9', borderRadius: '2px' }}>Circuito</span>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid #1A1A1E' }}>
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <FeedLogo variant="light" size="sm" />
          <div className="flex items-center gap-6">
            {[
              { n: '24', l: 'Graphics' },
              { n: '15', l: 'Control Tabs' },
              { n: '∞', l: 'Presets' },
              { n: '0', l: 'Backend' },
            ].map(item => (
              <div key={item.l} className="text-center">
                <div className="text-sm font-bold" style={{ color: '#FF6B00', fontFamily: 'Inter, sans-serif' }}>{item.n}</div>
                <div className="text-[8px] tracking-[0.12em] uppercase mt-0.5" style={{ color: '#5A5A6A' }}>{item.l}</div>
              </div>
            ))}
          </div>
          <span className="text-[9px] tracking-[0.1em]" style={{ color: '#5A5A6A', fontFamily: 'Inter, sans-serif' }}>
            by Studio+
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
