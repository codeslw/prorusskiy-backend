import { Injectable } from '@nestjs/common';
import { PrismaClient, Poll, Question } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';

interface PollSubmission {
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>
  }>
}

@Injectable()
export class PollService {

  constructor(private db: PrismaService) {}
  

  // Get a specific poll with all its questions and options
   getPollWithQuestions(pollId: string): string {
    return `this is a poll with id ${pollId}`;
  }

  

  // Start a user's poll session
   startPollSession(userId: string, pollId: string) {
    return `this is a poll session for user ${userId} with poll id ${pollId}`;
  }

  // Submit an answer to a specific question
   submitAnswer(sessionId: string, questionId: string, selectedOptionId: string) {
    

    return `this is an answer for question ${questionId} with option`;
  }

  // Get poll results for a user
   getPollResults(userId: string, pollId: string) {
    return `this is the poll results for user ${userId} with poll id ${pollId}`;
  }

  // Save final poll results
   savePollResults(userId: string, pollId: string, totalQuestions: number, correctAnswers: number) {
    return `this is the final poll results for user ${userId} with poll id ${pollId} and total questions ${totalQuestions} and correct answers ${correctAnswers}`;
  }
}