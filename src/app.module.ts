import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { PollModule } from './poll/poll.module';
import { QuestionModule } from './question/question.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { PrismaService } from './db/prisma.service';
import { TelegramBotUpdate } from './telegram/telegram.service';
import { PollService } from './telegram/poll.service';
import { UserService } from './users/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
    PollModule,
    QuestionModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, TelegramBotUpdate, PollService, UserService],
})
export class AppModule {}
