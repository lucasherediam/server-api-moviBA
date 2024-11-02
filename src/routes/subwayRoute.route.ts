import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const Route = (prisma: PrismaClient) => {
  const router = Router();

  // Nuevo Endpoint: Obtener el shape (trayectoria) de una línea específica
  router.get("/:route_short_name/shape", async (req, res) => {
    const { route_short_name } = req.params;

    try {
      // Buscar el shape asociado a la ruta especificada a través de los trips
      const shapes = await prisma.subwayShapePoint.findMany({
        where: { route_short_name },
        orderBy: { shape_pt_sequence: 'asc' }, 
      });

      if (shapes.length === 0) {
        res.status(404).json({ error: "No se encontró una trayectoria para la línea especificada" });
      } else {
        res.json(shapes);
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la trayectoria de la línea" });
    }
  });

  // Endpoint para obtener las paradas de una ruta específica
router.get('/:route_short_name/stations', async (req, res) => {
    const { route_short_name } = req.params;

    try {
      // Buscar las paradas asociadas a la ruta especificada
      const stops = await prisma.subwayStation.findMany({
        where: { 
            route_short_name: route_short_name },
        orderBy: {
          station_id: 'asc',
        },
      });
      console.log(stops);
      if (stops.length === 0) {
        res.status(404).json({ error: 'No se encontraron estaciones para la linea especificada' });
      }
      res.json(stops);
    } catch (error) {
      console.error('Error al obtener las estaciones de la linea:', error);
      res.status(500).json({ error: 'Error al obtener las estaciones de la linea' });
    }
  });

  return router;
};

export default Route;
