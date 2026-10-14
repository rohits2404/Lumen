"use client";

import { useEffect } from "react";

export function GlobalErrorForm({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    padding: "24px",
                    textAlign: "center",
                    background: "#f4f4f3",
                    color: "#18181b",
                    fontFamily:
                        "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
                }}
            >
                <div style={{ maxWidth: "28rem" }}>
                    <h1
                        style={{ fontSize: "26px", fontWeight: 700, margin: 0 }}
                    >
                        Something Went Wrong
                    </h1>
                    <p
                        style={{
                            marginTop: "10px",
                            fontSize: "15px",
                            color: "#5c5c66",
                        }}
                    >
                        The Application Failed To Load. Try Again, And If The
                        Problem Continues The Reference Below Will Be In The
                        Server Logs.
                    </p>
                    <button
                        onClick={reset}
                        style={{
                            marginTop: "24px",
                            height: "40px",
                            padding: "0 20px",
                            borderRadius: "10px",
                            border: 0,
                            cursor: "pointer",
                            background: "#18181b",
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: 600,
                        }}
                    >
                        Try Again
                    </button>
                    {error.digest ? (
                        <p
                            style={{
                                marginTop: "16px",
                                fontSize: "13px",
                                color: "#8a8a94",
                            }}
                        >
                            Error Reference: {error.digest}
                        </p>
                    ) : null}
                </div>
            </body>
        </html>
    );
}
