import { DataSource, getRepository } from "typeorm";
import { Vote } from "../database/entities/vote";
import { Round } from "../database/entities/round";

export class RoundUsecase {
    constructor(private readonly db: DataSource) { }

    async getRounds(id: number): Promise<Round[] | null> {
        const voteRepository = this.db.getRepository(Vote);
        const vote = await voteRepository.findOne({
            where: { id, isDeleted: false },
            relations: ["rounds"]
        });
    
        if (vote) {
            return vote.rounds;
        }
    
        return null; 
    }

    async createRound(description: string, starting: Date, ending: Date, voteId: number): Promise<Round | string> {
        const voteRepo = this.db.getRepository(Vote);
        const vote = await voteRepo.findOne({ where: { id: voteId } });
        if (!vote) {
            return 'Vote not found';
        }
    
        // Check if nrounds is greater than 0
        if (vote.nrounds <= 0) {
            return 'No rounds left for this vote';
        }
    
        // Check if round dates are within vote dates
        if (starting < vote.starting || ending > vote.ending) {
            return 'Round dates must be within the vote dates';
        }
    
        const roundRepo = this.db.getRepository(Round);
    
        // Check for overlapping rounds for the same vote
        const overlappingRounds = await roundRepo.createQueryBuilder("round")
            .where("round.voteId = :voteId", { voteId })
            .andWhere("round.starting < :ending AND round.ending > :starting", { starting, ending })
            .getCount();
    
        if (overlappingRounds > 0) {
            return "There is already a round planned for the same vote during this period";
        }
    
        // Create new round
        const newRound = roundRepo.create({description, starting, ending, vote });
    
        // Decrement nrounds
        vote.nrounds--;
        await voteRepo.save(vote);
    
        await roundRepo.save(newRound);
        return newRound;
    }
    
    async deleteRound(roundId: number): Promise<boolean | Round> {
        const roundRepo = this.db.getRepository(Round);
        const round = await roundRepo.findOne({ where: { id: roundId, isDeleted: false }, relations: ['vote'] });
    
        if (!round) {
            return false;
        }
    
        const voteRepo = this.db.getRepository(Vote);
        const vote = round.vote;
    
        // Mark round as deleted
        round.isDeleted = true;
        await roundRepo.save(round);
    
        // Increment nrounds
        if (vote) {
            vote.nrounds++;
            await voteRepo.save(vote);
        }
    
        return round;
    }
    
}
