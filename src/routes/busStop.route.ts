import { type PrismaClient } from "@prisma/client";
import { Router } from "express";

const BusStop = (prisma: PrismaClient) => {
  const router = Router();

  // Endpoint para devolver todas las paradas de colectivo cercanas
  router.get("/", async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    try {
      const lat = parseFloat(latitude as string);
      const long = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      const busStops = await prisma.busStop.findMany({
        where: {
          AND: [
            { latitude: { gte: lat - rad / 111000 } }, // Aproximación de conversión
            { latitude: { lte: lat + rad / 111000 } },
            { longitude: { gte: long - rad / (111000 * Math.cos(lat * Math.PI / 180)) } },
            { longitude: { lte: long + rad / (111000 * Math.cos(lat * Math.PI / 180)) } }
          ]
        }
      });
      res.json(busStops);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las paradas de autobús" });
    }
  });

  // Endpoint para buscar una parada de colectivo por su stop_id
  router.get("/:stop_id", async (req, res) => {
    const { stop_id } = req.params;

    try {
      const busStop = await prisma.busStop.findUnique({
        where: { stop_id }
      });

      if (busStop) {
        res.json(busStop);
      } else {
        res.status(404).json({ error: "Parada de colectivo no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la parada de colectivo" });
    }
  });

  // Endpoint para buscar los colectivos que pasan por una stop_id específica
  router.get("/:stop_id/buses", async (req, res) => {
    const { stop_id } = req.params;

    try {
      // Buscar las rutas asociadas a la parada especificada en BusStopRoute
      const routes = await prisma.busRouteStop.findMany({
        where: { stop_id },
        select: {
          route: {
            select: {
              route_id: true,
              route_short_name: true,
              trips: {
                select: {
                  trip_headsign: true,
                },
              },
            },
          },
        },
      });

      if (routes.length === 0) {
        res.status(404).json({ error: "No se encontraron colectivos para la parada especificada" });
      } else {
        // Mapeo de resultados para incluir trip_headsigns de cada ruta, eliminando duplicados
        const result = routes.map((route) => ({
          route_id: route.route.route_id,
          route_short_name: route.route.route_short_name,
          trip_headsigns: Array.from(
            new Set(route.route.trips.map((trip) => trip.trip_headsign))
          ),
        }));

        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los colectivos de la parada" });
    }
  });

  return router;
};

export default BusStop;
