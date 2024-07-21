"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviewValidation = exports.reviewValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.reviewValidation = joi_1.default.object({
    content: joi_1.default.string().required(),
    createdAt: joi_1.default.date().iso().required(),
    missionId: joi_1.default.number().required(),
    userId: joi_1.default.number().required()
}).options({ abortEarly: false });
exports.listReviewValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
