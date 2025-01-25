import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { PrismaService } from './db/prisma.service';
import { TelegramBotUpdate } from './telegram/telegram.service';
import { PollService } from './telegram/poll.service';
import { UserService } from './users/user.service';


@Module({
  imports: [ TelegrafModule.forRoot({
    token: process.env.TELEGRAM_BOT_TOKEN || '', // Replace with your bot token
  })],
  controllers: [AppController],
  providers: [AppService, PrismaService, TelegramBotUpdate, PollService, UserService],
})
export class AppModule {}
