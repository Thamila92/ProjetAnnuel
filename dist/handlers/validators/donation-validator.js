"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDonationValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createDonationValidation = joi_1.default.object({
    amount: joi_1.default.number().min(5).required(),
    description: joi_1.default.string().min(5).required()
}).options({ abortEarly: false });
