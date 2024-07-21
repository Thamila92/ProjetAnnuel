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
exports.Review = void 0;
const typeorm_1 = require("typeorm");
const mission_1 = require("./mission");
const user_1 = require("./user");
let Review = class Review {
    constructor(id, content, createdAt, mission, user) {
        // constructor(id: number, content: string, createdAt: Date, mission: Mission) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.mission = mission;
        this.user = user;
    }
};
exports.Review = Review;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Review.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Review.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_1.Mission, (mission) => mission.reviews),
    __metadata("design:type", mission_1.Mission)
], Review.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, (user) => user.reviews),
    __metadata("design:type", user_1.User)
], Review.prototype, "user", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)({ name: "review" }),
    __metadata("design:paramtypes", [Number, String, Date, mission_1.Mission, user_1.User])
], Review);
