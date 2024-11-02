import { type PrismaClient } from "@prisma/client"
import BusStop from "./busStop.route"
import BusRoute from "./busRoute.route"
import SubwayStation from "./subwayStation.route"
import BusAgency from './busAgency.route'
import SubwayRoute from './subwayRoute.route'
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
    app.use('/api/subway-stations', SubwayStation(prisma))
    app.use('/api/bus-agencies', BusAgency(prisma));
    app.use('/api/subway-route', SubwayRoute(prisma));
}

export default addRoutes
