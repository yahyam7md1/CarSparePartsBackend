import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { StorageAdapter } from "./types.js";

function normalizeKey(key: string): string {
  return key.replace(/^[/\\]+/, "").replaceAll("\\", "/");
}

export class S3StorageAdapter implements StorageAdapter {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly publicBaseUrl: string,
    private readonly useObjectAclPublicRead: boolean,
  ) {}

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    const k = normalizeKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: k,
        Body: body,
        ContentType: contentType,
        ...(this.useObjectAclPublicRead ? { ACL: "public-read" as const } : {}),
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    const k = normalizeKey(key);
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: k,
      }),
    );
  }

  publicUrlForKey(key: string): string {
    const clean = normalizeKey(key);
    const base = this.publicBaseUrl.replace(/\/$/, "");
    return `${base}/${clean}`;
  }
}

export function createS3ClientForSpaces(config: {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint.replace(/\/$/, ""),
    forcePathStyle: false,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}
