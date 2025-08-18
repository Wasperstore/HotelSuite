import { useEffect, useRef } from 'react';

interface Html5QrcodeScannerConfig {
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

type QrcodeScannerConstructor = new (
  elementId: string,
  config: Html5QrcodeScannerConfig,
  verbose: boolean
) => {
  render(onScanSuccess: (text: string) => void, onScanError: (error: string | Error) => void): void;
  clear(): Promise<void>;
};

const Html5QrcodeScanner = (window as any).Html5QrcodeScanner as QrcodeScannerConstructor;

interface QRScannerConfig {
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
}

export function useQRScanner(
  elementId: string,
  onScanSuccess: (decodedText: string, result?: any) => void,
  config?: QRScannerConfig
) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(elementId, {
        fps: config?.fps || 10,
        qrbox: config?.qrbox || 250,
        aspectRatio: config?.aspectRatio || 1.0,
        disableFlip: config?.disableFlip || false,
      }, false);

      scannerRef.current.render(
        (decodedText: string) => {
          onScanSuccess(decodedText);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        },
        (error: string | Error) => {
          console.error("QR scan error:", error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [elementId, onScanSuccess]);

  return {
    stop: () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    }
  };
}
