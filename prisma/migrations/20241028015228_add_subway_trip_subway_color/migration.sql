-- CreateTable
CREATE TABLE "SubwayTrip" (
    "trip_id" TEXT NOT NULL PRIMARY KEY,
    "trip_headsign" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SubawyColor" (
    "route_short_name" TEXT NOT NULL PRIMARY KEY,
    "color" TEXT NOT NULL
);
