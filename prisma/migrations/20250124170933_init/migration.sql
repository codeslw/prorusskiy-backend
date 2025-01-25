/*
  Warnings:

  - You are about to drop the column `answer` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `isCorrect` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `pollId` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `text` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "questions" DROP COLUMN "answer",
DROP COLUMN "isCorrect",
DROP COLUMN "pollId",
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "polls" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers_table" (
    "questionId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,

    CONSTRAINT "question_answers_table_pkey" PRIMARY KEY ("questionId","answerId")
);

-- CreateTable
CREATE TABLE "PollQuestions" (
    "pollId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "PollQuestions_pkey" PRIMARY KEY ("pollId","questionId")
);

-- AddForeignKey
ALTER TABLE "question_answers_table" ADD CONSTRAINT "question_answers_table_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers_table" ADD CONSTRAINT "question_answers_table_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollQuestions" ADD CONSTRAINT "PollQuestions_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollQuestions" ADD CONSTRAINT "PollQuestions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
