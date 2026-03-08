-- CreateTable
CREATE TABLE "Youth" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Youth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "youthId" TEXT NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "youthId" TEXT NOT NULL,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Guardian" ADD CONSTRAINT "Guardian_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "Youth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_youthId_fkey" FOREIGN KEY ("youthId") REFERENCES "Youth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
