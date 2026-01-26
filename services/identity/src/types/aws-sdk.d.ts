declare module '@aws-sdk/client-s3' {
  export interface AwsCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  }

  export interface S3ClientConfig {
    region?: string;
    credentials?: AwsCredentials;
    [key: string]: unknown;
  }

  export interface PutObjectCommandInput {
    Bucket: string;
    Key: string;
    Body?: unknown;
    ContentType?: string;
    [key: string]: unknown;
  }

  export class PutObjectCommand {
    constructor(input: PutObjectCommandInput);
    readonly input: PutObjectCommandInput;
  }

  export class S3Client {
    constructor(config?: S3ClientConfig);
    readonly config: S3ClientConfig;
    send<T = unknown>(command: { input: Record<string, unknown> }): Promise<T>;
  }
}

declare module '@aws-sdk/s3-presigned-post' {
  import type { S3Client } from '@aws-sdk/client-s3';

  export interface PresignedPost {
    url: string;
    fields: Record<string, string>;
  }

  export interface CreatePresignedPostOptions {
    Bucket: string;
    Key?: string;
    Fields?: Record<string, string>;
    Conditions?: unknown[];
    Expires?: number;
    [key: string]: unknown;
  }

  export function createPresignedPost(
    client: S3Client,
    params: CreatePresignedPostOptions
  ): Promise<PresignedPost>;
}
