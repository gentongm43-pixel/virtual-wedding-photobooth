ALTER TABLE "Video"
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "size" INTEGER;

UPDATE "Video"
SET
  "mimeType" = CASE
    WHEN "url" ILIKE '%.mp4' THEN 'video/mp4'
    WHEN "url" ILIKE '%.mov' THEN 'video/quicktime'
    WHEN "url" ILIKE '%.ogg' THEN 'video/ogg'
    ELSE 'video/webm'
  END,
  "size" = 0
WHERE "mimeType" IS NULL OR "size" IS NULL;

ALTER TABLE "Video"
  ALTER COLUMN "mimeType" SET NOT NULL,
  ALTER COLUMN "size" SET NOT NULL;

ALTER TABLE "VoiceNote"
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "size" INTEGER;

UPDATE "VoiceNote"
SET
  "mimeType" = CASE
    WHEN "url" ILIKE '%.mp4' THEN 'audio/mp4'
    WHEN "url" ILIKE '%.mp3' THEN 'audio/mpeg'
    WHEN "url" ILIKE '%.ogg' THEN 'audio/ogg'
    WHEN "url" ILIKE '%.wav' THEN 'audio/wav'
    ELSE 'audio/webm'
  END,
  "size" = 0
WHERE "mimeType" IS NULL OR "size" IS NULL;

ALTER TABLE "VoiceNote"
  ALTER COLUMN "mimeType" SET NOT NULL,
  ALTER COLUMN "size" SET NOT NULL;
