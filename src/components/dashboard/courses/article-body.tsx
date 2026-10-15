import * as React from "react";

import type { ArticleDoc, ArticleNode } from "@/lib/article-body";
import { cn } from "@/lib/utils";

function ArticleBody({
    doc,
    tone = "light",
    className,
}: {
    doc: ArticleDoc;
    tone?: "light" | "dark";
    className?: string;
}) {
    return (
        <div
            className={cn(
                "text-[16px] leading-6.75 [&>*+*]:mt-4 [&>*:first-child]:mt-0",
                tone === "dark" ? "text-white/85" : "text-foreground",
                className,
            )}
        >
            {doc.content.map((node, index) => (
                <Block key={index} node={node} tone={tone} />
            ))}
        </div>
    );
}

function Block({ node, tone }: { node: ArticleNode; tone: "light" | "dark" }) {
    switch (node.type) {
        case "paragraph":
            return (
                <p className="min-h-6.75">
                    <Inline nodes={node.content} />
                </p>
            );
        case "heading":
            return node.attrs?.level === 3 ? (
                <h3 className="mt-6 text-[18px] leading-7 font-bold">
                    <Inline nodes={node.content} />
                </h3>
            ) : (
                <h2 className="mt-7 text-[22px] leading-8 font-bold">
                    <Inline nodes={node.content} />
                </h2>
            );
        case "bulletList":
            return (
                <ul className={cn("list-disc pl-6", markerClass(tone))}>
                    <Items nodes={node.content} tone={tone} />
                </ul>
            );
        case "orderedList":
            return (
                <ol
                    className={cn("list-decimal pl-6", markerClass(tone))}
                    start={
                        typeof node.attrs?.start === "number"
                            ? node.attrs.start
                            : undefined
                    }
                >
                    <Items nodes={node.content} tone={tone} />
                </ol>
            );
        default:
            return null;
    }
}

function Items({
    nodes,
    tone,
}: {
    nodes: ArticleNode[] | undefined;
    tone: "light" | "dark";
}) {
    return (
        <>
            {(nodes ?? []).map((item, index) =>
                item.type === "listItem" ? (
                    <li key={index} className="mt-1.5 [&>*+*]:mt-1.5">
                        {(item.content ?? []).map((child, childIndex) => (
                            <Block key={childIndex} node={child} tone={tone} />
                        ))}
                    </li>
                ) : null,
            )}
        </>
    );
}

function Inline({ nodes }: { nodes: ArticleNode[] | undefined }) {
    return (
        <>
            {(nodes ?? []).map((node, index) => {
                if (node.type === "hardBreak") return <br key={index} />;
                if (node.type !== "text" || !node.text) return null;

                let content: React.ReactNode = node.text;
                const marks = new Set(
                    (node.marks ?? []).map((mark) => mark.type),
                );
                if (marks.has("italic")) content = <em>{content}</em>;
                if (marks.has("bold")) content = <strong>{content}</strong>;
                return <React.Fragment key={index}>{content}</React.Fragment>;
            })}
        </>
    );
}

function markerClass(tone: "light" | "dark") {
    return tone === "dark"
        ? "marker:text-white/50"
        : "marker:text-muted-foreground";
}

export { ArticleBody };
