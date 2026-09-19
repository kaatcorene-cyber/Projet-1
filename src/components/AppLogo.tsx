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
  const [logoSrc, setLogoSrc] = useState<string>('/logo.svg?v=agritrans');
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
        src={hasError ? '/logo.svg?v=agritrans' : logoSrc}
        alt="AgriTrans Logo"
        className={imgClassName}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setLogoSrc('/logo.svg?v=agritrans');
          }
        }}
      />
      {showText && (
        <span className="font-black text-slate-900 tracking-tight text-lg">
          Agri<span className="text-emerald-600 font-black">Trans</span>
        </span>
      )}
    </div>
  );
}
