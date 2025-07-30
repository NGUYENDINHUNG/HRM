import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadFileService {
  private s3_client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.getOrThrow<string>('AWS_REGION');
    const accessKeyId = this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey =this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');

    this.s3_client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async Upload(
    path: string,
    { file, file_name }: { file: Buffer; file_name: string },
  ) {
    const bucket_name = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    const key = file_name;

    await this.s3_client.send(
      new PutObjectCommand({
        Bucket: bucket_name,
        Key: key,
        Body: file,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      }),
    );

    return {
      url: `https://${bucket_name}.s3.amazonaws.com/${key}`,
    };
  }
}
