import { type PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import fetch from 'node-fetch';

const client_id = process.env.CLIENT_ID || '';
const client_secret = process.env.CLIENT_SECRET || '';

export function startTrafficAlertsCronJob(prisma: PrismaClient) {
  cron.schedule('*/10 * * * * *', async () => {
    console.log('Ejecutando cron job - Verificando alertas de tráfico...');

    try {
      const response = await fetch(`https://apitransporte.buenosaires.gob.ar/colectivos/serviceAlerts?client_id=${client_id}&client_secret=${client_secret}&json=1`);

      if (!response.ok) {
        console.error('Error en la respuesta de la API:', response.status, response.statusText);
        return;
      }

      const data = await response.json();
      if (!data._entity || data._entity.length === 0) {
        console.log('No hay alertas de tráfico para procesar.');
        return;
      }

      for (const alert of data._entity) {
        try {
          const exists = await prisma.alert.findUnique({ where: { id: alert.id } });

          if (!exists) {
            const newAlert = await prisma.alert.create({
              data: {
                id: alert.id,
                description: alert.descripcion,
                type: alert.tipo,
                date: new Date(alert.fecha),
                submitted: true,
              },
            });
            console.log(`Nueva alerta guardada: ${newAlert.description}`);

            // await sendNotificationToUsers(newAlert); // si tienes esta función disponible
            console.log('Notificación enviada a los usuarios', newAlert);
          }
        } catch (error) {
          console.error(`Error procesando alerta con ID ${alert.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error al ejecutar el cron job:', error);
    }
  });
}
