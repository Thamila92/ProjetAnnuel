import Joi from "joi";

export const createDocumentValidation = Joi.object<CreateDocumentValidationRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().required(),
    path: Joi.string().required(),
    userId: Joi.number().required(),
}).options({ abortEarly: false });

export interface CreateDocumentValidationRequest {
    title: string;
    description: string;
    type: string;
    path: string;
    userId: number;
}

export const updateDocumentValidation = Joi.object<UpdateDocumentValidationRequest>({
    id: Joi.number().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    type: Joi.string().optional(),
    path: Joi.string().optional(),
    userId: Joi.number().optional(),
}).options({ abortEarly: false });

export interface UpdateDocumentValidationRequest {
    id: number;
    title?: string;
    description?: string;
    type?: string;
    path?: string;
    userId?: number;
}

export const documentIdValidation = Joi.object<DocumentIdRequest>({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export interface DocumentIdRequest {
    id: number;
}
