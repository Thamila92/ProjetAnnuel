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
exports.adminMiddleware = void 0;
const database_1 = require("../../database/database");
const token_1 = require("../../database/entities/token");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../../database/entities/user");
const adminMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        console.log("No authorization header found");
        return res.status(401).json({ "error": "Unauthorized" });
    }
    const token = authHeader.split(' ')[1];
    if (token === null) {
        console.log("No token found in authorization header");
        return res.status(401).json({ "error": "Unauthorized" });
    }
    const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
    const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
    if (!tokenFound) {
        console.log("Token not found in database");
        return res.status(403).json({ "error": "Access Forbidden" });
    }
    if (!tokenFound.user) {
        console.log("No user associated with the token");
        return res.status(500).json({ "error": "Internal server error u" });
    }
    const userRepo = database_1.AppDataSource.getRepository(user_1.User);
    const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id }, relations: ['status'] });
    if (userFound && !userFound.status) {
        console.log("User found but no status associated with user");
        return res.status(500).json({ "error": "Internal server error stat " });
    }
    if (userFound && userFound.status.description != "ADMIN") {
        console.log("User is not an admin");
        return res.status(403).json({ "error": "Access Forbidden" });
    }
    const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "NoNotThiss";
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
            console.log("Token successfully decoded:", decoded);
            req.user = decoded;
            req.userId = tokenFound.user.id; // Ajouter l'userId au req
            console.log("User ID added to request:", req.userId);
            next();
        }
        else {
            console.log("Token decoding failed");
            return res.status(403).json({ "error": "Access Forbidden" });
        }
    }
    catch (err) {
        console.log("Error decoding token:", err);
        return res.status(403).json({ "error": "Access Forbidden" });
    }
});
exports.adminMiddleware = adminMiddleware;
