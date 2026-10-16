import type { Appearance } from "@stripe/stripe-js";

const checkoutAppearance: Appearance = {
    theme: "flat",
    variables: {
        fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif",
        fontSizeBase: "15px",
        colorBackground: "#f4f4f3",
        colorText: "#18181b",
        colorTextSecondary: "#71717a",
        colorTextPlaceholder: "#a1a1aa",
        colorDanger: "#ef4444",
        colorPrimary: "#625cf6",
        borderRadius: "8px",
        spacingUnit: "4px",
        gridRowSpacing: "18px",
    },
    rules: {
        ".Label": {
            fontSize: "14px",
            fontWeight: "700",
            color: "#18181b",
            marginBottom: "12px",
        },
        ".Input": {
            padding: "11px 14px",
            border: "none",
            boxShadow: "none",
            fontSize: "15px",
        },
        ".Input:focus": {
            boxShadow: "0 0 0 3px rgba(98, 92, 246, 0.35)",
        },
        ".Input::placeholder": { color: "#a1a1aa" },
        ".Error": { fontSize: "13px", marginTop: "8px" },
    },
};

const checkoutFonts = [
    {
        cssSrc: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&display=swap",
    },
];

export { checkoutAppearance, checkoutFonts };
