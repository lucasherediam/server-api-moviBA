const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

// Leer y parsear el archivo JSON
const data = JSON.parse(fs.readFileSync('./prisma/assets/routes_stops.json', 'utf-8'));

async function main() {
  for (const routeId in data) {
      const routeData = data[routeId];

      // Insertar la ruta
      const route = await prisma.route.upsert({
          where: { route_id: routeId },
          update: {},
          create: {
              route_id: routeId,
              route_short_name: routeData.route_short_name,
              route_long_name: routeData.route_long_name
          }
      });

      // Insertar las paradas y las relaciones con la ruta
      for (const stop of routeData.stops) {
          const busStop = await prisma.busStop.upsert({
              where: { stop_id: stop.stop_id },
              update: {},
              create: {
                  stop_id: stop.stop_id,
                  stop_name: stop.stop_name,
                  latitude: stop.stop_lat,
                  longitude: stop.stop_lon
              }
          });

          // Crear la relación BusStopRoute
          await prisma.busStopRoute.upsert({
              where: {
                  stop_id_route_id: {
                      stop_id: stop.stop_id,
                      route_id: routeId
                  }
              },
              update: {},
              create: {
                  stop_id: stop.stop_id,
                  route_id: routeId
              }
          });
      }
  }
}

main()
  .then(() => {
    console.log('Seed completado.');
  })
  .catch((e) => {
    console.error('Error insertando los datos: ', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
