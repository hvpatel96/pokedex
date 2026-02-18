import { Cpu } from "lucide-react";

interface LoadingOverlayProps {
    progress: number;
    isReady: boolean;
    isModelLoading: boolean;
}

export default function LoadingOverlay({
    progress,
    isReady,
    isModelLoading,
}: LoadingOverlayProps) {
    if (isReady || !isModelLoading) return null;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-pokedex-screen)]/90 backdrop-blur-sm rounded-lg">
            {/* Progress ring */}
            <div className="relative w-28 h-28 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="6"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="var(--color-pokedex-accent)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300"
                        style={{
                            filter: "drop-shadow(0 0 6px var(--color-pokedex-glow))",
                        }}
                    />
                </svg>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu
                        size={28}
                        className="text-[var(--color-pokedex-accent)] animate-progress-pulse"
                    />
                </div>
            </div>

            <p className="text-sm font-semibold text-white/80">Loading AI Model</p>
            <p className="text-xs text-white/40 mt-1">
                {progress > 0 ? `${progress}% downloaded` : "Initializing…"}
            </p>
        </div>
    );
}
