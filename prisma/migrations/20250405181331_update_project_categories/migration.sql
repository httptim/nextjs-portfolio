/*
  Warnings:

  - The values [MY_PROJECTS,FUTURE_PROJECTS] on the enum `PortfolioCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `PortfolioProject` table. All the data in the column will be lost.
  - You are about to drop the column `demoUrl` on the `PortfolioProject` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `PortfolioProject` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `PortfolioProject` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PortfolioCategory_new" AS ENUM ('CLIENT_PROJECTS', 'PERSONAL_PROJECTS');
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" TYPE "PortfolioCategory_new" USING ("category"::text::"PortfolioCategory_new");
ALTER TYPE "PortfolioCategory" RENAME TO "PortfolioCategory_old";
ALTER TYPE "PortfolioCategory_new" RENAME TO "PortfolioCategory";
DROP TYPE "PortfolioCategory_old";
ALTER TABLE "PortfolioProject" ALTER COLUMN "category" SET DEFAULT 'CLIENT_PROJECTS';
COMMIT;

-- AlterTable
ALTER TABLE "PortfolioProject" DROP COLUMN "createdAt",
DROP COLUMN "demoUrl",
DROP COLUMN "githubUrl",
DROP COLUMN "imageUrl",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "demo_url" TEXT,
ADD COLUMN     "github_url" TEXT,
ADD COLUMN     "image_url" TEXT,
ALTER COLUMN "category" SET DEFAULT 'CLIENT_PROJECTS',
ALTER COLUMN "features" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];
