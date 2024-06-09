import Joi from "joi";

export const createSubjectValidation = Joi.object<CreateSubjectValidationRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
}).options({ abortEarly: false });

export interface CreateSubjectValidationRequest {
    title: string;
    description: string;
}

export const updateSubjectValidation = Joi.object<UpdateSubjectValidationRequest>({
    id: Joi.number().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
}).options({ abortEarly: false });

export interface UpdateSubjectValidationRequest {
    id: number;
    title?: string;
    description?: string;
}

export const subjectIdValidation = Joi.object<SubjectIdRequest>({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export interface SubjectIdRequest {
    id: number;
}
export default {
    createSubjectValidation,
    updateSubjectValidation,
    subjectIdValidation
};