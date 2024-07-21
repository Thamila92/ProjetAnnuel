"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteUsecase = void 0;
const user_1 = require("../database/entities/user");
const note_1 = require("../database/entities/note");
class NoteUsecase {
    constructor(db) {
        this.db = db;
    }
    createNote(userId, note) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const noteRepo = this.db.getRepository(note_1.Note);
            const user = yield userRepo.findOne({ where: { id: userId } });
            if (!user) {
                return 'User not found';
            }
            const newNote = noteRepo.create(Object.assign(Object.assign({}, note), { user: user }));
            yield noteRepo.save(newNote);
            return newNote;
        });
    }
    listNotes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const noteRepo = this.db.getRepository(note_1.Note);
            return noteRepo.find({ where: { user: { id: userId } } });
        });
    }
    getNoteById(noteId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const noteRepo = this.db.getRepository(note_1.Note);
            const note = yield noteRepo.findOne({ where: { id: noteId, user: { id: userId } } });
            return note || null;
        });
    }
    updateNote(noteId, userId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const noteRepo = this.db.getRepository(note_1.Note);
            const note = yield noteRepo.findOne({ where: { id: noteId, user: { id: userId } } });
            if (!note) {
                return null;
            }
            if (params.name)
                note.name = params.name;
            if (params.content)
                note.content = params.content;
            if (params.date)
                note.date = params.date;
            const updatedNote = yield noteRepo.save(note);
            return updatedNote;
        });
    }
    deleteNote(noteId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const noteRepo = this.db.getRepository(note_1.Note);
            const note = yield noteRepo.findOne({ where: { id: noteId, user: { id: userId } } });
            if (!note) {
                return false;
            }
            yield noteRepo.remove(note);
            return true;
        });
    }
}
exports.NoteUsecase = NoteUsecase;
