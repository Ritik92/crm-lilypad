-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('LEAD', 'NOT_RESPONDING', 'CALL_BACK', 'INTERESTED', 'NOT_INTERESTED', 'HOME_DEMO_SCHEDULED', 'HOME_DEMO_COMPLETED', 'SALE');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'LEAD',
    "notes" TEXT,
    "demoDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
