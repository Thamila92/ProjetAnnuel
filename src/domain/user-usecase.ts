import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { Status } from "../database/entities/status";
import { AppDataSource } from "../database/database";
import { compare, hash } from "bcrypt";
// import { Skill } from "../database/entities/skill";
import { createOtherValidation } from "../handlers/validators/user-validator";
import { generateValidationErrorMessage } from "../handlers/validators/generate-validation-message";
import { Skill } from "../database/entities/skill";
import { Mission } from "../database/entities/mission";

export interface ListUserFilter {
    limit: number
    page: number
    type:string
    skills?: string[];
}

export interface UpdateMovieParams {
    name?: string
    duration?: number
}

export interface UserToUpdate {
    email?: string
    // iban?: string'
    name?:string
    password?:string
    actual_password:string
}



export class UserUsecase {
    constructor(private readonly db: DataSource) { }

    async updateUser(id: number, userToUpdate: UserToUpdate): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
          where: { id, isDeleted: false },
          relations: ['status']
        });
        
      
        if (!userFound) {
          return "User not Found !!!";
        }
        // if(userFound.status && userFound.status.description!="NORMAL"){
        //   return "This is not a commonn user !!!"
        // }
      
        // Vérifier si le mot de passe actuel est correct
        const isValid =await compare(userToUpdate.actual_password,userFound.password)
        if (!isValid) {
          return "Actual password incorrect !!!";
        }
      
        // Si le mot de passe actuel est correct, effectuer les modifications
        if (userToUpdate.email) {
          userFound.email = userToUpdate.email;
        }
      
        if (userToUpdate.name) {
          userFound.name = userToUpdate.name;
        }
        // if (userToUpdate.iban) {
        //   userFound.iban = userToUpdate.iban;
        // }
      
        if (userToUpdate.password) {
          userFound.password = await hash(userToUpdate.password, 10);
        }
      
        const uUpdated = await userRepo.save(userFound);
        return uUpdated;
    }

    async updateAdmin(id: number, userToUpdate: UserToUpdate): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
          where: { id, isDeleted: false },
          relations: ['status']
        });
        
      
        if (!userFound) {
          return "User not Found !!!";
        }
        if(userFound.status && userFound.status.description!="ADMIN"){
          return "This is not an admin !!!"
        }
      
        // Vérifier si le mot de passe actuel est correct
        const isValid =await compare(userToUpdate.actual_password,userFound.password)
        if (!isValid) {
          return "Actual password incorrect !!!";
        }
      
        // Si le mot de passe actuel est correct, effectuer les modifications
        if (userToUpdate.email) {
          userFound.email = userToUpdate.email;
        }
      
        //if (userToUpdate.iban) {
          //userFound.iban = userToUpdate.iban;
        //}
      
        if (userToUpdate.password) {
          userFound.password = await hash(userToUpdate.password, 10);
        }
      
        const uUpdated = await userRepo.save(userFound);
        return uUpdated;
    }
    async updateBenefactor(id: number, userToUpdate: UserToUpdate): Promise<User | string> {
      const userRepo = this.db.getRepository(User);
      const userFound = await userRepo.findOne({
        where: { id, isDeleted: false },
        relations: ['status']
      });
      
    
      if (!userFound) {
        return "User not Found !!!";
      }
      if(userFound.status && userFound.status.description!="BENEFACTOR"){
        return "This is not a benefactor !!!"
      }
    
      // Vérifier si le mot de passe actuel est correct
      const isValid =await compare(userToUpdate.actual_password,userFound.password)
      if (!isValid) {
        return "Actual password incorrect !!!";
      }
    
      // Si le mot de passe actuel est correct, effectuer les modifications
      if (userToUpdate.email) {
        userFound.email = userToUpdate.email;
      }
    
      if (userToUpdate.name) {
        userFound.name = userToUpdate.name;
      }
      // if (userToUpdate.iban) {
      //   userFound.iban = userToUpdate.iban;
      // }
    
      if (userToUpdate.password) {
        userFound.password = await hash(userToUpdate.password, 10);
      }
    
      const uUpdated = await userRepo.save(userFound);
      return uUpdated;
  }

  async listUser(filter: ListUserFilter): Promise<{ users: User[]; totalCount: number; } | string> {
    console.log(filter);
    const query = this.db.getRepository(User)
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.status', 'status')
        .leftJoinAndSelect('user.skills', 'skill')
        .where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (filter.type) {
        const status = await this.db.getRepository(Status)
            .createQueryBuilder('status')
            .where('status.description = :description', { description: filter.type })
            .getOne();

        if (status) {
            query.andWhere('user.status.id = :statusId', { statusId: status.id });
        } else {
            return `Nothing Found !!! from type: ${filter.type}`;
        }
    }

    if (filter.skills && filter.skills.length > 0) {
        query.andWhere('skill.name IN (:...skills)', { skills: filter.skills });
    }

    query.skip((filter.page - 1) * filter.limit)
        .take(filter.limit);

    const [users, totalCount] = await query.getManyAndCount();
    return {
        users,
        totalCount
    };
}

async getUsersByRole(role: string): Promise<string[]> {
  const userRepo = this.db.getRepository(User);

   const users = await userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .where('status.description = :role', { role })
      .andWhere('user.isDeleted = false')
      .select(['user.id', 'user.email'])
      .getMany();

   const currentDate = new Date();
  const missions = await this.db.getRepository(Mission).find({ relations: ['assignedUsers'] });

   for (const mission of missions) {
      if (currentDate > mission.starting && currentDate < mission.ending) {
          for (const user of mission.assignedUsers) {
              const foundUser = users.find(u => u.id === user.id);
              if (foundUser) {
                  foundUser.isAvailable = false;
              }
          }
      }
  }

   const availableUsers = users.filter(user => user.isAvailable !== false);

  return availableUsers.map(user => user.email);
}



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
async getUsersByStatus(statusDescription: string): Promise<User[]> {
  const status = await this.db.getRepository(Status)
      .createQueryBuilder('status')
      .where('status.description = :description', { description: statusDescription })
      .getOne();

  if (!status) {
      throw new Error(`Status with description ${statusDescription} not found`);
  }

  const users = await this.db.getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.status', 'status')
      .where('user.status.id = :statusId', { statusId: status.id })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .getMany();

  return users;
}
async getAllUsers(): Promise<User[]> {
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

  return await userRepo.find();
}

    
}