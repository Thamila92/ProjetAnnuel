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
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const expenditure_1 = require("./expenditure");
let Donation = class Donation {
};
exports.Donation = Donation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Donation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Donation.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Donation.prototype, "remaining", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Donation.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Donation.prototype, "isCanceled", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => expenditure_1.Expenditures, expenditures => expenditures.donation),
    __metadata("design:type", Array)
], Donation.prototype, "expenditures", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, benefactor => benefactor.donations),
    __metadata("design:type", user_1.User)
], Donation.prototype, "benefactor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], Donation.prototype, "createdAt", void 0);
exports.Donation = Donation = __decorate([
    (0, typeorm_1.Entity)()
], Donation);
