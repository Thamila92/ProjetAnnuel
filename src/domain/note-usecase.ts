import { Repository, DataSource } from 'typeorm';
import { User } from '../database/entities/user';
import { Note } from '../database/entities/note';
 
export interface CreateNoteParams {
    name: string;
    content: string;
}

export interface UpdateNoteParams {
    name?: string;
    content?: string;
}

export class NoteUsecase {
    constructor(private readonly db: DataSource) {}

    async createNote(userId: number, note: CreateNoteParams): Promise<Note | string> {
        const userRepo = this.db.getRepository(User);
        const noteRepo = this.db.getRepository(Note);

        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            return 'User not found';
        }

        const newNote = noteRepo.create({
            ...note,
            user: user
        });

        await noteRepo.save(newNote);
        return newNote;
    }

    async listNotes(userId: number): Promise<Note[]> {
        const noteRepo = this.db.getRepository(Note);
        return noteRepo.find({ where: { user: { id: userId } } });
    }

    async getNoteById(noteId: number, userId: number): Promise<Note | null> {
        const noteRepo = this.db.getRepository(Note);
        const note = await noteRepo.findOne({ where: { id: noteId, user: { id: userId } } });
        return note || null;
    }

    async updateNote(noteId: number, userId: number, params: UpdateNoteParams): Promise<Note | string | null> {
        const noteRepo = this.db.getRepository(Note);
        const note = await noteRepo.findOne({ where: { id: noteId, user: { id: userId } } });
        if (!note) {
            return null;
        }

        if (params.name) note.name = params.name;
        if (params.content) note.content = params.content;

        const updatedNote = await noteRepo.save(note);
        return updatedNote;
    }

    async deleteNote(noteId: number, userId: number): Promise<boolean> {
        const noteRepo = this.db.getRepository(Note);
        const note = await noteRepo.findOne({ where: { id: noteId, user: { id: userId } } });
        if (!note) {
            return false;
        }

        await noteRepo.remove(note);
        return true;
    }
}
