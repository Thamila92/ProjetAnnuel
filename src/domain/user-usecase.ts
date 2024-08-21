import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { Status } from "../database/entities/status";
import { compare, hash } from "bcrypt";
import { Skill } from "../database/entities/skill";
import { Mission } from "../database/entities/mission";
import { sign } from "jsonwebtoken";
import { Demande } from "../database/entities/demande";
import { EvenementAttendee } from "../database/entities/evenementAttendee";

export interface CreateAdherentRequest {
    name: string;
    email: string;
    password: string;
    skills?: string[];
}

export interface CreateAdminRequest {
    name: string;
    email: string;
    password: string;
    key: string;
}

export interface UpdateUserParams {
    name?: string;
    email?: string;
    password?: string;
    actual_password: string;
}

export interface ListUserFilter {
    limit: number;
    page: number;
    type: string;
    skills?: string[];
}

export class UserUsecase {
    constructor(private readonly db: DataSource) { }

    // Créer un Adhérent
    async createAdherent(createAdherentRequest: CreateAdherentRequest): Promise<User | string> {
        try {
            const userRepository = this.db.getRepository(User);
            const status = await this.db.getRepository(Status)
                .createQueryBuilder("status")
                .where("status.type = :status", { status: "MEMBER" })
                .getOne();

            if (!status) {
                return "Status MEMBER not found";
            }

            const hashedPassword = await hash(createAdherentRequest.password, 10);

            let skills: Skill[] = [];
            if (createAdherentRequest.skills && createAdherentRequest.skills.length > 0) {
                const skillRepo = this.db.getRepository(Skill);
                skills = await Promise.all(createAdherentRequest.skills.map(async (skillName: string) => {
                    let skill = await skillRepo.findOne({ where: { name: skillName } });
                    if (!skill) {
                        skill = skillRepo.create({ name: skillName });
                        await skillRepo.save(skill);
                    }
                    return skill;
                }));
            }

            const newUser = userRepository.create({
                name: createAdherentRequest.name,
                email: createAdherentRequest.email,
                password: hashedPassword,
                status: status,
                skills: skills
            });

            const savedUser = await userRepository.save(newUser);
            return savedUser;
        } catch (error) {
            console.error(error);
            return "Internal error, please try again later";
        }
    }
    async loginUser(email: string, password: string): Promise<{ user: User; token: string } | string> {
      const userRepo = this.db.getRepository(User);
      const user = await userRepo.findOne({ where: { email, isDeleted: false }, relations: ['status'] });

      if (!user) {
          return "User not found";
      }

      const isValid = await compare(password, user.password);
      if (!isValid) {
          return "Invalid email or password";
      }

      const secret = process.env.JWT_SECRET ?? "NoNotThis";
      const token = sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });

      return { user, token };
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

    // Mettre à jour un utilisateur (Adhérent, Admin, Bienfaiteur)
    async updateUser(id: number, userToUpdate: UpdateUserParams): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({ where: { id, isDeleted: false }, relations: ['status'] });

        if (!userFound) {
            return "User not found!";
        }

        const isValid = await compare(userToUpdate.actual_password, userFound.password);
        if (!isValid) {
            return "Actual password incorrect!";
        }

        if (userToUpdate.email) {
            userFound.email = userToUpdate.email;
        }

        if (userToUpdate.name) {
            userFound.name = userToUpdate.name;
        }

        if (userToUpdate.password) {
            userFound.password = await hash(userToUpdate.password, 10);
        }

        const updatedUser = await userRepo.save(userFound);
        return updatedUser;
    }

    // Bannir un utilisateur (définir isDeleted à true)
    async banUser(id: number): Promise<string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({ where: { id, isDeleted: false } });

        if (!userFound) {
            return "User not found";
        }

        userFound.isDeleted = true;
        await userRepo.save(userFound);
        return `User ${userFound.name} has been banned successfully.`;
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
            relations: ['evenementAttendees']
        });
    
        if (!userFound) {
            return "User not found";
        }
    
        return userFound.evenementAttendees;
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
        return await this.db.getRepository(User).find({ where: { isDeleted: false } });
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
}
