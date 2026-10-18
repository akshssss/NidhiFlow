import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StartupsModule } from './modules/startups/startups.module';
import { InvestorsModule } from './modules/investors/investors.module';
import { VerificationModule } from './modules/verification/verification.module';
import { InterestsModule } from './modules/interests/interests.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    StartupsModule,
    InvestorsModule,
    VerificationModule,
    InterestsModule,
    ChatModule,
    ReviewsModule,
    LeaderboardModule,
    AdminModule,
    NotificationsModule,
    UploadModule,
  ],
})
export class AppModule {}
