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

const SubwayAlerts = (prisma: PrismaClient) => {
  const router = Router();
  router.get("/", async (req, res) => {

    const routeShortNames = {
        'LineaA': 'Linea A',
        'LineaB': 'Linea B',
        'LineaC': 'Linea C',
        'LineaD': 'Linea D',
        'LineaE': 'Linea E',
        'LineaH': 'Linea H',
        'PM-Civico': 'PM Centro Civico', 
        "PM-Savio": 'PM General Savio',

    };
    try {
      console.log('alertas');
      const response = await fetch(`https://apitransporte.buenosaires.gob.ar/subtes/serviceAlerts?client_id=${client_id}&client_secret=${client_secret}&json=1`);
      if (!response.ok) {
          console.error('Error en la respuesta de la API:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        console.log(data);
        const alerts = data.entity.map((element: { alert: { informed_entity: { route_id: any; }[]; header_text: { translation: { text: any; }[]; }; }; }) => {
            const routeId = element.alert.informed_entity[0].route_id as keyof typeof routeShortNames;
            return {
                route_id: routeId,
                route_short_name: routeShortNames[routeId],
                message: element.alert.header_text.translation[0].text
              }
            });
        if (alerts) {
            res.json(alerts);
          } else {
            res.status(404).json({ error: "No se encontraron alertas" });
          }
      

    } catch (error) {
      res.status(500).json({ error: "Error al obtener alertas de subte" });
    }
  });

  return router;
};

export default SubwayAlerts;
