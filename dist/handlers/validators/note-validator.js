"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNoteValidation = exports.noteUpdateValidation = exports.noteValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.noteValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    content: joi_1.default.string().required(),
}).options({ abortEarly: false });
exports.noteUpdateValidation = joi_1.default.object({
    name: joi_1.default.string().optional(),
    content: joi_1.default.string().optional(),
}).options({ abortEarly: false });
exports.listNoteValidation = joi_1.default.object({
    page: joi_1.default.number().min(1).optional(),
    limit: joi_1.default.number().min(1).optional(),
});
