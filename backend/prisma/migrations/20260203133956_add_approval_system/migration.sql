-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CUTI', 'IJIN', 'PULANG_CEPAT', 'DINAS_LUAR', 'SAKIT');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "karyawan" ADD COLUMN     "SUPERIOR_ID" VARCHAR(9);

-- CreateTable
CREATE TABLE "pengajuan" (
    "id" UUID NOT NULL,
    "EMPL_ID" VARCHAR(9) NOT NULL,
    "TYPE" "RequestType" NOT NULL,
    "START_DATE" TIMESTAMP(3) NOT NULL,
    "END_DATE" TIMESTAMP(3),
    "REASON" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "ATTACHMENTS" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengajuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_log" (
    "id" UUID NOT NULL,
    "pengajuanId" UUID NOT NULL,
    "APPROVER_ID" VARCHAR(9) NOT NULL,
    "level" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL,
    "remarks" TEXT,
    "action_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_SUPERIOR_ID_fkey" FOREIGN KEY ("SUPERIOR_ID") REFERENCES "karyawan"("EMPL_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengajuan" ADD CONSTRAINT "pengajuan_EMPL_ID_fkey" FOREIGN KEY ("EMPL_ID") REFERENCES "karyawan"("EMPL_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_log" ADD CONSTRAINT "approval_log_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "pengajuan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_log" ADD CONSTRAINT "approval_log_APPROVER_ID_fkey" FOREIGN KEY ("APPROVER_ID") REFERENCES "karyawan"("EMPL_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
