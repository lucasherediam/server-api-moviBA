-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SubwayStation" (
    "station_id" TEXT NOT NULL PRIMARY KEY,
    "station_name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "route_short_name" TEXT NOT NULL,
    CONSTRAINT "SubwayStation_route_short_name_fkey" FOREIGN KEY ("route_short_name") REFERENCES "SubwayColor" ("route_short_name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SubwayStation" ("latitude", "longitude", "route_short_name", "station_id", "station_name") SELECT "latitude", "longitude", "route_short_name", "station_id", "station_name" FROM "SubwayStation";
DROP TABLE "SubwayStation";
ALTER TABLE "new_SubwayStation" RENAME TO "SubwayStation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
