import { Eye } from "lucide-react";
import type { Detection } from "../types";
import { getBBoxColor } from "../types";

interface ResultsPanelProps {
    detections: Detection[];
    isDetecting: boolean;
}

export default function ResultsPanel({
    detections,
    isDetecting,
}: ResultsPanelProps) {
    if (isDetecting) {
        return (
            <div className="flex items-center justify-center gap-3 py-8 text-white/50">
                <div className="w-5 h-5 border-2 border-[var(--color-pokedex-accent)] border-t-transparent rounded-full animate-spin-slow" />
                <span className="text-sm font-medium">Analyzing image…</span>
            </div>
        );
    }

    if (detections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-white/40">
                <Eye size={24} />
                <p className="text-sm">No detections yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                Detected Objects — {detections.length} found
            </h3>
            <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                {detections.map((det, i) => {
                    const color = getBBoxColor(i);
                    const percent = Math.round(det.score * 100);
                    return (
                        <div
                            key={`${det.label}-${i}`}
                            className="flex items-center gap-3 p-3 rounded-xl glass animate-fade-in-up"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {/* Color dot */}
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                            />

                            {/* Label */}
                            <span className="text-sm font-semibold text-white/90 capitalize flex-1 truncate">
                                {det.label}
                            </span>

                            {/* Confidence bar */}
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${percent}%`,
                                            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                                        }}
                                    />
                                </div>
                                <span className="text-xs font-mono text-white/60 w-9 text-right">
                                    {percent}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
