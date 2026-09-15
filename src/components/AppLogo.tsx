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
  const [logoSrc, setLogoSrc] = useState<string>('/logo.svg?v=cargillci');
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
        src={hasError ? '/logo.svg?v=cargillci' : logoSrc}
        alt="CargillCi Logo"
        className={imgClassName}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setLogoSrc('/logo.svg?v=cargillci');
          }
        }}
      />
      {showText && (
        <span className="font-black text-gray-900 tracking-tight text-lg">
          Cargill<span className="text-emerald-600 font-black">CI</span>
        </span>
      )}
    </div>
  );
}
