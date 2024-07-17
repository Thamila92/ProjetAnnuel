import { DataSource } from "typeorm";
import { Subject } from "../database/entities/subject";

export interface ListSubjectFilter {
    limit: number;
    page: number;
}

export interface UpdateSubjectParams {
    title?: string;
    description?: string;
}

export interface CreateSubjectParams {
    title: string;
    description: string;
}

export class SubjectUsecase {
    constructor(private readonly db: DataSource) { }

    async listSubjects(filter: ListSubjectFilter): Promise<{ subjects: Subject[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Subject, 'subject')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [subjects, totalCount] = await query.getManyAndCount();
        return {
            subjects,
            totalCount
        };
    }

    async createSubject(params: CreateSubjectParams): Promise<Subject> {
        const subjectRepo = this.db.getRepository(Subject);
        const newSubject = subjectRepo.create(params);
        await subjectRepo.save(newSubject);
        return newSubject;
    }

    async getSubject(id: number): Promise<Subject | null> {
        const repo = this.db.getRepository(Subject);
        const subjectFound = await repo.findOne({ where: { id } });
        return subjectFound || null;
    }

    async updateSubject(id: number, params: UpdateSubjectParams): Promise<Subject | null> {
        const repo = this.db.getRepository(Subject);
        const subjectFound = await repo.findOne({ where: { id } });
        if (!subjectFound) return null;

        if (params.title) subjectFound.title = params.title;
        if (params.description) subjectFound.description = params.description;

        const updatedSubject = await repo.save(subjectFound);
        return updatedSubject;
    }

    async deleteSubject(id: number): Promise<boolean | Subject> {
        const repo = this.db.getRepository(Subject);
        const subjectFound = await repo.findOne({ where: { id } });
        if (!subjectFound) return false;

        await repo.remove(subjectFound);
        return subjectFound;
    }
    
}export default SubjectUsecase;

