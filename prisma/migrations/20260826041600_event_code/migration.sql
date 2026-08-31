ALTER TABLE "Event" ADD COLUMN "eventCode" TEXT;

DO $$
DECLARE
  event_record RECORD;
  candidate TEXT;
BEGIN
  FOR event_record IN SELECT "id" FROM "Event" WHERE "eventCode" IS NULL LOOP
    LOOP
      candidate := upper(substr(translate(md5(event_record."id" || clock_timestamp()::text),
        '01IOL', 'ABCDEFG'), 1, 6));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Event" WHERE "eventCode" = candidate);
    END LOOP;
    UPDATE "Event" SET "eventCode" = candidate WHERE "id" = event_record."id";
  END LOOP;
END $$;

ALTER TABLE "Event" ALTER COLUMN "eventCode" SET NOT NULL;
CREATE UNIQUE INDEX "Event_eventCode_key" ON "Event"("eventCode");
