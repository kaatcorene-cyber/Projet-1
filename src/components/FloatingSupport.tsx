import { useAppStore } from '../store/useAppStore';

export function FloatingSupport() {
  const { config } = useAppStore();
  const supportLink = config?.support_link || 'https://t.me/+_WVnzoKbc89jMDQ0';

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
      className="fixed bottom-24 right-4 z-50 w-16 h-16 rounded-full bg-white shadow-2xl shadow-orange-900/20 flex items-center justify-center border-[3px] border-orange-500 hover:scale-105 active:scale-95 transition-transform"
    >
      <div className="relative flex items-center justify-center w-full h-full pointer-events-none">
        <img 
          src="/support_orange.svg" 
          alt="Support Client" 
          className="w-full h-full object-cover rounded-full p-0.5"
        />
        {/* Online dot indicator */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
      </div>
    </a>
  );
}

