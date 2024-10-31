import { type PrismaClient } from "@prisma/client";
import { Router } from "express";
import dotenv from 'dotenv';
dotenv.config();

const client_id = process.env.CLIENT_ID || '';
const client_secret = process.env.CLIENT_SECRET || '';

type Time = {
    time: number;
    delay: number;
};

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
      where: { station_id },
      include: {
        color: {
          select: {
            color: true
          }
        }
      }
    });

    if (subwayStation) {
      res.json({
        ...subwayStation,
        color: subwayStation.color?.color || null
      });
    } else {
      res.status(404).json({ error: "Estacion de subte no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la estacion de subte" });
  }
});


  // Endpoint para buscar una estacion de subte por su station_id
  router.get("/:station_id/color", async (req, res) => {
    const { station_id } = req.params;

    try {
      const subwayStation = await prisma.subwayStation.findUnique({
        where: { station_id }
      });

      const color = await prisma.subwayColor.findUnique({
        where: { route_short_name: subwayStation?.route_short_name }
      })

      if (color) {
        res.json(color);
      } else {
        res.status(404).json({ error: "Color de la linea de la estacion de subte no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el color de la linea la estacion de subte" });
    }
  });

  router.get("/:station_id/arrival", async (req, res) => {
    const { station_id } = req.params;

    const calculateTime = (time: Time): { time: string; remainingTime: string } => {
        // Convertir el tiempo UNIX a milisegundos y sumar el delay
        const arrivalTime = new Date((time.time + time.delay) * 1000);
        
        // Obtener el tiempo actual
        const currentTime = new Date();
        
        // Calcular la diferencia en milisegundos y luego convertir a minutos y segundos
        const timeDifference = (arrivalTime.getTime() - currentTime.getTime()) / 1000; // Diferencia en segundos
        const minutes = Math.floor(timeDifference / 60);
        const seconds = Math.floor(timeDifference % 60);
        
        return {
            time: arrivalTime.toLocaleString(), // Formato legible
            remainingTime: `${minutes} minutes and ${seconds} seconds`
        };
    };

    try {
        const subwayStation = await prisma.subwayStation.findUnique({
            where: { station_id }
          });
        
        const childSubwayStations = (await prisma.stationParentStation.findMany({
        where: { parent_station: station_id }
        })).map((station) => station.station_id);
        console.log('childSubwayStations:',childSubwayStations);
    
        const response = await fetch(`https://apitransporte.buenosaires.gob.ar/subtes/forecastGTFS?client_id=${client_id}&client_secret=${client_secret}`);
        if (!response.ok) {
            console.error('Error en la respuesta de la API:', response.status, response.statusText);
            return;
          }
          
        const data = await response.json();
        console.log(data);
        const subwayLine = data.Entity.filter((trip: { Linea: { Route_Id: string | undefined; }; }) => {
            console.log(trip.Linea.Route_Id, subwayStation?.route_short_name);
            return trip.Linea.Route_Id == subwayStation?.route_short_name;
        });
        console.log(subwayLine);
        const subwayStationArrivals = await Promise.all(subwayLine.map(async (line: { Linea: { Estaciones: any[]; Trip_Id: any; }; }) => {
            const station = line.Linea.Estaciones.filter((station: { stop_id: string | undefined; }) => station.stop_id && childSubwayStations.includes(station.stop_id))[0];
            const destination = await prisma.subwayTrip.findUnique({
                where: { trip_id: line.Linea.Trip_Id }
            })
            return {
                destination: destination?.trip_headsign,
                station_name: station.stop_name,
                arrival: calculateTime(station.arrival),
                departure: calculateTime(station.departure)
            };
        }));
        console.log(subwayStationArrivals);
        if (subwayStationArrivals) {
            res.json(subwayStationArrivals);
          } else {
            res.status(404).json({ error: "Tiempos de llegada no encontrados" });
          }

    } catch (error) {
      res.status(500).json({ error: "Error al obtener el tiempo de llegada del tren" });
    }
  });


  return router;
};

export default SubwayStation;
