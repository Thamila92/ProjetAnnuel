"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.notificationValidation = joi_1.default.object({
    userId: joi_1.default.number().required(),
    title: joi_1.default.string().required(),
    message: joi_1.default.string().required(),
}).options({ abortEarly: false });
