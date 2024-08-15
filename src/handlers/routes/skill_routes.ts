import express, { Request, Response } from "express";
import { SkillUsecase } from "../../domain/skill-usecase";
import { AppDataSource } from "../../database/database";

export const initSkillRoutes = (app: express.Express) => {
    const skillUsecase = new SkillUsecase(AppDataSource);

    // CREATE a new skill
    app.post('/skills', async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Skill name is required" });
            }
            const skill = await skillUsecase.createSkill(name);
            res.status(201).json(skill);
        } catch (error) {
            console.error("Failed to create skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // GET a skill by ID
    app.get('/skills/:id', async (req: Request, res: Response) => {
        try {
            const skill = await skillUsecase.getSkill(Number(req.params.id));
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }
            res.status(200).json(skill);
        } catch (error) {
            console.error("Failed to fetch skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // LIST all skills
    app.get('/skills', async (req: Request, res: Response) => {
        try {
            const skills = await skillUsecase.listSkills();
            res.status(200).json(skills);
        } catch (error) {
            console.error("Failed to fetch skills:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // UPDATE a skill by ID
    app.put('/skills/:id', async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Skill name is required" });
            }
            const skill = await skillUsecase.updateSkill(Number(req.params.id), name);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }
            res.status(200).json(skill);
        } catch (error) {
            console.error("Failed to update skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    // DELETE a skill by ID
    app.delete('/skills/:id', async (req: Request, res: Response) => {
        try {
            const success = await skillUsecase.deleteSkill(Number(req.params.id));
            if (!success) {
                return res.status(404).json({ error: "Skill not found" });
            }
            res.status(204).json({ message: "Skill deleted successfully" });
        } catch (error) {
            console.error("Failed to delete skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
};
