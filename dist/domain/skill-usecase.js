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
exports.SkillUsecase = void 0;
const skill_1 = require("../database/entities/skill");
class SkillUsecase {
    constructor(db) {
        this.db = db;
    }
    createSkill(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillRepo = this.db.getRepository(skill_1.Skill);
            let skill = yield skillRepo.findOne({ where: { name } });
            if (!skill) {
                skill = skillRepo.create({ name });
                yield skillRepo.save(skill);
            }
            return skill;
        });
    }
    getSkill(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillRepo = this.db.getRepository(skill_1.Skill);
            return yield skillRepo.findOne({ where: { id } });
        });
    }
    listSkills() {
        return __awaiter(this, void 0, void 0, function* () {
            const skillRepo = this.db.getRepository(skill_1.Skill);
            return yield skillRepo.find();
        });
    }
    updateSkill(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const skill = yield skillRepo.findOne({ where: { id } });
            if (skill) {
                skill.name = name;
                yield skillRepo.save(skill);
                return skill;
            }
            return null;
        });
    }
    deleteSkill(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const skillRepo = this.db.getRepository(skill_1.Skill);
            const skill = yield skillRepo.findOne({ where: { id } });
            if (skill) {
                yield skillRepo.remove(skill);
                return true;
            }
            return false;
        });
    }
}
exports.SkillUsecase = SkillUsecase;
