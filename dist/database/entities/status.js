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
exports.Status = exports.statustype = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
var statustype;
(function (statustype) {
    statustype["ADMIN"] = "ADMIN";
    statustype["MEMBER"] = "MEMBER";
    statustype["BENEFACTOR"] = "NORMAL";
    statustype["SALARIER"] = "SALARIER";
})(statustype || (exports.statustype = statustype = {}));
let Status = class Status {
};
exports.Status = Status;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Status.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: statustype }),
    __metadata("design:type", String)
], Status.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Status.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], Status.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_1.User, user => user.status),
    __metadata("design:type", Array)
], Status.prototype, "users", void 0);
exports.Status = Status = __decorate([
    (0, typeorm_1.Entity)()
], Status);
