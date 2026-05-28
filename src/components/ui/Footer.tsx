import FeedLogo from './FeedLogo';
import { useThemeStore } from '@/store/themeStore';

const Footer = () => {
  const theme = useThemeStore(s => s.theme);
  const tc = theme === 'dark'
    ? { border: '#2A2A2E', bg: '#1A1A1E', muted: '#6A6A7A' }
    : { border: '#E0E0E0', bg: '#FFFFFF', muted: '#AAAAAA' };

  return (
    <footer className="border-t" style={{ borderColor: tc.border, background: tc.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <FeedLogo variant={theme === 'dark' ? 'light' : 'dark'} size="sm" />

        <div className="flex items-center gap-2">
          <span className="text-[9px] tracking-wider uppercase" style={{ color: tc.muted }}>
            Powered by
          </span>
          <img
            src="/studio-plus-logo.svg"
            alt="studio+ marketing & medIA"
            className="h-4 w-auto"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
