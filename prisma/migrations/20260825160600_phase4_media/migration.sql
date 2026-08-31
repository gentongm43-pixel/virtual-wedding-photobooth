ALTER TABLE "Event"
  ADD COLUMN "videoDuration" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN "allowVoiceNote" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "voiceNoteDuration" INTEGER NOT NULL DEFAULT 60;

ALTER TABLE "Event" ALTER COLUMN "allowVideo" SET DEFAULT true;

CREATE TABLE "VoiceNote" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "durationMs" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VoiceNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VoiceNote_eventId_createdAt_idx" ON "VoiceNote"("eventId", "createdAt");
ALTER TABLE "VoiceNote" ADD CONSTRAINT "VoiceNote_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoiceNote" ADD CONSTRAINT "VoiceNote_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
