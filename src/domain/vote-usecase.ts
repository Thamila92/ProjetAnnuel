import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { Vote } from "../database/entities/vote";
import { Token } from "../database/entities/token";

export interface CreateVoteParams {
    description: string;
    starting: Date;
    ending: Date;
    rounds:number

}

export interface ListVoteFilter{
    limit: number;
    page: number;
}

export class VoteUsecase {
    constructor(private readonly db: DataSource) {}

    async listVotes(filter: ListVoteFilter): Promise<{ votes: Vote[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Vote, 'vote')
            .where('vote.isDeleted = :isDeleted', { isDeleted: false })
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);
    
        const [votes, totalCount] = await query.getManyAndCount();
        return {
            votes,
            totalCount
        };
    }
    

    async createVotee(vote: CreateVoteParams,token?:string): Promise<Vote | string> {
        const voteRepo = this.db.getRepository(Vote);


        if (!token) return "Access Forbidden";

        // Trouver le token dans le référentiel des tokens avec la relation utilisateur
        const tokenRepo = this.db.getRepository(Token);
        const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });

        if (!tokenFound) {
            return "Access Forbidden";
        }

        if (!tokenFound.user) {
            return "Internal server error";
        }

        // Trouver l'utilisateur associé au token
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id } });


        if (!userFound) {
            return "User not found";
        }

        // Create a new vote
        const newVote = voteRepo.create({
            description: vote.description,
            starting: vote.starting,
            ending: vote.ending,
            user: userFound,
            nrounds:vote.rounds
        });

        // Save the vote
        await voteRepo.save(newVote);

        return newVote;
    }

// <<<<<<< merge_fi2
// =======
//     async updateVote(id: number, params: UpdateVoteParams): Promise<Vote | null> {
//         const repo = this.db.getRepository(Vote);
//         const voteFound = await repo.findOne({ where: { id } });
//         if (!voteFound) return null;

//         // if (params.type) voteFound.type = params.type;
//         if (params.subjectId) {
//             const subjectRepo = this.db.getRepository(Subject);
//             const subjectFound = await subjectRepo.findOne({ where: { id: params.subjectId } });
//             if (subjectFound) voteFound.subject = subjectFound;
//         }

//         const updatedVote = await repo.save(voteFound);
//         return updatedVote;
//     }
// >>>>>>> merge_fi

    async deleteVote(id: number): Promise<boolean | Vote> {
        const repo = this.db.getRepository(Vote);
        const voteFound = await repo.findOne({ where: { id, isDeleted: false } });
        if (!voteFound) return false;
    
        voteFound.isDeleted = true;
        await repo.save(voteFound);
        return voteFound;
    }
    
}