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
    step: 'FULLNAME' | 'PHONE' | 'AGE',
    data: Partial<{
      telegramId: string,
      username: string,
      firstName: string,
      lastName: string,
      phoneNumber: string,
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

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { telegramId }
    });

    if (existingUser) {
      await ctx.reply(`Welcome back, ${existingUser.firstName}! 
        \nYour profile:
        \nUsername: ${existingUser.username}
        \nPhone: ${existingUser.phoneNumber || 'Not provided'}
        \nRole: ${existingUser.role}
        \n\nUse /help to see available commands.`);
      return;
    }

    // Start registration process
    this.registrationSteps.set(telegramId, {
      step: 'FULLNAME',
      data: { 
        telegramId,
        username: ctx.from.username || `user_${telegramId}`
      }
    });

    await ctx.reply('Welcome! Let\'s complete your registration.');
    await ctx.reply('Please enter your full name (e.g., "John Smith"):');
  }

  @On('text')
  async handleRegistration(@Ctx() ctx: Context) {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    const message = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const registrationState = this.registrationSteps.get(telegramId);

    if (!registrationState) return;

    switch (registrationState.step) {
      case 'FULLNAME':
        const nameParts = message.trim().split(' ');
        if (nameParts.length < 2) {
          await ctx.reply('Please enter both your first and last name separated by space:');
          return;
        }

        registrationState.data.firstName = nameParts[0];
        registrationState.data.lastName = nameParts.slice(1).join(' ');
        registrationState.step = 'PHONE';
        await ctx.reply('Please enter your phone number in international format (e.g., +998940992774):');
        break;

      case 'PHONE':
        const phoneRegex = /^\+[1-9]\d{10,14}$/;
        if (!phoneRegex.test(message)) {
          await ctx.reply('Invalid phone number format. Please use international format (e.g., +998940992774):');
          return;
        }

        registrationState.data.phoneNumber = message;
        registrationState.step = 'AGE';
        await ctx.reply('Please enter your age:');
        break;

      case 'AGE':
        const age = parseInt(message);
        if (isNaN(age) || age < 1 || age > 120) {
          await ctx.reply('Invalid age. Please enter a number between 1 and 120:');
          return;
        }

        registrationState.data.age = age;

        // Complete registration
        try {
          const user = await this.userService.registerUser({
            telegramId: registrationState.data.telegramId!,
            username: registrationState.data.username!,
            firstName: registrationState.data.firstName!,
            lastName: registrationState.data.lastName!,
            phoneNumber: registrationState.data.phoneNumber!,
            age: registrationState.data.age!,
            role: 'STUDENT' as const,
            registrationStatus: 'STARTED' as const
          });

          this.registrationSteps.delete(telegramId);

          await ctx.reply(`Registration complete! 
            \nWelcome ${user.firstName}!
            \n\nYour profile:
            \nUsername: ${user.username}
            \nAge: ${user.age}
            \nPhone: ${user.phoneNumber}
            \n\nWhat's next:
            1. You can verify your phone number through our web application
            2. After verification, you'll be able to take quizzes
            3. Use /help to see all available commands
            \nWeb app: https://your-quiz-app.com`);

        } catch (error) {
          console.error('Registration error:', error);
          await ctx.reply('Registration failed. Please try again with /start');
        }
        break;
    }
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply(`Available commands:
      \n/start - Start registration or view profile
      \n/help - Show this help message
      \n/profile - View your profile
      \n/start_poll - Start a quiz (if assigned)
      \n\nNeed assistance? Contact support: @support_username`);
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