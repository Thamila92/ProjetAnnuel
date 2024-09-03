import { DataSource, IsNull } from "typeorm";
import { User } from "../database/entities/user";
import { Status } from "../database/entities/status";
import { compare, hash } from "bcrypt";
import { Skill } from "../database/entities/skill";
import { Mission } from "../database/entities/mission";
import { sign } from "jsonwebtoken";
import { Demande } from "../database/entities/demande";
import { EvenementAttendee } from "../database/entities/evenementAttendee";
import { Donation } from "../database/entities/donation";
import { Cotisation } from "../database/entities/cotisation";
import { DeepPartial } from "typeorm";
export interface CreateAdherentRequest {
    name: string;
    email: string;
    password: string;
    skills?: string[];
    adresse?: string;
    dateDeNaissance?: Date;
}

export interface CreateAdminRequest {
    name: string;
    email: string;
    password: string;
    key: string;
}

export interface UpdateUserParams {
    email?: string;
    name?: string;
    adresse?: string;
    dateDeNaissance?: Date;
    password?: string;
    statusId?: number;  // Ajout de la propriété statusId
}


export interface ListUserFilter {
    limit: number;
    page: number;
    type: string;
    skills?: string[];
}


export class UserUsecase {
    constructor(private readonly db: DataSource) { }

 

    async loginUser(email: string, password: string): Promise<{ user: User; token: string; expirationDate?: Date } | string> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { email, isDeleted: false }, relations: ['status', 'cotisations'] });
    
        if (!user) {
            return "User not found";
        }
    
        // Vérifier si l'utilisateur est banni
        if (user.isBanned) {
            return "Votre compte est désactivé. Veuillez contacter le support pour plus d'informations.";
        }
    
        const isValid = await compare(password, user.password);
        if (!isValid) {
            return "Invalid email or password";
        }
    
        const secret = process.env.JWT_SECRET ?? "NoNotThis";
        const token = sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });
    
        // Obtenir la dernière cotisation de l'utilisateur (s'il y en a une)
        const latestCotisation = user.cotisations.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
        return {
            user,
            token,
            expirationDate: latestCotisation ? latestCotisation.expirationDate : undefined,
        };
    }
    
    

    // Créer un Administrateur
    async createAdmin(createAdminRequest: CreateAdminRequest): Promise<User | string> {
        try {
            const userRepository = this.db.getRepository(User);
            const status = await this.db.getRepository(Status)
                .createQueryBuilder("status")
                .where("status.type = :status", { status: "ADMIN" })
                .getOne();

            if (!status) {
                return "Status ADMIN not found";
            }

            const hashedPassword = await hash(createAdminRequest.password, 10);

            const newUser = userRepository.create({
                name: createAdminRequest.name,
                email: createAdminRequest.email,
                password: hashedPassword,
                status: status
            });

            const savedUser = await userRepository.save(newUser);
            return savedUser;
        } catch (error) {
            console.error(error);
            return "Internal error, please try again later";
        }
    }
        // Créer un Adhérent

      
  
        async createSalarier(createSalarierRequest: CreateAdherentRequest): Promise<User | string> {
            try {
                const userRepository = this.db.getRepository(User);
        
                // Rechercher le statut SALARIER
                const status = await this.db.getRepository(Status)
                    .createQueryBuilder("status")
                    .where("status.type = :status", { status: "SALARIER" })
                    .getOne();
        
                if (!status) {
                    return "Status SALARIER not found";
                }
        
                // Hash du mot de passe
                const hashedPassword = await hash(createSalarierRequest.password, 10);
        
                // Créer un nouvel utilisateur avec les informations fournies
                const newUser: DeepPartial<User> = {
                    name: createSalarierRequest.name,
                    email: createSalarierRequest.email,
                    password: hashedPassword,
                    status: status,
                    adresse: createSalarierRequest.adresse || undefined,
                    dateDeNaissance: createSalarierRequest.dateDeNaissance || undefined
                };
        
                // Utilisation de userRepository.create() pour créer l'utilisateur
                const createdUser = userRepository.create(newUser);
        
                // Sauvegarder l'utilisateur créé dans la base de données
                const savedUser = await userRepository.save(createdUser);
                
                return savedUser;
            } catch (error) {
                console.error(error);
                return "Internal error, please try again later";
            }
        }
        async createAdherent(createAdherentRequest: CreateAdherentRequest): Promise<User | string> {
            try {
                const userRepository = this.db.getRepository(User);
        
                // Rechercher le statut MEMBER
                const status = await this.db.getRepository(Status)
                    .createQueryBuilder("status")
                    .where("status.type = :status", { status: "MEMBER" })
                    .getOne();
        
                if (!status) {
                    return "Status MEMBER not found";
                }
        
                // Hash du mot de passe
                const hashedPassword = await hash(createAdherentRequest.password, 10);
        
                // Créer un nouvel utilisateur avec adresse et dateDeNaissance, en convertissant null en undefined
                const newUser: DeepPartial<User> = {
                    name: createAdherentRequest.name,
                    email: createAdherentRequest.email,
                    password: hashedPassword,
                    status: status,
                    adresse: createAdherentRequest.adresse || undefined, // Conversion de null en undefined
                    dateDeNaissance: createAdherentRequest.dateDeNaissance || undefined // Conversion de null en undefined
                };
        
                // Utilisation de userRepository.create() pour créer l'utilisateur
                const createdUser = userRepository.create(newUser);
        
                // Sauvegarder l'utilisateur créé dans la base de données
                const savedUser = await userRepository.save(createdUser);
        
                // Vérifier les cotisations avec le même email
                const cotisationRepo = this.db.getRepository(Cotisation);
                const cotisations = await cotisationRepo.find({ where: { email: createAdherentRequest.email } });
                if (cotisations.length > 0) {
                    for (const cotisation of cotisations) {
                        cotisation.user = savedUser; // Associer la cotisation à l'utilisateur nouvellement créé
                        await cotisationRepo.save(cotisation);
                    }
                }
        
                // Vérifier les donations avec le même email
                const donationRepo = this.db.getRepository(Donation);
                const donations = await donationRepo.find({ where: { email: createAdherentRequest.email } });
                if (donations.length > 0) {
                    for (const donation of donations) {
                        donation.user = savedUser; // Associer la donation à l'utilisateur nouvellement créé
                        await donationRepo.save(donation);
                    }
                }

                 // Vérifier les demandes avec le même email
                const demandeRepo = this.db.getRepository(Demande);
                const demandes = await demandeRepo.find({ where: { email: createAdherentRequest.email } });
                if (demandes.length > 0) {
                    for (const demande of demandes) {
                        demande.user = savedUser; // Associer la demande à l'utilisateur nouvellement créé
                        await demandeRepo.save(demande);
                    }
                }
                const eventAttendeeRepo = this.db.getRepository(EvenementAttendee);
                const eventAttendees = await eventAttendeeRepo.find({ where: { email: createAdherentRequest.email } });
                if (eventAttendees.length > 0) {
                    for (const attendee of eventAttendees) {
                        attendee.user = savedUser; // Associer l'attendee à l'utilisateur nouvellement créé
                        await eventAttendeeRepo.save(attendee);
                    }
                }
        
                return savedUser;
            } catch (error) {
                console.error(error);
                return "Internal error, please try again later";
            }
        }
        
    // Fonction pour associer les enregistrements existants à l'utilisateur nouvellement créé
    async associateExistingRecords(email: string, user: User): Promise<void> {
        const donationRepo = this.db.getRepository(Donation);
        const demandeRepo = this.db.getRepository(Demande);
        const evenementAttendeeRepo = this.db.getRepository(EvenementAttendee);

        // Associer les donations existantes à cet utilisateur
        const donations = await donationRepo.find({ where: { email, user: undefined } });
        for (const donation of donations) {
            donation.user = user;
            await donationRepo.save(donation);
        }

        // Associer les demandes existantes à cet utilisateur
        const demandes = await demandeRepo.find({ where: { email, user: undefined } });
        for (const demande of demandes) {
            demande.user = user;
            await demandeRepo.save(demande);
        }

        // Associer les EvenementAttendees existants à cet utilisateur
        const evenementAttendees = await evenementAttendeeRepo.find({ where: { email, user: undefined } });
        for (const attendee of evenementAttendees) {
            attendee.user = user;
            await evenementAttendeeRepo.save(attendee);
        }
    }

    async updateUser(id: number, userToUpdate: UpdateUserParams): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({ where: { id, isDeleted: false }, relations: ['status'] });
    
        if (!userFound) {
            return "User not found!";
        }
    
        // Mise à jour des champs sans avoir besoin du mot de passe actuel
        if (userToUpdate.email) {
            userFound.email = userToUpdate.email;
        }
    
        if (userToUpdate.name) {
            userFound.name = userToUpdate.name;
        }
    
        if (userToUpdate.adresse !== undefined) {
            userFound.adresse = userToUpdate.adresse;
        }
    
        if (userToUpdate.dateDeNaissance !== undefined) {
            userFound.dateDeNaissance = userToUpdate.dateDeNaissance;
        }
    
        if (userToUpdate.password) {
            userFound.password = await hash(userToUpdate.password, 10); // Hashing du mot de passe s'il est fourni
        }
    
        if (userToUpdate.statusId) {
            const statusRepo = this.db.getRepository(Status);
            const newStatus = await statusRepo.findOne({ where: { id: userToUpdate.statusId } });
    
            if (newStatus) {
                userFound.status = newStatus;
            }
        }
    
        const updatedUser = await userRepo.save(userFound);
        return updatedUser;
    }
    

    // Bannir un utilisateur (définir isDeleted à true)
    async banUser(id: number): Promise<{ success: boolean; message: string }> {
        const userRepo = this.db.getRepository(User);
    
        // Trouver l'utilisateur
        const userFound = await userRepo.findOne({ where: { id, isDeleted: false } });
    
        if (!userFound) {
            return { success: false, message: "User not found or already banned." };
        }
    
        if (userFound.isBanned) {
            // Débannir l'utilisateur
            userFound.isBanned = false;
            await userRepo.save(userFound);
            return { success: true, message: `User ${userFound.name} has been unbanned successfully.` };
        } else {
            // Bannir l'utilisateur
            userFound.isBanned = true;
            await userRepo.save(userFound);
            return { success: true, message: `User ${userFound.name} has been banned successfully.` };
        }
    }
    
    

    // Lister les utilisateurs avec des filtres
    async listUser(filter: ListUserFilter): Promise<{ users: User[]; totalCount: number; } | string> {
        const query = this.db.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.status', 'status')
            .leftJoinAndSelect('user.skills', 'skill')
            .where('user.isDeleted = :isDeleted', { isDeleted: false });
    
        const page = Number(filter.page) || 1;  // Valeur par défaut si page n'est pas définie
        const limit = Number(filter.limit) || 10;  // Valeur par défaut si limit n'est pas définie
    
        // Vérification du type des paramètres de pagination
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            return "Invalid page or limit parameters.";
        }
    
        if (filter.type) {
            const status = await this.db.getRepository(Status)
                .createQueryBuilder('status')
                .where('status.type = :type', { type: filter.type })
                .getOne();
    
            if (status) {
                query.andWhere('user.status.id = :statusId', { statusId: status.id });
            } else {
                return `Nothing Found for type: ${filter.type}`;
            }
        }
    
        if (filter.skills && filter.skills.length > 0) {
            query.andWhere('skill.name IN (:...skills)', { skills: filter.skills });
        }
    
        query.skip((page - 1) * limit).take(limit);
    
        const [users, totalCount] = await query.getManyAndCount();
        return { users, totalCount };
    }
    
    async getUserDemandes(userId: number): Promise<Demande[] | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
            where: { id: userId, isDeleted: false },
            relations: ['demandes']
        });
    
        if (!userFound) {
            return "User not found";
        }
    
        return userFound.demandes;
    }
    async getUserEvenementAttendees(userId: number): Promise<EvenementAttendee[] | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
            where: { id: userId, isDeleted: false },
            relations: ['evenementAttendees', 'evenementAttendees.evenement'] // Ajoutez cette relation
        });
    
        if (!userFound) {
            return "User not found";
        }
    
        // Assurez-vous que les données de l'événement sont chargées
        const attendeesWithEvents = userFound.evenementAttendees.map(attendee => {
            const event = attendee.evenement; // Ici, vous pourriez également formater les données si nécessaire
            return { ...attendee, event };
        });
    
        return attendeesWithEvents; // Retournez les participants avec les détails de l'événement
    }
    async getUserByEmail(email: string): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
            where: { email, isDeleted: false },
            relations: ['status', 'skills'] // Ajoutez d'autres relations si nécessaire
        });
    
        if (!userFound) {
            return "User not found";
        }
    
        return userFound;
    }
    
    
    
    // Récupérer un utilisateur par ID
    async getUserById(id: number): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({ where: { id, isDeleted: false }, relations: ['status', 'skills'] });

        if (!userFound) {
            return "User not found";
        }

        return userFound;
    }
    async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<string> {
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: userId, isDeleted: false }
        });
    
        if (!user) {
            return "User not found";
        }
    
        // Comparaison de l'ancien mot de passe avec le hash stocké
        const isValid = await compare(oldPassword, user.password);
        if (!isValid) {
            return "Invalid old password";
        }
    
        // Hashage du nouveau mot de passe
        const hashedPassword = await hash(newPassword, 10);
        user.password = hashedPassword;
    
        // Sauvegarde du nouvel utilisateur avec le mot de passe mis à jour
        await userRepo.save(user);
    
        return "Password updated successfully";
    }
    
    // Ajouter une compétence à un utilisateur
    async addSkillToUser(userId: number, skillName: string): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const skillRepo = this.db.getRepository(Skill);

        const userFound = await userRepo.findOne({ where: { id: userId, isDeleted: false }, relations: ['skills'] });
        if (!userFound) {
            return "User not found";
        }

        let skillFound = await skillRepo.findOne({ where: { name: skillName } });
        if (!skillFound) {
            skillFound = skillRepo.create({ name: skillName });
            await skillRepo.save(skillFound);
        }

        userFound.skills.push(skillFound);
        await userRepo.save(userFound);
        return userFound;
    }

    // Récupérer les utilisateurs par rôle
    async getUsersByRole(role: string): Promise<User[]> {
        const userRepo = this.db.getRepository(User);
        const status = await this.db.getRepository(Status)
            .createQueryBuilder('status')
            .where('status.type = :role', { role })
            .getOne();

        if (!status) {
            throw new Error(`Role ${role} not found`);
        }

        const users = await userRepo.find({
            where: { status: status, isDeleted: false },
            relations: ['status', 'skills'],
        });

        return users;
    }

    // Récupérer les utilisateurs disponibles par statut
    async getAvailableUsersByStatus(statusDescription: string): Promise<User[]> {
        const status = await this.db.getRepository(Status)
            .createQueryBuilder('status')
            .where('status.type = :type', { type: statusDescription })
            .getOne();

        if (!status) {
            throw new Error(`Status with description ${statusDescription} not found`);
        }

        const users = await this.db.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.status', 'status')
            .where('user.status.id = :statusId', { statusId: status.id })
            .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('user.isAvailable = :isAvailable', { isAvailable: true })
            .getMany();

        return users;
    }
    async getUsersByStatus(statusDescription: string): Promise<User[]> {
        const status = await this.db.getRepository(Status)
            .createQueryBuilder('status')
            .where('status.type = :type', { type: statusDescription })
            .getOne();

        if (!status) {
            throw new Error(`Status with description ${statusDescription} not found`);
        }

        const users = await this.db.getRepository(User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.status', 'status')
            .where('user.status.id = :statusId', { statusId: status.id })
            .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('user.isBanned = :isBanned', { isBanned: false })
            .getMany();

        return users;
    }
    // Récupérer tous les utilisateurs disponibles
    async getAllUsersAvailable(): Promise<User[]> {
        const userRepo = this.db.getRepository(User);

        const missions = await this.db.getRepository(Mission).find({ relations: ['assignedUsers'] });
        const currentDate = new Date();

        for (const mission of missions) {
            for (const user of mission.assignedUsers) {
                if (currentDate > mission.ending && user.isAvailable === false) {
                    user.isAvailable = true;
                    await userRepo.save(user);
                }
            }
        }

        return await userRepo.find({ where: { isDeleted: false } });
    }

 
    // Récupérer tous les utilisateurs
    async getAllUsers(): Promise<User[]> {
        return await this.db.getRepository(User).find({ where: { isBanned: false } });
    }
    async getCurrentUser(userId: number): Promise<User | string> {
      const userRepo = this.db.getRepository(User);
      const user = await userRepo.findOne({
          where: { id: userId, isDeleted: false },
          select: ['id', 'name', 'email', 'status'],
          relations: ['status']
      });

      if (!user) {
          return "User not found";
      }

      return user;
  }


  async deleteUser(userId: number): Promise<string> {
    const userRepository = this.db.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
        return "Utilisateur non trouvé";
    }

    await userRepository.remove(user);
    return "Utilisateur supprimé avec succès";
}
}

