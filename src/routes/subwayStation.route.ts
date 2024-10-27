import { type PrismaClient } from "@prisma/client";
import { Router } from "express";

const SubwayStation = (prisma: PrismaClient) => {
  const router = Router();

  // Endpoint para devolver todas las estaciones de subte cercanas
  router.get("/", async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    try {
      const lat = parseFloat(latitude as string);
      const long = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      const subwayStations = await prisma.subwayStation.findMany({
        where: {
          AND: [
            { latitude: { gte: lat - rad / 111000 } }, // Aproximación de conversión
            { latitude: { lte: lat + rad / 111000 } },
            { longitude: { gte: long - rad / (111000 * Math.cos(lat * Math.PI / 180)) } },
            { longitude: { lte: long + rad / (111000 * Math.cos(lat * Math.PI / 180)) } }
          ]
        }
      });
      res.json(subwayStations);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las estaciones de subte" });
    }
  });

  // Endpoint para buscar una estacion de subte por su station_id
  router.get("/:station_id", async (req, res) => {
    const { station_id } = req.params;

    try {
      const subwayStation = await prisma.subwayStation.findUnique({
        where: { station_id }
      });

      if (subwayStation) {
        res.json(subwayStation);
      } else {
        res.status(404).json({ error: "Estacion de subte no encontrada" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la estacion de subte" });
    }
  });

  return router;
};

export default SubwayStation;
