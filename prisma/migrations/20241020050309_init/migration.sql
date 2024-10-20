-- CreateTable
CREATE TABLE "BusAgency" (
    "agency_id" TEXT NOT NULL PRIMARY KEY,
    "agency_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BusRoute" (
    "route_id" TEXT NOT NULL PRIMARY KEY,
    "agency_id" TEXT NOT NULL,
    "route_short_name" TEXT NOT NULL,
    CONSTRAINT "BusRoute_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "BusAgency" ("agency_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusStop" (
    "stop_id" TEXT NOT NULL PRIMARY KEY,
    "stop_name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "BusStopRoute" (
    "stop_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,

    PRIMARY KEY ("stop_id", "route_id"),
    CONSTRAINT "BusStopRoute_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "BusStop" ("stop_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BusStopRoute_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "BusRoute" ("route_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusTrip" (
    "trip_id" TEXT NOT NULL PRIMARY KEY,
    "route_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "trip_headsign" TEXT NOT NULL,
    "shape_id" TEXT,
    CONSTRAINT "BusTrip_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "BusRoute" ("route_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BusTrip_shape_id_fkey" FOREIGN KEY ("shape_id") REFERENCES "BusShape" ("shape_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusShape" (
    "shape_id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "BusShapePoint" (
    "shape_id" TEXT NOT NULL,
    "shape_pt_lat" REAL NOT NULL,
    "shape_pt_lon" REAL NOT NULL,
    "shape_pt_sequence" INTEGER NOT NULL,
    "shape_dist_traveled" REAL,

    PRIMARY KEY ("shape_id", "shape_pt_sequence"),
    CONSTRAINT "BusShapePoint_shape_id_fkey" FOREIGN KEY ("shape_id") REFERENCES "BusShape" ("shape_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubwayStation" (
    "station_id" TEXT NOT NULL PRIMARY KEY,
    "station_name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "route_short_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StationParentStation" (
    "station_id" TEXT NOT NULL,
    "parent_station" TEXT NOT NULL,

    PRIMARY KEY ("station_id", "parent_station")
);
