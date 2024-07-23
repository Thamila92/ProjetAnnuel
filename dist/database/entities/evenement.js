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
exports.Evenement = exports.repetitivity = void 0;
const typeorm_1 = require("typeorm");
const mission_1 = require("./mission");
const user_1 = require("./user");
const program_1 = require("./program");
const location_1 = require("./location");
const evenement_attendee_1 = require("./evenement-attendee");
const event_types_1 = require("../../types/event-types");
const notification_1 = require("./notification");
var repetitivity;
(function (repetitivity) {
    repetitivity["NONE"] = "NONE";
    repetitivity["MONTHLY"] = "MONTHLY";
    repetitivity["ANNUAL"] = "ANNUAL";
})(repetitivity || (exports.repetitivity = repetitivity = {}));
let Evenement = class Evenement {
    constructor() {
        this.state = 'UNSTARTED';
    }
};
exports.Evenement = Evenement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Evenement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Evenement.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: event_types_1.eventtype
    }),
    __metadata("design:type", String)
], Evenement.prototype, "typee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Evenement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => program_1.Program, (program) => program.evenement),
    __metadata("design:type", Array)
], Evenement.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Evenement.prototype, "quorum", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Evenement.prototype, "starting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: repetitivity }),
    __metadata("design:type", String)
], Evenement.prototype, "repetitivity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime" }),
    __metadata("design:type", Date)
], Evenement.prototype, "ending", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, (user) => user.evenements),
    __metadata("design:type", user_1.User)
], Evenement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => mission_1.Mission, (mission) => mission.evenement),
    __metadata("design:type", Array)
], Evenement.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evenement_attendee_1.EvenementAttendee, (attendee) => attendee.evenement),
    __metadata("design:type", Array)
], Evenement.prototype, "attendees", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => location_1.Location),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Evenement.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Evenement.prototype, "isVirtual", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Evenement.prototype, "virtualLink", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Evenement.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_1.Notification, vote => vote.event),
    __metadata("design:type", Array)
], Evenement.prototype, "notifications", void 0);
exports.Evenement = Evenement = __decorate([
    (0, typeorm_1.Entity)({ name: "evenement" }),
    __metadata("design:paramtypes", [])
], Evenement);
