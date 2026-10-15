export type ArticleMark = { type: "bold" | "italic" };

export type ArticleNode = {
    type: string;
    attrs?: Record<string, unknown>;
    content?: ArticleNode[];
    text?: string;
    marks?: ArticleMark[];
};

export type ArticleDoc = { type: "doc"; content: ArticleNode[] };

const BLOCKS = new Set([
    "paragraph",
    "heading",
    "bulletList",
    "orderedList",
    "listItem",
]);
const MARKS = new Set(["bold", "italic"]);

export function sanitizeArticle(input: unknown): ArticleDoc | null {
    if (!isRecord(input) || input.type !== "doc") return null;
    return { type: "doc", content: cleanChildren(input.content, 0) };
}

function cleanChildren(value: unknown, depth: number): ArticleNode[] {
    if (!Array.isArray(value) || depth > 12) return [];
    return value.flatMap((child) => {
        const node = cleanNode(child, depth);
        return node ? [node] : [];
    });
}

function cleanNode(value: unknown, depth: number): ArticleNode | null {
    if (!isRecord(value) || typeof value.type !== "string") return null;

    if (value.type === "text") {
        if (typeof value.text !== "string" || value.text === "") return null;
        const marks = Array.isArray(value.marks)
            ? value.marks.flatMap((mark) =>
                  isRecord(mark) &&
                  typeof mark.type === "string" &&
                  MARKS.has(mark.type)
                      ? [{ type: mark.type as ArticleMark["type"] }]
                      : [],
              )
            : [];
        return marks.length > 0
            ? { type: "text", text: value.text, marks }
            : { type: "text", text: value.text };
    }

    if (value.type === "hardBreak") return { type: "hardBreak" };
    if (!BLOCKS.has(value.type)) return null;

    const node: ArticleNode = {
        type: value.type,
        content: cleanChildren(value.content, depth + 1),
    };

    if (value.type === "heading") {
        const level = isRecord(value.attrs) ? value.attrs.level : undefined;
        node.attrs = { level: level === 3 ? 3 : 2 };
    }
    if (value.type === "orderedList") {
        const start = isRecord(value.attrs) ? value.attrs.start : undefined;
        node.attrs = {
            start:
                typeof start === "number" &&
                Number.isInteger(start) &&
                start > 0
                    ? Math.min(start, 10_000)
                    : 1,
        };
    }

    return node;
}

export function articleWordCount(doc: ArticleDoc): number {
    let words = 0;
    const walk = (nodes: ArticleNode[] | undefined) => {
        for (const node of nodes ?? []) {
            if (node.text) {
                words += node.text.split(/\s+/).filter(Boolean).length;
            }
            walk(node.content);
        }
    };
    walk(doc.content);
    return words;
}

export function parseArticle(stored: string | null): ArticleDoc | null {
    if (!stored) return null;
    try {
        return sanitizeArticle(JSON.parse(stored));
    } catch {
        return {
            type: "doc",
            content: stored
                .split(/\n{2,}/)
                .filter((paragraph) => paragraph.trim() !== "")
                .map((paragraph) => ({
                    type: "paragraph",
                    content: [{ type: "text", text: paragraph.trim() }],
                })),
        };
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
