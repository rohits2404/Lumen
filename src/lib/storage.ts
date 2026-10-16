import "server-only";

import { randomUUID } from "node:crypto";
import {
    DeleteObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = "lumen-avatars";

const EXTENSIONS: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
};

function endpoint() {
    return process.env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, "") ?? "";
}

function client() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!accessKeyId || !secretAccessKey || !endpoint()) return null;

    return new S3Client({
        endpoint: endpoint(),
        region: process.env.AWS_REGION ?? "us-east-2",
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
    });
}

function publicUrl(key: string) {
    return `${endpoint()}/${BUCKET}/${key}`;
}

export async function putAvatar(
    userId: string,
    file: { bytes: Uint8Array; contentType: string },
): Promise<string | null> {
    const s3 = client();
    if (!s3) return null;

    const extension = EXTENSIONS[file.contentType] ?? "bin";
    const key = `avatars/${userId}/${randomUUID()}.${extension}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.bytes,
            ContentType: file.contentType,
            CacheControl: "public, max-age=31536000, immutable",
        }),
    );

    return publicUrl(key);
}

export async function deleteAvatar(userId: string, imageUrl: string | null) {
    if (!imageUrl) return;
    const prefix = `${endpoint()}/${BUCKET}/avatars/${userId}/`;
    if (!endpoint() || !imageUrl.startsWith(prefix)) return;

    const s3 = client();
    if (!s3) return;

    const key = imageUrl.slice(`${endpoint()}/${BUCKET}/`.length);
    try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {}
}

export async function putBrandingAsset(
    kind: "logo" | "favicon",
    file: { bytes: Uint8Array; contentType: string },
): Promise<string | null> {
    const s3 = client();
    if (!s3) return null;

    const extension = EXTENSIONS[file.contentType] ?? "bin";
    const key = `branding/${kind}/${randomUUID()}.${extension}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.bytes,
            ContentType: file.contentType,
            CacheControl: "public, max-age=31536000, immutable",
        }),
    );

    return publicUrl(key);
}

export async function deleteBrandingAsset(
    kind: "logo" | "favicon",
    assetUrl: string | null,
) {
    if (!assetUrl) return;
    const prefix = `${endpoint()}/${BUCKET}/branding/${kind}/`;
    if (!endpoint() || !assetUrl.startsWith(prefix)) return;

    const s3 = client();
    if (!s3) return;

    const key = assetUrl.slice(`${endpoint()}/${BUCKET}/`.length);
    try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {}
}

export const LESSON_VIDEO_PREFIX = "lessons";

export function lessonVideoPrefix(courseId: string, lessonId: string) {
    return `${LESSON_VIDEO_PREFIX}/${courseId}/${lessonId}/`;
}

export async function createLessonVideoUpload(
    courseId: string,
    lessonId: string,
    contentType: string,
): Promise<{ uploadUrl: string; key: string } | null> {
    const s3 = client();
    if (!s3) return null;

    const extension = EXTENSIONS[contentType] ?? "bin";
    const key = `${lessonVideoPrefix(courseId, lessonId)}${randomUUID()}.${extension}`;

    const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            ContentType: contentType,
        }),
        { expiresIn: 60 * 60 },
    );

    return { uploadUrl, key };
}

export async function inspectObject(
    key: string,
): Promise<{ sizeBytes: number; contentType: string; url: string } | null> {
    const s3 = client();
    if (!s3) return null;

    try {
        const head = await s3.send(
            new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
        );
        return {
            sizeBytes: head.ContentLength ?? 0,
            contentType: head.ContentType ?? "application/octet-stream",
            url: publicUrl(key),
        };
    } catch {
        return null;
    }
}

export async function deleteLessonObject(
    courseId: string,
    lessonId: string,
    key: string,
) {
    if (!key.startsWith(lessonVideoPrefix(courseId, lessonId))) return;

    const s3 = client();
    if (!s3) return;

    try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    } catch {}
}

export async function putCourseCover(
    courseId: string,
    file: { bytes: Uint8Array; contentType: string },
): Promise<string | null> {
    const s3 = client();
    if (!s3) return null;

    const extension = EXTENSIONS[file.contentType] ?? "bin";
    const key = `courses/${courseId}/cover/${randomUUID()}.${extension}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.bytes,
            ContentType: file.contentType,
            CacheControl: "public, max-age=31536000, immutable",
        }),
    );

    return publicUrl(key);
}

export async function deleteCourseCover(courseId: string, url: string | null) {
    if (!url) return;
    const prefix = `${endpoint()}/${BUCKET}/courses/${courseId}/cover/`;
    if (!endpoint() || !url.startsWith(prefix)) return;

    const s3 = client();
    if (!s3) return;

    try {
        await s3.send(
            new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: url.slice(`${endpoint()}/${BUCKET}/`.length),
            }),
        );
    } catch {}
}
