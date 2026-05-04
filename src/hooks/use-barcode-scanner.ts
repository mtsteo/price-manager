import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export function useBarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const startScanning = useCallback(async () => {
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
    if (!scanning || !videoRef.current) return;

    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    const decode = async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result) => {
            if (result && !stopped) {
              setBarcode(result.getText());
              setScanning(false);
              controls.stop();
            }
          },
        );
        controlsRef.current = controls;
      } catch (err) {
        if (!stopped) {
          setError(
            err instanceof Error ? err.message : "Erro ao acessar câmera",
          );
          setScanning(false);
        }
      }
    };

    decode();

    return () => {
      stopped = true;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, [scanning]);

  return { videoRef, scanning, barcode, error, startScanning, stopScanning };
}
