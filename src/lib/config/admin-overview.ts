import {
    BrainCircuitIcon,
    BriefcaseIcon,
    Code2Icon,
    LayoutGridIcon,
    LineChartIcon,
    LucideIcon,
    MegaphoneIcon,
    PaletteIcon,
    SproutIcon,
} from "lucide-react";

export const categoryGradients: Record<string, string> = {
    blue: "from-accent-2 to-accent-3",
    violet: "from-accent-1 to-accent-2",
    cyan: "from-accent-3 to-accent-2",
    green: "from-success to-accent-3",
    amber: "from-warning to-star",
    red: "from-destructive to-warning",
};

export const FALLBACK_CATEGORY_GRADIENT = "from-accent-1 to-accent-3";

export const categoryIcons: Record<string, LucideIcon> = {
    development: Code2Icon,
    design: PaletteIcon,
    "data-ai": BrainCircuitIcon,
    business: BriefcaseIcon,
    marketing: MegaphoneIcon,
    "personal-development": SproutIcon,
    finance: LineChartIcon,
};

export const FALLBACK_CATEGORY_ICON = LayoutGridIcon;
