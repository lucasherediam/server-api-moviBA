const fs = require('fs');
const csv = require('csv-parser');

async function convertTxtToJson(inputFilePath, outputFilePath) {
    const trips = [];

    // Leer el archivo .txt usando csv-parser
    fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (row) => {
            // Agregar cada fila al array de trips
            trips.push({
                trip_id: row.trip_id,
                route_id: row.route_id,
                service_id: row.service_id,
                trip_headsign: row.trip_headsign,
                shape_id: row.shape_id || null,
            });
        })
        .on('end', () => {
            // Escribir el array de trips en un archivo .json
            fs.writeFile(outputFilePath, JSON.stringify(trips, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir el archivo JSON:', err);
                } else {
                    console.log(`Archivo JSON creado con éxito: ${outputFilePath}`);
                }
            });
        })
        .on('error', (err) => {
            console.error('Error al leer el archivo TXT:', err);
        });
}

// Convertir trips.txt a trips.json
convertTxtToJson('./assets/trips.txt', './assets/trips.json');
