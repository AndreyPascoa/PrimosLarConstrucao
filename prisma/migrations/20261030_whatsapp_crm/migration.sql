-- CreateTable
CREATE TABLE "CrmUser" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmSession" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmSession_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "WaAccount" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "qr" TEXT,
    "qrExpiresAt" TIMESTAMP(3),
    "command" TEXT NOT NULL DEFAULT 'disconnect',
    "commandId" TEXT NOT NULL DEFAULT '',
    "heartbeatAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmConversation" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "assignedSellerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT NOT NULL DEFAULT '',
    "quoteId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmAttachment" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "requestKey" TEXT,
    "externalKey" TEXT,
    "direction" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "attachmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "error" TEXT,
    "author" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmUser_sellerId_key" ON "CrmUser"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmUser_email_key" ON "CrmUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WaAccount_sellerId_key" ON "WaAccount"("sellerId");

-- CreateIndex
CREATE INDEX "CrmConversation_assignedSellerId_updatedAt_idx" ON "CrmConversation"("assignedSellerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CrmConversation_accountId_phone_key" ON "CrmConversation"("accountId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "CrmAttachment_path_key" ON "CrmAttachment"("path");

-- CreateIndex
CREATE UNIQUE INDEX "CrmMessage_requestKey_key" ON "CrmMessage"("requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "CrmMessage_externalKey_key" ON "CrmMessage"("externalKey");

-- CreateIndex
CREATE INDEX "CrmMessage_conversationId_createdAt_idx" ON "CrmMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmMessage_status_createdAt_idx" ON "CrmMessage"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "CrmConversation" ADD CONSTRAINT "CrmConversation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WaAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmAttachment" ADD CONSTRAINT "CrmAttachment_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CrmConversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMessage" ADD CONSTRAINT "CrmMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "CrmConversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmMessage" ADD CONSTRAINT "CrmMessage_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "CrmAttachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "CrmUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrmAttachment" ENABLE ROW LEVEL SECURITY;
