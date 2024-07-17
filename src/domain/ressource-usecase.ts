import { DataSource } from "typeorm";
import { Resource } from "../database/entities/ressource";
import { Mission } from "../database/entities/mission";

export class ResourceUsecase {
    constructor(private readonly db: DataSource) { }

    async createResource(name: string, type: string, isAvailable: boolean = true): Promise<Resource> {
        const resourceRepo = this.db.getRepository(Resource);
        const newResource = resourceRepo.create({ name, type, isAvailable });
        await resourceRepo.save(newResource);
        return newResource;
    }

    async assignResourcesToMission(missionId: number, resourceIds: number[]): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const resourceRepo = this.db.getRepository(Resource);

        const mission = await missionRepo.findOne({ where: { id: missionId }, relations: ['resources'] });
        if (!mission) return "Mission not found";

        const resources = await resourceRepo.findByIds(resourceIds);
        if (resources.length !== resourceIds.length) return "One or more resources not found";

        for (const resource of resources) {
            if (!resource.isAvailable) {
                return `Resource ${resource.name} is not available`;
            }
            resource.isAvailable = false; // Mark the resource as unavailable
        }

        mission.resources.push(...resources);
        await resourceRepo.save(resources);
        await missionRepo.save(mission);

        return mission;
    }

    async releaseResourcesFromMission(missionId: number): Promise<Mission | string> {
        const missionRepo = this.db.getRepository(Mission);
        const resourceRepo = this.db.getRepository(Resource);

        const mission = await missionRepo.findOne({ where: { id: missionId }, relations: ['resources'] });
        if (!mission) return "Mission not found";

        mission.resources.forEach(resource => {
            resource.isAvailable = true;
        });

        await resourceRepo.save(mission.resources);
        mission.resources = [];
        await missionRepo.save(mission);

        return mission;
    }
    async getAvailableResources(): Promise<Resource[]> {
        const resourceRepo = this.db.getRepository(Resource);
        return await resourceRepo.find({ where: { isAvailable: true } });
    }

    async getResourcesByMission(missionId: number): Promise<Resource[]> {
        const missionRepo = this.db.getRepository(Mission);
        const mission = await missionRepo.findOne({ where: { id: missionId }, relations: ['resources'] });
        if (!mission) throw new Error('Mission not found');
        return mission.resources;
    }

    async getAllResources(): Promise<Resource[]> {
        const resourceRepo = this.db.getRepository(Resource);
        return await resourceRepo.find();
    }
    async updateResource(id: number, updateData: Partial<Resource>): Promise<Resource | null> {
        const resourceRepo = this.db.getRepository(Resource);
        const resource = await resourceRepo.findOne({ where: { id } });

        if (!resource) {
            return null;
        }

        Object.assign(resource, updateData);
        await resourceRepo.save(resource);
        return resource;
    }
}
