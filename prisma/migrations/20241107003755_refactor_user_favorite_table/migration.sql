/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserFavoriteRoute" (
    "user_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "route_id"),
    CONSTRAINT "UserFavoriteRoute_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "BusRoute" ("route_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
