"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendeeRole = exports.repetitivity = exports.eventtype = void 0;
var eventtype;
(function (eventtype) {
    eventtype["AG"] = "AG";
    eventtype["AG_EXTRAORDINAIRE"] = "AG_EXTRAORDINAIRE";
    eventtype["porteOuverte"] = "PORTE_OUVERTE";
    eventtype["conference"] = "CONFERENCE";
    eventtype["atelier"] = "ATELIER";
    eventtype["seminaire"] = "SEMINAIRE";
    eventtype["reunion"] = "REUNION";
})(eventtype || (exports.eventtype = eventtype = {}));
var repetitivity;
(function (repetitivity) {
    repetitivity["MONTHLY"] = "MONTHLY";
    repetitivity["ANNUAL"] = "ANNUAL";
    repetitivity["NONE"] = "NONE";
})(repetitivity || (exports.repetitivity = repetitivity = {}));
var AttendeeRole;
(function (AttendeeRole) {
    AttendeeRole["IMPORTANT"] = "IMPORTANT";
    AttendeeRole["NORMAL"] = "NORMAL";
})(AttendeeRole || (exports.AttendeeRole = AttendeeRole = {}));
