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
exports.NotificationUsecase = void 0;
const notification_1 = require("../database/entities/notification");
const user_1 = require("../database/entities/user");
class NotificationUsecase {
    constructor(db) {
        this.db = db;
    }
    listNotifications(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(notification_1.Notification, 'notification')
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [notifications, totalCount] = yield query.getManyAndCount();
            return {
                notifications,
                totalCount
            };
        });
    }
    createNotification(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepo = this.db.getRepository(user_1.User);
            const notificationRepo = this.db.getRepository(notification_1.Notification);
            const userFound = yield userRepo.findOne({ where: { id: params.userId } });
            if (!userFound) {
                return "User not found";
            }
            const newNotification = notificationRepo.create({
                title: params.title,
                message: params.message,
                users: [userFound], // Change 'user' to 'users' to match the entity
            });
            yield notificationRepo.save(newNotification);
            return newNotification;
        });
    }
    getNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(notification_1.Notification);
            const notificationFound = yield repo.findOne({ where: { id } });
            return notificationFound || null;
        });
    }
    updateNotification(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(notification_1.Notification);
            const notificationFound = yield repo.findOne({ where: { id } });
            if (!notificationFound)
                return null;
            if (params.title)
                notificationFound.title = params.title;
            if (params.message)
                notificationFound.message = params.message;
            if (typeof params.read !== 'undefined')
                notificationFound.read = params.read;
            const updatedNotification = yield repo.save(notificationFound);
            return updatedNotification;
        });
    }
    getNotificationsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationRepository = this.db.getRepository(notification_1.Notification);
            const notifications = yield notificationRepository.find({
                where: { users: { id: userId } }, // Correct 'user' to 'users'
                relations: ["users"] // Correct 'user' to 'users'
            });
            return notifications;
        });
    }
    deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(notification_1.Notification);
            const notificationFound = yield repo.findOne({ where: { id } });
            if (!notificationFound)
                return false;
            yield repo.remove(notificationFound);
            return notificationFound;
        });
    }
}
exports.NotificationUsecase = NotificationUsecase;
