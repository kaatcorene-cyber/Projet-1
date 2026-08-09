import { useAppStore } from '../store/useAppStore';

export function FloatingSupport() {
  const { config } = useAppStore();
  const supportLink = config?.support_link || 'https://t.me/ElevFinAi';

  const getTgLink = (url: string | undefined | null) => {
    if (!url || url === '#') return '#';
    if (url.startsWith('https://t.me/')) {
      const path = url.replace('https://t.me/', '');
      if (path.startsWith('+')) {
        return `tg://join?invite=${path.substring(1)}`;
      }
      return `tg://resolve?domain=${path}`;
    }
    return url;
  };

  return (
    <a 
      href={getTgLink(supportLink)} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-32 right-4 z-50 w-14 h-14 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
    >
      <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
        <img src="https://i.imgur.com/yNhnM1Kh.jpg" alt="Support" className="w-full h-full object-cover rounded-full" />
        {/* Online dot indicator */}
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
      </div>
    </a>
  );
}
