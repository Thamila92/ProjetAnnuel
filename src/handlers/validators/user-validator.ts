import Joi from "joi";

export const createAdminValidation = Joi.object<CreateAdminValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    key:Joi.string().min(8).required(),
    iban:Joi.string().min(28).max(28).optional()
}).options({ abortEarly: false });

export interface CreateAdminValidationRequest {
    email: string
    password: string
    key:string
    iban:string
}




export const createOtherValidation = Joi.object<CreateOtherValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    iban:Joi.string().min(28).max(28).optional()
}).options({ abortEarly: false });

export interface CreateOtherValidationRequest {
    email: string
    password: string
    iban:string
}




export const listUsersValidation = Joi.object<ListUsersRequest>({
    type:Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional()
})

export interface ListUsersRequest {
    type?:string
    page?: number
    limit?: number
}




export const userIdValidation = Joi.object<UserIdRequest>({
    id: Joi.number().required(),
})

export interface UserIdRequest {
    id: number
}




export const updateUserValidation = Joi.object<UpdateUserRequest>({
    id: Joi.number().required(),
    status:Joi.string().optional(),
    email:Joi.string().optional(),
    iban:Joi.string().optional(),
    password:Joi.string().optional(),
    actual_password:Joi.string().required()
})

export interface UpdateUserRequest {
    id: number
    email:string
    status:string
    iban:string
    password:string
    actual_password:string
}