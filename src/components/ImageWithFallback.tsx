import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  title?: string;
}

export function ImageWithFallback({ src, alt, className = '', title }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EDE6] to-[#E6DDD2] text-[#6E655D] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-6 h-6 mb-2 text-[#6B1D3A]/60" aria-hidden="true" />
        <span className="text-xs font-medium tracking-wide text-[#453F3A] max-w-[16ch] truncate">
          {title || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
