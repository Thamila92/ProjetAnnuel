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
exports.Paiement = void 0;
// entities/paiement.ts
const typeorm_1 = require("typeorm");
const donation_1 = require("./donation");
const cotisation_1 = require("./cotisation");
let Paiement = class Paiement {
};
exports.Paiement = Paiement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Paiement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Paiement.prototype, "stripePaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Paiement.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Paiement.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Paiement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Paiement.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => donation_1.Donation, (donation) => donation.paiement, { nullable: true }),
    __metadata("design:type", Object)
], Paiement.prototype, "donation", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => cotisation_1.Cotisation, (cotisation) => cotisation.paiement, { nullable: true }),
    __metadata("design:type", Object)
], Paiement.prototype, "cotisation", void 0);
exports.Paiement = Paiement = __decorate([
    (0, typeorm_1.Entity)({ name: "paiements" })
], Paiement);
