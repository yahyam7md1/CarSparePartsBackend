/**
 * URL-safe slug from English text (categories). Not for Arabic display names.
 */
export function slugify(source) {
    const s = source
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return s.length > 0 ? s : "category";
}
//# sourceMappingURL=slug.js.map