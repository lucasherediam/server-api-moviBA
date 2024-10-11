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
    "user_id" INTEGER,

    PRIMARY KEY ("stop_id", "route_id"),
    CONSTRAINT "BusStopRoute_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "BusStop" ("stop_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BusStopRoute_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "Route" ("route_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Route" (
    "route_id" TEXT NOT NULL PRIMARY KEY,
    "route_short_name" TEXT NOT NULL,
    "route_long_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Station" (
    "station_id" TEXT NOT NULL PRIMARY KEY,
    "station_name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "route_short_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Trip" (
    "trip_id" TEXT NOT NULL PRIMARY KEY,
    "trip_headsign" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StationParentStation" (
    "station_id" TEXT NOT NULL,
    "parent_station" TEXT NOT NULL,

    PRIMARY KEY ("station_id", "parent_station")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserBusStop" (
    "user_id" INTEGER NOT NULL,
    "stop_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "stop_id"),
    CONSTRAINT "UserBusStop_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBusStop_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "BusStop" ("stop_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
