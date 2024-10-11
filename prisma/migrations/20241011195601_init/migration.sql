/*
  Warnings:

  - You are about to drop the `Station` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Station";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SubwayStation" (
    "station_id" TEXT NOT NULL PRIMARY KEY,
    "station_name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "route_short_name" TEXT NOT NULL
);
