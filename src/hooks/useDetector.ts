import { useState, useEffect, useRef, useCallback } from "react";
import type { Detection, WorkerMessage } from "../types";

interface UseDetectorReturn {
    /** Send an image (base64 data URL) for detection */
    detect: (imageDataUrl: string) => void;
    /** Detection results from the last inference */
    results: Detection[];
    /** Whether the model is currently loading */
    isModelLoading: boolean;
    /** Whether detection is currently running */
    isDetecting: boolean;
    /** Model loading progress 0-100 */
    progress: number;
    /** Whether the model is ready for inference */
    isReady: boolean;
    /** Error message if something went wrong */
    error: string | null;
}

export function useDetector(): UseDetectorReturn {
    const workerRef = useRef<Worker | null>(null);
    const [results, setResults] = useState<Detection[]>([]);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize worker and begin model loading
    useEffect(() => {
        const worker = new Worker(
            new URL("../workers/detector.ts", import.meta.url),
            { type: "module" }
        );

        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
            const msg = e.data;

            switch (msg.type) {
                case "load-progress":
                    setIsModelLoading(true);
                    setProgress(msg.progress ?? 0);
                    break;
                case "model-ready":
                    setIsModelLoading(false);
                    setIsReady(true);
                    setProgress(100);
                    break;
                case "detection-result":
                    setResults(msg.results ?? []);
                    setIsDetecting(false);
                    break;
                case "error":
                    setError(msg.message ?? "Unknown error");
                    setIsModelLoading(false);
                    setIsDetecting(false);
                    break;
            }
        };

        // Start loading the model immediately
        setIsModelLoading(true);
        worker.postMessage({ type: "load-model" });

        return () => {
            worker.terminate();
            workerRef.current = null;
        };
    }, []);

    const detect = useCallback((imageDataUrl: string) => {
        if (!workerRef.current) return;
        setIsDetecting(true);
        setError(null);
        setResults([]);
        workerRef.current.postMessage({ type: "detect", imageData: imageDataUrl });
    }, []);

    return {
        detect,
        results,
        isModelLoading,
        isDetecting,
        progress,
        isReady,
        error,
    };
}
