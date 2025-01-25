import { Update, Ctx, On, Start, Help, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { PollService } from './poll.service';
import { UserService } from 'src/users/user.service';
import { PrismaService } from 'src/db/prisma.service';


@Update()
export class TelegramBotUpdate {
  constructor(private readonly pollService: PollService, 
    private readonly prisma: PrismaService,
    private readonly userService: UserService) {}

  private registrationSteps = new Map<string, {
    step: 'USERNAME' | 'FIRSTNAME' | 'LASTNAME' | 'AGE',
    data: Partial<{
      telegramId: string,
      username: string,
      firstName: string,
      lastName: string,
      age: number
    }>
  }>();

  private selectionState = new Map<number, {
    stage: 'POLL_SELECTION' | 'USER_SELECTION',
    pollId?: number
  }>();

  @Command('start')
  async onStart(@Ctx() ctx: Context) {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    // Start registration process
    this.registrationSteps.set(telegramId, {
      step: 'USERNAME',
      data: { telegramId }
    });

    await ctx.reply('Welcome! Let\'s register you.');
    await ctx.reply('Please choose a unique username:');
  }
  @On('text')
  async handleRegistration(@Ctx() ctx: Context) {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    const message = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const registrationState = this.registrationSteps.get(telegramId);

    if (!registrationState) return;

    switch (registrationState.step) {
      case 'USERNAME':
        try {
          const isAvailable = await this.userService.checkUsernameAvailability(message);
          if (!isAvailable) {
            await ctx.reply('Username is already taken. Please choose another:');
            return;
          }

          registrationState.data.username = message;
          registrationState.step = 'FIRSTNAME';
          await ctx.reply('Enter your first name:');
        } catch (error) {
          await ctx.reply('Error with username. Please try again:');
        }
        break;

      case 'FIRSTNAME':
        registrationState.data.firstName = message;
        registrationState.step = 'LASTNAME';
        await ctx.reply('Enter your last name:');
        break;

      case 'LASTNAME':
        registrationState.data.lastName = message;
        registrationState.step = 'AGE';
        await ctx.reply('Enter your age:');
        break;

      case 'AGE':
        const age = parseInt(message);
        if (isNaN(age) || age < 1 || age > 120) {
          await ctx.reply('Invalid age. Please enter a valid age:');
          return;
        }

        registrationState.data.age = age;

        // Complete registration
        try {
          await this.userService.registerUser(registrationState.data as any);
          await ctx.reply('Registration complete!');
          this.registrationSteps.delete(telegramId);
        } catch (error) {
            console.log(error, " error");
          await ctx.reply('Registration failed. Please start over with /start');
        }
        break;
    }
  }

 @Command('assign_poll')
async assignPoll(@Ctx() ctx: Context) {
  // Fetch available polls
  const polls = await this.prisma.poll.findMany({
    select: { id: true, title: true }
  });

  console.log(polls, " polls");

  // Fetch registered users
  const users = await this.prisma.user.findMany({
    select: { id: true, username: true }
  });

  console.log(users, " users");

  // Create inline keyboard for poll selection
  const pollKeyboard = polls.map(poll => [
    { text: poll.title, callback_data: `select_poll:${poll.id}` }
  ]);

  console.log(pollKeyboard, " pollKeyboard");

  await ctx.reply('Select a poll:', {
    reply_markup: { inline_keyboard: pollKeyboard }
  });

  // Store poll selection state
  this.selectionState.set(ctx.from.id, { stage: 'POLL_SELECTION' });
}

@On('callback_query')
async handleCallbackQuery(@Ctx() ctx: Context) {
  const userId = ctx.from.id;

  if (!('data' in ctx.callbackQuery)) return;

  const data = ctx.callbackQuery.data;
    console.log(data, " data");
  const state = this.selectionState.get(userId);

  if (state.stage === 'POLL_SELECTION' && data.startsWith('select_poll:')) {
    const pollId = parseInt(data.split(':')[1]);
    
    // Fetch users
    const users = await this.prisma.user.findMany({
      select: { id: true, username: true }
    });

    // Create inline keyboard for user selection
    const userKeyboard = users.map(user => [
      { text: user.username, callback_data: `select_user:${user.id}:${pollId}` }
    ]);

    await ctx.editMessageText('Select a user:', {
      reply_markup: { inline_keyboard: userKeyboard }
    });

    this.selectionState.set(userId, { 
      stage: 'USER_SELECTION', 
      pollId 
    });
  }
  else if (state.stage === 'USER_SELECTION' && data.startsWith('select_user:')) {
    const [, userId, pollId] = data.split(':');

    // Update user's current poll
    await this.prisma.user.update({
      where: { id: userId },
      data : {
        current_poll_id : Number(pollId)
      }
    });

    this.selectionState.delete(Number(userId));
    await ctx.editMessageText(`Poll ${pollId} assigned to user!`);
  }
}

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: Context) {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;

    const userId = ctx.from?.id.toString();
    if (!userId) return;

    const [action, optionIndex] = (ctx.callbackQuery.data as string).split(':');
    console.log(action, " action");
    console.log(optionIndex, " optionIndex");
    // if (action === 'answer') {
    //   const result = this.pollService.submitAnswer(userId, parseInt(optionIndex));
      
    //   if (!result) {
    //     await ctx.answerCbQuery('Invalid poll state');
    //     return;
    //   }

    //   if (result.isCorrect) {
    //     await ctx.answerCbQuery('Correct!');
    //   } else {
    //     await ctx.answerCbQuery('Wrong answer!');
    //   }

    //   if (result.isComplete) {
    //     const finalResults = this.pollService.getPollResults(userId);
    //     await ctx.editMessageText(
    //       `Poll Completed! \n\nResults:\nCorrect Answers: ${finalResults.correctAnswers}/${finalResults.totalQuestions}\nPercentage: ${finalResults.percentage}%`
    //     );
    //   } else {
    //     await this.sendNextQuestion(ctx, userId, result.nextQuestion);
    //   }
    // }
  }

  @Command('start_poll')
  async onCommand(@Ctx() ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;

    console.log(ctx.message.text, " ctx.message.text");

    const command = ctx.message.text;
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    if (command === '/start_poll') {

        const questions = await this.pollService
    
      const samplePoll = {
        questions: [
          {
            question: 'What is the capital of France?',
            options: [
              { text: 'London', isCorrect: false },
              { text: 'Berlin', isCorrect: false },
              { text: 'Paris', isCorrect: true },
              { text: 'Rome', isCorrect: false }
            ]
          },
          {
            question: 'Which planet is known as the Red Planet?',
            options: [
              { text: 'Venus', isCorrect: false },
              { text: 'Mars', isCorrect: true },
              { text: 'Jupiter', isCorrect: false },
              { text: 'Saturn', isCorrect: false }
            ]
          }
          // Add more questions here
        ]
      };

    //   this.pollService.createPoll(userId, samplePoll);
      await ctx.replyWithPoll(
         'What is the capital of France?',
         [
         'London',
         'Berlin',
         'Paris',
         'Rome'
        ],
        {is_anonymous : false, correct_option_id :2}
      )
    }
  }


  private async sendNextQuestion(ctx: Context, userId: string, question: any) {
    const keyboard = {
      inline_keyboard: question.options.map((option, index) => [
        {
          text: option.text,
          callback_data: `answer:${index}`
        }
      ])
    };
    console.log(keyboard, " keyboard");

    await ctx.editMessageText(question.question, {
      reply_markup: keyboard
    });
  }
}