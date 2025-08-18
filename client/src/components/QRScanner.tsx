import { useEffect, useRef } from 'react';
import '../types/html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrRef.current || typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode';
    script.async = true;
    script.onload = initializeScanner;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeScanner = () => {
    if (!qrRef.current || !(window as any).Html5QrcodeScanner) return;

    const scanner = new (window as any).Html5QrcodeScanner('qr-scanner', {
      fps: 10,
      qrbox: 250,
    }, false);

    scanner.render((decodedText: string) => {
      onScan(decodedText);
      scanner.clear();
    }, console.error);
  };

  return <div id="qr-scanner" ref={qrRef} className="w-full h-64" />;
}
