import logger from '../../logger/logger.js';
import { prisma } from '../../config.js';
import { DatabaseOperationError, ExistingSessionError, NotFoundError } from '../../errors/index.js';

/**
 * Removes the OAuth token from the database, leading to a clean database entry.
 *
 * @param {string} token - The OAuth token to be removed.
 * @returns {Promise<void>} - A promise that resolves when the token is successfully removed.
 *
 * @throws {NotFoundError} - If no user is found for the provided token.
 * @throws {ExistingSessionError} - If the user has open sessions, preventing token removal.
 * @throws {DatabaseOperationError} - If there is an error during the database operation.
 */
export async function logout(token: string): Promise<void> {
    try {
        const tokenDBEntry = await prisma.jwt.findUnique({
            where: {
                token,
            },
            include: {
                user: true,
            },
        });

        if (tokenDBEntry?.user === null || tokenDBEntry?.user === undefined) {
            logger.warn('Could not remove OAuth token from the database: No user found for the provided token.');
            throw new NotFoundError('No user found for the provided token to remove from the database');
        }

        // Check if any sessions are open for the user
        const openSessions = await prisma.currentSession.findUnique({
            where: {
                adminId: tokenDBEntry.user.id,
            },
        });

        if (openSessions !== null && openSessions !== undefined) {
            logger.warn('Could not remove OAuth token from the database: User has open sessions.');
            throw new ExistingSessionError('User has open sessions, cannot remove OAuth token from the database');
        }

        const currentToken = await prisma.oAuthToken.findUnique({
            where: {
                userId: tokenDBEntry.user.id,
            },
        });

        if (currentToken === undefined || currentToken === null) {
            logger.warn('Could not remove OAuth token from the database: No OAuth token found.');
            throw new NotFoundError('No OAuth token found to remove from the database');
        }

        await prisma.oAuthToken.delete({
            where: {
                id: currentToken.id,
            },
        });

        logger.info(
            { userId: tokenDBEntry.user.id, file: 'src/api/auth/logout.ts', function: 'logout()' },
            'Successfully removed OAuth token from the database.'
        );
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ExistingSessionError) {
            throw error;
        }
        logger.error(error, 'Could not delete OAuth token from database.');
        throw new DatabaseOperationError('Could not delete the OAuth token during logout');
    }
}
