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
    listFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.drive.files.list({
                pageSize: 10,
                fields: 'files(id, name)',
            });
            return res.data.files || [];
        });
    }
    getFile(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
            return res.data;
        });
    }
    uploadFile(name, mimeType, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.drive.files.create({
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
        });
    }
}
exports.default = GoogleDriveService;
