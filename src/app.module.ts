import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SocialModule } from './social/social.module';
import { TrustModule } from './trust/trust.module';
import { ZkModule } from './zk/zk.module';
import { DustModule } from './dust/dust.module';
import { TierModule } from './tier/tier.module';
import { SbtModule } from './sbt/sbt.module';
import { JobsModule } from './jobs/jobs.module';
import { EscrowModule } from './escrow/escrow.module';
import { NotificationModule } from './notifications/notification.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BlockchainModule,
    AuthModule,
    UsersModule,
    DustModule,
    TrustModule,
    SocialModule,
    TierModule,
    SbtModule,
    ZkModule,
    JobsModule,
    EscrowModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
