import { DataSource } from "typeorm";
import { Response as UserResponse } from "../database/entities/response";
import { Vote } from "../database/entities/vote";
import { User } from "../database/entities/user";

export interface ListResponseFilter {
    limit: number;
    page: number;
}

export interface UpdateResponseParams {
    content?: string;
    voteId?: number;
    userId?: number;
}

export interface CreateResponseParams {
    content: string;
    voteId: number;
    userId: number;
}

export class ResponseUsecase {
    constructor(private readonly db: DataSource) { }

    async listResponses(filter: ListResponseFilter): Promise<{ responses: UserResponse[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(UserResponse, 'response')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [responses, totalCount] = await query.getManyAndCount();
        return {
            responses,
            totalCount
        };
    }

    async createResponse(params: CreateResponseParams): Promise<UserResponse | string> {
        const voteRepo = this.db.getRepository(Vote);
        const userRepo = this.db.getRepository(User);
        const responseRepo = this.db.getRepository(UserResponse);

        const voteFound = await voteRepo.findOne({ where: { id: params.voteId } });
        if (!voteFound) {
            return "Vote not found";
        }

        const userFound = await userRepo.findOne({ where: { id: params.userId } });
        if (!userFound) {
            return "User not found";
        }

        const newResponse = responseRepo.create({
            content: params.content,
            vote: voteFound,
            user: userFound
        });

        await responseRepo.save(newResponse);
        return newResponse;
    }

    async getResponse(id: number): Promise<UserResponse | null> {
        const repo = this.db.getRepository(UserResponse);
        const responseFound = await repo.findOne({ where: { id } });
        return responseFound || null;
    }

    async updateResponse(id: number, params: UpdateResponseParams): Promise<UserResponse | null> {
        const repo = this.db.getRepository(UserResponse);
        const responseFound = await repo.findOne({ where: { id } });
        if (!responseFound) return null;

        if (params.content) responseFound.content = params.content;
        if (params.voteId) {
            const voteRepo = this.db.getRepository(Vote);
            const voteFound = await voteRepo.findOne({ where: { id: params.voteId } });
            if (voteFound) responseFound.vote = voteFound;
        }
        if (params.userId) {
            const userRepo = this.db.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: params.userId } });
            if (userFound) responseFound.user = userFound;
        }

        const updatedResponse = await repo.save(responseFound);
        return updatedResponse;
    }

    async deleteResponse(id: number): Promise<boolean | UserResponse> {
        const repo = this.db.getRepository(UserResponse);
        const responseFound = await repo.findOne({ where: { id } });
        if (!responseFound) return false;

        await repo.remove(responseFound);
        return responseFound;
    }
    async getResponsesByUser(userId: number): Promise<UserResponse[]> {
        const repo = this.db.getRepository(UserResponse);
        return await repo.find({ where: { user: { id: userId } } });
    }
    
}
