import { useState, useCallback } from "react";
// import { RotateCcw, Zap, Sparkles } from "lucide-react"; // Unused in new design
import Camera from "./components/Camera";
import BoundingBoxCanvas from "./components/BoundingBoxCanvas";
import LoadingOverlay from "./components/LoadingOverlay";
import { useDetector } from "./hooks/useDetector";

export default function App() {
    const {
        detect,
        results,
        isModelLoading,
        isDetecting,
        progress,
        isReady,
        // error, // Unused for now
    } = useDetector();

    // Filter to top 3 detections by score
    const displayResults = [...results]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handleCapture = useCallback(
        (dataUrl: string) => {
            setCapturedImage(dataUrl);
            detect(dataUrl);
        },
        [detect]
    );

    const handleReset = useCallback(() => {
        setCapturedImage(null);
    }, []);

    const topResult = displayResults[0];

    return (
        <div className="min-h-dvh flex items-center justify-center bg-[var(--color-pokedex-dark)] p-4">
            <div className="pokedex-container">
                <img
                    src="/pokedex_square.png"
                    alt="Pokedex"
                    className="pokedex-bg select-none pointer-events-none"
                />

                {/* Main Screen (Camera / Image) */}
                <div className="pokemon-screen bg-[var(--color-pokedex-screen)]">
                    {/* Scan line effect */}
                    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-[0.15]">
                        <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-white to-transparent animate-scanline" />
                    </div>

                    <LoadingOverlay
                        progress={progress}
                        isReady={isReady}
                        isModelLoading={isModelLoading}
                    />

                    {capturedImage ? (
                        <div className="w-full h-full relative">
                            <BoundingBoxCanvas
                                imageUrl={capturedImage}
                                detections={displayResults}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full relative">
                            <Camera
                                onCapture={handleCapture}
                                disabled={!isReady}
                            />
                        </div>
                    )}
                </div>

                {/* Data Display (Green screen area) */}
                <div className="pokemon-data font-oxanium">
                    <span className="pokemon-number text-white/60 mr-2 text-shadow-sm">
                        {topResult ? `${Math.round(topResult.score * 100)}%` : ""}
                    </span>
                    <span className="pokemon-name text-[var(--color-pokedex-screen)] text-shadow-sm">
                        {topResult ? topResult.label : isDetecting ? "Scanning..." : "Ready"}
                    </span>
                </div>

                {/* Input Search Form Area - Reused for manual input if needed, or just visual for now */}
                <div className="form-container">
                    {/* Could be used for manual search later */}
                </div>

                {/* Physical Buttons */}
                <div className="buttons-container">
                    <button
                        className="pokedex-button btn-prev active:shadow-inner"
                        onClick={handleReset}
                        disabled={!capturedImage}
                    >
                        &lt; Reset
                    </button>
                    <button
                        className="pokedex-button btn-next active:shadow-inner"
                        disabled={true}
                    >
                        Info &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}
