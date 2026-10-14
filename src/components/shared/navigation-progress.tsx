"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { NAVIGATION_PROGRESS_EVENT } from "@/lib/navigation-progress";

const CRAWL_TARGET = "90%";
const CRAWL_MS = 6000;
const MIN_VISIBLE_MS = 420;
const SAFETY_MS = 12000;

const FILL_MS = 190;
const FADE_MS = 280;

const IDLE: React.CSSProperties = {
    width: "0%",
    opacity: 0,
    transitionProperty: "none",
};

function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [style, setStyle] = React.useState<React.CSSProperties>(IDLE);

    const activeRef = React.useRef(false);
    const startedAtRef = React.useRef(0);
    const timersRef = React.useRef<number[]>([]);
    const frameRef = React.useRef(0);

    const clearPending = React.useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
        cancelAnimationFrame(frameRef.current);
    }, []);

    const after = React.useCallback((ms: number, run: () => void) => {
        timersRef.current.push(window.setTimeout(run, ms));
    }, []);

    const finish = React.useCallback(() => {
        if (!activeRef.current) {
            return;
        }

        activeRef.current = false;
        clearPending();

        const hold = Math.max(
            0,
            MIN_VISIBLE_MS - (performance.now() - startedAtRef.current),
        );

        after(hold, () => {
            setStyle({
                width: "100%",
                opacity: 1,
                transitionProperty: "width",
                transitionDuration: `${FILL_MS}ms`,
                transitionTimingFunction: "ease-out",
            });

            after(FILL_MS, () => {
                setStyle({
                    width: "100%",
                    opacity: 0,
                    transitionProperty: "opacity",
                    transitionDuration: `${FADE_MS}ms`,
                    transitionTimingFunction: "ease-out",
                });

                after(FADE_MS, () => setStyle(IDLE));
            });
        });
    }, [after, clearPending]);

    const start = React.useCallback(() => {
        clearPending();
        activeRef.current = true;
        startedAtRef.current = performance.now();

        setStyle(IDLE);
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = requestAnimationFrame(() => {
                setStyle({
                    width: CRAWL_TARGET,
                    opacity: 1,
                    transitionProperty: "width, opacity",
                    transitionDuration: `${CRAWL_MS}ms, 120ms`,
                    transitionTimingFunction:
                        "cubic-bezier(0.1, 0.8, 0.2, 1), linear",
                });
            });
        });

        after(SAFETY_MS, finish);
    }, [after, clearPending, finish]);

    React.useEffect(() => {
        window.addEventListener(NAVIGATION_PROGRESS_EVENT, start);

        return () => {
            window.removeEventListener(NAVIGATION_PROGRESS_EVENT, start);
            clearPending();
        };
    }, [clearPending, start]);

    const route = `${pathname}?${searchParams}`;
    const lastRouteRef = React.useRef(route);

    React.useEffect(() => {
        if (lastRouteRef.current === route) {
            return;
        }

        lastRouteRef.current = route;
        finish();
    }, [finish, route]);

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.75"
        >
            <div
                className="h-full bg-(image:--gradient-brand) bg-no-repeat shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{
                    backgroundSize: "100vw 100%",
                    ...style,
                }}
            />
        </div>
    );
}

export { NavigationProgress };
