import { useState, useCallback } from "react";
import { RotateCcw, Zap, Github, Sparkles } from "lucide-react";
import Camera from "./components/Camera";
import BoundingBoxCanvas from "./components/BoundingBoxCanvas";
import ResultsPanel from "./components/ResultsPanel";
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
        error,
    } = useDetector();

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

    return (
        <div className="min-h-dvh flex flex-col">
            {/* ── Header ── */}
            <header className="relative z-10 px-4 sm:px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Pokeball logo */}
                        <div className="relative w-10 h-10">
                            <div
                                className="absolute inset-0 rounded-full bg-gradient-to-b from-[var(--color-pokedex-red)] 
                to-[var(--color-pokedex-red-dark)] shadow-lg shadow-red-500/30"
                            />
                            <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-[var(--color-pokedex-dark)] -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-4 h-4 rounded-full bg-white border-[3px] border-[var(--color-pokedex-dark)]"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-white">
                                Pokédex
                            </h1>
                            <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                                AI Object Detector
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Model status indicator */}
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                ${isReady
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : isModelLoading
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-progress-pulse"
                                        : "bg-white/5 text-white/40 border border-white/10"
                                }`}
                        >
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${isReady
                                        ? "bg-emerald-400"
                                        : isModelLoading
                                            ? "bg-amber-400"
                                            : "bg-white/40"
                                    }`}
                            />
                            {isReady ? "Ready" : isModelLoading ? "Loading…" : "Idle"}
                        </div>

                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-white/40 hover:text-white/70 transition-colors"
                        >
                            <Github size={18} />
                        </a>
                    </div>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="flex-1 px-4 sm:px-6 pb-8">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_340px] gap-6">
                    {/* Screen area */}
                    <div className="relative">
                        {/* Screen bezel */}
                        <div
                            className="relative rounded-2xl overflow-hidden
              bg-[var(--color-pokedex-screen)] border border-[var(--color-pokedex-screen-border)]
              screen-glow"
                        >
                            {/* Scan line effect */}
                            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden opacity-[0.03]">
                                <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-white to-transparent animate-scanline" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 min-h-[400px] sm:min-h-[480px] flex">
                                <LoadingOverlay
                                    progress={progress}
                                    isReady={isReady}
                                    isModelLoading={isModelLoading}
                                />

                                {capturedImage ? (
                                    <div className="w-full p-3">
                                        <BoundingBoxCanvas
                                            imageUrl={capturedImage}
                                            detections={results}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full p-3">
                                        <Camera
                                            onCapture={handleCapture}
                                            disabled={!isReady}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Bottom indicators */}
                            <div className="relative z-10 px-4 py-3 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-white/30">
                                    <Zap size={12} />
                                    <span>YOLOS-Tiny · In-Browser AI</span>
                                </div>

                                {capturedImage && (
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      text-xs font-medium text-white/60 hover:text-white 
                      bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <RotateCcw size={12} />
                                        New Scan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Side panel */}
                    <div className="flex flex-col gap-4">
                        {/* Results card */}
                        <div className="rounded-2xl glass p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles
                                    size={16}
                                    className="text-[var(--color-pokedex-accent)]"
                                />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">
                                    Scan Results
                                </h2>
                            </div>
                            <ResultsPanel detections={results} isDetecting={isDetecting} />
                        </div>

                        {/* Error display */}
                        {error && (
                            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 animate-fade-in-up">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Info card */}
                        <div className="rounded-2xl glass p-5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                                How It Works
                            </h3>
                            <ol className="space-y-2 text-xs text-white/50 leading-relaxed">
                                <li className="flex gap-2">
                                    <span className="text-[var(--color-pokedex-accent)] font-bold">
                                        1.
                                    </span>
                                    The AI model loads directly in your browser (~20MB)
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[var(--color-pokedex-accent)] font-bold">
                                        2.
                                    </span>
                                    Capture a photo or upload an image
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[var(--color-pokedex-accent)] font-bold">
                                        3.
                                    </span>
                                    Objects are detected and highlighted with bounding boxes
                                </li>
                            </ol>
                            <div className="mt-4 pt-3 border-t border-white/5">
                                <p className="text-[10px] text-white/30">
                                    All processing happens locally. No images are sent to any
                                    server. Powered by Transformers.js &amp; YOLOS.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="px-4 sm:px-6 py-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white/30">
                    <span>Built with React + Transformers.js</span>
                    <span>100% Client-Side AI</span>
                </div>
            </footer>
        </div>
    );
}
