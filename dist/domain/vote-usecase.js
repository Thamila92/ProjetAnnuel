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
const user_1 = require("../database/entities/user");
const vote_1 = require("../database/entities/vote");
const token_1 = require("../database/entities/token");
class VoteUsecase {
    constructor(db) {
        this.db = db;
    }
    listVotes(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(vote_1.Vote, 'vote')
                .where('vote.isDeleted = :isDeleted', { isDeleted: false })
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [votes, totalCount] = yield query.getManyAndCount();
            return {
                votes,
                totalCount
            };
        });
    }
    createVotee(vote, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            if (!token)
                return "Access Forbidden";
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = this.db.getRepository(token_1.Token);
            const tokenFound = yield tokenRepo.findOne({ where: { token }, relations: ['user'] });
            if (!tokenFound) {
                return "Access Forbidden";
            }
            if (!tokenFound.user) {
                return "Internal server error";
            }
            // Trouver l'utilisateur associé au token
            const userRepo = this.db.getRepository(user_1.User);
            const userFound = yield userRepo.findOne({ where: { id: tokenFound.user.id } });
            if (!userFound) {
                return "User not found";
            }
            // Create a new vote
            const newVote = voteRepo.create({
                description: vote.description,
                starting: vote.starting,
                ending: vote.ending,
                user: userFound,
                nrounds: vote.rounds
            });
            // Save the vote
            yield voteRepo.save(newVote);
            return newVote;
        });
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
    deleteVote(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(vote_1.Vote);
            const voteFound = yield repo.findOne({ where: { id, isDeleted: false } });
            if (!voteFound)
                return false;
            voteFound.isDeleted = true;
            yield repo.save(voteFound);
            return voteFound;
        });
    }
}
exports.VoteUsecase = VoteUsecase;
