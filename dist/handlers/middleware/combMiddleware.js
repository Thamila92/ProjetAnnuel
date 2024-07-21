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
exports.authMiddleware = void 0;
const database_1 = require("../../database/database");
const token_1 = require("../../database/entities/token");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../../database/entities/user");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ "error": "Unauthorized" });
    const token = authHeader.split(' ')[1];
    if (token === null)
        return res.status(401).json({ "error": "Unauthorized" });
    const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
    const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
    if (!tokenFound) {
        return res.status(403).json({ "error": "Access Forbidden1" });
    }
    if (!tokenFound.user) {
        return res.status(500).json({ "error": "Internal server error u" });
    }
    const userRepo = database_1.AppDataSource.getRepository(user_1.User);
    const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id }, relations: ['status'] });
    if (userFound && !userFound.status) {
        return res.status(500).json({ "error": "Internal server error stat " });
    }
    const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThis";
    try {
        const decoded = yield new Promise((resolve, reject) => {
            (0, jsonwebtoken_1.verify)(token, secret, (err, decoded) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(decoded);
                }
            });
        });
        if (decoded) {
            req.user = decoded;
            // Vérifier si l'utilisateur est un administrateur
            if (userFound && userFound.status.description === "ADMIN") {
                next();
            }
            else if (userFound && userFound.status.description === "NORMAL") {
                // Vérifier si l'utilisateur est un utilisateur normal
                next();
            }
            else {
                return res.status(403).json({ "error": "Access Forbidden2" });
            }
        }
        else {
            return res.status(403).json({ "error": "Access Forbidden3" });
        }
    }
    catch (err) {
        return res.status(403).json({ "error": "Access Forbidden4" });
    }
});
exports.authMiddleware = authMiddleware;
