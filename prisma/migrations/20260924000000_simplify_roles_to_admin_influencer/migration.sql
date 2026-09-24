-- Collapse the 5-role model (SUPER_ADMIN, FINANCE, INFLUENCER_MANAGER,
-- ANALYST, INFLUENCER) down to 2 (ADMIN, INFLUENCER) per the simplified
-- product direction: only two user types, Admin and Influencer.
-- Every former admin-tier role becomes ADMIN; INFLUENCER is unchanged.

ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'INFLUENCER');

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role"
  USING (CASE WHEN "role"::text = 'INFLUENCER' THEN 'INFLUENCER' ELSE 'ADMIN' END)::"Role";

DROP TYPE "Role_old";
