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
exports.Note = void 0;
// models/note.ts
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
let Note = class Note {
};
exports.Note = Note;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Note.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Note.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Note.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Note.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Note.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.notes),
    __metadata("design:type", user_1.User)
], Note.prototype, "user", void 0);
exports.Note = Note = __decorate([
    (0, typeorm_1.Entity)({ name: "note" })
], Note);
