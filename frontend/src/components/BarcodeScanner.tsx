import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Barcode, Upload } from "lucide-react";

type Props = {
  onDetected: (barcode: string) => void;
};

export default function BarcodeScanner({ onDetected }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        return () => {
        BrowserMultiFormatReader.releaseAllStreams();
        };
    }, []);

    const startCameraScan = async () => {
    const reader = new BrowserMultiFormatReader();
    setIsScanning(true);

    const TIMEOUT = 10000;

    const timeoutId = setTimeout(() => {
        console.log("Timeout scan");

        BrowserMultiFormatReader.releaseAllStreams();
        setIsScanning(false);
        alert("Aucun code-barres détecté");
    }, TIMEOUT);

    try {
        await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result) => {
            if (result) {
            clearTimeout(timeoutId);

            onDetected(result.getText());

            BrowserMultiFormatReader.releaseAllStreams();
            setIsScanning(false);
            }
        }
        );
    } catch (err) {
        clearTimeout(timeoutId);
        console.error(err);
        setIsScanning(false);
    }
    };

  const handleFileScan = async (file: File) => {
    const reader = new BrowserMultiFormatReader();

    const imageUrl = URL.createObjectURL(file);

    try {
      const result = await reader.decodeFromImageUrl(imageUrl);
      onDetected(result.getText());
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={startCameraScan} disabled={isScanning}>
            <Barcode />
        </Button>

        <Button type="button" asChild>
        <label>
            <Upload />
            <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileScan(file);
            }}
            />
        </label>
        </Button>

        {isScanning && (
            <video
            ref={videoRef}
            className="max-h-64 w-full basis-full rounded-xl border border-green-100 object-cover"
            />
        )}
    </div>
  );
}
