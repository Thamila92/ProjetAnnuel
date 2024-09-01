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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteSession = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const vote_1 = require("./vote");
const optionVote_1 = require("./optionVote");
const evenement_1 = require("./evenement");
let VoteSession = class VoteSession {
};
exports.VoteSession = VoteSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VoteSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VoteSession.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], VoteSession.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VoteSession.prototype, "modalite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], VoteSession.prototype, "tourActuel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VoteSession.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_1.User),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], VoteSession.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], VoteSession.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], VoteSession.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vote_1.Vote, vote => vote.session),
    __metadata("design:type", Array)
], VoteSession.prototype, "votes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => optionVote_1.OptionVote, option => option.session),
    __metadata("design:type", Array)
], VoteSession.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evenement_1.Evenement, (evenement) => evenement.votes, { nullable: true }) // nullable pour permettre les votes sans événement
    ,
    __metadata("design:type", Object)
], VoteSession.prototype, "evenement", void 0);
exports.VoteSession = VoteSession = __decorate([
    (0, typeorm_1.Entity)({ name: "vote_sessions" })
], VoteSession);
