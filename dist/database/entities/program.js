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
exports.Program = void 0;
const typeorm_1 = require("typeorm");
const evenement_1 = require("./evenement");
let Program = class Program {
};
exports.Program = Program;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Program.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Program.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Program, (program) => program.children),
    __metadata("design:type", Array)
], Program.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evenement_1.Evenement, { nullable: true }),
    __metadata("design:type", Object)
], Program.prototype, "evenement", void 0);
exports.Program = Program = __decorate([
    (0, typeorm_1.Entity)()
], Program);
