import { type PrismaClient } from "@prisma/client"
import BusStop from "./busStop.route"
import { type Express } from "express"

const addRoutes = (app: Express, prisma: PrismaClient) => {
    app.get('/', (req, res) => {
        res.send({
            message: "Hello world!"
        })
    })
    // Acá van las custom routers
    app.use('/bus-stops', BusStop(prisma))
}

export default addRoutes
