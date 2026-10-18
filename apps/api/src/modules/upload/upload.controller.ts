import {
  Controller, Post, Get, UseGuards, UseInterceptors, UploadedFile, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { CreateDocumentDto } from './upload.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import * as fs from 'fs';

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@ApiTags('Uploads & Documents')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', example: 'pitch_deck' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload document (pitch deck, KYC doc, or image)' })
  async uploadFile(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: any,
    @Body() body: CreateDocumentDto,
  ) {
    return this.uploadService.saveUploadedDocument(userId, file, body.type);
  }

  @Get('my-documents')
  @ApiOperation({ summary: 'Get all documents uploaded by logged-in user' })
  async getMyDocuments(@CurrentUser('id') userId: string) {
    return this.uploadService.getMyDocuments(userId);
  }
}
