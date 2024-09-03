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
exports.Folder = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const document_1 = require("./document");
let Folder = class Folder {
};
exports.Folder = Folder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Object)
], Folder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Folder.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, user => user.folders),
    __metadata("design:type", user_1.User)
], Folder.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Folder, folder => folder.children, { nullable: true }) // Autoriser les valeurs null
    ,
    __metadata("design:type", Object)
], Folder.prototype, "parentFolder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Folder, folder => folder.parentFolder),
    __metadata("design:type", Array)
], Folder.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_1.Document, document => document.folder),
    __metadata("design:type", Array)
], Folder.prototype, "documents", void 0);
exports.Folder = Folder = __decorate([
    (0, typeorm_1.Entity)()
], Folder);
