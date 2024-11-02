import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const UserRouter = (prisma: PrismaClient) => {
    const router = Router();

    // Endpoint para obtener líneas favoritas
    router.get('/:userId/favorites', async (req, res) => {
        const { userId } = req.params;

        try {
            // Simulación de recuperación de datos de favoritos con console.log
            console.log(`Obteniendo favoritos del usuario ${userId}`);

            // Aquí iría la lógica para obtener favoritos con Prisma más adelante
            // Por ahora, devolver una lista simulada
            const favoriteLines = ['101', '102', '103']; // Ejemplo de datos simulados

            res.status(200).json({ favorites: favoriteLines });
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            res.status(500).json({ message: 'Error al obtener las líneas favoritas' });
        }
    });

    // Endpoint para agregar una línea a favoritos
    router.post('/:userId/favorite', async (req, res) => {
        const { userId } = req.params;
        const { lineNumber } = req.body;

        try {
            // Imprime el log de agregar línea a favoritos
            console.log(`Usuario ${userId} agregó la línea ${lineNumber} a favoritos`);

            // Respuesta de éxito
            res.status(200).json({ message: 'Línea marcada como favorita exitosamente' });
        } catch (error) {
            // Imprime el error en la consola
            console.error('Error al marcar como favorito:', error);

            // Respuesta de error
            res.status(500).json({ message: 'Error al marcar la línea como favorita' });
        }
    });

    // Endpoint para eliminar una línea de favoritos
    router.delete('/:userId/favorite', async (req, res) => {
        const { userId } = req.params;
        const { lineNumber } = req.body;

        try {
            // Imprime el log de eliminar línea de favoritos
            console.log(`Usuario ${userId} eliminó la línea ${lineNumber} de favoritos`);

            // Respuesta de éxito
            res.status(200).json({ message: 'Línea eliminada de favoritos exitosamente' });
        } catch (error) {
            // Imprime el error en la consola
            console.error('Error al eliminar de favoritos:', error);

            // Respuesta de error
            res.status(500).json({ message: 'Error al eliminar la línea de favoritos' });
        }
    });

    return router;
};

export default UserRouter;
