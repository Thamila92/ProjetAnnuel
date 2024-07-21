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
exports.EvenementAttendee = exports.AttendeeRole = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./user");
const evenement_1 = require("./evenement");
var AttendeeRole;
(function (AttendeeRole) {
    AttendeeRole["IMPORTANT"] = "IMPORTANT";
    AttendeeRole["NORMAL"] = "NORMAL";
})(AttendeeRole || (exports.AttendeeRole = AttendeeRole = {}));
let EvenementAttendee = class EvenementAttendee {
};
exports.EvenementAttendee = EvenementAttendee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EvenementAttendee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evenement_1.Evenement, (evenement) => evenement.attendees),
    __metadata("design:type", evenement_1.Evenement)
], EvenementAttendee.prototype, "evenement", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_1.User, (user) => user.evenementAttendees),
    __metadata("design:type", user_1.User)
], EvenementAttendee.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: AttendeeRole, default: AttendeeRole.NORMAL }),
    __metadata("design:type", String)
], EvenementAttendee.prototype, "role", void 0);
exports.EvenementAttendee = EvenementAttendee = __decorate([
    (0, typeorm_1.Entity)({ name: "evenement_attendee" })
], EvenementAttendee);
