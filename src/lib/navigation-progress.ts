const NAVIGATION_PROGRESS_EVENT = "lumen:navigation-start";

function startNavigationProgress() {
    window.dispatchEvent(new Event(NAVIGATION_PROGRESS_EVENT));
}

export { NAVIGATION_PROGRESS_EVENT, startNavigationProgress };
