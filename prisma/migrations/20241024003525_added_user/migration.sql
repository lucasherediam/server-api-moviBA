-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "stop_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "stop_id"),
    CONSTRAINT "User_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "BusStop" ("stop_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
