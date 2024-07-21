"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.Round = void 0;
const typeorm_1 = require("typeorm");
const vote_1 = require("./vote");
const proposition_1 = require("./proposition");
const database_1 = require("../database");
let Round = class Round {
    checkAndDecrementNrounds() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.vote && this.vote.nrounds > 0) {
                this.vote.nrounds--;
                yield database_1.AppDataSource.getRepository(vote_1.Vote).save(this.vote);
            }
            else {
                throw new Error("Cannot create round: no remaining rounds available.");
            }
        });
    }
    incrementNrounds() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.vote) {
                this.vote.nrounds++;
                yield database_1.AppDataSource.getRepository(vote_1.Vote).save(this.vote);
            }
        });
    }
};
exports.Round = Round;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Round.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Round.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Round.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], Round.prototype, "npropositions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Round.prototype, "starting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Round.prototype, "ending", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vote_1.Vote, (vote) => vote.rounds, { onDelete: 'CASCADE' }),
    __metadata("design:type", vote_1.Vote)
], Round.prototype, "vote", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => proposition_1.Proposition, (proposition) => proposition.round),
    __metadata("design:type", Array)
], Round.prototype, "propositions", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Round.prototype, "checkAndDecrementNrounds", null);
__decorate([
    (0, typeorm_1.AfterRemove)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Round.prototype, "incrementNrounds", null);
exports.Round = Round = __decorate([
    (0, typeorm_1.Entity)()
], Round);
