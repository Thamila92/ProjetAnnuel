import Joi from "joi";


export const createAdminValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    key: Joi.string().min(8).required(),
}).options({ abortEarly: false });

export interface CreateAdminValidationRequest {
    name: string;
    email: string;
    password: string;
    key: string;
}

export const createOtherValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    skills: Joi.array().items(Joi.string()).optional()
}).options({ abortEarly: false });

export interface CreateOtherValidationRequest {
    name: string;
    email: string;
    password: string;
    skills?: string[];
}

export const loginOtherValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
}).options({ abortEarly: false });

export interface LoginOtherValidationRequest {
    email: string;
    password: string;
}

export const listUsersValidation = Joi.object({
    type: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    skills: Joi.array().items(Joi.string()).optional()
}).options({ abortEarly: false });

export interface ListUsersRequest {
    type?: string;
    page?: number;
    limit?: number;
    skills?: string[];
}


export const userIdValidation = Joi.object({
    id: Joi.number().required(),
}).options({ abortEarly: false });

export interface UserIdRequest {
    id: number;
}

export const updateUserValidation = Joi.object({
    id: Joi.number().required(),
    status: Joi.string().optional(),
    name: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    actual_password: Joi.string().required()
}).options({ abortEarly: false });

export interface UpdateUserRequest {
    id: number;
    name?: string;
    email?: string;
    status?: string;
    password?: string;
    actual_password: string;
}
