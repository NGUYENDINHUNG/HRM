import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import { UploadFileService } from './upload-files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/common/decorator/customize';

@Controller('upload-files')
export class UploadFilesController {
  constructor(private readonly uploadFilesService: UploadFileService) {}
  @Public()
  @Post('upload')
  @ResponseMessage('upload thành công')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(new ParseFilePipe({})) file: Express.Multer.File,
  ) {
    return await this.uploadFilesService.Upload(file.originalname, {
      file: file.buffer,
      file_name: file.originalname,
    });
  }
}
