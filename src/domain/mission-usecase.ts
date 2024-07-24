 
import { DataSource, LessThanOrEqual, MoreThanOrEqual, Not ,In} from "typeorm";
import { Mission } from "../database/entities/mission";
import { Evenement } from "../database/entities/evenement";
// import { Skill } from "../database/entities/skill";
import { User } from "../database/entities/user";
import { Step } from "../database/entities/step";
import { Skill } from "../database/entities/skill";

import { Resource } from "../database/entities/ressource";
import { ResourceAvailability } from "../database/entities/resourceAvailability";

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

    async listMissions(filter: ListMissionFilter): Promise<{ missions: Mission[]; totalCount: number; }> {
        const query = this.db.getRepository(Mission)
            .createQueryBuilder('mission')
            .leftJoinAndSelect('mission.requiredSkills', 'skill')
            .leftJoinAndSelect('mission.assignedUsers', 'user')
            .leftJoinAndSelect('mission.evenement', 'evenement')
            .leftJoinAndSelect('mission.step', 'step')
            .leftJoinAndSelect('mission.resources', 'resource')  
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);
    
        const [missions, totalCount] = await query.getManyAndCount();
    
        const currentDate = new Date();
    
        for (const mission of missions) {
            if (currentDate > mission.ending) {
                mission.state = 'ENDED';
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
    

    async   isResourceAvailable(resourceId: number, start: Date, end: Date): Promise<boolean> {
        const resourceAvailabilityRepository = this.db.getRepository(ResourceAvailability);
    
        const overlappingAvailabilities = await resourceAvailabilityRepository
            .createQueryBuilder("availability")
            .where("availability.resourceId = :resourceId", { resourceId })
            .andWhere("(availability.start < :end AND availability.end > :start)", { start, end })
            .getCount();
    
        return overlappingAvailabilities === 0;
    }
    
    
    async createMission(
        starting: Date,
        ending: Date,
        description: string,
        eventId: number | null,
        stepId: number | null,
        skills: string[] | null,
        userEmails: string[] | null,
        resourceIds: number[] | null
    ): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const eventRepo = this.db.getRepository(Evenement);
        const stepRepo = this.db.getRepository(Step);
        const skillRepo = this.db.getRepository(Skill);
        const userRepo = this.db.getRepository(User);
        const resourceRepo = this.db.getRepository(Resource);
    
        let eventFound = null;
        let stepFound = null;
    
        if (eventId) {
            eventFound = await eventRepo.findOne({ where: { id: eventId } });
            if (!eventFound) {
                return "Event not found";
            }
        }
    
        if (stepId) {
            stepFound = await stepRepo.findOne({ where: { id: stepId } });
            if (!stepFound) {
                return "Step not found";
            }
        }
    
        if (!eventFound && !stepFound) {
            return "Mission must be linked to either an event or a step";
        }
    
        if (eventFound && (starting < eventFound.starting || ending > eventFound.ending)) {
            return "Mission dates must be within the event's dates";
        }
    
        if (stepFound && (starting < stepFound.starting || ending > stepFound.ending)) {
            return "Mission dates must be within the step's dates";
        }
    
        const conflictingMissions = await missionRepo.createQueryBuilder('mission')
            .where((qb) => {
                if (eventId) {
                    qb.where('mission.evenement = :eventId', { eventId });
                } else {
                    qb.where('mission.step = :stepId', { stepId });
                }
            })
            .andWhere(':starting < mission.ending AND :ending > mission.starting', { starting, ending })
            .getMany();
    
        if (conflictingMissions.length > 0) {
            return "Conflicting mission exists within the same event or step";
        }
    
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
        if (resourceIds) {
            for (const resourceId of resourceIds) {
                const resource = await resourceRepo.findOne({ where: { id: resourceId } });
                if (resource) {
                    resource.isAvailable = false;
                    await resourceRepo.save(resource);
                    assignedResources.push(resource);
                }
            }
        }
    
        const newMission = missionRepo.create({
            starting,
            ending,
            description,
            state: 'UNSTARTED',
            evenement: eventFound || undefined,
            step: stepFound || undefined,
            requiredSkills,
            assignedUsers,
            resources: assignedResources
        });
        await missionRepo.save(newMission);
        return newMission;
    }
    
    
    
    
 
    async getMission(id: number): Promise<Mission | null> {
        const repo = this.db.getRepository(Mission);
        const missionFound = await repo.findOne({ where: { id } });
        if (!missionFound) return null;
    
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
    
        await repo.save(missionFound); // Optionally save the updated state to the database
    
        return missionFound;
    }
 
    async updateMission(id: number, params: UpdateMissionParams): Promise<Mission | null | string> {
        const repo = this.db.getRepository(Mission);
        const evenementRepo = this.db.getRepository(Evenement);
        const stepRepo = this.db.getRepository(Step);
        const skillRepo = this.db.getRepository(Skill);
        const userRepo = this.db.getRepository(User);
        const resourceRepo = this.db.getRepository(Resource);
    
        const missionFound = await repo.findOne({
            where: { id },
            relations: ['evenement', 'step', 'requiredSkills', 'assignedUsers', 'resources']
        });
        if (!missionFound) return "Mission not found";
    
        const evenement = missionFound.evenement;
        const step = missionFound.step;
    
        if (!evenement && !step) return "Mission must be associated with either an event or a step";
    
        const newStarting = params.starting || missionFound.starting;
        const newEnding = params.ending || missionFound.ending;
    
        if (evenement) {
            if (newStarting < evenement.starting || newEnding > evenement.ending) {
                return "La période de la mission doit être comprise dans celle de l'événement.";
            }
        }
    
        if (step) {
            if (newStarting < step.starting || newEnding > step.ending) {
                return "La période de la mission doit être comprise dans celle de l'étape.";
            }
        }
    
        const conflictingMissions = await repo.find({
            where: [
                {
                    evenement: evenement,
                    id: Not(id),
                    starting: LessThanOrEqual(newEnding),
                    ending: MoreThanOrEqual(newStarting),
                },
                {
                    step: step,
                    id: Not(id),
                    starting: LessThanOrEqual(newEnding),
                    ending: MoreThanOrEqual(newStarting),
                }
            ],
        });
    
        if (conflictingMissions.length > 0) {
            return "Il existe déjà une mission sur cette période.";
        }
    
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
    
    

    
    
    async deleteMission(id: number): Promise<boolean | Mission> {
        const repo = this.db.getRepository(Mission);
        const missionFound = await repo.findOne({ where: { id } });
        if (!missionFound) return false;

        await repo.remove(missionFound);
        return missionFound;
    }



    async addSkillsToMission(missionId: number, skillIds: number[]): Promise<Mission> {
        const missionRepo = this.db.getRepository(Mission);
        const skillRepo = this.db.getRepository(Skill);

        const mission = await missionRepo.findOne({ where: { id: missionId }, relations: ['requiredSkills'] });
        if (!mission) throw new Error('Mission not found');

        const skills = await skillRepo.findByIds(skillIds);
        mission.requiredSkills = skills;
        await missionRepo.save(mission);

        return mission;
    }

    async assignUsersToMission(missionId: number, userEmails: string[]): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const userRepo = this.db.getRepository(User);
    
        const mission = await missionRepo.findOne({
            where: { id: missionId },
            relations: ['assignedUsers', 'requiredSkills']
        });
    
        if (!mission) {
            return "Mission not found";
        }
    
        const users = await userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.skills', 'skill')
            .where('user.email IN (:...userEmails)', { userEmails })
            .getMany();
    
         const requiredSkillNames = mission.requiredSkills.map(skill => skill.name);
        const compatibleUsers = users.filter(user => 
            user.skills.some(skill => requiredSkillNames.includes(skill.name))
        );
    
        if (compatibleUsers.length !== users.length) {
            return "Some users do not have the required skills for this mission";
        }
    
        mission.assignedUsers = compatibleUsers;
        await missionRepo.save(mission);
        return mission;
    }
    
    
    async getUsersByMissionSkills(missionId: number): Promise<User[]> {
        const missionRepo = this.db.getRepository(Mission);
        const userRepo = this.db.getRepository(User);
        const skillRepo = this.db.getRepository(Skill);

         const mission = await missionRepo.findOne({ where: { id: missionId }, relations: ["requiredSkills"] });
        if (!mission) throw new Error('Mission not found');

         const users = await userRepo.createQueryBuilder('user')
            .leftJoinAndSelect('user.skills', 'skill')
            .where('user.status = :status', { status: 'NORMAL' })
            .andWhere('skill.id IN (:...skillIds)', { skillIds: mission.requiredSkills.map(skill => skill.id) })
            .getMany();

        return users;
    }
    async getMissionsByStep(stepId: number): Promise<Mission[]> {
        const missionRepo = this.db.getRepository(Mission);
        const missions = await missionRepo.find({ where: { step: { id: stepId } }, relations: ["step"] });
        return missions;
    }

    async getMissionsByEvent(eventId: number): Promise<Mission[]> {
        const missionRepo = this.db.getRepository(Mission);
        const missions = await missionRepo.find({ where: { evenement: { id: eventId } }, relations: ["evenement"] });
        return missions;
    }
}
 
 