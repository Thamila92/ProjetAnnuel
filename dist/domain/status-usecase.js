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
exports.StatusUsecase = void 0;
const status_1 = require("../database/entities/status");
class StatusUsecase {
    constructor(db) {
        this.db = db;
    }
    // CREATE a new status
    createStatus(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const statusRepo = this.db.getRepository(status_1.Status);
            const newStatus = statusRepo.create({
                type: params.type,
                key: params.key || null,
            });
            try {
                const savedStatus = yield statusRepo.save(newStatus);
                return savedStatus;
            }
            catch (error) {
                console.error(error);
                return "Failed to create status";
            }
        });
    }
    // READ/List all statuses
    listStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            const statusRepo = this.db.getRepository(status_1.Status);
            return yield statusRepo.find();
        });
    }
    // READ/Get one status by ID
    getStatusById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const statusRepo = this.db.getRepository(status_1.Status);
            const status = yield statusRepo.findOne({ where: { id } });
            return status || null;
        });
    }
    // UPDATE a status
    updateStatus(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const statusRepo = this.db.getRepository(status_1.Status);
            const statusFound = yield statusRepo.findOne({ where: { id } });
            if (!statusFound) {
                return "Status not found";
            }
            if (params.type) {
                statusFound.type = params.type;
            }
            if (params.key !== undefined) {
                statusFound.key = params.key || null;
            }
            try {
                const updatedStatus = yield statusRepo.save(statusFound);
                return updatedStatus;
            }
            catch (error) {
                console.error(error);
                return "Failed to update status";
            }
        });
    }
    // DELETE a status
    deleteStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const statusRepo = this.db.getRepository(status_1.Status);
            const statusFound = yield statusRepo.findOne({ where: { id } });
            if (!statusFound) {
                return "Status not found";
            }
            try {
                yield statusRepo.remove(statusFound);
                return statusFound;
            }
            catch (error) {
                console.error(error);
                return "Failed to delete status";
            }
        });
    }
}
exports.StatusUsecase = StatusUsecase;
