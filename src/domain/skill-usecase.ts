import { DataSource } from "typeorm";
import { Skill } from "../database/entities/skill";

export class SkillUsecase {
    constructor(private readonly db: DataSource) { }

    async createSkill(name: string): Promise<Skill> {
        const skillRepo = this.db.getRepository(Skill);
        let skill = await skillRepo.findOne({ where: { name } });
        if (!skill) {
            skill = skillRepo.create({ name });
            await skillRepo.save(skill);
        }
        return skill;
    }

    async getSkill(id: number): Promise<Skill | null> {
        const skillRepo = this.db.getRepository(Skill);
        return await skillRepo.findOne({ where: { id } });
    }

    async listSkills(): Promise<Skill[]> {
        const skillRepo = this.db.getRepository(Skill);
        return await skillRepo.find();
    }

    async updateSkill(id: number, name: string): Promise<Skill | null> {
        const skillRepo = this.db.getRepository(Skill);
        const skill = await skillRepo.findOne({ where: { id } });
        if (skill) {
            skill.name = name;
            await skillRepo.save(skill);
            return skill;
        }
        return null;
    }

    async deleteSkill(id: number): Promise<boolean> {
        const skillRepo = this.db.getRepository(Skill);
        const skill = await skillRepo.findOne({ where: { id } });
        if (skill) {
            await skillRepo.remove(skill);
            return true;
        }
        return false;
    }
}
