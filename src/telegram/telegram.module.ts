import { Module } from '@nestjs/common';
import { PollService } from './poll.service';

@Module({
    imports: [],
    providers: [PollService],
})
export class TelegramModule {}
