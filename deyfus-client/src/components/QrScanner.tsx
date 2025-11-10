import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export function QrScanner({ onScan, onError, onClose }: QrScannerProps) {
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const qrScanner = new Html5Qrcode('reader');
    qrRef.current = qrScanner;

    qrScanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          if (onClose) {
            onClose();
          }
        },
        (errorMessage) => {
          if (onError) {
            onError(errorMessage);
          }
        }
      )
      .catch((err) => {
        if (onError) {
          onError(err);
        }
      });

    return () => {
      if (qrRef.current) {
        qrRef.current
          .stop()
          .then(() => {
            qrRef.current = null;
          })
          .catch(console.error);
      }
    };
  }, [onScan, onError, onClose]);

  return (
    <div className="relative">
      <div id="reader" className="w-full max-w-sm mx-auto" />
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          ×
        </button>
      )}
    </div>
  );
}