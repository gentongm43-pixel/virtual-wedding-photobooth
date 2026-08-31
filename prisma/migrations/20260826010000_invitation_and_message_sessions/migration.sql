ALTER TABLE "Event"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "primaryColor" TEXT,
  ADD COLUMN "secondaryColor" TEXT;

ALTER TABLE "Message"
  ADD COLUMN "sessionId" TEXT;

CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
