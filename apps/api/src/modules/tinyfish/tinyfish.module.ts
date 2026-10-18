import { Module } from '@nestjs/common';
import { TinyFishController } from './tinyfish.controller';
import { TinyFishService } from './tinyfish.service';
import { TinyFishClient } from './tinyfish.client';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TinyFishController],
  providers: [TinyFishService, TinyFishClient],
  exports: [TinyFishService, TinyFishClient],
})
export class TinyFishModule {}
