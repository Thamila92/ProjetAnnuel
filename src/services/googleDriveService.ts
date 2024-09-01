import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';

class GoogleDriveService {
    private drive: drive_v3.Drive;

    constructor(private oAuth2Client: OAuth2Client) {
        this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
    }

    // Rafraîchir automatiquement le token avant chaque opération
    async ensureValidToken() {
        try {
            const tokens = await this.oAuth2Client.getAccessToken();
            if (!tokens.token) {
                throw new Error('Failed to refresh access token');
            }
            console.log('Access token refreshed');
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw new Error('Failed to refresh access token');
        }
    }

    // Lister les fichiers de Google Drive
    async listFiles(): Promise<drive_v3.Schema$File[]> {
        try {
            await this.ensureValidToken();  // Assurez-vous que le token est valide
            const res = await this.drive.files.list({
                pageSize: 10,
                fields: 'files(id, name)',
            });
            return res.data.files || [];
        } catch (error) {
            console.error('Error listing files:', error);
            throw new Error('Failed to list files');
        }
    }

    // Récupérer un fichier en tant que flux
    async getFile(fileId: string): Promise<Readable> {
        try {
            await this.ensureValidToken();  // Assurez-vous que le token est valide
            const res = await this.drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' }
            );
            return res.data as Readable;
        } catch (error) {
            console.error('Error retrieving file:', error);
            throw new Error('Failed to retrieve file');
        }
    }

    // Télécharger un fichier sur Google Drive
    async uploadFile(name: string, mimeType: string, body: Readable, folderId?: string): Promise<drive_v3.Schema$File> {
        try {
            await this.ensureValidToken();  // Assurez-vous que le token est valide
            const requestBody: drive_v3.Schema$File = {
                name,
                mimeType,
            };

            if (folderId) {
                requestBody.parents = [folderId];
            }

            const res = await this.drive.files.create({
                requestBody,
                media: {
                    mimeType,
                    body,
                },
            });

            return res.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('Failed to upload file');
        }
    }

    // Supprimer un fichier de Google Drive
    async deleteFile(fileId: string): Promise<void> {
        try {
            await this.ensureValidToken();  // Assurez-vous que le token est valide
            await this.drive.files.delete({ fileId });
            console.log(`File ${fileId} deleted from Google Drive.`);
        } catch (error) {
            console.error('Failed to delete file from Google Drive:', error);
            throw new Error('Failed to delete file');
        }
    }
    async setFilePermissions(fileId: string, role: 'reader' | 'writer' = 'reader', type: 'user' | 'group' | 'domain' | 'anyone' = 'anyone'): Promise<void> {
        try {
            await this.ensureValidToken();

            await this.drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: role,
                    type: type, // Par exemple, "anyone" pour que le fichier soit public
                },
            });

            console.log(`Permissions updated for file ${fileId}`);
        } catch (error) {
            console.error('Failed to update file permissions:', error);
            throw new Error('Failed to update file permissions');
        }
    }
}

export default GoogleDriveService;
