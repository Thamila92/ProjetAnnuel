import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { Status } from "../database/entities/status";
import { AppDataSource } from "../database/database";
import { compare, hash } from "bcrypt";
// import { Skill } from "../database/entities/skill";
import { createOtherValidation } from "../handlers/validators/user-validator";
import { generateValidationErrorMessage } from "../handlers/validators/generate-validation-message";
import { Skill } from "../database/entities/skill";

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
        if(userFound.status && userFound.status.description!="NORMAL"){
          return "This is not a commonn user !!!"
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

    async listUser(listUserFilter: ListUserFilter): Promise<{ users: User[]; totalCount: number; } | string> {
        console.log(listUserFilter);
        const query = AppDataSource.getRepository(User)
        .createQueryBuilder('user')
      
        .leftJoinAndSelect('user.status', 'status')
        .leftJoinAndSelect('user.skills', 'skill')
        .where('user.isDeleted = :isDeleted', { isDeleted: false });

        if (listUserFilter.type) {
            const status = await AppDataSource.getRepository(Status)
                .createQueryBuilder('status')
                .where('status.description = :description', { description: listUserFilter.type })
                .getOne();
    
            if (status) {
                query.andWhere('user.status.id = :statusId', { statusId: status.id });
            } else {
                const adminStatus = await AppDataSource.getRepository(Status)
                    .createQueryBuilder('status')
                    .where('status.description = :description', { description: 'ADMIN' })
                    .getOne();
                return `Nothing Found !!! from type: ${listUserFilter.type} ${adminStatus?.description}`;
            }
        }
        if (listUserFilter.skills && listUserFilter.skills.length > 0) {
          query.andWhere('skill.name IN (:...skills)', { skills: listUserFilter.skills });
      }
    
        query.skip((listUserFilter.page - 1) * listUserFilter.limit)
            .take(listUserFilter.limit);
    
        const [users, totalCount] = await query.getManyAndCount();
        return {
            users,
            totalCount
        };
    }
    async getUsersByRole(role: string): Promise<string[]> {
      const users = await this.db.getRepository(User)
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.status', 'status')
          .where('status.description = NORMAL')
          .andWhere('user.isDeleted = false')
          .select('user.email')
          .getMany();

      return users.map(user => user.email);
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

    
}