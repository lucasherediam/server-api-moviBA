import { type PrismaClient } from "@prisma/client"
import { Router } from "express"

const BusStop = (prisma: PrismaClient) => {
  const router = Router()

  // Endpoint para devolver todas las paradas de colectivo
  router.get('/', async (req, res) => {
    try {
      const busStops = await prisma.busStop.findMany()
      res.json(busStops)
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las paradas de autobús" })
    }
  })

  // Endpoint para buscar una parada de colectivo por su stop_id
  router.get('/:stop_id', async (req, res) => {
    const { stop_id } = req.params

    try {
      const busStop = await prisma.busStop.findUnique({
        where: { stop_id }
      })

      if (busStop) {
        res.json(busStop)
      } else {
        res.status(404).json({ error: "Parada de colectivo no encontrada" })
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la parada de colectivo" })
    }
  })

  return router
}

export default BusStop
