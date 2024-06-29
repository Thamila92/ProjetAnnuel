import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { OAuth2Client } from 'google-auth-library';

 class GoogleDriveService {
    private drive: drive_v3.Drive;

    constructor(private oAuth2Client: OAuth2Client) {
        this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
    }

    async listFiles(): Promise<drive_v3.Schema$File[]> {
        const res = await this.drive.files.list({
            pageSize: 10,
            fields: 'files(id, name)',
        });
        return res.data.files || [];
    }

    async getFile(fileId: string): Promise<Readable> {
        const res = await this.drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return res.data as Readable;
    }

    async uploadFile(name: string, mimeType: string, body: Readable): Promise<drive_v3.Schema$File> {
        const res = await this.drive.files.create({
            requestBody: {
                name,
                mimeType,
            },
            media: {
                mimeType,
                body,
            },
        });
        return res.data;
    }
}

export default GoogleDriveService;
