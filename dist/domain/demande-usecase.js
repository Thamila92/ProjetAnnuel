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
exports.DemandeUsecase = void 0;
const demande_1 = require("../database/entities/demande");
const user_1 = require("../database/entities/user");
class DemandeUsecase {
    constructor(db) {
        this.db = db;
    }
    // Créer une demande
    createDemande(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const demandeRepo = this.db.getRepository(demande_1.Demande);
            // Vérifier si un utilisateur avec le même email et nom existe déjà
            const existingUser = yield userRepo.findOne({ where: { email: params.email } });
            // Créer une nouvelle demande
            const newDemande = demandeRepo.create({
                email: params.email,
                nom: params.nom,
                prenom: params.prenom,
                age: params.age,
                phone: params.phone,
                profession: params.profession || '',
                titre: params.titre,
                description: params.description,
                budget: params.budget,
                deadline: params.deadline,
                statut: params.statut || 'en_attente',
                user: existingUser || undefined // Associer à l'utilisateur existant ou laisser vide
            });
            // Sauvegarder la nouvelle demande dans la base de données
            return yield demandeRepo.save(newDemande);
        });
    }
    // Liste des demandes
    listDemandes() {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(demande_1.Demande);
            return yield repo.find();
        });
    }
    // Obtenir une demande par ID
    getDemande(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(demande_1.Demande);
            return yield repo.findOneBy({ id });
        });
    }
    // Mettre à jour une demande
    updateDemande(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(demande_1.Demande);
            // Trouver la demande existante
            let demandeFound = yield repo.findOne({ where: { id } });
            if (!demandeFound)
                return null;
            // Valider et mettre à jour les champs
            if (params.nom)
                demandeFound.nom = params.nom;
            if (params.prenom)
                demandeFound.prenom = params.prenom;
            if (params.email)
                demandeFound.email = params.email;
            if (params.phone)
                demandeFound.phone = params.phone;
            if (params.titre)
                demandeFound.titre = params.titre;
            if (params.description)
                demandeFound.description = params.description;
            if (params.budget !== undefined)
                demandeFound.budget = params.budget;
            if (params.deadline) {
                demandeFound.deadline = params.deadline instanceof Date ? params.deadline.toISOString() : params.deadline;
            }
            if (params.statut)
                demandeFound.statut = params.statut;
            const updatedDemande = yield repo.save(demandeFound);
            return updatedDemande;
        });
    }
    // Supprimer une demande
    deleteDemande(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(demande_1.Demande);
            const demandeFound = yield repo.findOneBy({ id });
            if (!demandeFound)
                return "Demande not found";
            yield repo.remove(demandeFound);
            return demandeFound;
        });
    }
}
exports.DemandeUsecase = DemandeUsecase;
