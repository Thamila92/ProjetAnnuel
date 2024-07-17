import { DataSource } from "typeorm";
import { Vote } from "../database/entities/vote";
import { Subject } from "../database/entities/subject";

export interface ListVoteFilter {
    limit: number;
    page: number;
}

export interface UpdateVoteParams {
    type?: string;
    subjectId?: number;
}

export interface CreateVoteParams {
    type: string;
    subjectId: number;
}

export class VoteUsecase {
    constructor(private readonly db: DataSource) { }

    async listVotes(filter: ListVoteFilter): Promise<{ votes: Vote[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Vote, 'vote')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [votes, totalCount] = await query.getManyAndCount();
        return {
            votes,
            totalCount
        };
    }

    async createVote(params: CreateVoteParams): Promise<Vote | string> {
        const subjectRepo = this.db.getRepository(Subject);
        const voteRepo = this.db.getRepository(Vote);

        const subjectFound = await subjectRepo.findOne({ where: { id: params.subjectId } });
        if (!subjectFound) {
            return "Subject not found";
        }

        const newVote = voteRepo.create({
            type: params.type,
            subject: subjectFound
        });

        await voteRepo.save(newVote);
        return newVote;
    }

    async getVote(id: number): Promise<Vote | null> {
        const repo = this.db.getRepository(Vote);
        const voteFound = await repo.findOne({ where: { id } });
        return voteFound || null;
    }

    async updateVote(id: number, params: UpdateVoteParams): Promise<Vote | null> {
        const repo = this.db.getRepository(Vote);
        const voteFound = await repo.findOne({ where: { id } });
        if (!voteFound) return null;

        if (params.type) voteFound.type = params.type;
        if (params.subjectId) {
            const subjectRepo = this.db.getRepository(Subject);
            const subjectFound = await subjectRepo.findOne({ where: { id: params.subjectId } });
            if (subjectFound) voteFound.subject = subjectFound;
        }

        const updatedVote = await repo.save(voteFound);
        return updatedVote;
    }

    async deleteVote(id: number): Promise<boolean | Vote> {
        const repo = this.db.getRepository(Vote);
        const voteFound = await repo.findOne({ where: { id } });
        if (!voteFound) return false;

        await repo.remove(voteFound);
        return voteFound;
    }
    async getVotesBySubject(subjectId: number): Promise<Vote[]> {
        const repo = this.db.getRepository(Vote);
        return await repo.find({ where: { subject: { id: subjectId } } });
    }
}
