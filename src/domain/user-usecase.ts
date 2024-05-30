import { DataSource } from "typeorm";
import { User } from "../database/entities/user";
import { Status } from "../database/entities/status";
import { AppDataSource } from "../database/database";
import { compare, hash } from "bcrypt";

export interface ListUserFilter {
    limit: number
    page: number
    type:string
}

export interface UpdateMovieParams {
    name?: string
    duration?: number
}

export interface UserToUpdate {
    email?: string
    iban?: string
    password?:string
    actual_password:string
}



export class UserUsecase {
    constructor(private readonly db: DataSource) { }

    async updateUser(id: number, userToUpdate: UserToUpdate): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
          where: { id },
          relations: ['status']
        });
        
      
        if (!userFound) {
          return "User not Found !!!";
        }
        if(userFound.status && userFound.status.description!="NORMAL"){
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
      
        if (userToUpdate.iban) {
          userFound.iban = userToUpdate.iban;
        }
      
        if (userToUpdate.password) {
          userFound.password = await hash(userToUpdate.password, 10);
        }
      
        const uUpdated = await userRepo.save(userFound);
        return uUpdated;
    }

    async updateAdmin(id: number, userToUpdate: UserToUpdate): Promise<User | string> {
        const userRepo = this.db.getRepository(User);
        const userFound = await userRepo.findOne({
          where: { id },
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
      
        if (userToUpdate.iban) {
          userFound.iban = userToUpdate.iban;
        }
      
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
            .leftJoinAndSelect('user.status', 'status');
    
        if (listUserFilter.type) {
            const status = await AppDataSource.getRepository(Status)
                .createQueryBuilder('status')
                .where('status.description = :description', { description: listUserFilter.type })
                .getOne();
    
            if (status) {
                query.where('user.status.id = :statusId', { statusId: status.id });
            } else {
                const adminStatus = await AppDataSource.getRepository(Status)
                    .createQueryBuilder('status')
                    .where('status.description = :description', { description: 'ADMIN' })
                    .getOne();
                return `Nothing Found !!! from type: ${listUserFilter.type} ${adminStatus?.description}`;
            }
        }
    
        query.skip((listUserFilter.page - 1) * listUserFilter.limit)
            .take(listUserFilter.limit);
    
        const [users, totalCount] = await query.getManyAndCount();
        return {
            users,
            totalCount
        };
    }
    
}
