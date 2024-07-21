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
exports.ReviewUsecase = void 0;
const review_1 = require("../database/entities/review");
const mission_1 = require("../database/entities/mission");
const user_1 = require("../database/entities/user");
class ReviewUsecase {
    constructor(db) {
        this.db = db;
    }
    listReviews(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.db.createQueryBuilder(review_1.Review, 'review')
                .skip((filter.page - 1) * filter.limit)
                .take(filter.limit);
            const [reviews, totalCount] = yield query.getManyAndCount();
            return {
                reviews,
                totalCount
            };
        });
    }
    createReview(content, createdAt, missionId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const missionRepo = this.db.getRepository(mission_1.Mission);
            const mission = yield missionRepo.findOne({ where: { id: missionId } });
            if (!mission) {
                throw new Error('Mission not found');
            }
            const userRepo = this.db.getRepository(user_1.User);
            const user = yield userRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            const reviewRepo = this.db.getRepository(review_1.Review);
            const newReview = reviewRepo.create({ content, createdAt, mission, user });
            yield reviewRepo.save(newReview);
            return newReview;
        });
    }
    getReview(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(review_1.Review);
            const reviewFound = yield repo.findOne({ where: { id } });
            return reviewFound || null;
        });
    }
    updateReview(id, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(review_1.Review);
            const reviewFound = yield repo.findOne({ where: { id } });
            if (!reviewFound)
                return null;
            if (params.content)
                reviewFound.content = params.content;
            const updatedReview = yield repo.save(reviewFound);
            return updatedReview;
        });
    }
    deleteReview(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = this.db.getRepository(review_1.Review);
            const reviewFound = yield repo.findOne({ where: { id } });
            if (!reviewFound)
                return false;
            yield repo.remove(reviewFound);
            return true;
        });
    }
}
exports.ReviewUsecase = ReviewUsecase;
