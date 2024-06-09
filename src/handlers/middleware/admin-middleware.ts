import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../database/database";
import { Token } from "../../database/entities/token";
import { JwtPayload, verify } from 'jsonwebtoken';
import { User } from "../../database/entities/user";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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

  const tokenRepo = AppDataSource.getRepository(Token);
  const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });

  if (!tokenFound) {
    console.log("Token not found in database");
    return res.status(403).json({ "error": "Access Forbidden" });
  }

  if (!tokenFound.user) {
    console.log("No user associated with the token");
    return res.status(500).json({ "error": "Internal server error u"});
  }

  const userRepo = AppDataSource.getRepository(User);
  const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id }, relations: ['status'] });

  if (userFound && !userFound.status) {
    console.log("User found but no status associated with user");
    return res.status(500).json({ "error": "Internal server error stat "});
  }
  
  if (userFound && userFound.status.description != "ADMIN") {
    console.log("User is not an admin");
    return res.status(403).json({ "error": "Access Forbidden" });
  }

  const secret = process.env.JWT_SECRET ?? "NoNotThiss";

  try {
    const decoded = await new Promise<JwtPayload | undefined>((resolve, reject) => {
      verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded as JwtPayload);
        }
      });
    });
  
    if (decoded) {
      console.log("Token successfully decoded:", decoded);
      (req as any).user = decoded;
      (req as any).userId = tokenFound.user.id;  // Ajouter l'userId au req
      console.log("User ID added to request:", (req as any).userId);
      next();
    } else {
      console.log("Token decoding failed");
      return res.status(403).json({ "error": "Access Forbidden" });
    }
  } catch (err) {
    console.log("Error decoding token:", err);
    return res.status(403).json({ "error": "Access Forbidden" });
  }
};