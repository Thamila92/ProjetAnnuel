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
exports.Mission = void 0;
const typeorm_1 = require("typeorm");
const evenement_1 = require("./evenement");
const user_1 = require("./user");
const step_1 = require("./step");
const review_1 = require("./review");
const skill_1 = require("./skill");
const ressource_1 = require("./ressource");
let Mission = class Mission {
    constructor(starting, ending, description, evenement, step) {
        this.starting = starting;
        this.ending = ending;
        this.description = description;
        this.evenement = evenement;
        this.step = step;
    }
};
exports.Mission = Mission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Mission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Mission.prototype, "starting", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Mission.prototype, "ending", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evenement_1.Evenement, (evenement) => evenement.mission, { nullable: true }),
    __metadata("design:type", evenement_1.Evenement)
], Mission.prototype, "evenement", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => step_1.Step, (step) => step.missions, { nullable: true }),
    __metadata("design:type", step_1.Step)
], Mission.prototype, "step", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_1.User, { eager: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Mission.prototype, "assignedUsers", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => skill_1.Skill, { eager: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Mission.prototype, "requiredSkills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_1.Review, (review) => review.mission),
    __metadata("design:type", Array)
], Mission.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ressource_1.Resource, { eager: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Mission.prototype, "resources", void 0);
exports.Mission = Mission = __decorate([
    (0, typeorm_1.Entity)({ name: "mission" }),
    __metadata("design:paramtypes", [Date, Date, String, evenement_1.Evenement, step_1.Step])
], Mission);
