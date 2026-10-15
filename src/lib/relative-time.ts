export function compactAge(then: Date, now: Date): string {
    const seconds = Math.max(
        0,
        Math.round((now.getTime() - then.getTime()) / 1000),
    );
    if (seconds < 60) return "Now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    if (weeks < 52) return `${weeks}w`;
    return `${Math.floor(days / 365)}y`;
}

export function compactAgo(then: Date, now: Date): string {
    const age = compactAge(then, now);
    return age === "Now" ? "Just Now" : `${age} Ago`;
}

export function longAgo(then: Date, now: Date): string {
    const elapsed = Math.max(0, now.getTime() - then.getTime());
    const DAY = 24 * 60 * 60 * 1000;

    if (elapsed < DAY) return "Today";
    const days = Math.floor(elapsed / DAY);
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} Days Ago`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} ${weeks === 1 ? "Week" : "Weeks"} Ago`;
    }
    if (days < 365) {
        const months = Math.max(1, Math.floor(days / 30));
        return `${months} ${months === 1 ? "Month" : "Months"} Ago`;
    }
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "Year" : "Years"} Ago`;
}

export function longAgoPrecise(then: Date, now: Date): string {
    const elapsed = Math.max(0, now.getTime() - then.getTime());
    const MINUTE = 60 * 1000;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;

    if (elapsed < MINUTE) return "Just Now";
    if (elapsed < HOUR) {
        const minutes = Math.floor(elapsed / MINUTE);
        return `${minutes} ${minutes === 1 ? "Minute" : "Minutes"} Ago`;
    }
    if (elapsed < DAY) {
        const hours = Math.floor(elapsed / HOUR);
        return `${hours} ${hours === 1 ? "Hour" : "Hours"} Ago`;
    }
    const days = Math.floor(elapsed / DAY);
    if (days < 7) return `${days} ${days === 1 ? "Day" : "Days"} Ago`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} ${weeks === 1 ? "Week" : "Weeks"} Ago`;
    }
    if (days < 365) {
        const months = Math.max(1, Math.floor(days / 30));
        return `${months} ${months === 1 ? "Month" : "Months"} Ago`;
    }
    const years = Math.floor(days / 365);
    return `${years} ${years === 1 ? "Year" : "Years"} Ago`;
}
