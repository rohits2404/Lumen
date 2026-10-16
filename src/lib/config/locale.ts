export type Language = { value: string; label: string };

export const languages: Language[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "pt-BR", label: "Português (Brasil)" },
    { value: "it", label: "Italiano" },
    { value: "nl", label: "Nederlands" },
    { value: "pl", label: "Polski" },
    { value: "tr", label: "Türkçe" },
    { value: "ru", label: "Русский" },
    { value: "ar", label: "العربية" },
    { value: "hi", label: "हिन्दी" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "zh-Hans", label: "简体中文" },
];

export const DEFAULT_LANGUAGE = "en";

export const timeZones: { id: string; city: string }[] = [
    { id: "Pacific/Honolulu", city: "Honolulu" },
    { id: "America/Anchorage", city: "Anchorage" },
    { id: "America/Los_Angeles", city: "Los Angeles" },
    { id: "America/Denver", city: "Denver" },
    { id: "America/Chicago", city: "Chicago" },
    { id: "America/Mexico_City", city: "Mexico City" },
    { id: "America/New_York", city: "New York" },
    { id: "America/Bogota", city: "Bogotá" },
    { id: "America/Sao_Paulo", city: "São Paulo" },
    { id: "America/Argentina/Buenos_Aires", city: "Buenos Aires" },
    { id: "Atlantic/Reykjavik", city: "Reykjavík" },
    { id: "Europe/London", city: "London" },
    { id: "Europe/Lisbon", city: "Lisbon" },
    { id: "Europe/Paris", city: "Paris" },
    { id: "Europe/Berlin", city: "Berlin" },
    { id: "Europe/Madrid", city: "Madrid" },
    { id: "Europe/Rome", city: "Rome" },
    { id: "Europe/Warsaw", city: "Warsaw" },
    { id: "Africa/Lagos", city: "Lagos" },
    { id: "Europe/Athens", city: "Athens" },
    { id: "Europe/Istanbul", city: "Istanbul" },
    { id: "Africa/Cairo", city: "Cairo" },
    { id: "Africa/Johannesburg", city: "Johannesburg" },
    { id: "Europe/Moscow", city: "Moscow" },
    { id: "Asia/Dubai", city: "Dubai" },
    { id: "Asia/Karachi", city: "Karachi" },
    { id: "Asia/Kolkata", city: "Kolkata" },
    { id: "Asia/Dhaka", city: "Dhaka" },
    { id: "Asia/Bangkok", city: "Bangkok" },
    { id: "Asia/Singapore", city: "Singapore" },
    { id: "Asia/Shanghai", city: "Shanghai" },
    { id: "Asia/Tokyo", city: "Tokyo" },
    { id: "Asia/Seoul", city: "Seoul" },
    { id: "Australia/Perth", city: "Perth" },
    { id: "Australia/Sydney", city: "Sydney" },
    { id: "Pacific/Auckland", city: "Auckland" },
];

export const timeZoneIds = new Set(timeZones.map((zone) => zone.id));

function offsetMinutes(id: string, at: Date) {
    const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: id,
        timeZoneName: "longOffset",
    }).format(at);
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(formatted);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3]));
}

export function timeZoneLabel(
    zone: { id: string; city: string },
    at: Date = new Date(),
) {
    const minutes = offsetMinutes(zone.id, at);
    const sign = minutes < 0 ? "-" : "+";
    const absolute = Math.abs(minutes);
    const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
    const rest = String(absolute % 60).padStart(2, "0");
    return `(GMT${sign}${hours}:${rest}) ${zone.city}`;
}

export type TimeZoneOption = { value: string; label: string };

export function timeZoneOptions(at: Date = new Date()): TimeZoneOption[] {
    return timeZones
        .map((zone) => ({
            value: zone.id,
            label: timeZoneLabel(zone, at),
            offset: offsetMinutes(zone.id, at),
        }))
        .sort((a, b) => a.offset - b.offset || a.label.localeCompare(b.label))
        .map(({ value, label }) => ({ value, label }));
}
