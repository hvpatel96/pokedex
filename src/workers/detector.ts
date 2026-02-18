import { pipeline, env } from "@huggingface/transformers";

// Disable local model loading — always fetch from HuggingFace Hub
env.allowLocalModels = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detector: any = null;

// ── Message handler ──
self.onmessage = async (e: MessageEvent) => {
    const { type, imageData } = e.data;

    if (type === "load-model") {
        try {
            self.postMessage({ type: "load-progress", progress: 0 });

            detector = await pipeline("object-detection", "Xenova/yolos-tiny", {
                progress_callback: (progress: Record<string, unknown>) => {
                    if (
                        "progress" in progress &&
                        typeof progress.progress === "number"
                    ) {
                        self.postMessage({
                            type: "load-progress",
                            progress: Math.round(progress.progress),
                        });
                    }
                },
            });

            self.postMessage({ type: "model-ready" });
        } catch (err) {
            self.postMessage({
                type: "error",
                message: `Failed to load model: ${err instanceof Error ? err.message : String(err)}`,
            });
        }
    }

    if (type === "detect" && imageData) {
        if (!detector) {
            self.postMessage({ type: "error", message: "Model not loaded yet" });
            return;
        }

        try {
            const rawOutput = await detector(imageData, {
                threshold: 0.3,
            });

            // Normalize output — pipeline may return nested arrays
            const output = Array.isArray(rawOutput)
                ? rawOutput
                : [rawOutput];

            const results = output.map(
                (r: {
                    label: string;
                    score: number;
                    box: { xmin: number; ymin: number; xmax: number; ymax: number };
                }) => ({
                    label: r.label,
                    score: r.score,
                    box: r.box,
                })
            );

            self.postMessage({
                type: "detection-result",
                results,
            });
        } catch (err) {
            self.postMessage({
                type: "error",
                message: `Detection failed: ${err instanceof Error ? err.message : String(err)}`,
            });
        }
    }
};
