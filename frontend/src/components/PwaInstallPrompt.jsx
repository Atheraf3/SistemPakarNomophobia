import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setIsVisible(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') console.log('PWA Installed');
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 z-[100] flex flex-col gap-4 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start">
        <div className="pr-4">
          <h3 className="font-bold text-slate-900 text-lg">Install Aplikasi SIKAR</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Install aplikasi ini di layar utama agar lebih cepat diakses tanpa harus membuka browser lagi.
          </p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1">
          <X size={18} />
        </button>
      </div>
      <div className="flex gap-3 w-full mt-2">
        <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsVisible(false)}>Nanti Saja</Button>
        <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={handleInstallClick}>Install Sekarang</Button>
      </div>
    </div>
  );
}