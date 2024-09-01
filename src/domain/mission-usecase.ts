import { DataSource, In } from "typeorm";
import { Mission } from "../database/entities/mission";
import { Skill } from "../database/entities/skill";
import { User } from "../database/entities/user";
import { Resource } from "../database/entities/ressource";

export interface ListMissionFilter {
    limit: number;
    page: number;
}

export interface UpdateMissionParams {
    description?: string;
    starting?: Date;
    ending?: Date;
    skills?: string[];
    userEmails?: string[];
    resources?: number[];
}

export class MissionUsecase {
    constructor(private readonly db: DataSource) { }

    // CREATE a new mission
    async createMission(
        starting: Date,
        ending: Date,
        description: string,
        skills?: string[],
        userEmails?: string[],
        resourceIds?: number[]
    ): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const skillRepo = this.db.getRepository(Skill);
        const userRepo = this.db.getRepository(User);
        const resourceRepo = this.db.getRepository(Resource);

        let requiredSkills: Skill[] = [];
        if (skills) {
            requiredSkills = await Promise.all(skills.map(async (skillName) => {
                let skill = await skillRepo.findOne({ where: { name: skillName } });
                if (!skill) {
                    skill = skillRepo.create({ name: skillName });
                    await skillRepo.save(skill);
                }
                return skill;
            }));
        }

        let assignedUsers: User[] = [];
        if (userEmails) {
            for (const email of userEmails) {
                const user = await userRepo.findOne({ where: { email } });
                if (user) {
                    user.isAvailable = false;
                    await userRepo.save(user);
                    assignedUsers.push(user);
                }
            }
        }

        let assignedResources: Resource[] = [];
        if (resourceIds && resourceIds.length > 0) {
            const resources = await Promise.all(resourceIds.map(async (resourceId) => {
                const resource = await resourceRepo.findOne({ where: { id: resourceId } });
                if (resource) {
                    resource.isAvailable = false;
                    await resourceRepo.save(resource);
                    return resource;
                }
                return null; // Retourne null si la ressource n'est pas trouvée
            }));
        
             assignedResources = resources.filter((resource): resource is Resource => resource !== null);
            console.log("Assigned Resources after filter:", assignedResources);
        }
        
        console.log("Final Resources to be saved in mission:", assignedResources);
        
        
        

        const newMission = missionRepo.create({
            starting,
            ending,
            description,
            state: 'UNSTARTED',
            requiredSkills,
            assignedUsers,
            resources: assignedResources
        });
        await missionRepo.save(newMission);
        return newMission;
    }

  // READ/List missions
async listMissions(filter: ListMissionFilter): Promise<{ missions: Mission[]; totalCount: number; }> {
    const query = this.db.getRepository(Mission)
        .createQueryBuilder('mission')
        .leftJoinAndSelect('mission.requiredSkills', 'skill')
        .leftJoinAndSelect('mission.assignedUsers', 'user')
        .leftJoinAndSelect('mission.resources', 'resource')  
        .skip((filter.page - 1) * filter.limit)
        .take(filter.limit);

    const [missions, totalCount] = await query.getManyAndCount();

    const currentDate = new Date();

    for (const mission of missions) {
        if (currentDate > mission.ending) {
            mission.state = 'ENDED';

            // Libérer les utilisateurs et les ressources si la mission est terminée
            if (mission.assignedUsers) {
                for (const user of mission.assignedUsers) {
                    user.isAvailable = true;
                    await this.db.getRepository(User).save(user);
                }
            }

            if (mission.resources) {
                for (const resource of mission.resources) {
                    resource.isAvailable = true;
                    await this.db.getRepository(Resource).save(resource);
                }
            }
        } else if (currentDate > mission.starting && currentDate < mission.ending) {
            mission.state = 'RUNNING';
        } else if (currentDate.toDateString() === mission.starting.toDateString()) {
            mission.state = 'STARTED';
        } else {
            mission.state = 'UNSTARTED';
        }

        await this.db.getRepository(Mission).save(mission);  
    }

    return {
        missions,
        totalCount
    };
}

// READ/Find one mission by id
async getMission(id: number): Promise<Mission | null> {
    const repo = this.db.getRepository(Mission);
    const missionFound = await repo.findOne({ where: { id }, relations: ['requiredSkills', 'assignedUsers', 'resources'] });
    if (!missionFound) return null;

    const currentDate = new Date();

    if (currentDate > missionFound.ending) {
        missionFound.state = 'ENDED';

        // Libérer les utilisateurs et les ressources si la mission est terminée
        if (Array.isArray(missionFound.assignedUsers)) {
            for (const user of missionFound.assignedUsers) {
                user.isAvailable = true;
                await this.db.getRepository(User).save(user);
            }
        }
        
        if (Array.isArray(missionFound.resources)) {
            for (const resource of missionFound.resources) {
                resource.isAvailable = true;
                await this.db.getRepository(Resource).save(resource);
            }
        }
        
    } else if (currentDate > missionFound.starting && currentDate < missionFound.ending) {
        missionFound.state = 'RUNNING';
    } else if (currentDate.toDateString() === missionFound.starting.toDateString()) {
        missionFound.state = 'STARTED';
    } else {
        missionFound.state = 'UNSTARTED';
    }

    await repo.save(missionFound); // Save the updated state and availability to the database

    return missionFound;
}

    // UPDATE a mission
    async updateMission(id: number, params: UpdateMissionParams): Promise<Mission | null | string> {
        const repo = this.db.getRepository(Mission);
        const skillRepo = this.db.getRepository(Skill);
        const userRepo = this.db.getRepository(User);
        const resourceRepo = this.db.getRepository(Resource);

        const missionFound = await repo.findOne({
            where: { id },
            relations: ['requiredSkills', 'assignedUsers', 'resources']
        });
        if (!missionFound) return "Mission not found";

        // Libérer les anciennes ressources et utilisateurs
        const oldResources = missionFound.resources;
        if (oldResources) {
            for (const resource of oldResources) {
                resource.isAvailable = true;
                await resourceRepo.save(resource);
            }
        }

        const oldUsers = missionFound.assignedUsers;
        if (oldUsers) {
            for (const user of oldUsers) {
                user.isAvailable = true;
                await userRepo.save(user);
            }
        }

        // Mettre à jour la mission
        if (params.starting) missionFound.starting = params.starting;
        if (params.ending) missionFound.ending = params.ending;
        if (params.description) missionFound.description = params.description;

        // Réinitialiser les compétences si un tableau vide est fourni
        if (Array.isArray(params.skills)) {
            missionFound.requiredSkills = [];
        }

        if (params.skills && params.skills.length > 0) {
            missionFound.requiredSkills = await skillRepo.find({ where: { name: In(params.skills) } });
        }

        if (Array.isArray(params.userEmails)) {
            missionFound.assignedUsers = [];
        }

        // Mettre à jour les utilisateurs (users) si des valeurs sont fournies
        if (params.userEmails && params.userEmails.length > 0) {
            const assignedUsers: User[] = [];
            for (const email of params.userEmails) {
                const user = await userRepo.findOne({ where: { email } });
                if (user) {
                    user.isAvailable = false;
                    await userRepo.save(user);
                    assignedUsers.push(user);
                }
            }
            missionFound.assignedUsers = assignedUsers;
        }

        // Réinitialiser les ressources si un tableau vide est fourni
        if (Array.isArray(params.resources)) {
            missionFound.resources = [];
        }

        // Assigner les nouvelles ressources
        if (params.resources && params.resources.length > 0) {
            const assignedResources: Resource[] = [];
            for (const resourceId of params.resources) {
                const resource = await resourceRepo.findOne({ where: { id: resourceId } });
                if (resource) {
                    resource.isAvailable = false;
                    await resourceRepo.save(resource);
                    assignedResources.push(resource);
                }
            }
            missionFound.resources = assignedResources;
        }

        // Mettre à jour l'état en fonction des nouvelles dates
        const currentDate = new Date();
        if (currentDate > missionFound.ending) {
            missionFound.state = 'ENDED';
        } else if (currentDate > missionFound.starting && currentDate < missionFound.ending) {
            missionFound.state = 'RUNNING';
        } else if (currentDate.toDateString() === missionFound.starting.toDateString()) {
            missionFound.state = 'STARTED';
        } else {
            missionFound.state = 'UNSTARTED';
        }

        const updatedMission = await repo.save(missionFound);
        return updatedMission;
    }
    async listMissionsByUser(userId: number): Promise<Mission[]> {
        const missionRepo = this.db.getRepository(Mission);
        
        // Requête pour récupérer les missions où l'utilisateur est assigné
        const missions = await missionRepo
          .createQueryBuilder('mission')
          .leftJoinAndSelect('mission.assignedUsers', 'user')
          .leftJoinAndSelect('mission.requiredSkills', 'skill')
          .leftJoinAndSelect('mission.resources', 'resource')
          .where('user.id = :userId', { userId })
          .getMany();
        
        return missions;
      }
    // DELETE a mission
    async deleteMission(id: number): Promise<Mission | string> {
        const repo = this.db.getRepository(Mission);
        const userRepo = this.db.getRepository(User);
        const resourceRepo = this.db.getRepository(Resource);
    
        const missionFound = await repo.findOne({
            where: { id },
            relations: ['assignedUsers', 'resources']
        });
    
        if (!missionFound) return "Mission not found";
    
        const currentDate = new Date();
        if (currentDate < missionFound.ending) {
            // La mission est en cours ou à venir, libérer les utilisateurs et les ressources
            if (Array.isArray(missionFound.assignedUsers)) {
                for (const user of missionFound.assignedUsers) {
                    user.isAvailable = true;
                    await this.db.getRepository(User).save(user);
                }
            }
            
            if (Array.isArray(missionFound.resources)) {
                for (const resource of missionFound.resources) {
                    resource.isAvailable = true;
                    await this.db.getRepository(Resource).save(resource);
                }
            }
            
        }
    
        // Supprimer définitivement la mission
        await repo.remove(missionFound);
        return missionFound;
    }
    
}
