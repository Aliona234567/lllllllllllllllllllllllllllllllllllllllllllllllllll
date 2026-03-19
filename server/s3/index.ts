import { S3Client } from "@aws-sdk/client-s3";

const globalForS3 = globalThis as unknown as {
    s3: S3Client | undefined
};

export const s3 = globalForS3.s3 ?? new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true, // Важно для совместимости с S3-совместимыми хранилищами (MinIO, Yandex Object Storage и т.д.)
});

if (process.env.NODE_ENV !== 'production') {
    globalForS3.s3 = s3;
}