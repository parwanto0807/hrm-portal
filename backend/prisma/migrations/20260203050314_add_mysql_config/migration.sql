-- CreateTable
CREATE TABLE "mysql_config" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL DEFAULT 'localhost',
    "port" INTEGER NOT NULL DEFAULT 3306,
    "user" TEXT NOT NULL DEFAULT 'root',
    "password" TEXT,
    "database" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "mysql_config_pkey" PRIMARY KEY ("id")
);
