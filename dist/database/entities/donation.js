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
exports.Donation = void 0;
// entities/donation.ts
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const paiement_1 = require("./paiement");
let Donation = class Donation {
};
exports.Donation = Donation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Donation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Donation.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Donation.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Donation.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Donation.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.donations, { nullable: true }),
    __metadata("design:type", Object)
], Donation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => paiement_1.Paiement),
    (0, typeorm_1.JoinColumn)() // Lie ce don à un paiement particulier
    ,
    __metadata("design:type", paiement_1.Paiement)
], Donation.prototype, "paiement", void 0);
exports.Donation = Donation = __decorate([
    (0, typeorm_1.Entity)({ name: "donations" })
], Donation);
