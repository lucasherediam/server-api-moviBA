/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `stop_id` on the `User` table. All the data in the column will be lost.
  - Added the required column `route_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "user_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "route_id"),
    CONSTRAINT "User_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "BusRoute" ("route_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("user_id") SELECT "user_id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
