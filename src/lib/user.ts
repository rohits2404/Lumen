export type MenuUser = {
    name: string;
    email: string;
    image?: string | null;
};

export function initialsOf(name: string, email: string) {
    const source = name.trim() || email;
    const parts = source.split(/[\s@._-]+/).filter(Boolean);
    return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}
