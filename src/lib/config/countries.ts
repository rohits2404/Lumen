export const countryCodes: string[] = [
    "AE",
    "AR",
    "AT",
    "AU",
    "BD",
    "BE",
    "BR",
    "CA",
    "CH",
    "CL",
    "CN",
    "CO",
    "CZ",
    "DE",
    "DK",
    "EG",
    "ES",
    "FI",
    "FR",
    "GB",
    "GH",
    "GR",
    "HU",
    "ID",
    "IE",
    "IL",
    "IN",
    "IT",
    "JP",
    "KE",
    "KR",
    "MA",
    "MX",
    "MY",
    "NG",
    "NL",
    "NO",
    "NZ",
    "PE",
    "PH",
    "PK",
    "PL",
    "PT",
    "RO",
    "RS",
    "SA",
    "SE",
    "SG",
    "TH",
    "TR",
    "TW",
    "UA",
    "US",
    "VN",
    "ZA",
];

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

export function countryName(code: string | null | undefined): string | null {
    if (!code) return null;
    try {
        return displayNames.of(code.toUpperCase()) ?? code;
    } catch {
        return code;
    }
}

export type CountryOption = { code: string; name: string };

export function countryOptions(): CountryOption[] {
    return countryCodes
        .map((code) => ({ code, name: countryName(code) ?? code }))
        .sort((a, b) => a.name.localeCompare(b.name, "en"));
}
