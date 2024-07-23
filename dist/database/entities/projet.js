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
exports.Projet = void 0;
const typeorm_1 = require("typeorm");
const step_1 = require("./step");
const user_1 = require("./user");
let Projet = class Projet {
    constructor() {
        this.state = 'UNSTARTED';
    }
};
exports.Projet = Projet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Projet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Projet.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Projet.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Projet.prototype, "starting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Projet.prototype, "ending", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Projet.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => step_1.Step, (step) => step.projet),
    __metadata("design:type", Array)
], Projet.prototype, "steps", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.projets),
    __metadata("design:type", user_1.User)
], Projet.prototype, "user", void 0);
exports.Projet = Projet = __decorate([
    (0, typeorm_1.Entity)({ name: "projet" }),
    __metadata("design:paramtypes", [])
], Projet);
