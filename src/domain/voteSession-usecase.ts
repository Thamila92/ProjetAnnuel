import { DataSource, DeepPartial, Repository } from "typeorm";
import { User } from "../database/entities/user";
import { Vote } from "../database/entities/vote";
import { VoteSession } from "../database/entities/VoteSession";
import { OptionVote } from "../database/entities/optionVote";
import { Evenement } from "../database/entities/evenement";
interface VoteDetail {
    titre: string;
    votes: number;
    pourcentage: number;
}

interface VoteResult {
    gagnant: string;
    pourcentage: Record<number, VoteDetail> | { pour: VoteDetail, contre: VoteDetail };
    message?: string;
}
export class VoteSessionUsecase {
    private sessionRepo: Repository<VoteSession>;
    private userRepo: Repository<User>;
    private optionRepo: Repository<OptionVote>;
    private evenementRepo: Repository<Evenement>;

    constructor(private readonly db: DataSource) {
        this.sessionRepo = this.db.getRepository(VoteSession);
        this.userRepo = this.db.getRepository(User);
        this.optionRepo = this.db.getRepository(OptionVote);
        this.evenementRepo = this.db.getRepository(Evenement);
    }

 
  async createVoteSession(params: Partial<VoteSession> & { evenementId?: number }): Promise<VoteSession> {
    const sessionRepo = this.db.getRepository(VoteSession);
    const userRepo = this.db.getRepository(User);
    const optionRepo = this.db.getRepository(OptionVote);
    const evenementRepo = this.db.getRepository(Evenement);

    const participants = await userRepo.findByIds(params.participants || []);

    // Chercher l'événement si `evenementId` est fourni
    let evenement: Evenement | undefined = undefined;
    if (params.evenementId) {
      evenement = await evenementRepo.findOne({ where: { id: params.evenementId } }) || undefined; // Assurez-vous que c'est `undefined` si non trouvé
    }

    // Créer et sauvegarder la session de vote
    const newSession = sessionRepo.create({
      titre: params.titre!,
      description: params.description!,
      modalite: params.modalite!,
      participants: participants,
      dateDebut: params.dateDebut || new Date(),
      dateFin: params.dateFin || new Date(),
      tourActuel: 1,
      type: params.type!,  // Assurez-vous que ce champ est bien défini dans params
      evenement,  // Associer l'événement si disponible
    });

    const savedSession = await sessionRepo.save(newSession);

    // Créer et sauvegarder les options de vote si elles existent
    if (params.options && params.options.length > 0) {
      const options = params.options.map(optionTitre => {
        return optionRepo.create({
          titre: optionTitre as unknown as string,  // Chaque chaîne de caractères devient un titre d'option
          session: savedSession,  // Liez l'option à la session
        });
      });

      // Sauvegardez les options dans la base de données
      await optionRepo.save(options);
    }

    return savedSession;
  }

 

  async deleteVoteSession(sessionId: number): Promise<void> {
    const sessionRepo = this.db.getRepository(VoteSession);
    const voteRepo = this.db.getRepository(Vote);
    const optionRepo = this.db.getRepository(OptionVote);
    await optionRepo.delete({ session: { id: sessionId } });

    const session = await sessionRepo.findOneBy({ id: sessionId });
    await voteRepo.delete({ session: { id: sessionId } });

    if (!session) {
        throw new Error('Session de vote non trouvée');
    }

    // Supprimer la session
    await sessionRepo.delete(sessionId);
}


    // Lancer un nouveau tour
    async lancerNouveauTour(sessionId: number): Promise<VoteSession | string> {
        const sessionRepo = this.db.getRepository(VoteSession);
        const session = await sessionRepo.findOne({ where: { id: sessionId }, relations: ["votes"] });

        if (!session) {
            return "Session de vote non trouvée";
        }

        // Calcul des résultats du tour actuel pour vérifier s'il y a un gagnant
        const resultats = await this.calculerResultats(sessionId);

        if (resultats.gagnant) {
            return "Un gagnant a déjà été déterminé";
        }

        // Passez au tour suivant
        session.tourActuel += 1;
        return await sessionRepo.save(session);
    }

 
    async calculerResultats(sessionId: number): Promise<VoteResult> {
        const voteRepo = this.db.getRepository(Vote);
        const sessionRepo = this.db.getRepository(VoteSession);
    
        const session = await sessionRepo.findOne({
            where: { id: sessionId },
            relations: ["votes", "votes.option", "evenement", "options"]
        });
    
        if (!session) {
            throw new Error("Session non trouvée");
        }
    
        const votes = session.votes;
        const totalVotes = votes.length;
    
        let details: Record<number, VoteDetail> = {};
        let gagnant = '';
    
        if (session.type === 'sondage') {
            // Initialisation des détails pour chaque option
            session.options.forEach(option => {
                details[option.id] = {
                    titre: option.titre,
                    votes: 0,
                    pourcentage: 0
                };
            });
    
            // Comptabilisation des votes par option
            votes.forEach(vote => {
                if (vote.option) {
                    details[vote.option.id].votes++;
                }
            });
    
            // Calcul des pourcentages pour chaque option
            Object.keys(details).forEach(key => {
                const optionId = parseInt(key);
                details[optionId].pourcentage = totalVotes > 0 
                    ? parseFloat((details[optionId].votes / totalVotes * 100).toFixed(2)) 
                    : 0;
            });
    
            // Détermination de l'option gagnante
            let maxVote = 0;
            Object.values(details).forEach(option => {
                if (option.votes > maxVote) {
                    maxVote = option.votes;
                    gagnant = option.titre;
                }
            });
        } else {
            // Gestion des votes classiques (hors sondage)
            const pourVotes = votes.filter(v => v.choix === 'pour').length;
            const contreVotes = votes.filter(v => v.choix === 'contre').length;
            let pourcentageClassique = {
                pour: { votes: pourVotes, pourcentage: totalVotes > 0 ? parseFloat((pourVotes / totalVotes * 100).toFixed(2)) : 0 },
                contre: { votes: contreVotes, pourcentage: totalVotes > 0 ? parseFloat((contreVotes / totalVotes * 100).toFixed(2)) : 0 }
            };
    
            switch (session.modalite) {
                case 'majorité_absolue':
                    gagnant = pourVotes > totalVotes / 2 ? 'pour' : (contreVotes > totalVotes / 2 ? 'contre' : '');
                    break;
                case 'majorité_relative':
                    gagnant = pourVotes > contreVotes ? 'pour' : (contreVotes > pourVotes ? 'contre' : 'aucun');
                    break;
                case 'deux_tours':
                    if (session.tourActuel === 1 && (pourVotes > totalVotes / 2 || contreVotes > totalVotes / 2)) {
                        gagnant = pourVotes > contreVotes ? 'pour' : 'contre';
                        if (session.modalite === 'deux_tours' && gagnant === '') {
                            session.tourActuel = 2;
                            await sessionRepo.save(session);
                        }
                    } else if (session.tourActuel === 2) {
                        gagnant = pourVotes > contreVotes ? 'pour' : (contreVotes > pourVotes ? 'contre' : 'aucun');
                    }
                    break;
                case 'un_tour':
                    gagnant = pourVotes > contreVotes ? 'pour' : (contreVotes > pourVotes ? 'contre' : 'aucun');
                    break;
                default:
                    throw new Error("Modalité de vote inconnue");
            }
            return { gagnant, pourcentage: pourcentageClassique };
        }
    
        return { gagnant, pourcentage: details };
    }
    
    
    
    async getVotesBySession(sessionId: number): Promise<Vote[]> {
        const voteRepo = this.db.getRepository(Vote);
        try {
            const votes = await voteRepo.find({
                where: { session: { id: sessionId } },
                relations: ['user', 'option']
            });
            return votes;
        } catch (error) {
            console.error("Error retrieving votes:", error);
            throw new Error("Failed to retrieve votes");
        }
    }
    
    
    // Méthode pour récupérer une session de vote par ID
async getVoteSession(sessionId: number): Promise<VoteSession | null> {
    const sessionRepo = this.db.getRepository(VoteSession);
    const session = await sessionRepo.findOne({ where: { id: sessionId }, relations: ["participants", "votes","options"] });
    return session || null;
}

// Méthode pour récupérer toutes les sessions de vote
async getAllVoteSessions(): Promise<VoteSession[]> {
    const sessionRepo = this.db.getRepository(VoteSession);
    return await sessionRepo.find({ relations: ["participants", "votes","options"] });
}

 
async updateVoteSession(params: Partial<VoteSession> & { id: number }): Promise<VoteSession> {
    const existingSession = await this.sessionRepo.findOne({
        where: { id: params.id },
        relations: ['participants']
    });

    if (!existingSession) {
        throw new Error('Session de vote non trouvée');
    }

    // Mise à jour des champs simples
    existingSession.titre = params.titre ?? existingSession.titre;
    existingSession.description = params.description ?? existingSession.description;
    existingSession.dateDebut = params.dateDebut ?? existingSession.dateDebut;
    existingSession.dateFin = params.dateFin ?? existingSession.dateFin;

    // Mise à jour des participants
    if (params.participants) {
        existingSession.participants = await this.userRepo.findByIds(params.participants);
    }

    // Sauvegarde de la session mise à jour
    return await this.sessionRepo.save(existingSession);
}



}