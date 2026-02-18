declare module "lucide-react" {
    import { FC, SVGAttributes } from "react";
    interface IconProps extends SVGAttributes<SVGElement> {
        size?: number | string;
        color?: string;
        strokeWidth?: number | string;
        className?: string;
    }
    type Icon = FC<IconProps>;
    export const Camera: Icon;
    export const Upload: Icon;
    export const SwitchCamera: Icon;
    export const X: Icon;
    export const RotateCcw: Icon;
    export const Zap: Icon;
    export const Github: Icon;
    export const Sparkles: Icon;
    export const Eye: Icon;
    export const Cpu: Icon;
}
