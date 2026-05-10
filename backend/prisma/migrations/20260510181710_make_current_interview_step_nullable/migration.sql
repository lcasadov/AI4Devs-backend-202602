-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_currentInterviewStep_fkey";

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "currentInterviewStep" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_currentInterviewStep_fkey" FOREIGN KEY ("currentInterviewStep") REFERENCES "InterviewStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
