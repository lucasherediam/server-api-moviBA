/*
  Warnings:

  - You are about to drop the `SubawyColor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SubawyColor";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SubwayColor" (
    "route_short_name" TEXT NOT NULL PRIMARY KEY,
    "color" TEXT NOT NULL
);
