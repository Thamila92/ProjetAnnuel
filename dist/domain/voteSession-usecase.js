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
        this.sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
        this.userRepo = this.db.getRepository(user_1.User);
        this.optionRepo = this.db.getRepository(optionVote_1.OptionVote);
        this.evenementRepo = this.db.getRepository(evenement_1.Evenement);
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
    deleteVoteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            const voteRepo = this.db.getRepository(vote_1.Vote);
            const optionRepo = this.db.getRepository(optionVote_1.OptionVote);
            yield optionRepo.delete({ session: { id: sessionId } });
            const session = yield sessionRepo.findOneBy({ id: sessionId });
            yield voteRepo.delete({ session: { id: sessionId } });
            if (!session) {
                throw new Error('Session de vote non trouvée');
            }
            // Supprimer la session
            yield sessionRepo.delete(sessionId);
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
            const session = yield sessionRepo.findOne({
                where: { id: sessionId },
                relations: ["votes", "votes.option", "evenement", "options"]
            });
            if (!session) {
                throw new Error("Session non trouvée");
            }
            const votes = session.votes;
            const totalVotes = votes.length;
            let details = {};
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
            }
            else {
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
                                yield sessionRepo.save(session);
                            }
                        }
                        else if (session.tourActuel === 2) {
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
        });
    }
    getVotesBySession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            try {
                const votes = yield voteRepo.find({
                    where: { session: { id: sessionId } },
                    relations: ['user', 'option']
                });
                return votes;
            }
            catch (error) {
                console.error("Error retrieving votes:", error);
                throw new Error("Failed to retrieve votes");
            }
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
    updateVoteSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const existingSession = yield this.sessionRepo.findOne({
                where: { id: params.id },
                relations: ['participants']
            });
            if (!existingSession) {
                throw new Error('Session de vote non trouvée');
            }
            // Mise à jour des champs simples
            existingSession.titre = (_a = params.titre) !== null && _a !== void 0 ? _a : existingSession.titre;
            existingSession.description = (_b = params.description) !== null && _b !== void 0 ? _b : existingSession.description;
            existingSession.dateDebut = (_c = params.dateDebut) !== null && _c !== void 0 ? _c : existingSession.dateDebut;
            existingSession.dateFin = (_d = params.dateFin) !== null && _d !== void 0 ? _d : existingSession.dateFin;
            // Mise à jour des participants
            if (params.participants) {
                existingSession.participants = yield this.userRepo.findByIds(params.participants);
            }
            // Sauvegarde de la session mise à jour
            return yield this.sessionRepo.save(existingSession);
        });
    }
}
exports.VoteSessionUsecase = VoteSessionUsecase;
