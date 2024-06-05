import { DataSource } from "typeorm";
import { Review } from "../database/entities/review";
import { Mission } from "../database/entities/mission";
import { User } from "../database/entities/user";

export interface ListReviewFilter {
    limit: number;
    page: number;
}

export interface UpdateReviewParams {
    content?: string;
}

export class ReviewUsecase {
    constructor(private readonly db: DataSource) { }

    async listReviews(filter: ListReviewFilter): Promise<{ reviews: Review[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Review, 'review')
            .skip((filter.page - 1) * filter.limit)
            .take(filter.limit);

        const [reviews, totalCount] = await query.getManyAndCount();
        return {
            reviews,
            totalCount
        };
    }

    async createReview(content: string, createdAt: Date, missionId: number, userId: number): Promise<Review> {
        const missionRepo = this.db.getRepository(Mission);
        const mission = await missionRepo.findOne({ where: { id: missionId } });
        if (!mission) {
            throw new Error('Mission not found');
        }

        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const reviewRepo = this.db.getRepository(Review);
        const newReview = reviewRepo.create({ content, createdAt, mission, user });
        await reviewRepo.save(newReview);
        return newReview;
    }

    async getReview(id: number): Promise<Review | null> {
        const repo = this.db.getRepository(Review);
        const reviewFound = await repo.findOne({ where: { id } });
        return reviewFound || null;
    }

    async updateReview(id: number, params: UpdateReviewParams): Promise<Review | null> {
        const repo = this.db.getRepository(Review);
        const reviewFound = await repo.findOne({ where: { id } });
        if (!reviewFound) return null;

        if (params.content) reviewFound.content = params.content;

        const updatedReview = await repo.save(reviewFound);
        return updatedReview;
    }

    async deleteReview(id: number): Promise<boolean> {
        const repo = this.db.getRepository(Review);
        const reviewFound = await repo.findOne({ where: { id } });
        if (!reviewFound) return false;

        await repo.remove(reviewFound);
        return true;
    }
}
