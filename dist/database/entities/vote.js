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
exports.Vote = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const round_1 = require("./round");
let Vote = class Vote {
};
exports.Vote = Vote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Vote.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], Vote.prototype, "nrounds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Vote.prototype, "starting", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Vote.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Vote.prototype, "ending", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => round_1.Round, (round) => round.vote, { cascade: true }) // Added cascade option
    ,
    __metadata("design:type", Array)
], Vote.prototype, "rounds", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.votes),
    __metadata("design:type", user_1.User)
], Vote.prototype, "user", void 0);
exports.Vote = Vote = __decorate([
    (0, typeorm_1.Entity)()
], Vote);
