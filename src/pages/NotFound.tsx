import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Footer from '@/components/ui/Footer';

const NotFound = () => {
  useEffect(() => { document.title = '404 — Feed+ Motorsport'; }, []);
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: '#0F0F11' }}>
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-sm flex items-center justify-center" style={{ background: '#FF6B0018' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold mb-2" style={{ color: '#E8E8F0', fontFamily: 'Inter, sans-serif' }}>404</h1>
          <p className="text-xl" style={{ color: '#8A8A9A' }}>Página no encontrada</p>
          <p className="text-sm mt-1 font-mono" style={{ color: '#5A5A6A' }}>{location.pathname}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-sm transition-colors font-bold tracking-wider uppercase text-sm"
          style={{ background: '#FF6B00', color: '#000' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9L12 2L21 9V20C21 20.5 20.6 21 20 21H4C3.4 21 3 20.5 3 20V9Z" />
          </svg>
          Volver al inicio
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
