import { Router } from 'express';
import { type PrismaClient } from '@prisma/client';
import fs from 'fs';  // Importamos el módulo fs para trabajar con archivos

const BusAgency = (prisma: PrismaClient) => {
  const router = Router();

  // Endpoint para obtener todas las agencias con sus rutas
  router.get('/', async (req, res) => {
    try {
      const agencies = await prisma.busAgency.findMany({
        select: {
          agency_id: true,
          agency_name: true,
          agency_color: true,
          agency_type: true,
          routes: {
            select: {
              route_id: true,
              route_short_name: true,
              route_desc: true,
            },
          },
        },
      });

      // Convertimos el objeto agencies a una cadena JSON
      const agenciesText = JSON.stringify(agencies, null, 2);

      // Guardamos el resultado en un archivo txt
      fs.writeFile('agencies.txt', agenciesText, (err) => {
        if (err) {
          console.error('Error al guardar el archivo:', err);
        } else {
          console.log('Archivo guardado exitosamente');
        }
      });

      res.json(agencies);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las agencias' });
    }
  });

  return router;
};

export default BusAgency;
