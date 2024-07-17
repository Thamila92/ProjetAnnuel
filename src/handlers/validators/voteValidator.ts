import Joi from "joi";

export const createVoteValidation = Joi.object<CreateVoteValidationRequest>({
    type: Joi.string().required(),
    subjectId: Joi.number().required(),
}).options({ abortEarly: false });

export interface CreateVoteValidationRequest {
    type: string;
    subjectId: number;
}

export const updateVoteValidation = Joi.object<UpdateVoteValidationRequest>({
    id: Joi.number().required(),
    type: Joi.string().optional(),
    subjectId: Joi.number().optional(),
}).options({ abortEarly: false });

export interface UpdateVoteValidationRequest {
    id: number;
    type?: string;
    subjectId?: number;
}

export const voteIdValidation = Joi.object<VoteIdRequest>({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export interface VoteIdRequest {
    id: number;
}
export default {
    createVoteValidation,
    updateVoteValidation,
    voteIdValidation
};