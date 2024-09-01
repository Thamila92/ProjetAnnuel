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
exports.OptionVote = void 0;
const typeorm_1 = require("typeorm");
const VoteSession_1 = require("./VoteSession");
const vote_1 = require("./vote");
let OptionVote = class OptionVote {
};
exports.OptionVote = OptionVote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OptionVote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OptionVote.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => VoteSession_1.VoteSession, session => session.options),
    __metadata("design:type", VoteSession_1.VoteSession)
], OptionVote.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vote_1.Vote, vote => vote.option),
    __metadata("design:type", Array)
], OptionVote.prototype, "votes", void 0);
exports.OptionVote = OptionVote = __decorate([
    (0, typeorm_1.Entity)({ name: "vote_options" })
], OptionVote);
