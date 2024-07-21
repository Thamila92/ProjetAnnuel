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
exports.RoundUsecase = void 0;
const vote_1 = require("../database/entities/vote");
const round_1 = require("../database/entities/round");
class RoundUsecase {
    constructor(db) {
        this.db = db;
    }
    getRounds(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepository = this.db.getRepository(vote_1.Vote);
            const vote = yield voteRepository.findOne({
                where: { id, isDeleted: false },
                relations: ["rounds"]
            });
            if (vote) {
                return vote.rounds;
            }
            return null;
        });
    }
    createRound(description, starting, ending, voteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const voteRepo = this.db.getRepository(vote_1.Vote);
            const vote = yield voteRepo.findOne({ where: { id: voteId } });
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
            const roundRepo = this.db.getRepository(round_1.Round);
            // Check for overlapping rounds for the same vote
            const overlappingRounds = yield roundRepo.createQueryBuilder("round")
                .where("round.voteId = :voteId", { voteId })
                .andWhere("round.starting < :ending AND round.ending > :starting", { starting, ending })
                .getCount();
            if (overlappingRounds > 0) {
                return "There is already a round planned for the same vote during this period";
            }
            // Create new round
            const newRound = roundRepo.create({ description, starting, ending, vote });
            // Decrement nrounds
            vote.nrounds--;
            yield voteRepo.save(vote);
            yield roundRepo.save(newRound);
            return newRound;
        });
    }
    deleteRound(roundId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roundRepo = this.db.getRepository(round_1.Round);
            const round = yield roundRepo.findOne({ where: { id: roundId, isDeleted: false }, relations: ['vote'] });
            if (!round) {
                return false;
            }
            const voteRepo = this.db.getRepository(vote_1.Vote);
            const vote = round.vote;
            // Mark round as deleted
            round.isDeleted = true;
            yield roundRepo.save(round);
            // Increment nrounds
            if (vote) {
                vote.nrounds++;
                yield voteRepo.save(vote);
            }
            return round;
        });
    }
}
exports.RoundUsecase = RoundUsecase;
