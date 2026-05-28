interface FeedLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const h: Record<string, number> = { sm: 20, md: 40, lg: 100, xl: 160 };

const src: Record<string, string> = {
  light: '/logo-light.png',
  dark: '/logo-dark.png',
};

const FeedLogo = ({ variant = 'dark', size = 'md', className = '' }: FeedLogoProps) => (
  <img
    src={src[variant]}
    alt="Feed+ Motorsport"
    height={h[size]}
    className={className}
    style={{ width: 'auto', height: h[size], display: 'block' }}
  />
);

export default FeedLogo;
