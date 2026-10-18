import { Module } from '@nestjs/common';
import { StartupsController } from './startups.controller';
import { StartupsService } from './startups.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StartupsController],
  providers: [StartupsService],
  exports: [StartupsService],
})
export class StartupsModule {}
