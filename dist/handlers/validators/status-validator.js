"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatusValidation = void 0;
const joi_1 = __importDefault(require("joi"));
var statustype;
(function (statustype) {
    statustype["admin"] = "ADMIN";
    statustype["other"] = "NORMAL";
    statustype["benefactor"] = "BENEFACTOR";
})(statustype || (statustype = {}));
exports.createStatusValidation = joi_1.default.object({
    description: joi_1.default.string().valid(...Object.values(statustype)).required(),
    key: joi_1.default.string().optional()
}).options({ abortEarly: false });
