import { type PrismaClient } from "@prisma/client"
import BusStop from "./busStop.route"
import BusRoute from "./busRoute.route"
import { type Express } from "express"

const addRoutes = (app: Express, prisma: PrismaClient) => {
    app.get('/api/', (req, res) => {
        res.send({
            message: "Hello world!"
        })
    })
    // Acá van las custom routers
    app.use('/api/bus-stops', BusStop(prisma))
    app.use('/api/bus-route', BusRoute(prisma))
}

export default addRoutes
