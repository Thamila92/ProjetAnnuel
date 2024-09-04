import { DataSource } from "typeorm";
import { Vote } from "../database/entities/vote";
import { User } from "../database/entities/user";
import { VoteSession } from "../database/entities/VoteSession";
import { OptionVote } from "../database/entities/optionVote";

export class VoteUsecase {
    constructor(private readonly db: DataSource) {}

    async createVote(userId: number, sessionId: number, choixOuOption: string | number): Promise<Vote | string> {
        const voteRepo = this.db.getRepository(Vote);
        const userRepo = this.db.getRepository(User);
        const sessionRepo = this.db.getRepository(VoteSession);
        const optionRepo = this.db.getRepository(OptionVote);
    
        const user = await userRepo.findOne({ where: { id: userId } });
        const session = await sessionRepo.findOne({ where: { id: sessionId }, relations: ["participants", "options"] });
    
        if (!user || !session) {
            return "Utilisateur ou session introuvable";
        }
    
        if (!session.participants.some(participant => participant.id === user.id)) {
            return "Utilisateur non autorisé à voter dans cette session";
        }
    
        let option: OptionVote | null = null;
        let choix: string | undefined;
    
        if (session.type === 'sondage') {
            option = await optionRepo.findOne({ where: { id: choixOuOption as number, session: { id: sessionId } } });
            if (!option) {
                return "Option introuvable pour ce sondage";
            }
        } else {
            choix = choixOuOption as string;
        }
    
        const newVote = voteRepo.create({
            user,
            session,
            option: session.type === 'sondage' ? option : undefined,   
            choix: session.type !== 'sondage' ? choix : undefined,   
            tour: session.tourActuel,
        });
    
        return await voteRepo.save(newVote);
    }
    

    async hasUserVoted(userId: number, sessionId: number): Promise<boolean> {
        const voteRepo = this.db.getRepository(Vote);
        const voteExists = await voteRepo.findOne({
            where: {
                user: { id: userId },
                session: { id: sessionId }
            }
        });
        return !!voteExists;
    }
    async getAllVotes(): Promise<Vote[]> {
        const voteRepo = this.db.getRepository(Vote);
        return await voteRepo.find({ relations: ['user', 'session', 'option'] });
    }
    
 }
