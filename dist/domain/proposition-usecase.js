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
exports.PropositionUsecase = void 0;
const proposition_1 = require("../database/entities/proposition");
const round_1 = require("../database/entities/round");
class PropositionUsecase {
    constructor(db) {
        this.db = db;
    }
    createProposition(propo) {
        return __awaiter(this, void 0, void 0, function* () {
            const propoRepo = this.db.getRepository(proposition_1.Proposition);
            const roundRepo = this.db.getRepository(round_1.Round);
            const round = yield roundRepo.findOne({ where: { id: propo.roundId, isDeleted: false } });
            if (!round) {
                return "Round not found";
            }
            if (round.npropositions < 1) {
                return "No remaining propositions available for this round";
            }
            round.npropositions--;
            yield roundRepo.save(round);
            const newPropo = propoRepo.create({ round, description: propo.description });
            yield propoRepo.save(newPropo);
            return newPropo;
        });
    }
    deleteProposition(propositionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const propoRepo = this.db.getRepository(proposition_1.Proposition);
            const roundRepo = this.db.getRepository(round_1.Round);
            const proposition = yield propoRepo.findOne({ where: { id: propositionId }, relations: ["round"] });
            if (!proposition) {
                return "Proposition not found";
            }
            const round = proposition.round;
            yield propoRepo.remove(proposition);
            round.npropositions++;
            yield roundRepo.save(round);
            return "Proposition deleted successfully";
        });
    }
    getPropositions(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const roundRepository = this.db.getRepository(round_1.Round);
            const round = yield roundRepository.findOne({
                where: { id, isDeleted: false },
                relations: ["propositions"]
            });
            if (round) {
                return round.propositions;
            }
            return null;
        });
    }
}
exports.PropositionUsecase = PropositionUsecase;
