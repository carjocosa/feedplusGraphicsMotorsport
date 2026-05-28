import FeedLogo from './FeedLogo';

const Footer = () => {
  return (
    <footer className="border-t border-[#EAEAEA] bg-white/50">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <FeedLogo size="sm" />

        <div className="flex items-center gap-2">
          <span className="text-[9px] tracking-wider uppercase text-[#C4C4C4]">
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
