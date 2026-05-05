import sharp from "sharp";
const THUMB_MAX_PX = 300;
const LARGE_MAX_PX = 800;
export async function makeThumbWebp(buffer) {
    return sharp(buffer)
        .rotate()
        .resize({
        width: THUMB_MAX_PX,
        height: THUMB_MAX_PX,
        fit: "inside",
        withoutEnlargement: true,
    })
        .webp({ quality: 82 })
        .toBuffer();
}
export async function makeLargeWebp(buffer) {
    return sharp(buffer)
        .rotate()
        .resize({
        width: LARGE_MAX_PX,
        height: LARGE_MAX_PX,
        fit: "inside",
        withoutEnlargement: true,
    })
        .webp({ quality: 82 })
        .toBuffer();
}
export const ALLOWED_IMAGE_MIMETYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);
//# sourceMappingURL=image-processing.js.map