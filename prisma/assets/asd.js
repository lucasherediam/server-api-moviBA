const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

// Leer y parsear el archivo CSV
const readCsv = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

// Escribir el CSV ordenado
const writeCsv = (filePath, data) => {
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: Object.keys(data[0]).map((key) => ({ id: key, title: key }))
    });
    return csvWriter.writeRecords(data);
};

// Función principal para ordenar el CSV
const sortCsvByRouteId = async (inputPath, outputPath) => {
    try {
        // Leer el archivo CSV
        const data = await readCsv(inputPath);

        // Ordenar los datos por 'route_id' de menor a mayor
        const sortedData = data.sort((a, b) => parseInt(a.route_id) - parseInt(b.route_id));

        // Escribir el archivo CSV ordenado
        await writeCsv(outputPath, sortedData);

        console.log(`Archivo ordenado guardado como '${outputPath}'`);
    } catch (error) {
        console.error('Error al procesar el archivo CSV:', error);
    }
};

// Llamar a la función con las rutas de los archivos
sortCsvByRouteId('./trips.txt', './tripsOrder.txt');
