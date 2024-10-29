const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Conectar Prisma antes de comenzar
async function connectPrisma() {
    try {
        await prisma.$connect();
        console.log("Conectado a la base de datos con éxito.");
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
    }
}

// Función para leer e importar archivos CSV en lotes
async function importCSV(filePath, rowCallback) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', rowCallback)
            .on('end', resolve)
            .on('error', reject);
    });
}

// Función de inserción segura con reintentos y depuración mejorada
async function safeCreateMany(model, data, batchSize = 50) {
    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
        try {
            console.log(`Intentando insertar ${data.length} registros en ${model}...`);
            await model.createMany({ data });
            success = true;
        } catch (error) {
            attempts += 1;
            console.error(`Error al insertar, intento ${attempts}:`, error);

            // Imprimir el primer registro problemático para depuración
            if (error.code === 'P2003') {
                console.log("Registro problemático:", data[0]);
            }

            if (attempts >= 3) throw error; // Lanza error tras 3 intentos fallidos
        }
    }
}


// Importar BusStop desde JSON en transacción
async function seedBusStops(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const stops = JSON.parse(data);
        const batchSize = 50;
        let batch = [];

        for (const stop of stops) {
            batch.push({
                stop_id: stop.stop_id,
                stop_name: stop.stop_name || null,
                latitude: parseFloat(stop.latitude),
                longitude: parseFloat(stop.longitude),
            });

            if (batch.length >= batchSize) {
                await safeCreateMany(prisma.busStop, batch, batchSize);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await safeCreateMany(prisma.busStop, batch, batchSize);
        }

        console.log("Importación de paradas completada desde JSON.");
    } catch (error) {
        console.error("Error al importar paradas desde JSON:", error);
    }
}

// Función de seed para la tabla 'BusAgency'
async function seedAgencies() {
    try {
        console.log("Importando tabla 'BusAgency'...");
        const agencies = [];

        await importCSV('./assets/agency.txt', (row) => {
            if (row.agency_id && row.agency_name) { // Validación de campos obligatorios
                agencies.push({
                    agency_id: row.agency_id,
                    agency_name: row.agency_name,
                });
            }
        });

        // Inserción en lotes
        if (agencies.length > 0) {
            await safeCreateMany(prisma.busAgency, agencies);
        }

        console.log("Tabla 'BusAgency' importada con éxito.");
    } catch (error) {
        console.error("Error al importar 'BusAgency':", error);
    }
}

// Función de seed para la tabla 'BusRoute'
async function seedRoutes() {
    try {
        console.log("Importando tabla 'BusRoute'...");
        const routes = [];
        const routeIds = new Set(); // Usar un Set para evitar duplicados de route_id
        const batchSize = 50;
        let batch = [];

        // Leer el archivo de rutas antes de procesarlo
        await importCSV('./assets/routes.txt', (row) => {
            // Validar existencia de agency_id y route_id
            if (row.route_id && row.route_short_name) {
                // Limpiar y agregar la ruta si no es duplicada
                if (!routeIds.has(row.route_id)) {
                    routeIds.add(row.route_id);
                    batch.push({
                        route_id: row.route_id,
                        agency_id: row.agency_id,
                        route_short_name: row.route_short_name,
                    });

                    // Insertar lote si alcanza el tamaño especificado
                    if (batch.length >= batchSize) {
                        routes.push(...batch); // Almacenar en buffer
                        batch = [];
                    }
                }
            } else {
                console.warn(`Datos incompletos para route_id: ${row.route_id}, omitiendo esta ruta.`);
            }
        });

        // Añadir cualquier remanente del lote
        if (batch.length > 0) {
            routes.push(...batch);
        }

        // Insertar todos los datos bufferizados en la base de datos
        if (routes.length > 0) {
            await safeCreateMany(prisma.busRoute, routes, batchSize);
        }

        console.log(`Tabla 'BusRoute' importada con éxito. Total de rutas importadas: ${routes.length}`);
    } catch (error) {
        console.error("Error al importar 'BusRoute':", error);
    }
}

// Función de seed para la tabla 'BusTrip' con validación más estricta
async function seedTrips() {
    try {
        console.log("Importando tabla 'BusTrip' desde trips.json...");

        // Verificar la existencia de route_id y shape_id en sus respectivas tablas
        const validRouteIds = new Set((await prisma.busRoute.findMany({ select: { route_id: true } })).map(r => r.route_id));
        const validShapeIds = new Set((await prisma.busShape.findMany({ select: { shape_id: true } })).map(s => s.shape_id));

        // Leer los datos del archivo JSON
        const data = fs.readFileSync('./assets/trips.json', 'utf8');
        const trips = JSON.parse(data);
        const batchSize = 50;
        let batch = [];

        for (const trip of trips) {
            // Validar la existencia de claves foráneas antes de agregar el trip al lote
            if (validRouteIds.has(trip.route_id) && validShapeIds.has(trip.shape_id)) {
                batch.push({
                    trip_id: trip.trip_id,
                    route_id: trip.route_id,
                    service_id: trip.service_id,
                    trip_headsign: trip.trip_headsign,
                    shape_id: trip.shape_id,
                });

                // Insertar lote si alcanza el tamaño especificado
                if (batch.length >= batchSize) {
                    await safeCreateMany(prisma.busTrip, batch, batchSize);
                    batch = [];
                }
            } else {
                console.warn(`Trip con trip_id ${trip.trip_id} omite inserción por claves foráneas inválidas.`);
            }
        }

        // Insertar cualquier remanente del lote
        if (batch.length > 0) {
            await safeCreateMany(prisma.busTrip, batch, batchSize);
        }

        console.log("Tabla 'BusTrip' importada con éxito.");
    } catch (error) {
        console.error("Error al importar 'BusTrip':", error);
    }
}


// Función de seed para la tabla 'Shape' y 'ShapePoint'
async function seedShapes() {
    try {
        console.log("Importando tabla 'Shape' y 'ShapePoint'...");
        const shapes = new Set();
        const shapePoints = [];
        const batchSize = 50;

        await importCSV('./assets/shapes.txt', (row) => {
            if (row.shape_id && row.shape_pt_lat && row.shape_pt_lon) {
                shapes.add(row.shape_id);

                shapePoints.push({
                    shape_id: row.shape_id,
                    shape_pt_lat: parseFloat(row.shape_pt_lat),
                    shape_pt_lon: parseFloat(row.shape_pt_lon),
                    shape_pt_sequence: parseInt(row.shape_pt_sequence),
                    shape_dist_traveled: row.shape_dist_traveled ? parseFloat(row.shape_dist_traveled) : null,
                });
            }
        });

        const uniqueShapes = Array.from(shapes).map(shape_id => ({ shape_id }));

        // Iniciar transacción
        await prisma.$transaction([
            prisma.busShape.createMany({ data: uniqueShapes }),
            prisma.busShapePoint.createMany({ data: shapePoints }),
        ]);

        console.log("Tabla 'Shape' y 'ShapePoint' importadas con éxito.");
    } catch (error) {
        console.error("Error al importar 'Shape' y 'ShapePoint':", error);
    }
}

async function seedBusStopRoute(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const routesData = JSON.parse(data);
    // Iterar por cada ruta en el JSON
    for (const routeId in routesData) {
        const route = routesData[routeId];
        const stops = route.stops;

        for (const stop of stops) {
            // Verificar si la parada ya existe en la base de datos
            let busStop = await prisma.busStop.findUnique({
                where: { stop_id: stop.stop_id },
            });

            // Si la parada no existe, crearla
            if (!busStop) {
                busStop = await prisma.busStop.create({
                    data: {
                        stop_id: stop.stop_id,
                        stop_name: stop.stop_name,
                        latitude: stop.stop_lat,
                        longitude: stop.stop_lon,
                    },
                });
            }

            // Crear la relación en BusStopRoute
            await prisma.busRouteStop.create({
                data: {
                    route_id: routeId,
                    stop_id: stop.stop_id,
                },
            });
        }
    }

    console.log('Datos insertados correctamente en BusStopRoute');
}

// Importar BusStop desde JSON en transacción
async function seedSubwayStations(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const stops = JSON.parse(data);
        const batchSize = 50;
        let batch = [];

        for (const stop of stops) {
            batch.push({
                station_id: stop.stop_id,
                station_name: stop.stop_name || null,
                latitude: parseFloat(stop.stop_lat),
                longitude: parseFloat(stop.stop_lon),
                route_short_name: stop.route_id,
            });

            if (batch.length >= batchSize) {
                await safeCreateMany(prisma.subwayStation, batch, batchSize);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await safeCreateMany(prisma.subwayStation, batch, batchSize);
        }

        console.log("Importación de estaciones completada desde JSON.");
    } catch (error) {
        console.error("Error al importar paradas desde JSON:", error);
    }
}

// Importar BusStop desde JSON en transacción
async function seedStationParentStation(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const stops = JSON.parse(data);
        const batchSize = 50;
        let batch = [];

        for (const stop of stops) {
            batch.push({
                station_id: stop.stop_id,
                parent_station: stop.parent_station,
            });

            if (batch.length >= batchSize) {
                await safeCreateMany(prisma.stationParentStation, batch, batchSize);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await safeCreateMany(prisma.stationParentStation, batch, batchSize);
        }

        console.log("Importación de estaciones completada desde JSON.");
    } catch (error) {
        console.error("Error al importar paradas desde JSON:", error);
    }
}

async function seedSubwayTrip(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const trips = JSON.parse(data);
        const batchSize = 50;
        let batch = [];

        for (const trip of trips) {
            batch.push({
                trip_id: trip.trip_id,
                trip_headsign: trip.trip_headsign,
            });

            if (batch.length >= batchSize) {
                await safeCreateMany(prisma.subwayTrip, batch, batchSize);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await safeCreateMany(prisma.subwayTrip, batch, batchSize);
        }

        console.log("Importación de estaciones completada desde JSON.");
    } catch (error) {
        console.error("Error al importar paradas desde JSON:", error);
    }
}

async function seedSubwayColor(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const colors = JSON.parse(data);
        const batchSize = 50;
        let batch = [];

        for (const color of colors) {
            batch.push({
                route_short_name: color.route_short_name,
                color: color.color,
            });

            if (batch.length >= batchSize) {
                await safeCreateMany(prisma.subwayColor, batch, batchSize);
                batch = [];
            }
        }

        if (batch.length > 0) {
            await safeCreateMany(prisma.subwayColor, batch, batchSize);
        }

        console.log("Importación de estaciones completada desde JSON.");
    } catch (error) {
        console.error("Error al importar paradas desde JSON:", error);
    }
}

// Ejecutar el seed tabla por tabla usando transacciones
(async function main() {
    await connectPrisma();
    // await seedAgencies();
    // await seedRoutes();
    // await seedBusStops('./assets/stops.json');
    // await seedShapes();
    // await seedTrips();
    // await seedBusStopRoute('./assets/routes_stops.json');
    // await seedSubwayStations('./assets/subway_stations.json');
    // await seedStationParentStation('./assets/station_parent_station.json');
    // await seedSubwayTrip('./assets/subway_trips.json');
    await seedSubwayColor('./assets/subway_colors.json');
    console.log("Proceso de seed completado.");
    await prisma.$disconnect();
})();
