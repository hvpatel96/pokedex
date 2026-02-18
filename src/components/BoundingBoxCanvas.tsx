import { useEffect, useRef } from "react";
import type { Detection } from "../types";
import { getBBoxColor } from "../types";

interface BoundingBoxCanvasProps {
    imageUrl: string;
    detections: Detection[];
}

export default function BoundingBoxCanvas({
    imageUrl,
    detections,
}: BoundingBoxCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!img || !canvas || !container) return;

        const draw = () => {
            // Match canvas size to the displayed image size
            const rect = img.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, rect.width, rect.height);

            // The model returns box coordinates in pixels relative to the original image
            const scaleX = rect.width / img.naturalWidth;
            const scaleY = rect.height / img.naturalHeight;

            detections.forEach((det, i) => {
                const color = getBBoxColor(i);
                const x = det.box.xmin * scaleX;
                const y = det.box.ymin * scaleY;
                const w = (det.box.xmax - det.box.xmin) * scaleX;
                const h = (det.box.ymax - det.box.ymin) * scaleY;

                // Bounding box
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.setLineDash([]);
                ctx.strokeRect(x, y, w, h);

                // Glow effect
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.strokeRect(x, y, w, h);
                ctx.shadowBlur = 0;

                // Label background
                const label = `${det.label} ${Math.round(det.score * 100)}%`;
                ctx.font = "600 13px Inter, system-ui, sans-serif";
                const textMetrics = ctx.measureText(label);
                const labelHeight = 22;
                const labelWidth = textMetrics.width + 12;

                // Position label above box, but keep inside canvas
                let labelY = y - labelHeight - 2;
                if (labelY < 0) labelY = y + 2;

                ctx.fillStyle = color;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.roundRect(x, labelY, labelWidth, labelHeight, 4);
                ctx.fill();
                ctx.globalAlpha = 1;

                // Label text
                ctx.fillStyle = "#000";
                ctx.fillText(label, x + 6, labelY + 15);
            });
        };

        // Draw when image loads and on resize
        if (img.complete) {
            draw();
        }
        img.addEventListener("load", draw);
        const resizeObserver = new ResizeObserver(draw);
        resizeObserver.observe(container);

        return () => {
            img.removeEventListener("load", draw);
            resizeObserver.disconnect();
        };
    }, [detections, imageUrl]);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full flex items-center justify-center"
        >
            <img
                ref={imgRef}
                src={imageUrl}
                alt="Captured"
                className="max-w-full max-h-full object-contain rounded-lg"
            />
            <canvas
                ref={canvasRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-bbox-in"
            />
        </div>
    );
}
