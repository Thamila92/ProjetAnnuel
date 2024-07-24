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
exports.ResourceAvailability = void 0;
const typeorm_1 = require("typeorm");
const ressource_1 = require("./ressource");
let ResourceAvailability = class ResourceAvailability {
};
exports.ResourceAvailability = ResourceAvailability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ResourceAvailability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], ResourceAvailability.prototype, "start", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], ResourceAvailability.prototype, "end", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ressource_1.Resource, (resource) => resource.availabilities),
    __metadata("design:type", ressource_1.Resource)
], ResourceAvailability.prototype, "resource", void 0);
exports.ResourceAvailability = ResourceAvailability = __decorate([
    (0, typeorm_1.Entity)({ name: "resource_availability" })
], ResourceAvailability);
