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
exports.VoteSessionUsecase = void 0;
const user_1 = require("../database/entities/user");
const vote_1 = require("../database/entities/vote");
const VoteSession_1 = require("../database/entities/VoteSession");
const optionVote_1 = require("../database/entities/optionVote");
const evenement_1 = require("../database/entities/evenement");
class VoteSessionUsecase {
    constructor(db) {
        this.db = db;
    }
    createVoteSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            const userRepo = this.db.getRepository(user_1.User);
            const optionRepo = this.db.getRepository(optionVote_1.OptionVote);
            const evenementRepo = this.db.getRepository(evenement_1.Evenement);
            const participants = yield userRepo.findByIds(params.participants || []);
            // Chercher l'événement si `evenementId` est fourni
            let evenement = undefined;
            if (params.evenementId) {
                evenement = (yield evenementRepo.findOne({ where: { id: params.evenementId } })) || undefined; // Assurez-vous que c'est `undefined` si non trouvé
            }
            // Créer et sauvegarder la session de vote
            const newSession = sessionRepo.create({
                titre: params.titre,
                description: params.description,
                modalite: params.modalite,
                participants: participants,
                dateDebut: params.dateDebut || new Date(),
                dateFin: params.dateFin || new Date(),
                tourActuel: 1,
                type: params.type, // Assurez-vous que ce champ est bien défini dans params
                evenement, // Associer l'événement si disponible
            });
            const savedSession = yield sessionRepo.save(newSession);
            // Créer et sauvegarder les options de vote si elles existent
            if (params.options && params.options.length > 0) {
                const options = params.options.map(optionTitre => {
                    return optionRepo.create({
                        titre: optionTitre, // Chaque chaîne de caractères devient un titre d'option
                        session: savedSession, // Liez l'option à la session
                    });
                });
                // Sauvegardez les options dans la base de données
                yield optionRepo.save(options);
            }
            return savedSession;
        });
    }
    // Lancer un nouveau tour
    lancerNouveauTour(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            const session = yield sessionRepo.findOne({ where: { id: sessionId }, relations: ["votes"] });
            if (!session) {
                return "Session de vote non trouvée";
            }
            // Calcul des résultats du tour actuel pour vérifier s'il y a un gagnant
            const resultats = yield this.calculerResultats(sessionId);
            if (resultats.gagnant) {
                return "Un gagnant a déjà été déterminé";
            }
            // Passez au tour suivant
            session.tourActuel += 1;
            return yield sessionRepo.save(session);
        });
    }
    calculerResultats(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            // Récupérer la session de vote
            const session = yield sessionRepo.findOne({ where: { id: sessionId }, relations: ["votes", "evenement"] });
            if (!session) {
                throw new Error("Session not found");
            }
            // Récupérer les votes de cette session
            const votes = yield voteRepo.find({ where: { session: { id: sessionId } } });
            const totalVotes = votes.length;
            const pourVotes = votes.filter(v => v.choix === 'pour').length;
            const contreVotes = votes.filter(v => v.choix === 'contre').length;
            let gagnant = false;
            let resultat = {};
            if (session.evenement && session.evenement.type === "AG") {
                const quorum = session.evenement.quorum;
                if (totalVotes < quorum) {
                    return { gagnant: false, resultat: { message: "Quorum non atteint. Le vote est invalide." } };
                }
            }
            // Logique basée sur la modalité
            switch (session.modalite) {
                case 'majorité_absolue':
                    // Pour gagner à la majorité absolue, il faut plus de 50% des votes
                    if (pourVotes > totalVotes / 2) {
                        gagnant = true;
                        resultat = { gagnant: 'pour' };
                    }
                    else if (contreVotes > totalVotes / 2) {
                        gagnant = true;
                        resultat = { gagnant: 'contre' };
                    }
                    break;
                case 'majorité_relative':
                    // Pour la majorité relative, celui qui a le plus de votes gagne, même si ce n'est pas plus de 50%
                    if (pourVotes > contreVotes) {
                        gagnant = true;
                        resultat = { gagnant: 'pour' };
                    }
                    else if (contreVotes > pourVotes) {
                        gagnant = true;
                        resultat = { gagnant: 'contre' };
                    }
                    break;
                case 'deux_tours':
                    // Si on est au premier tour et aucun gagnant, on passe au deuxième tour
                    if (session.tourActuel === 1) {
                        if (pourVotes > totalVotes / 2) {
                            gagnant = true;
                            resultat = { gagnant: 'pour' };
                        }
                        else if (contreVotes > totalVotes / 2) {
                            gagnant = true;
                            resultat = { gagnant: 'contre' };
                        }
                        else {
                            // Pas de gagnant au premier tour, passer au deuxième tour
                            session.tourActuel = 2;
                            yield sessionRepo.save(session);
                            resultat = { message: 'Pas de gagnant au premier tour, passage au deuxième tour.' };
                        }
                    }
                    else if (session.tourActuel === 2) {
                        // Logique de deuxième tour (on pourrait simplifier ici pour simplement désigner le plus de votes comme gagnant)
                        if (pourVotes > contreVotes) {
                            gagnant = true;
                            resultat = { gagnant: 'pour' };
                        }
                        else if (contreVotes > pourVotes) {
                            gagnant = true;
                            resultat = { gagnant: 'contre' };
                        }
                    }
                    break;
                case 'un_tour':
                    // Pour le vote à un tour, on applique une logique similaire à la majorité relative
                    if (pourVotes > contreVotes) {
                        gagnant = true;
                        resultat = { gagnant: 'pour' };
                    }
                    else if (contreVotes > pourVotes) {
                        gagnant = true;
                        resultat = { gagnant: 'contre' };
                    }
                    break;
                default:
                    throw new Error("Modalité inconnue");
            }
            return { gagnant, resultat };
        });
    }
    // Méthode pour récupérer une session de vote par ID
    getVoteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            const session = yield sessionRepo.findOne({ where: { id: sessionId }, relations: ["participants", "votes", "options"] });
            return session || null;
        });
    }
    // Méthode pour récupérer toutes les sessions de vote
    getAllVoteSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            return yield sessionRepo.find({ relations: ["participants", "votes", "options"] });
        });
    }
}
exports.VoteSessionUsecase = VoteSessionUsecase;
