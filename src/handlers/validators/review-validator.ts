import Joi from "joi";

export const reviewValidation = Joi.object<ReviewRequest>({
    content: Joi.string().required(),
    createdAt: Joi.date().iso().required(),
    missionId: Joi.number().required(),
    userId: Joi.number().required()
}).options({ abortEarly: false });

export interface ReviewRequest {
    content: string;
    createdAt: Date;
    missionId: number;
    userId: number;
}

export const listReviewValidation = Joi.object<ListReviewRequest>({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
});

export interface ListReviewRequest {
    page?: number;
    limit?: number;
}
