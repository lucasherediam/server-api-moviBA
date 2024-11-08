import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const UserRouter = (prisma: PrismaClient) => {
    const router = Router();

    // Endpoint para obtener líneas favoritas
    router.get('/:userId/favorites', async (req, res) => {
        const { userId } = req.params;

        try {
            // Consulta de Prisma para obtener las rutas favoritas del usuario
            const favoriteLines = await prisma.userFavoriteRoute.findMany({
                where: {
                    user_id: userId,
                },
                select: {
                    route: {
                        select: {
                            route_id: true,
                            route_short_name: true,
                            route_desc: true,
                        },
                    },
                },
            });

            // Formatear la respuesta para enviar solo la información relevante
            const favorites = favoriteLines.map(fav => ({
                route_id: fav.route.route_id,
                route_short_name: fav.route.route_short_name,
                route_desc: fav.route.route_desc,
            }));
            console.log(`Usuario ${userId} obtuvo sus líneas favoritas:`, favorites);
            res.status(200).json({ favorites });
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            res.status(500).json({ message: 'Error al obtener las líneas favoritas' });
        }
    });


    // Endpoint para agregar una línea a favoritos
    router.post('/:userId/favorite', async (req, res) => {
        const { userId } = req.params;
        const { lineRouteId } = req.body;
        console.log(`Usuario ${userId} marcó la línea ${lineRouteId} como favorita`);
        try {
            await prisma.userFavoriteRoute.create({
                data: {
                    user_id: userId,
                    route_id: lineRouteId,
                },
            });

            res.status(200).json({ message: 'Línea marcada como favorita exitosamente' });
        } catch (error) {
            console.error('Error al marcar como favorito:', error);
            res.status(500).json({ message: 'Error al marcar la línea como favorita' });
        }
    });

    // Endpoint para eliminar una línea de favoritos
    router.delete('/:userId/favorite', async (req, res) => {
        const { userId } = req.params;
        const { lineRouteId } = req.body;

        try {
            // Imprime el log de eliminar línea de favoritos
            console.log(`Usuario ${userId} eliminó la el routeId ${lineRouteId} de favoritos`);

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
