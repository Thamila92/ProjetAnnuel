"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
class GoogleDriveService {
    constructor(oAuth2Client) {
        this.oAuth2Client = oAuth2Client;
        this.drive = googleapis_1.google.drive({ version: 'v3', auth: this.oAuth2Client });
    }
    // Rafraîchir automatiquement le token avant chaque opération
    ensureValidToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tokens = yield this.oAuth2Client.getAccessToken();
                if (!tokens.token) {
                    throw new Error('Failed to refresh access token');
                }
                console.log('Access token refreshed');
            }
            catch (error) {
                console.error('Error refreshing token:', error);
                throw new Error('Failed to refresh access token');
            }
        });
    }
    // Lister les fichiers de Google Drive
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureValidToken(); // Assurez-vous que le token est valide
                const res = yield this.drive.files.list({
                    pageSize: 10,
                    fields: 'files(id, name)',
                });
                return res.data.files || [];
            }
            catch (error) {
                console.error('Error listing files:', error);
                throw new Error('Failed to list files');
            }
        });
    }
    // Récupérer un fichier en tant que flux
    getFile(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureValidToken(); // Assurez-vous que le token est valide
                const res = yield this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
                return res.data;
            }
            catch (error) {
                console.error('Error retrieving file:', error);
                throw new Error('Failed to retrieve file');
            }
        });
    }
    // Télécharger un fichier sur Google Drive
    uploadFile(name, mimeType, body, folderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureValidToken(); // Assurez-vous que le token est valide
                const requestBody = {
                    name,
                    mimeType,
                };
                if (folderId) {
                    requestBody.parents = [folderId];
                }
                const res = yield this.drive.files.create({
                    requestBody,
                    media: {
                        mimeType,
                        body,
                    },
                });
                return res.data;
            }
            catch (error) {
                console.error('Error uploading file:', error);
                throw new Error('Failed to upload file');
            }
        });
    }
    // Supprimer un fichier de Google Drive
    deleteFile(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureValidToken(); // Assurez-vous que le token est valide
                yield this.drive.files.delete({ fileId });
                console.log(`File ${fileId} deleted from Google Drive.`);
            }
            catch (error) {
                console.error('Failed to delete file from Google Drive:', error);
                throw new Error('Failed to delete file');
            }
        });
    }
    setFilePermissions(fileId_1) {
        return __awaiter(this, arguments, void 0, function* (fileId, role = 'reader', type = 'anyone') {
            try {
                yield this.ensureValidToken();
                yield this.drive.permissions.create({
                    fileId: fileId,
                    requestBody: {
                        role: role,
                        type: type, // Par exemple, "anyone" pour que le fichier soit public
                    },
                });
                console.log(`Permissions updated for file ${fileId}`);
            }
            catch (error) {
                console.error('Failed to update file permissions:', error);
                throw new Error('Failed to update file permissions');
            }
        });
    }
}
exports.default = GoogleDriveService;
