import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const client_id = process.env.CLIENT_ID || '';
const client_secret = process.env.CLIENT_SECRET || '';

const Route = (prisma: PrismaClient) => {
  const router = Router();

  // Obtener el shape (trayectoria) de una línea específica
  router.get("/:route_id/shape", async (req, res) => {
    const { route_id } = req.params;

    try {
      // Buscar el shape asociado a la ruta especificada a través de los trips
      const shapes = await prisma.busShape.findMany({
        where: {
          BusTrip: {
            some: {
              route_id,
            },
          },
        },
        select: {
          shape_id: true,
          shape_points: {
            select: {
              shape_pt_lat: true,
              shape_pt_lon: true,
              shape_pt_sequence: true,
              shape_dist_traveled: true,
            },
            orderBy: {
              shape_pt_sequence: 'asc', // Ordenar los puntos según la secuencia
            },
          },
        },
      });

      if (shapes.length === 0) {
        res.status(404).json({ error: "No se encontró una trayectoria para la línea especificada" });
      } else {
        // Mapeo de resultados para devolver los puntos del shape
        const result = shapes.map((shape) => ({
          shape_id: shape.shape_id,
          points: shape.shape_points,
        }));

        res.json(result);
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la trayectoria de la línea" });
    }
  });

  // Endpoint para obtener las paradas de una ruta específica
  router.get('/:route_id/stops', async (req, res) => {
    const { route_id } = req.params;

    try {
      // Buscar las paradas asociadas a la ruta especificada
      const stops = await prisma.busRouteStop.findMany({
        where: {
          route_id: route_id,
        },
        select: {
          stop: {
            select: {
              stop_id: true,
              stop_name: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy: {
          stop: {
            stop_id: 'asc', // Ordenar por stop_id, ajusta si necesitas un orden diferente
          },
        },
      });
    //   console.log(stops);
      if (stops.length === 0) {
        res.status(404).json({ error: 'No se encontraron paradas para la ruta especificada' });
      }

      // Mapear las paradas para devolver solo las coordenadas y nombres
      const stopData = stops.map((stop) => ({
        stop_id: stop.stop.stop_id,
        stop_name: stop.stop.stop_name,
        latitude: stop.stop.latitude,
        longitude: stop.stop.longitude,
      }));

      res.json(stopData);
    } catch (error) {
      console.error('Error al obtener las paradas de la ruta:', error);
      res.status(500).json({ error: 'Error al obtener las paradas de la ruta' });
    }
  });

  router.get("/:route_id/position", async (req, res) => {
    const { route_id } = req.params;
    try {
      console.log("route_id", route_id);
      const response = await fetch(
        `https://apitransporte.buenosaires.gob.ar/colectivos/vehiclePositionsSimple?client_id=${client_id}&client_secret=${client_secret}&route_id=${route_id}`
      );

      if (!response.ok) {
        console.error('Error en la respuesta de la API:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      if (data) {
        // Filtrar los colectivos que tienen velocidad mayor a 0
        const filteredData = data
  .filter(
    (vehicle: { speed: number }) =>
      vehicle.speed > 0 && !Number.isInteger(vehicle.speed) // Filtra solo si la velocidad es un número decimal
  )
  .map((vehicle: { route_id: string; latitude: number; longitude: number; speed: number }) => ({
    route_id: vehicle.route_id,
    latitude: vehicle.latitude,
    longitude: vehicle.longitude,
    speed: vehicle.speed,
  }));

        console.log("data backend (filtrada)", filteredData);
        res.json(filteredData);
      } else {
        res.status(404).json({ error: "Tiempos de llegada no encontrados" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el tiempo de llegada del tren" });
    }
  });

  return router;
};

export default Route;
