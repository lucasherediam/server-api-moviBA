import { Router } from 'express';
import { type PrismaClient } from '@prisma/client';

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
      res.json(agencies);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las agencias' });
    }
  });

  return router;
};

export default BusAgency;
