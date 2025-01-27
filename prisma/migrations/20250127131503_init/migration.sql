-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "difficulty" "QuestionDifficulty";
