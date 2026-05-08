-- Add movement class classification for stock alert policy.
CREATE TYPE "MovementClass" AS ENUM ('slow', 'medium', 'fast');

ALTER TABLE "Product"
ADD COLUMN "movementClass" "MovementClass" NOT NULL DEFAULT 'medium';
