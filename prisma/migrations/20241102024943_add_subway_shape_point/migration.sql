-- CreateTable
CREATE TABLE "SubwayShapePoint" (
    "route_short_name" TEXT NOT NULL,
    "shape_pt_lat" REAL NOT NULL,
    "shape_pt_lon" REAL NOT NULL,
    "shape_pt_sequence" INTEGER NOT NULL,
    "shape_dist_traveled" REAL,

    PRIMARY KEY ("route_short_name", "shape_pt_sequence")
);
