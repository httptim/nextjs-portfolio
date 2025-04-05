/*
  Warnings:

  - The values [FULLSTACK,FRONTEND,BACKEND,MOBILE,FUTURE,PERSONAL] on the enum `PortfolioCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PortfolioCategory_new" AS ENUM ('MY_PROJECTS', 'FUTURE_PROJECTS', 'PERSONAL_PROJECTS');
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" TYPE "PortfolioCategory_new" USING ("category"::text::"PortfolioCategory_new");
ALTER TYPE "PortfolioCategory" RENAME TO "PortfolioCategory_old";
ALTER TYPE "PortfolioCategory_new" RENAME TO "PortfolioCategory";
DROP TYPE "PortfolioCategory_old";
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" SET DEFAULT 'MY_PROJECTS';
COMMIT;

-- AlterTable
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" SET DEFAULT 'MY_PROJECTS';
