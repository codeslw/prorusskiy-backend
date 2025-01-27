import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { PrismaService } from './db/prisma.service';
import { TelegramBotUpdate } from './telegram/telegram.service';
import { PollService } from './telegram/poll.service';
import { UserService } from './users/user.service';
import { ConfigModule } from '@nestjs/config';
import { PollController } from './poll/poll.controller';
import { PollModule } from './poll/poll.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
    PollModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, TelegramBotUpdate, PollService, UserService],
})
export class AppModule {}
