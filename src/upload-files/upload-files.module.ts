import { Module } from '@nestjs/common';
import { UploadFileService } from './upload-files.service';
import { UploadFilesController } from './upload-files.controller';

@Module({
  imports: [],
  controllers: [UploadFilesController],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploadFilesModule {}
