import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIosDevice = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
    // Check if already installed (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Hide install when successfully installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsIOS(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
       alert("Pour installer l'application sur iPhone :\n1. Appuyez sur l'icône de partage ⍗ en bas de l'écran\n2. Choisissez 'Sur l'écran d'accueil' ➕");
    } else {
       alert("Pour installer l'application :\n1. Ouvrez le menu de votre navigateur (les 3 points en haut à droite)\n2. Sélectionnez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'");
    }
  };

  return { isInstallable: isInstallable || isIOS, installPWA, isIOS };
}
