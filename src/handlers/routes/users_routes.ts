import express, { Request, Response } from "express";
import { AppDataSource } from "../../database/database";
import { UserUsecase } from "../../domain/user-usecase";
import { generateValidationErrorMessage } from "../validators/generate-validation-message";
import { createAdherentValidation, createAdminValidation, loginOtherValidation, updateUserValidation, listUsersValidation, createSalarierValidation } from "../validators/user-validator";
import { verify } from "jsonwebtoken";

export const initUserRoutes = (app: express.Express) => {
    const userUsecase = new UserUsecase(AppDataSource);

    // Inscription Adhérent
app.post('/adherent/signup', async (req: Request, res: Response) => {
    try {
      console.log("Données reçues pour l'inscription :", req.body);
  
      const validationResult = createAdherentValidation.validate(req.body);
      if (validationResult.error) {
        res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
        return;
      }
  
      const createAdherentRequest = validationResult.value;
      const result = await userUsecase.createAdherent(createAdherentRequest);
  
      if (typeof result === 'string') {
        res.status(400).json({ error: result });
      } else {
        res.status(201).json(result); 
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ "error": "Internal error, please try again later" });
    }
  });
 
 

app.post('/salarier/signup', async (req: Request, res: Response) => {
    try {
      console.log("Données reçues pour l'inscription :", req.body);
  
      const validationResult = createSalarierValidation.validate(req.body);
      if (validationResult.error) {
        res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
        return;
      }
  
      const createSalarierRequest = validationResult.value;
      const result = await userUsecase.createSalarier(createSalarierRequest);
  
      if (typeof result === 'string') {
        res.status(400).json({ error: result });
      } else {
        res.status(201).json(result); 
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ "error": "Internal error, please try again later" });
    }
});

 

    app.get('/getUserEvenementAttendees/:id', async (req: Request, res: Response) => {
        try {
            const userId = Number(req.params.id);
            const result = await userUsecase.getUserEvenementAttendees(userId);
    
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });
    app.get('/getUserDemandes/:id', async (req: Request, res: Response) => {
        try {
            const userId = Number(req.params.id);
            const result = await userUsecase.getUserDemandes(userId);
    
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });
    
    // Inscription Administrateur
    app.post('/admin/signup', async (req: Request, res: Response) => {
        try {
            const validationResult = createAdminValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const createAdminRequest = validationResult.value;
            const result = await userUsecase.createAdmin(createAdminRequest);

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(201).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

    // Connexion (commun pour Adhérent et Administrateur)
    app.post('/login', async (req: Request, res: Response) => {
        try {
            const validationResult = loginOtherValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const { email, password } = validationResult.value;
            const result = await userUsecase.loginUser(email, password);

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

    // Mise à jour d'un utilisateur
    app.patch('/updateUser/:id', async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate(req.body);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }
    
            const updateUserRequest = validationResult.value;
            const result = await userUsecase.updateUser(Number(req.params.id), updateUserRequest);
    
            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

 // Bannir un utilisateur
app.post('/banUser/:id', async (req: Request, res: Response) => {
    try {
        const result = await userUsecase.banUser(Number(req.params.id));

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal error, please try again later" });
    }
});


    // Lister les utilisateurs
    app.get('/listUsers', async (req: Request, res: Response) => {
        try {
            const validationResult = listUsersValidation.validate(req.query);
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const filter = validationResult.value;
            const result = await userUsecase.listUser(filter);

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });
    app.delete('/deleteUser/:id', async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id, 10);
            const result = await userUsecase.deleteUser(userId);

            if (result === "Utilisateur non trouvé") {
                res.status(404).json({ error: result });
            } else {
                res.status(200).json({ message: result });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Erreur interne, veuillez réessayer plus tard." });
        }
    });
    
    // Récupérer un utilisateur par ID
    app.get('/getUser/:id', async (req: Request, res: Response) => {
        try {
            const result = await userUsecase.getUserById(Number(req.params.id));

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });
    app.patch('/UpdatePwd/:userId', async (req, res) => {
        const { userId } = req.params; // ID de l'utilisateur extrait de l'URL
        const { oldPassword, newPassword } = req.body; // Mots de passe extraits du corps de la requête
    
        // Convertir userId en nombre si nécessaire
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }
    
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required." });
        }
    
        try {
            const result = await userUsecase.changePassword(numericUserId, oldPassword, newPassword);
            if (result === "Password updated successfully") {
                res.status(200).json({ message: result });
            } else {
                res.status(400).json({ message: result });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    
    // Ajouter une compétence à un utilisateur
    app.post('/addSkillToUser/:id', async (req: Request, res: Response) => {
        try {
            const skillName = req.body.skillName;
            if (!skillName) {
                res.status(400).json({ error: "Skill name is required" });
                return;
            }

            const result = await userUsecase.addSkillToUser(Number(req.params.id), skillName);

            if (typeof result === 'string') {
                res.status(400).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

    // Récupérer les utilisateurs par rôle
    app.get('/getUsersByRole/:role', async (req: Request, res: Response) => {
        try {
            const role = req.params.role;
            const result = await userUsecase.getUsersByRole(role);

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

    // Récupérer les utilisateurs disponibles par statut
    app.get('/getAvailableUsersByStatus/:status', async (req: Request, res: Response) => {
        try {
            const status = req.params.status;
            const result = await userUsecase.getAvailableUsersByStatus(status);

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });
    app.get('/getUsersByStatus/:status', async (req: Request, res: Response) => {
        try {
            const status = req.params.status;
            const result = await userUsecase.getUsersByStatus(status);

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

    // Récupérer tous les utilisateurs disponibles
    app.get('/getAllUsersAvailable', async (req: Request, res: Response) => {
        try {
            const result = await userUsecase.getAllUsersAvailable();
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });

    // Récupérer tous les utilisateurs
    app.get('/getAllUsers', async (req: Request, res: Response) => {
        try {
            const result = await userUsecase.getAllUsers();
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ "error": "Internal error, please try again later" });
        }
    });


    //retourne user actuel
    app.get('/auth/me', async (req: Request, res: Response) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const secret = process.env.JWT_SECRET ?? "NoNotThis";
            const decoded = verify(token, secret) as { userId: number };

            const userId = decoded.userId;
            const result = await userUsecase.getCurrentUser(userId);

            if (typeof result === 'string') {
                res.status(404).json({ error: result });
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};
