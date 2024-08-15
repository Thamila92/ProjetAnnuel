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
exports.initSkillRoutes = void 0;
const skill_usecase_1 = require("../../domain/skill-usecase");
const database_1 = require("../../database/database");
const initSkillRoutes = (app) => {
    const skillUsecase = new skill_usecase_1.SkillUsecase(database_1.AppDataSource);
    // CREATE a new skill
    app.post('/skills', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Skill name is required" });
            }
            const skill = yield skillUsecase.createSkill(name);
            res.status(201).json(skill);
        }
        catch (error) {
            console.error("Failed to create skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }));
    // GET a skill by ID
    app.get('/skills/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const skill = yield skillUsecase.getSkill(Number(req.params.id));
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }
            res.status(200).json(skill);
        }
        catch (error) {
            console.error("Failed to fetch skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }));
    // LIST all skills
    app.get('/skills', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const skills = yield skillUsecase.listSkills();
            res.status(200).json(skills);
        }
        catch (error) {
            console.error("Failed to fetch skills:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }));
    // UPDATE a skill by ID
    app.put('/skills/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Skill name is required" });
            }
            const skill = yield skillUsecase.updateSkill(Number(req.params.id), name);
            if (!skill) {
                return res.status(404).json({ error: "Skill not found" });
            }
            res.status(200).json(skill);
        }
        catch (error) {
            console.error("Failed to update skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }));
    // DELETE a skill by ID
    app.delete('/skills/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const success = yield skillUsecase.deleteSkill(Number(req.params.id));
            if (!success) {
                return res.status(404).json({ error: "Skill not found" });
            }
            res.status(204).json({ message: "Skill deleted successfully" });
        }
        catch (error) {
            console.error("Failed to delete skill:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }));
};
exports.initSkillRoutes = initSkillRoutes;
