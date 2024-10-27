const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
    try {
        // Eliminar los datos de todas las tablas en orden de dependencia inverso
        // await prisma.userBusStop.deleteMany();
        // await prisma.busStopRoute.deleteMany();
        // await prisma.trip.deleteMany();
        // await prisma.shapePoint.deleteMany();
        // await prisma.shape.deleteMany();
        // await prisma.busRoute.deleteMany();
        // await prisma.agency.deleteMany();
        await prisma.stationParentStation.deleteMany();

        console.log('Base de datos limpiada exitosamente.');
    } catch (error) {
        console.error('Error al limpiar la base de datos:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDatabase();
