import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export function useBarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const startScanning = useCallback(() => {
    setError(null);
    setBarcode(null);
    setScanning(true);
  }, []);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!scanning) return;

    let stopped = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const startDecode = () => {
      if (stopped) return;

      const videoEl = videoRef.current;
      if (!videoEl) {
        timeoutId = setTimeout(startDecode, 100);
        return;
      }

      const reader = new BrowserMultiFormatReader();

      reader
        .decodeFromVideoDevice(undefined, videoEl, (result) => {
          if (result && !stopped) {
            setBarcode(result.getText());
            setScanning(false);
          }
        })
        .then((controls) => {
          if (stopped) {
            controls.stop();
          } else {
            controlsRef.current = controls;
          }
        })
        .catch((err) => {
          if (!stopped) {
            setError(
              err instanceof Error ? err.message : "Erro ao acessar câmera",
            );
            setScanning(false);
          }
        });
    };

    startDecode();

    return () => {
      stopped = true;
      clearTimeout(timeoutId);
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, [scanning]);

  return { videoRef, scanning, barcode, error, startScanning, stopScanning };
}
