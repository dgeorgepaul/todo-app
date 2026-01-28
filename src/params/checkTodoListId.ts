export function match(value: string): boolean {
    // UUID v4 basic check
    return /^[0-9a-fA-F-]{36}$/.test(value);
}
