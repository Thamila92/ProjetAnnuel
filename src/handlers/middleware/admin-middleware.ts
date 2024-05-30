import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../database/database";
import { Token } from "../../database/entities/token";
import { JwtPayload, verify } from 'jsonwebtoken';
import { User } from "../../database/entities/user";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ "error": "Unauthorized" });

  const token = authHeader.split(' ')[1];
  if (token === null) return res.status(401).json({ "error": "Unauthorized" });

  const tokenRepo = AppDataSource.getRepository(Token);
  const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });

  if (!tokenFound) {
    return res.status(403).json({ "error": "Access Forbidden" });
  }

  if (!tokenFound.user) {
    return res.status(500).json({ "error": "Internal server error u"});
  }

  const userRepo = AppDataSource.getRepository(User);
  const userFound = await userRepo.findOne({ where: { id:tokenFound.user.id }, relations: ['status'] });

  if (userFound && !userFound.status) {
    return res.status(500).json({ "error": "Internal server error stat "});
  }
  
  if (userFound && userFound.status.description != "ADMIN") {
    return res.status(403).json({ "error": "Access Forbidden" });
  }

  const secret = process.env.JWT_SECRET ?? "NoNotThis";

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
      (req as any).user = decoded;
      next();
    } else {
      return res.status(403).json({ "error": "Access Forbidden" });
    }
  } catch (err) {
    return res.status(403).json({ "error": "Access Forbidden" });
  }
};