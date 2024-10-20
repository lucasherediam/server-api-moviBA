-- CreateTable
CREATE TABLE "BusRouteStop" (
    "route_id" TEXT NOT NULL,
    "stop_id" TEXT NOT NULL,

    PRIMARY KEY ("route_id", "stop_id"),
    CONSTRAINT "BusRouteStop_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "BusRoute" ("route_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BusRouteStop_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "BusStop" ("stop_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
