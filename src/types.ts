export interface Detection {
    label: string;
    score: number;
    box: {
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;
    };
}

export interface WorkerMessage {
    type: "load-progress" | "model-ready" | "detection-result" | "error";
    progress?: number;
    results?: Detection[];
    message?: string;
}

export interface WorkerRequest {
    type: "load-model" | "detect";
    imageData?: string; // base64 data URL
}

// Color palette for bounding boxes — visually distinct and neon-styled
export const BBOX_COLORS = [
    "#38BDF8", // sky
    "#F472B6", // pink
    "#34D399", // emerald
    "#FBBF24", // amber
    "#A78BFA", // violet
    "#FB923C", // orange
    "#2DD4BF", // teal
    "#F87171", // red
    "#818CF8", // indigo
    "#4ADE80", // green
];

export function getBBoxColor(index: number): string {
    return BBOX_COLORS[index % BBOX_COLORS.length];
}
