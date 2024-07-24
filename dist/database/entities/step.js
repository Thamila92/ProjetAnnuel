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
exports.Step = void 0;
const typeorm_1 = require("typeorm");
const projet_1 = require("./projet");
const mission_1 = require("./mission");
let Step = class Step {
    constructor(state, description, starting, ending, projet) {
        this.state = state;
        this.description = description;
        this.starting = starting;
        this.ending = ending;
        this.projet = projet;
    }
};
exports.Step = Step;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Step.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Step.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Step.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Step.prototype, "starting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Step.prototype, "ending", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => projet_1.Projet, (projet) => projet.steps),
    __metadata("design:type", projet_1.Projet)
], Step.prototype, "projet", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => mission_1.Mission, (mission) => mission.step),
    __metadata("design:type", Array)
], Step.prototype, "missions", void 0);
exports.Step = Step = __decorate([
    (0, typeorm_1.Entity)({ name: "step" }),
    __metadata("design:paramtypes", [String, String, Date, Date, projet_1.Projet])
], Step);
