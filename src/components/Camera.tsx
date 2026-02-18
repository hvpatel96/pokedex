import { useRef, useState, useCallback } from "react";
import { Camera as CameraIcon, Upload, SwitchCamera, X } from "lucide-react";

interface CameraProps {
    onCapture: (dataUrl: string) => void;
    disabled?: boolean;
}

export default function Camera({ onCapture, disabled }: CameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">(
        "environment"
    );
    const [isDragging, setIsDragging] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Camera access denied:", err);
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }, []);

    const captureFrame = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        stopCamera();
        onCapture(dataUrl);
    }, [onCapture, stopCamera]);

    const switchCamera = useCallback(() => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
        // Restart with new facing mode
        if (isCameraActive) {
            stopCamera();
            setTimeout(() => startCamera(), 100);
        }
    }, [isCameraActive, startCamera, stopCamera]);

    const handleFileUpload = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === "string") {
                    onCapture(result);
                }
            };
            reader.readAsDataURL(file);
        },
        [onCapture]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        },
        [handleFileUpload]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Live camera view
    if (isCameraActive) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain rounded-lg"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera controls overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                    <button
                        onClick={switchCamera}
                        className="p-3 rounded-full glass text-white/80 hover:text-white transition-colors cursor-pointer"
                        title="Switch camera"
                    >
                        <SwitchCamera size={20} />
                    </button>
                    <button
                        onClick={captureFrame}
                        disabled={disabled}
                        className="w-16 h-16 rounded-full border-4 border-white/80 bg-white/20 
              hover:bg-white/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer
              flex items-center justify-center"
                        title="Capture"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/90" />
                    </button>
                    <button
                        onClick={stopCamera}
                        className="p-3 rounded-full glass text-white/80 hover:text-white transition-colors cursor-pointer"
                        title="Close camera"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // Upload / camera prompt
    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full h-full flex flex-col items-center justify-center gap-6 p-8
        rounded-lg border-2 border-dashed transition-all duration-300
        ${isDragging
                    ? "border-[var(--color-pokedex-accent)] bg-[var(--color-pokedex-accent)]/5"
                    : "border-white/10 hover:border-white/20"
                }`}
        >
            <div className="flex flex-col items-center gap-3 text-center">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center
          bg-gradient-to-br from-[var(--color-pokedex-red)] to-[var(--color-pokedex-red-dark)]
          shadow-lg shadow-red-500/20"
                >
                    <CameraIcon size={36} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white/90">
                    Capture or Upload
                </h3>
                <p className="text-sm text-white/50 max-w-xs">
                    Take a photo with your camera or drag & drop an image to detect
                    objects
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={startCamera}
                    disabled={disabled}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
            bg-gradient-to-r from-[var(--color-pokedex-red)] to-[var(--color-pokedex-red-dark)]
            text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40
            active:scale-[0.97] transition-all disabled:opacity-50 cursor-pointer"
                >
                    <CameraIcon size={18} />
                    Camera
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
            glass text-white/80 hover:text-white
            active:scale-[0.97] transition-all disabled:opacity-50 cursor-pointer"
                >
                    <Upload size={18} />
                    Upload
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    // Reset so the same file can be selected again
                    e.target.value = "";
                }}
            />
        </div>
    );
}
