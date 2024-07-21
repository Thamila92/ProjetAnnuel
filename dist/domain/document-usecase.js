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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentUsecase = void 0;
const document_1 = require("../database/entities/document");
const user_1 = require("../database/entities/user");
const googleDriveService_1 = __importDefault(require("../services/googleDriveService"));
class DocumentUsecase {
    constructor(db, oAuth2Client) {
        this.db = db;
        this.googleDriveService = new googleDriveService_1.default(oAuth2Client);
    }
    listDocuments(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(document_1.Document, 'document')
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [documents, totalCount] = yield query.getManyAndCount();
            return {
                documents,
                totalCount
            };
        });
    }
    // async createDocument(params: CreateDocumentParams): Promise<UserDocument | string> {
    //     const userRepo = this.db.getRepository(User);
    //     const documentRepo = this.db.getRepository(UserDocument);
    //     const userFound = await userRepo.findOne({ where: { id: params.userId } });
    //     if (!userFound) {
    //         return "User not found";
    //     }
    //     const newDocument = documentRepo.create({
    //         title: params.title,
    //         description: params.description,
    //         type: params.type,
    //         path: params.path,
    //         user: userFound
    //     });
    //     await documentRepo.save(newDocument);
    //     return newDocument;
    // }
    getDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(document_1.Document);
            const documentFound = yield repo.findOne({ where: { id } });
            return documentFound || null;
        });
    }
    updateDocument(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(document_1.Document);
            const documentFound = yield repo.findOne({ where: { id } });
            if (!documentFound)
                return null;
            if (params.title)
                documentFound.title = params.title;
            if (params.description)
                documentFound.description = params.description;
            if (params.type)
                documentFound.type = params.type;
            if (params.path)
                documentFound.fileId = params.path;
            if (params.userId) {
                const userRepo = this.db.getRepository(user_1.User);
                const userFound = yield userRepo.findOne({ where: { id: params.userId } });
                if (userFound)
                    documentFound.user = userFound;
            }
            const updatedDocument = yield repo.save(documentFound);
            return updatedDocument;
        });
    }
    deleteDocument(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(document_1.Document);
            const documentFound = yield repo.findOne({ where: { id } });
            if (!documentFound)
                return false;
            yield repo.remove(documentFound);
            return documentFound;
        });
    }
    getDocumentsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(document_1.Document);
            return yield repo.find({ where: { user: { id: userId } } });
        });
    }
    listGoogleDriveFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.googleDriveService.listFiles();
        });
    }
    getGoogleDriveFile(fileId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.googleDriveService.getFile(fileId);
        });
    }
    uploadFileToGoogleDrive(name, mimeType, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield this.googleDriveService.uploadFile(name, mimeType, body);
            return file.id || '';
        });
    }
}
exports.DocumentUsecase = DocumentUsecase;
