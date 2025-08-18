export {};

declare global {
  interface Window {
    Html5QrcodeScanner: new (
      elementId: string,
      config: {
        fps?: number;
        qrbox?: number;
        aspectRatio?: number;
        disableFlip?: boolean;
      },
      verbose: boolean
    ) => {
      render: (
        onScanSuccess: (decodedText: string) => void,
        onScanError: (error: string | Error) => void
      ) => void;
      clear: () => Promise<void>;
    };
  }
}
