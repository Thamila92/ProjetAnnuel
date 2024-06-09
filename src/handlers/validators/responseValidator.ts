import Joi from "joi";

export const createResponseValidation = Joi.object<CreateResponseValidationRequest>({
    content: Joi.string().required(),
    voteId: Joi.number().required(),
    userId: Joi.number().required(),
}).options({ abortEarly: false });

export interface CreateResponseValidationRequest {
    content: string;
    voteId: number;
    userId: number;
}

export const updateResponseValidation = Joi.object<UpdateResponseValidationRequest>({
    id: Joi.number().required(),
    content: Joi.string().optional(),
    voteId: Joi.number().optional(),
    userId: Joi.number().optional(),
}).options({ abortEarly: false });

export interface UpdateResponseValidationRequest {
    id: number;
    content?: string;
    voteId?: number;
    userId?: number;
}

export const responseIdValidation = Joi.object<ResponseIdRequest>({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export interface ResponseIdRequest {
    id: number;
}
export default {
    createResponseValidation,
    updateResponseValidation,
    responseIdValidation
};