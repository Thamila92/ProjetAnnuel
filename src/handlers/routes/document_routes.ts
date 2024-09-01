import express, { Request, Response, Express } from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import { AppDataSource } from '../../database/database';
import { DocumentUsecase } from '../../domain/document-usecase';
 
export const initGoogleDriveRoutes = (app: Express) => {
    // Configuration de OAuth2Client pour Google Drive
    const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
    );

    // Mettre à jour le token si nécessaire (refresh_token)
    oAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
    });

    // Créer une instance du DocumentUsecase en lui passant le DataSource et le OAuth2Client
    const documentUsecase = new DocumentUsecase(AppDataSource, oAuth2Client);

    // Configuration de Multer pour gérer les uploads de fichiers
    const storage = multer.memoryStorage();
    const upload = multer({ storage }).single('file');

    // Route pour uploader un document
    app.post('/document/upload', (req: Request, res: Response) => {
        upload(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(500).json({ message: 'Multer error', error: err.message });
            }

            try {
                // Appel au use case pour uploader un document
                const userId = req.body.userId || undefined // Remplacer par l'ID de l'utilisateur réel (ex: via token ou session)
                const newDocument = await documentUsecase.uploadDocument(req, userId);
                res.status(201).json({ message: 'File uploaded successfully', document: newDocument });
            } catch (error) {
                console.error('Error uploading document:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    });

    // Route pour lister tous les documents
    app.get('/documents', async (req: Request, res: Response) => {
        try {
            // Appel au use case pour lister les documents
            const documents = await documentUsecase.listDocuments();
            res.status(200).json(documents);
        } catch (error) {
            console.error('Error listing documents:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Route pour obtenir les liens d'un document spécifique
    app.get('/document/:id', async (req: Request, res: Response) => {
        try {
            // Appel au use case pour obtenir les informations sur le document
            const documentId = parseInt(req.params.id);
            const document = await documentUsecase.getDocument(documentId);

            if (!document) {
                return res.status(404).json({ message: 'Document not found' });
            }

            // Appel au use case pour obtenir les liens Google Drive
            const links = await documentUsecase.getFileLinks(document.fileId);
            res.status(200).json({ document, links });
        } catch (error) {
            console.error('Error getting document:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Route pour supprimer un document
    app.delete('/document/:id', async (req: Request, res: Response) => {
        try {
            // Appel au use case pour supprimer un document
            const documentId = parseInt(req.params.id);
            const deletedDocument = await documentUsecase.deleteDocument(documentId);

            if (typeof deletedDocument === 'string') {
                return res.status(404).json({ message: deletedDocument });
            }

            res.status(200).json({ message: 'Document deleted successfully', document: deletedDocument });
        } catch (error) {
            console.error('Error deleting document:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });



       // Route pour mettre à jour un document (PATCH)
       app.patch('/document/:id', async (req: Request, res: Response) => {
        try {
            const documentId = parseInt(req.params.id);
            const updateParams = req.body;

            // Appel au use case pour mettre à jour un document
            const updatedDocument = await documentUsecase.updateDocument(documentId, updateParams);

            if (!updatedDocument) {
                return res.status(404).json({ message: 'Document not found' });
            }

            res.status(200).json({ message: 'Document updated successfully', document: updatedDocument });
        } catch (error) {
            console.error('Error updating document:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
};
