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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const status_1 = require("./status");
const token_1 = require("./token");
const expenditure_1 = require("./expenditure");
const donation_1 = require("./donation");
const review_1 = require("./review");
const evenement_1 = require("./evenement");
const mission_1 = require("./mission");
const projet_1 = require("./projet");
const document_1 = require("./document");
const vote_1 = require("./vote");
const location_1 = require("./location");
const evenement_attendee_1 = require("./evenement-attendee");
const notification_1 = require("./notification");
const skill_1 = require("./skill");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        unique: true
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => skill_1.Skill, skill => skill.users, { cascade: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_1.Notification, notification => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "datetime" }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => status_1.Status, status => status.users),
    __metadata("design:type", status_1.Status)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => token_1.Token, token => token.user),
    __metadata("design:type", Array)
], User.prototype, "tokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evenement_1.Evenement, ev => ev.user),
    __metadata("design:type", Array)
], User.prototype, "evenements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => projet_1.Projet, projet => projet.user),
    __metadata("design:type", Array)
], User.prototype, "projets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => mission_1.Mission, mission => mission.assignedUsers),
    __metadata("design:type", Array)
], User.prototype, "missions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_1.Review, review => review.user),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => donation_1.Donation, donation => donation.benefactor),
    __metadata("design:type", Array)
], User.prototype, "donations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => location_1.Location, location => location.user),
    __metadata("design:type", Array)
], User.prototype, "locations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => expenditure_1.Expenditures, expenditures => expenditures.user),
    __metadata("design:type", Array)
], User.prototype, "expenditures", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => document_1.Document, document => document.user),
    __metadata("design:type", Array)
], User.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vote_1.Vote, vote => vote.user),
    __metadata("design:type", Array)
], User.prototype, "votes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vote_1.Vote, note => note.user),
    __metadata("design:type", Array)
], User.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evenement_attendee_1.EvenementAttendee, (attendee) => attendee.user),
    __metadata("design:type", Array)
], User.prototype, "evenementAttendees", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
