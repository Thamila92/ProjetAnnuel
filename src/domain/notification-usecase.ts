import { DataSource } from "typeorm";
import { Notification } from "../database/entities/notification";
import { User } from "../database/entities/user";

export interface ListNotificationFilter {
    limit: number;
    page: number;
}

export interface CreateNotificationParams {
    title: string;
    message: string;
    userId: number;
}

export interface UpdateNotificationParams {
    title?: string;
    message?: string;
    read?: boolean;
}

export class NotificationUsecase {
    constructor(private readonly db: DataSource) { }

    async listNotifications(filter: ListNotificationFilter): Promise<{ notifications: Notification[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Notification, 'notification')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [notifications, totalCount] = await query.getManyAndCount();
        return {
            notifications,
            totalCount
        };
    }

    async createNotification(params: CreateNotificationParams): Promise<Notification | string> {
        const userRepo = this.db.getRepository(User);
        const notificationRepo = this.db.getRepository(Notification);

        const userFound = await userRepo.findOne({ where: { id: params.userId } });
        if (!userFound) {
            return "User not found";
        }

        const newNotification = notificationRepo.create({
            title: params.title,
            message: params.message,
            user: userFound
        });

        await notificationRepo.save(newNotification);
        return newNotification;
    }

    async getNotification(id: number): Promise<Notification | null> {
        const repo = this.db.getRepository(Notification);
        const notificationFound = await repo.findOne({ where: { id } });
        return notificationFound || null;
    }

    async updateNotification(id: number, params: UpdateNotificationParams): Promise<Notification | string | null> {
        const repo = this.db.getRepository(Notification);
        const notificationFound = await repo.findOne({ where: { id } });

        if (!notificationFound) return null;

        if (params.title) notificationFound.title = params.title;
        if (params.message) notificationFound.message = params.message;
        if (typeof params.read !== 'undefined') notificationFound.read = params.read;

        const updatedNotification = await repo.save(notificationFound);
        return updatedNotification;
    }
    async getNotificationsByUser(userId: number): Promise<Notification[]> {
        const notificationRepository = this.db.getRepository(Notification);
        const notifications = await notificationRepository.find({
            where: { user: { id: userId } },
            relations: ["user"]   
        });
        return notifications;
    }
    
    async deleteNotification(id: number): Promise<boolean|Notification> {
        const repo = this.db.getRepository(Notification);
        const notificationFound = await repo.findOne({ where: { id } });
        if (!notificationFound) return false;

        await repo.remove(notificationFound);
        return notificationFound;
    }
}
