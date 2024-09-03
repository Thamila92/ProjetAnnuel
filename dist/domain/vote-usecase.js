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
exports.VoteUsecase = void 0;
const vote_1 = require("../database/entities/vote");
const user_1 = require("../database/entities/user");
const VoteSession_1 = require("../database/entities/VoteSession");
const optionVote_1 = require("../database/entities/optionVote");
class VoteUsecase {
    constructor(db) {
        this.db = db;
    }
    createVote(userId, sessionId, choixOuOption) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            const userRepo = this.db.getRepository(user_1.User);
            const sessionRepo = this.db.getRepository(VoteSession_1.VoteSession);
            const optionRepo = this.db.getRepository(optionVote_1.OptionVote);
            const user = yield userRepo.findOne({ where: { id: userId } });
            const session = yield sessionRepo.findOne({ where: { id: sessionId }, relations: ["participants", "options"] });
            if (!user || !session) {
                return "Utilisateur ou session introuvable";
            }
            if (!session.participants.some(participant => participant.id === user.id)) {
                return "Utilisateur non autorisé à voter dans cette session";
            }
            let option = null;
            let choix;
            if (session.type === 'sondage') {
                option = yield optionRepo.findOne({ where: { id: choixOuOption, session: { id: sessionId } } });
                if (!option) {
                    return "Option introuvable pour ce sondage";
                }
            }
            else {
                choix = choixOuOption;
            }
            const newVote = voteRepo.create({
                user,
                session,
                option: session.type === 'sondage' ? option : undefined, // Lier l'option si c'est un sondage
                choix: session.type !== 'sondage' ? choix : undefined, // Lier le choix si ce n'est pas un sondage
                tour: session.tourActuel,
            });
            return yield voteRepo.save(newVote);
        });
    }
    hasUserVoted(userId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            const voteExists = yield voteRepo.findOne({
                where: {
                    user: { id: userId },
                    session: { id: sessionId }
                }
            });
            return !!voteExists;
        });
    }
    getAllVotes() {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            return yield voteRepo.find({ relations: ['user', 'session', 'option'] });
        });
    }
}
exports.VoteUsecase = VoteUsecase;
