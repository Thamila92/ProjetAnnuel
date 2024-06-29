import { DataSource } from "typeorm";
import { Proposition } from "../database/entities/proposition";
import { Round } from "../database/entities/round";


export interface CreatePropositionParams {
    description: string;
    roundId:number
}

export class PropositionUsecase {
    constructor(private readonly db: DataSource) { }
    async createProposition(propo: CreatePropositionParams): Promise<Proposition | string> {
        const propoRepo = this.db.getRepository(Proposition);
        const roundRepo = this.db.getRepository(Round);
        const round = await roundRepo.findOne({ where: { id: propo.roundId,isDeleted:false } });
    
        if (!round) {
            return "Round not found";
        }
    
        if (round.npropositions < 1) {
            return "No remaining propositions available for this round";
        }
    
        round.npropositions--;
        await roundRepo.save(round);
    
        const newPropo = propoRepo.create({ round,description:propo.description });
        await propoRepo.save(newPropo);
        return newPropo;
    }
    async deleteProposition(propositionId: number): Promise<string> {
        const propoRepo = this.db.getRepository(Proposition);
        const roundRepo = this.db.getRepository(Round);
    
        const proposition = await propoRepo.findOne({ where: { id: propositionId }, relations: ["round"] });
    
        if (!proposition) {
            return "Proposition not found";
        }
    
        const round = proposition.round;
        await propoRepo.remove(proposition);
    
        round.npropositions++;
        await roundRepo.save(round);
    
        return "Proposition deleted successfully";
    }
    
    async getPropositions(id: number): Promise<Proposition[] | null> {
        const roundRepository = this.db.getRepository(Round);
        const round = await roundRepository.findOne({
            where: { id, isDeleted: false },
            relations: ["propositions"]
        });
    
        if (round) {
            return round.propositions;
        }
    
        return null; 
    }
}