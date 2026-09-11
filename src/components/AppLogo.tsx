import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
}

export function AppLogo({ 
  className = '', 
  imgClassName = 'h-9 w-auto object-contain',
  showText = false 
}: AppLogoProps) {
  const [logoSrc, setLogoSrc] = useState<string>('/logo.svg?v=cargill');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadLogo() {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'app_logo')
          .maybeSingle();

        if (data?.value && data.value.trim() !== '') {
          setLogoSrc(data.value.trim());
        }
      } catch {
        // Fallback to local /logo.svg
      }
    }
    loadLogo();
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={hasError ? '/logo.svg?v=cargill' : logoSrc}
        alt="Cargill Logo"
        className={imgClassName}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setLogoSrc('/logo.svg?v=cargill');
          }
        }}
      />
      {showText && (
        <span className="font-black text-gray-900 tracking-tight text-lg">
          Car<span className="text-emerald-600">gill</span>
        </span>
      )}
    </div>
  );
}
