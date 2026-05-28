import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventInfoTab from '@/components/control/EventInfoTab';
import EntriesTab from '@/components/control/EntriesTab';
import CircuitEntriesTab from '@/components/control/circuit/CircuitEntriesTab';
import BrandingTab from '@/components/control/BrandingTab';
import RallyTimingSyncPanel from '@/components/control/RallyTimingSyncPanel';
import TimingSyncPanel from '@/components/control/circuit/TimingSyncPanel';
import FeedLogo from '@/components/ui/FeedLogo';
import Footer from '@/components/ui/Footer';

const noop = () => {};
const empty = new Set<string>();

const Admin = () => {
  useEffect(() => { document.title = 'Feed+ Motorsport — Admin  |  by Studio+'; }, []);
  return (
    <div className="min-h-screen" style={{ background: '#0F0F11' }}>
      <header className="sticky top-0 z-50 border-b" style={{ background: '#1A1A1E', borderColor: '#2A2A2E' }}>
        <div className="px-6 py-3 flex items-center justify-between">
          <FeedLogo variant="light" size="sm" />

          <div className="flex items-center gap-2">
            <Link to="/control" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all" style={{ borderColor: '#2A2A2E', color: '#6A6A7A' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#E8E8F0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.color = '#6A6A7A'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 2L20 2" /><path d="M4 6L20 6" /><path d="M4 10L20 10" /><path d="M4 14L20 14" /><rect x="2" y="16" width="20" height="6" rx="1" />
              </svg>
              <span className="hidden sm:inline">Control</span>
            </Link>
            <Link to="/live-rally" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all" style={{ borderColor: '#2A2A2E', color: '#6A6A7A' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#E8E8F0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.color = '#6A6A7A'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" />
                <path d="M22 4L12 14.01L9 11.01" />
              </svg>
              <span className="hidden sm:inline">Live</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm border transition-all" style={{ borderColor: '#2A2A2E', color: '#6A6A7A' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#E8E8F0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2E'; e.currentTarget.style.color = '#6A6A7A'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9L12 2L21 9V20C21 20.5 20.6 21 20 21H4C3.4 21 3 20.5 3 20V9Z" />
              </svg>
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="p-4">
        <p className="text-xs mb-4" style={{ color: '#6A6A7A', letterSpacing: '0.02em' }}>
          Cargá una sola vez los datos del evento, los inscritos y el branding. El Control Panel y la página Live tomarán estos datos por dropdown o por <span className="font-bold" style={{ color: '#FF6B00' }}>match automático por nº de auto</span>.
        </p>

        <Tabs defaultValue="event" className="w-full">
          <TabsList
            className="flex gap-0 h-auto p-0 w-full justify-start rounded-sm overflow-hidden mb-4 flex-wrap"
            style={{ background: '#1A1A1E', border: '1px solid #2A2A2E' }}
          >
            <Tab label="📋 Evento" value="event" />
            <Tab label="👥 Rally" value="rally-entries" />
            <Tab label="🏁 Circuito" value="circuit-entries" />
            <Tab label="🎨 Branding" value="branding" />
            <Tab label="🔄 Sync" value="sync" />
          </TabsList>

          <TabsContent value="event"><EventInfoTab /></TabsContent>
          <TabsContent value="rally-entries"><EntriesTab /></TabsContent>
          <TabsContent value="circuit-entries"><CircuitEntriesTab /></TabsContent>
          <TabsContent value="branding"><BrandingTab onTake={noop as any} onClear={noop as any} liveGraphics={empty} /></TabsContent>
          <TabsContent value="sync">
            <div className="space-y-6">
              <div>
                <h2 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6A6A7A', letterSpacing: '0.12em' }}>🏔 Rally · Stage / Overall</h2>
                <RallyTimingSyncPanel />
              </div>
              <div>
                <h2 className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6A6A7A', letterSpacing: '0.12em' }}>🏁 Circuito · Live Timing</h2>
                <TimingSyncPanel />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

const Tab = ({ label, value }: { label: string; value: string }) => (
  <TabsTrigger
    value={value}
    className="relative flex-1 px-4 py-2.5 text-[11px] font-medium tracking-wider uppercase rounded-none bg-transparent data-[state=active]:shadow-none transition-all"
    style={{
      borderRight: '1px solid #2A2A2E',
    }}
  >
    {label}
  </TabsTrigger>
);

export default Admin;
